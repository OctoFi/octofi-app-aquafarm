import { getContractWrappers } from "./contractWrapper";
import { ordersToUIOrders } from "./uiOrders";
import { assetDataUtils } from "@0x/order-utils";
import { BigNumber, NULL_BYTES } from "@0x/utils";
import { getRelayer } from "../../common/relayer";
import {
	CHAIN_ID,
	FEE_RECIPIENT,
	MAKER_FEE_PERCENTAGE,
	OrderSide,
	PROTOCOL_FEE_MULTIPLIER,
	TAKER_FEE_PERCENTAGE,
	USE_RELAYER_ORDER_CONFIG,
	ZERO,
	ZERO_ADDRESS,
} from "../../constants";
import { getKnownTokens, getWethAssetData } from "../known_tokens";
import { tokenAmountInUnitsToBigNumber, unitsInTokenAmount } from "./tokens";
import { AssetProxyId } from "@0x/types";
import Web3 from "web3";
import { Web3Wrapper } from "@0x/web3-wrapper";

export const getAllOrders = async (baseToken, quoteToken, makerAddresses) => {
	const relayer = getRelayer();
	const baseTokenAssetData = assetDataUtils.encodeERC20AssetData(baseToken.address);
	const quoteTokenAssetData = assetDataUtils.encodeERC20AssetData(quoteToken.address);
	const orders = await relayer.getAllOrdersAsync(baseTokenAssetData, quoteTokenAssetData);

	// if makerAddresses is null or empty do not filter
	if (!makerAddresses || makerAddresses.length === 0) {
		return orders;
	}

	// filter orders by existence in the makerAddresses array
	const filteredOrders = orders.filter((order) => {
		const orderMakerAddress = order.makerAddress;
		return makerAddresses.includes(orderMakerAddress);
	});
	return filteredOrders;
};

export const isBridgeAssetData = (decodedAssetData) => {
	return decodedAssetData.assetProxyId === AssetProxyId.ERC20Bridge;
};

export const getAllOrdersAsUIOrders = async (baseToken, quoteToken, makerAddresses, library) => {
	const orders = await getAllOrders(baseToken, quoteToken, makerAddresses);
	try {
		const contractWrappers = await getContractWrappers(library);
		const [ordersInfo] = await contractWrappers.devUtils
			.getOrderRelevantStates(
				orders,
				orders.map((o) => o.signature)
			)
			.callAsync();
		return ordersToUIOrders(orders, baseToken, ordersInfo);
	} catch (err) {
		throw err;
	}
};

export const getUserOrders = (baseToken, quoteToken, ethAccount) => {
	const relayer = getRelayer();
	const baseTokenAssetData = assetDataUtils.encodeERC20AssetData(baseToken.address);
	const quoteTokenAssetData = assetDataUtils.encodeERC20AssetData(quoteToken.address);
	return relayer.getUserOrdersAsync(ethAccount, baseTokenAssetData, quoteTokenAssetData);
};

export const getUserOrdersAsUIOrders = async (baseToken, quoteToken, ethAccount, library) => {
	const myOrders = await getUserOrders(baseToken, quoteToken, ethAccount);

	try {
		const contractWrappers = await getContractWrappers(library);
		const [ordersInfo] = await contractWrappers.devUtils
			.getOrderRelevantStates(
				myOrders,
				myOrders.map((o) => o.signature)
			)
			.callAsync();
		return ordersToUIOrders(myOrders, baseToken, ordersInfo);
	} catch (err) {
		throw err;
	}
};

