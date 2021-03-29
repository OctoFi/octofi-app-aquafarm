import { BigNumber } from "bignumber.js";

import { OrderSigner } from "./OrderSigner";
import { EIP712_DOMAIN_STRING, EIP712_DOMAIN_STRUCT, MarketId } from "./types";
import {
	addressToBytes32,
	argToBytes,
	bytesToHexString,
	hashString,
	stripHexPrefix,
	toBytes,
	toString,
} from "./lib/helpers";
import Web3 from "web3";

const EIP712_ORDER_STRUCT = [
	{ type: "bytes32", name: "flags" },
	{ type: "uint256", name: "baseMarket" },
	{ type: "uint256", name: "quoteMarket" },
	{ type: "uint256", name: "amount" },
	{ type: "uint256", name: "limitPrice" },
	{ type: "uint256", name: "triggerPrice" },
	{ type: "uint256", name: "limitFee" },
	{ type: "address", name: "makerAccountOwner" },
	{ type: "uint256", name: "makerAccountNumber" },
	{ type: "uint256", name: "expiration" },
];

const EIP712_ORDER_STRUCT_STRING =
	"CanonicalOrder(" +
	"bytes32 flags," +
	"uint256 baseMarket," +
	"uint256 quoteMarket," +
	"uint256 amount," +
	"uint256 limitPrice," +
	"uint256 triggerPrice," +
	"uint256 limitFee," +
	"address makerAccountOwner," +
	"uint256 makerAccountNumber," +
	"uint256 expiration" +
	")";

const EIP712_CANCEL_ORDER_STRUCT = [
	{ type: "string", name: "action" },
	{ type: "bytes32[]", name: "orderHashes" },
];

const EIP712_CANCEL_ORDER_STRUCT_STRING = "CancelLimitOrder(" + "string action," + "bytes32[] orderHashes" + ")";

export class CanonicalOrders extends OrderSigner {
	constructor(contracts, web3, networkId) {
		super(web3, contracts);
		this.networkId = networkId;
	}

	/**
	 *
	 * @param order
	 * @returns string
	 */
	stringifyOrder(order) {
		const stringifiedOrder = {
			...order,
			flags: this.getCanonicalOrderFlags(order),
			limitPrice: this.toSolidity(order.limitPrice),
			triggerPrice: this.toSolidity(order.triggerPrice),
			limitFee: this.toSolidity(order.limitFee),
		};
		for (const [key, value] of Object.entries(stringifiedOrder)) {
			if (!["string", "boolean"].includes(typeof value)) {
				stringifiedOrder[key] = toString(value);
			}
		}
		return stringifiedOrder;
	}

	// ============ Getter Contract Methods ============

	/**
	 * Gets the status and the current filled amount (in makerAmount) of all given orders.
	 */
	async getOrderStates(orders, options = {}) {
		const orderHashes = orders.map((order) => this.getOrderHash(order));
		const states = await this.contracts.call(
			this.contracts.canonicalOrders.methods.getOrderStates(orderHashes),
			options
		);

		return states.map((state) => {
			return {
				status: parseInt(state[0], 10),
				totalFilledAmount: new BigNumber(state[1]),
			};
		});
	}

	async getTakerAddress(options = {}) {
		return this.contracts.call(this.contracts.canonicalOrders.methods.g_taker(), options);
	}

	// ============ Setter Contract Methods ============

	async setTakerAddress(taker, options = {}) {
		return this.contracts.send(this.contracts.canonicalOrders.methods.setTakerAddress(taker), options);
	}

	// ============ Off-Chain Fee Calculation Methods ============

	getFeeForOrder(baseMarketBN, amount, isTaker = true) {
		const ZERO = new BigNumber(0);
		const BIPS = new BigNumber("1e-4");

		const ETH_SMALL_ORDER_THRESHOLD = new BigNumber("20e18");
		const DAI_SMALL_ORDER_THRESHOLD = new BigNumber("10000e18");

		switch (baseMarketBN.toNumber()) {
			case MarketId.ETH.toNumber():
			case MarketId.WETH.toNumber():
				return amount.lt(ETH_SMALL_ORDER_THRESHOLD)
					? isTaker
						? BIPS.times(100)
						: ZERO
					: isTaker
					? BIPS.times(30)
					: ZERO;
			case MarketId.DAI.toNumber():
				return amount.lt(DAI_SMALL_ORDER_THRESHOLD)
					? isTaker
						? BIPS.times(100)
						: ZERO
					: isTaker
					? BIPS.times(20)
					: ZERO;
			default:
				throw new Error(`Invalid baseMarketNumber ${baseMarketBN}`);
		}
	}

