import { getRelayer } from "../../common/relayer";
import {
	ASSET_SWAPPER_MARKET_ORDERS_OPTS,
	CHAIN_ID,
	FEE_PERCENTAGE,
	FEE_RECIPIENT,
	QUOTE_ORDER_EXPIRATION_BUFFER_MS,
} from "../../constants";
import { toUnitAmount } from "../../lib/helper";
import { assetDataUtils } from "@0x/order-utils";
import { getKnownTokens } from "../known_tokens";
import { BigNumber, RevertError } from "@0x/utils";
import { ExtensionContractType, OrderPrunerPermittedFeeTypes } from "./types";
import { isBridgeAssetData } from "./orders";
import { SwapQuoteConsumer, SwapQuoter } from "@0x/asset-swapper";
import { Web3Wrapper } from "@0x/web3-wrapper";

export class SwapService {
	_provider;
	_swapQuoter;
	_swapQuoteConsumer;
	_web3Wrapper;
	constructor(orderbook, provider, web3) {
		this._provider = provider;
		const swapQuoterOpts = {
			chainId: CHAIN_ID,
			expiryBufferMs: QUOTE_ORDER_EXPIRATION_BUFFER_MS,
			permittedOrderFeeTypes: new Set([
				OrderPrunerPermittedFeeTypes.NoFees,
				//  OrderPrunerPermittedFeeTypes.MakerDenominatedTakerFee,
				OrderPrunerPermittedFeeTypes.TakerDenominatedTakerFee,
			]),
		};
		this._swapQuoter = new SwapQuoter(this._provider, orderbook, swapQuoterOpts);
		this._swapQuoteConsumer = new SwapQuoteConsumer(this._provider);
		this._web3Wrapper = web3;
	}
	getSwapQuoteConsumer() {
		return this._swapQuoteConsumer;
	}
	async executeSwapQuote(isETHSell, quote) {
		// TODO: if ETH was specified as the token to sell but we have enought WETH, not use the forwarder
		// If ETH was specified as the token to sell then we use the Forwarder
		const extensionContractType = isETHSell ? ExtensionContractType.Forwarder : ExtensionContractType.None;
		return this._swapQuoteConsumer.executeSwapQuoteOrThrowAsync(quote, {
			useExtensionContract: extensionContractType,
			extensionContractOpts: {
				// Apply the Fee Recipient for the Forwarder
				feeRecipient: FEE_RECIPIENT,
				feePercentage: Number(FEE_PERCENTAGE),
			},
		});
	}

	async getSwapQuoteAsync(params) {
		let swapQuote;
		const {
			sellAmount,
			buyAmount,
			buyTokenAddress,
			sellTokenAddress,
			slippagePercentage,
			gasPrice: providedGasPrice,
		} = params;

		const assetSwapperOpts = {
			slippagePercentage,
			gasPrice: providedGasPrice,
			...ASSET_SWAPPER_MARKET_ORDERS_OPTS,
		};
		if (sellAmount !== undefined) {
			swapQuote = await this._swapQuoter.getMarketSellSwapQuoteAsync(
				buyTokenAddress,
				sellTokenAddress,
				sellAmount,
				assetSwapperOpts
			);
		} else if (buyAmount !== undefined) {
			swapQuote = await this._swapQuoter.getMarketBuySwapQuoteAsync(
				buyTokenAddress,
				sellTokenAddress,
				buyAmount,
				assetSwapperOpts
			);
		} else {
			throw new Error("sellAmount or buyAmount required");
		}
		const attributedSwapQuote = this._attributeSwapQuoteOrders(swapQuote);
		return attributedSwapQuote;
	}