export const buildMarketLimitMatchingOrders = (params, side) => {
	const { amount, orders, price } = params;

	// sort orders from best to worse
	const sortedOrders = orders.sort((a, b) => {
		if (side === OrderSide.Buy) {
			return a.price.comparedTo(b.price);
		} else {
			return b.price.comparedTo(a.price);
		}
	});
	// Filter orders higher than price
	const filteredOrders = sortedOrders.filter((o) => {
		if (side === OrderSide.Buy) {
			return o.price.isLessThanOrEqualTo(price);
		} else {
			return o.price.isGreaterThanOrEqualTo(price);
		}
	});
	if (filteredOrders.length === 0) {
		return {
			ordersToFill: [],
			amounts: [new BigNumber(0)],
			canBeFilled: false,
			remainingAmount: amount,
			amountsMaker: [new BigNumber(0)],
			amountFill: new BigNumber(0),
		};
	}
	const ordersToFill = [];
	const amounts = [];
	const amountsMaker = [];
	let filledAmount = new BigNumber(0);
	for (let i = 0; i < filteredOrders.length && filledAmount.isLessThan(amount); i++) {
		const order = filteredOrders[i];
		ordersToFill.push(order.rawOrder);
		let available = order.size;
		if (order.filled) {
			available = order.size.minus(order.filled);
		}
		if (filledAmount.plus(available).isGreaterThan(amount)) {
			amounts.push(amount.minus(filledAmount));
			filledAmount = amount;
		} else {
			amounts.push(available);
			filledAmount = filledAmount.plus(available);
		}

		if (side === OrderSide.Buy) {
			// @TODO: cache maker/taker info (decimals)
			const makerTokenDecimals = getKnownTokens().getTokenByAssetData(order.rawOrder.makerAssetData).decimals;
			const takerTokenDecimals = getKnownTokens().getTokenByAssetData(order.rawOrder.takerAssetData).decimals;
			const buyAmount = tokenAmountInUnitsToBigNumber(amounts[i], makerTokenDecimals);
			amounts[i] = unitsInTokenAmount(buyAmount.multipliedBy(order.price).toString(), takerTokenDecimals);
		} else {
			const makerTokenDecimals = getKnownTokens().getTokenByAssetData(order.rawOrder.makerAssetData).decimals;
			const takerTokenDecimals = getKnownTokens().getTokenByAssetData(order.rawOrder.takerAssetData).decimals;
			const buyAmount = tokenAmountInUnitsToBigNumber(amounts[i], takerTokenDecimals);
			amountsMaker[i] = unitsInTokenAmount(buyAmount.multipliedBy(order.price).toString(), makerTokenDecimals);
		}
	}
	const canBeFilled = filledAmount.eq(amount);
	const remainingAmount = amount.minus(filledAmount);

	const roundedAmounts = amounts.map((a) => a.integerValue(BigNumber.ROUND_CEIL));
	return {
		ordersToFill,
		amounts: roundedAmounts,
		canBeFilled,
		remainingAmount,
		amountFill: filledAmount,
		amountsMaker,
	};
};

export const buildMarketOrders = (params, side) => {
	const { amount, orders } = params;

	// sort orders from best to worse
	const sortedOrders = orders.sort((a, b) => {
		if (side === OrderSide.Buy) {
			return a.price.comparedTo(b.price);
		} else {
			return b.price.comparedTo(a.price);
		}
	});

	const ordersToFill = [];
	const amounts = [];
	let filledAmount = ZERO;
	for (let i = 0; i < sortedOrders.length && filledAmount.isLessThan(amount); i++) {
		const order = sortedOrders[i];
		ordersToFill.push(order.rawOrder);

		let available = order.size;
		if (order.filled) {
			available = order.size.minus(order.filled);
		}
		if (filledAmount.plus(available).isGreaterThan(amount)) {
			amounts.push(amount.minus(filledAmount));
			filledAmount = amount;
		} else {
			amounts.push(available);
			filledAmount = filledAmount.plus(available);
		}

		if (side === OrderSide.Buy) {
			// @TODO: cache maker/taker info (decimals)
			const makerTokenDecimals = getKnownTokens().getTokenByAssetData(order.rawOrder.makerAssetData).decimals;
			const takerTokenDecimals = getKnownTokens().getTokenByAssetData(order.rawOrder.takerAssetData).decimals;
			const buyAmount = tokenAmountInUnitsToBigNumber(amounts[i], makerTokenDecimals);
			amounts[i] = unitsInTokenAmount(buyAmount.multipliedBy(order.price).toString(), takerTokenDecimals);
		}
	}
	const canBeFilled = filledAmount.eq(amount);

	const roundedAmounts = amounts.map((a) => a.integerValue(BigNumber.ROUND_CEIL));

	return [ordersToFill, roundedAmounts, canBeFilled];
};