	// ============ Off-Chain Collateralization Calculation Methods ============

	/**
	 * Returns the estimated account collateralization after making each of the orders provided.
	 * The makerAccount of each order should be associated with the same account.
	 * This function does not make any on-chain calls and so all information must be passed in
	 * (including asset prices and remaining amounts on the orders).
	 * - 150% collateralization will be returned as BigNumber(1.5).
	 * - Accounts with zero borrow will be returned as BigNumber(infinity) regardless of supply.
	 */
	getAccountCollateralizationAfterMakingOrders(weis, prices, orders, remainingMakerAmounts) {
		const runningWeis = weis.map((x) => new BigNumber(x));

		// for each order, modify the wei value of the account
		for (let i = 0; i < orders.length; i += 1) {
			const isCanonical = !!orders[i].limitPrice;

			if (isCanonical) {
				// calculate maker and taker amounts
				const order = orders[i];
				const makerAmount = remainingMakerAmounts[i];
				const takerAmount = order.isBuy
					? makerAmount.div(order.limitPrice)
					: makerAmount.times(order.limitPrice);

				// update running weis
				const makerMarket = (order.isBuy ? order.quoteMarket : order.baseMarket).toNumber();
				const takerMarket = (order.isBuy ? order.baseMarket : order.quoteMarket).toNumber();
				runningWeis[makerMarket] = runningWeis[makerMarket].minus(makerAmount);
				runningWeis[takerMarket] = runningWeis[takerMarket].plus(takerAmount);
			} else {
				// calculate maker and taker amounts
				const order = orders[i];
				const makerAmount = remainingMakerAmounts[i];
				const takerAmount = order.takerAmount
					.times(makerAmount)
					.div(order.makerAmount)
					.integerValue(BigNumber.ROUND_UP);

				// update running weis
				const makerMarket = order.makerMarket.toNumber();
				const takerMarket = order.takerMarket.toNumber();
				runningWeis[makerMarket] = runningWeis[makerMarket].minus(makerAmount);
				runningWeis[takerMarket] = runningWeis[takerMarket].plus(takerAmount);
			}
		}

		// calculate the final collateralization
		let supplyValue = new BigNumber(0);
		let borrowValue = new BigNumber(0);
		for (let i = 0; i < runningWeis.length; i += 1) {
			const value = runningWeis[i].times(prices[i]);
			if (value.gt(0)) {
				supplyValue = supplyValue.plus(value.abs());
			} else if (value.lt(0)) {
				borrowValue = borrowValue.plus(value.abs());
			}
		}

		// return infinity if borrow amount is zero (even if supply is also zero)
		if (borrowValue.isZero()) {
			return new BigNumber(Infinity);
		}

		return supplyValue.div(borrowValue);
	}

	// ============ Public Helper Functions ============

	toSolidity(price) {
		return price.shiftedBy(18).integerValue();
	}

	// ============ Hashing Functions ============

	/**
	 * Returns the final signable EIP712 hash for approving an order.
	 */
	getOrderHash(order) {
		const structHash = Web3.utils.soliditySha3(
			{ t: "bytes32", v: hashString(EIP712_ORDER_STRUCT_STRING) },
			{ t: "bytes32", v: this.getCanonicalOrderFlags(order) },
			{ t: "uint256", v: toString(order.baseMarket) },
			{ t: "uint256", v: toString(order.quoteMarket) },
			{ t: "uint256", v: toString(order.amount) },
			{ t: "uint256", v: toString(this.toSolidity(order.limitPrice)) },
			{ t: "uint256", v: toString(this.toSolidity(order.triggerPrice)) },
			{ t: "uint256", v: toString(this.toSolidity(order.limitFee.abs())) },
			{ t: "bytes32", v: addressToBytes32(order.makerAccountOwner) },
			{ t: "uint256", v: toString(order.makerAccountNumber) },
			{ t: "uint256", v: toString(order.expiration) }
		);
		return this.getEIP712Hash(structHash);
	}