	async calculateSwapQuoteAsync(params) {
		let swapQuote;
		const {
			sellAmount,
			buyAmount,
			buyTokenAddress,
			sellTokenAddress,
			slippagePercentage,
			gasPrice: providedGasPrice,
			isETHSell,
			from,
		} = params;

		const assetSwapperOpts = {
			slippagePercentage,
			gasPrice: providedGasPrice,
			...ASSET_SWAPPER_MARKET_ORDERS_OPTS,
		};
		if (sellAmount !== undefined) {
			swapQuote = await this._swapQuoter.getMarketSellSwapQuoteAsync(
				buyTokenAddress,
				sellTokenAddress,
				sellAmount,
				assetSwapperOpts
			);
		} else if (buyAmount !== undefined) {
			swapQuote = await this._swapQuoter.getMarketBuySwapQuoteAsync(
				buyTokenAddress,
				sellTokenAddress,
				buyAmount,
				assetSwapperOpts
			);
		} else {
			throw new Error("sellAmount or buyAmount required");
		}
		const attributedSwapQuote = this._attributeSwapQuoteOrders(swapQuote);
		const {
			makerAssetAmount,
			totalTakerAssetAmount,
			protocolFeeInWeiAmount: protocolFee,
		} = attributedSwapQuote.bestCaseQuoteInfo;
		const { orders, gasPrice } = attributedSwapQuote;

		// If ETH was specified as the token to sell then we use the Forwarder
		const extensionContractType = isETHSell ? ExtensionContractType.Forwarder : ExtensionContractType.None;
		const {
			calldataHexString: data,
			ethAmount: value,
			toAddress: to,
		} = await this._swapQuoteConsumer.getCalldataOrThrowAsync(attributedSwapQuote, {
			useExtensionContract: extensionContractType,
			extensionContractOpts: {
				// Apply the Fee Recipient for the Forwarder
				feeRecipient: FEE_RECIPIENT,
				feePercentage: FEE_PERCENTAGE,
			},
		});

		let gas;
		if (from) {
			gas = await this._estimateGasOrThrowRevertErrorAsync({
				to,
				data,
				from,
				value,
				gasPrice,
			});
		}

		const buyTokenDecimals = await this._fetchTokenDecimalsIfRequiredAsync(buyTokenAddress);
		const sellTokenDecimals = await this._fetchTokenDecimalsIfRequiredAsync(sellTokenAddress);
		const unitMakerAssetAmount = toUnitAmount(makerAssetAmount, buyTokenDecimals);
		const unitTakerAssetAMount = toUnitAmount(totalTakerAssetAmount, sellTokenDecimals);
		const price =
			buyAmount === undefined
				? unitMakerAssetAmount.dividedBy(unitTakerAssetAMount).decimalPlaces(sellTokenDecimals)
				: unitTakerAssetAMount.dividedBy(unitMakerAssetAmount).decimalPlaces(buyTokenDecimals);

		const apiSwapQuote = {
			price,
			to,
			data,
			value,
			gas,
			from,
			gasPrice,
			protocolFee,
			buyAmount: makerAssetAmount,
			sellAmount: totalTakerAssetAmount,
			orders: this._cleanSignedOrderFields(orders),
		};
		return apiSwapQuote;
	}

	async _estimateGasOrThrowRevertErrorAsync(txData) {
		// Perform this concurrently
		// if the call fails the gas estimation will also fail, we can throw a more helpful
		// error message than gas estimation failure
		const estimateGasPromise = this._web3Wrapper.estimateGasAsync(txData);
		const callResult = await this._web3Wrapper.callAsync(txData);
		throwIfRevertError(callResult);
		const gas = await estimateGasPromise;
		return new BigNumber(gas);
	}

	// tslint:disable-next-line:prefer-function-over-method
	_attributeSwapQuoteOrders(swapQuote) {
		// Where possible, attribute any fills of these orders to the Fee Recipient Address
		const attributedOrders = swapQuote.orders.map((o) => {
			try {
				const decodedAssetData = assetDataUtils.decodeAssetDataOrThrow(o.makerAssetData);
				if (isBridgeAssetData(decodedAssetData)) {
					return {
						...o,
						feeRecipientAddress: FEE_RECIPIENT,
					};
				}
				// tslint:disable-next-line:no-empty
			} catch (err) {}
			// Default to unmodified order
			return o;
		});
		const attributedSwapQuote = {
			...swapQuote,
			orders: attributedOrders,
		};
		return attributedSwapQuote;
	}

	// tslint:disable-next-line:prefer-function-over-method
	_cleanSignedOrderFields(orders) {
		return orders.map((o) => ({
			chainId: o.chainId,
			exchangeAddress: o.exchangeAddress,
			makerAddress: o.makerAddress,
			takerAddress: o.takerAddress,
			feeRecipientAddress: o.feeRecipientAddress,
			senderAddress: o.senderAddress,
			makerAssetAmount: o.makerAssetAmount,
			takerAssetAmount: o.takerAssetAmount,
			makerFee: o.makerFee,
			takerFee: o.takerFee,
			expirationTimeSeconds: o.expirationTimeSeconds,
			salt: o.salt,
			makerAssetData: o.makerAssetData,
			takerAssetData: o.takerAssetData,
			makerFeeAssetData: o.makerFeeAssetData,
			takerFeeAssetData: o.takerFeeAssetData,
			signature: o.signature,
		}));
	}
	async _fetchTokenDecimalsIfRequiredAsync(tokenAddress) {
		// HACK(dekz): Our ERC20Wrapper does not have decimals as it is optional
		// so we must encode this ourselves
		const known_tokens = getKnownTokens();
		let decimals = 18;
		// let decimals = findTokenDecimalsIfExists(tokenAddress, CHAIN_ID);
		try {
			decimals = known_tokens.getTokenByAddress(tokenAddress).decimals;
		} catch (e) {
			//
		}

		return decimals;
	}
}

let swapService;
export const getAssetSwapper = async (library, web3) => {
	const relayer = getRelayer();

	if (!swapService && library) {
		const web3Wrapper = new Web3Wrapper(library);
		swapService = new SwapService(relayer.getOrderbook(), web3Wrapper.getProvider(), web3Wrapper);
	}

	return swapService;
};

const throwIfRevertError = (result) => {
	let revertError;
	try {
		revertError = RevertError.decode(result, false);
	} catch (e) {
		// No revert error
	}
	if (revertError) {
		throw revertError;
	}
};