export const getOrderWithTakerAndFeeConfigFromRelayer = async (
	orderConfigRequest,
	isCollectible = undefined,
	affiliateAddress = undefined
) => {
	const round = (num) => num.integerValue(BigNumber.ROUND_FLOOR);
	let orderResult;
	if (USE_RELAYER_ORDER_CONFIG) {
		const client = getRelayer();
		orderResult = await client.getOrderConfigAsync(orderConfigRequest);
	} else {
		if (isCollectible) {
			orderResult = {
				feeRecipientAddress: FEE_RECIPIENT,
				senderAddress: ZERO_ADDRESS,
				makerFeeAssetData: NULL_BYTES,
				takerFeeAssetData: new BigNumber(TAKER_FEE_PERCENTAGE).isGreaterThan("0")
					? orderConfigRequest.takerAssetData
					: NULL_BYTES,
				makerFee: new BigNumber(0),
				takerFee: orderConfigRequest.takerAssetAmount.multipliedBy(new BigNumber(TAKER_FEE_PERCENTAGE)),
			};
		} else {
			const wethAssetData = getWethAssetData();
			const isWethTaker = orderConfigRequest.takerAssetData.toLowerCase() === wethAssetData;
			// Use always Weth as fee, when ETH is on the order. Forwarder needs to make approve asset proxy for all assets.
			// As 0x team always deploying new versions of Forwarder this is needed
			if (isWethTaker || orderConfigRequest.takerAssetData.toLowerCase() === wethAssetData) {
				// Used to track affiliated dex's, Note remove prefix '0x' to pass library validation
				const takerFeeAssetData = new BigNumber(TAKER_FEE_PERCENTAGE).isGreaterThan("0")
					? wethAssetData
					: NULL_BYTES;
				/*const takerFeeAssetData = new BigNumber(TAKER_FEE_PERCENTAGE).isGreaterThan('0')
                ? wethAssetData
                : NULL_BYTES;*/
				orderResult = {
					feeRecipientAddress: FEE_RECIPIENT,
					senderAddress: ZERO_ADDRESS,
					makerFeeAssetData: affiliateAddress
						? assetDataUtils.encodeERC20AssetData(affiliateAddress)
						: NULL_BYTES,
					takerFeeAssetData,
					makerFee: isWethTaker
						? round(orderConfigRequest.makerAssetAmount.multipliedBy(new BigNumber(MAKER_FEE_PERCENTAGE)))
						: round(orderConfigRequest.takerAssetAmount.multipliedBy(new BigNumber(MAKER_FEE_PERCENTAGE))),
					takerFee: isWethTaker
						? round(orderConfigRequest.takerAssetAmount.multipliedBy(new BigNumber(TAKER_FEE_PERCENTAGE)))
						: round(orderConfigRequest.makerAssetAmount.multipliedBy(new BigNumber(TAKER_FEE_PERCENTAGE))),
				};
			} else {
				// Used to track affiliated dex's
				const takerFeeAssetData = new BigNumber(TAKER_FEE_PERCENTAGE).isGreaterThan("0")
					? orderConfigRequest.makerAssetData
					: NULL_BYTES;
				// const  takerFeeAssetData = new BigNumber(TAKER_FEE_PERCENTAGE).isGreaterThan('0') ? orderConfigRequest.makerAssetData : NULL_BYTES;

				orderResult = {
					feeRecipientAddress: FEE_RECIPIENT,
					senderAddress: ZERO_ADDRESS,
					makerFeeAssetData: affiliateAddress
						? assetDataUtils.encodeERC20AssetData(affiliateAddress)
						: NULL_BYTES,
					takerFeeAssetData,
					makerFee: round(
						orderConfigRequest.takerAssetAmount.multipliedBy(new BigNumber(MAKER_FEE_PERCENTAGE))
					),
					takerFee: round(
						orderConfigRequest.makerAssetAmount.multipliedBy(new BigNumber(TAKER_FEE_PERCENTAGE))
					),
				};
			}
		}
	}

	return {
		...orderConfigRequest,
		...orderResult,
		chainId: CHAIN_ID,
		salt: new BigNumber(Date.now()),
	};
};