	/**
	 * Given some order hash, returns the hash of a cancel-order message.
	 */
	orderHashToCancelOrderHash(orderHash) {
		const structHash = Web3.utils.soliditySha3(
			{ t: "bytes32", v: hashString(EIP712_CANCEL_ORDER_STRUCT_STRING) },
			{ t: "bytes32", v: hashString("Cancel Orders") },
			{ t: "bytes32", v: Web3.utils.soliditySha3({ t: "bytes32", v: orderHash }) }
		);
		return this.getEIP712Hash(structHash);
	}

	/**
	 * Returns the EIP712 domain separator hash.
	 */
	getDomainHash() {
		return Web3.utils.soliditySha3(
			{ t: "bytes32", v: hashString(EIP712_DOMAIN_STRING) },
			{ t: "bytes32", v: hashString("CanonicalOrders") },
			{ t: "bytes32", v: hashString("1.1") },
			{ t: "uint256", v: toString(this.networkId) },
			{ t: "bytes32", v: addressToBytes32(this.contracts.canonicalOrders.options.address) }
		);
	}

	// ============ To-Bytes Functions ============

	orderToBytes(order, price, fee) {
		let orderBytes = []
			.concat(argToBytes(this.getCanonicalOrderFlags(order)))
			.concat(argToBytes(order.baseMarket))
			.concat(argToBytes(order.quoteMarket))
			.concat(argToBytes(order.amount))
			.concat(argToBytes(this.toSolidity(order.limitPrice)))
			.concat(argToBytes(this.toSolidity(order.triggerPrice)))
			.concat(argToBytes(this.toSolidity(order.limitFee.abs())))
			.concat(argToBytes(order.makerAccountOwner))
			.concat(argToBytes(order.makerAccountNumber))
			.concat(argToBytes(order.expiration));

		if (price && fee) {
			orderBytes = orderBytes
				.concat(argToBytes(this.toSolidity(price)))
				.concat(argToBytes(this.toSolidity(fee.abs())))
				.concat(argToBytes(fee.isNegative()));
		}

		const orderAndTradeHex = Web3.utils.bytesToHex(orderBytes);

		return !!order.typedSignature ? `${orderAndTradeHex}${stripHexPrefix(order.typedSignature)}` : orderAndTradeHex;
	}

	// ============ Private Helper Functions ============

	getDomainData() {
		return {
			name: "CanonicalOrders",
			version: "1.1",
			chainId: this.networkId,
			verifyingContract: this.contracts.canonicalOrders.options.address,
		};
	}

	async ethSignTypedOrderInternal(order, signingMethod) {
		const orderData = {
			flags: this.getCanonicalOrderFlags(order),
			baseMarket: order.baseMarket.toFixed(0),
			quoteMarket: order.quoteMarket.toFixed(0),
			amount: order.amount.toFixed(0),
			limitPrice: this.toSolidity(order.limitPrice).toFixed(0),
			triggerPrice: this.toSolidity(order.triggerPrice).toFixed(0),
			limitFee: this.toSolidity(order.limitFee.abs()).toFixed(0),
			makerAccountOwner: order.makerAccountOwner,
			makerAccountNumber: order.makerAccountNumber.toFixed(0),
			expiration: order.expiration.toFixed(0),
		};
		const data = {
			types: {
				EIP712Domain: EIP712_DOMAIN_STRUCT,
				CanonicalOrder: EIP712_ORDER_STRUCT,
			},
			domain: this.getDomainData(),
			primaryType: "CanonicalOrder",
			message: orderData,
		};
		return this.ethSignTypedDataInternal(order.makerAccountOwner, data, signingMethod);
	}

	async ethSignTypedCancelOrderInternal(orderHash, signer, signingMethod) {
		const data = {
			types: {
				EIP712Domain: EIP712_DOMAIN_STRUCT,
				CancelLimitOrder: EIP712_CANCEL_ORDER_STRUCT,
			},
			domain: this.getDomainData(),
			primaryType: "CancelLimitOrder",
			message: {
				action: "Cancel Orders",
				orderHashes: [orderHash],
			},
		};
		return this.ethSignTypedDataInternal(signer, data, signingMethod);
	}

	getCanonicalOrderFlags(order) {
		let booleanFlags = 0;
		booleanFlags += order.limitFee.isNegative() ? 4 : 0;
		booleanFlags += order.isDecreaseOnly ? 2 : 0;
		booleanFlags += order.isBuy ? 1 : 0;
		return `0x${bytesToHexString(toBytes(order.salt)).slice(-63)}${booleanFlags}`;
	}

	getContract() {
		return this.contracts.canonicalOrders;
	}
}