export const calculateWorstCaseProtocolFee = (orders, gasPrice) => {
	const protocolFee = new BigNumber(orders.length * PROTOCOL_FEE_MULTIPLIER).times(gasPrice);
	return protocolFee;
};

export const buildLimitOrder = async (params, side, expirationTimeSeconds, affiliateAddress = undefined) => {
	const { account, baseTokenAddress, exchangeAddress, amount, price, quoteTokenAddress } = params;

	const baseTokenAssetData = assetDataUtils.encodeERC20AssetData(baseTokenAddress);
	const quoteTokenAssetData = assetDataUtils.encodeERC20AssetData(quoteTokenAddress);

	const baseTokenDecimals = getKnownTokens().getTokenByAddress(baseTokenAddress).decimals;
	const baseTokenAmountInUnits = tokenAmountInUnitsToBigNumber(amount, baseTokenDecimals);

	const quoteTokenAmountInUnits = baseTokenAmountInUnits.multipliedBy(price);

	const quoteTokenDecimals = getKnownTokens().getTokenByAddress(quoteTokenAddress).decimals;
	const round = (num) => num.integerValue(BigNumber.ROUND_FLOOR);
	const quoteTokenAmountInBaseUnits = round(
		unitsInTokenAmount(quoteTokenAmountInUnits.toString(), quoteTokenDecimals)
	);

	const isBuy = side === OrderSide.Buy;

	const orderConfigRequest = {
		exchangeAddress,
		makerAssetData: isBuy ? quoteTokenAssetData : baseTokenAssetData,
		takerAssetData: isBuy ? baseTokenAssetData : quoteTokenAssetData,
		makerAssetAmount: isBuy ? quoteTokenAmountInBaseUnits : amount,
		takerAssetAmount: isBuy ? amount : quoteTokenAmountInBaseUnits,
		makerAddress: account,
		takerAddress: ZERO_ADDRESS,
		expirationTimeSeconds,
	};
	// timestamp ? getExpirationTimeFromDate(timestamp) : getExpirationTimeOrdersFromConfig(),
	return getOrderWithTakerAndFeeConfigFromRelayer(orderConfigRequest, undefined, affiliateAddress);
};

export const sumTakerAssetFillableOrders = (side, ordersToFill, amounts) => {
	if (ordersToFill.length !== amounts.length) {
		throw new Error("ordersToFill and amount array lengths must be the same.");
	}
	if (ordersToFill.length === 0) {
		return ZERO;
	}
	return ordersToFill.reduce((sum, order, index) => {
		// Check buildMarketOrders for more details
		const price = side === OrderSide.Buy ? 1 : order.makerAssetAmount.div(order.takerAssetAmount);
		return sum.plus(amounts[index].multipliedBy(price));
	}, ZERO);
};

export const cancelSignedOrder = async (order, gasPrice) => {
	const web3 = new Web3(Web3.givenProvider || new Web3.providers.HttpProvider(process.env.REACT_APP_NETWORK_URL));
	const web3Wrapper = new Web3Wrapper(web3.currentProvider);
	const contractWrappers = await getContractWrappers(web3.currentProvider);
	const tx = await contractWrappers.exchange.cancelOrder(order).sendTransactionAsync({
		from: order.makerAddress,
		gas: 1000000,
		gasPrice,
	});
	return web3Wrapper.awaitTransactionSuccessAsync(tx);
};
