import { createAction } from "@reduxjs/toolkit";
import { FEE_PERCENTAGE, FEE_RECIPIENT, OrderSide, ServerState, ZERO } from "../../constants";
import { getKnownTokens, getWethAssetData, isWeth, isWhackd } from "../../utils/known_tokens";
import { getMarketFillsFromRelayer, getRelayer, startWebsocketMarketsSubscription } from "../../common/relayer";
import { marketToString } from "../../common/markets";
import { mapRelayerFillToFill } from "../../utils/spot/fills";
import { addMarketFills } from "../spotUI/actions";
import BigNumber from "bignumber.js";
import { getCurrencyPairByTokensSymbol } from "../../utils/spot/knownCurrencyPair";
import { unitsInTokenAmount } from "../../utils/spot/tokens";
import {
	buildLimitOrder,
	buildMarketLimitMatchingOrders,
	buildMarketOrders,
	calculateWorstCaseProtocolFee,
	cancelSignedOrder,
	getAllOrdersAsUIOrders,
	getUserOrdersAsUIOrders,
	sumTakerAssetFillableOrders,
} from "../../utils/spot/orders";
import { getExpirationTimeOrdersFromConfig, todayInSeconds } from "../../utils/spot/timeUtils";
import {
	getBaseToken,
	getFeePercentage,
	getFeeRecipient,
	getGasInfo,
	getMarketMakerStats,
	getOpenBuyOrders,
	getOpenSellOrders,
	getQuoteToken,
} from "../selectors";
import { getContractWrappers } from "../../utils/spot/contractWrapper";
import { RelayerException } from "../../lib/exceptions/relayer";
import { INSUFFICIENT_ORDERS_TO_FILL_AMOUNT_ERR } from "../../lib/exceptions/common";
import { InsufficientOrdersAmountException } from "../../lib/exceptions/order";
import { setMarketMakerStats } from "../spot/actions";

export const setOrderBookState = createAction("relayer/ORDERBOOK_STATE_set");

export const setMarketFillState = createAction("relayer/MARKET_FILLS_STATE_set");

export const setOrders = createAction("relayer/ORDERS_set");

export const setUserOrders = createAction("relayer/USER_ORDERS_set");

export const setMarketsStatsState = createAction("relayer/MARKET_STATS_STATE_set");

export const setMinOrderExpireTimeOnBooks = createAction("relayer/MIN_ORDER_EXPIRE_TIME_ON_BOOKS_set");

export const fetchPastMarketFills = () => {
	return async (dispatch, getState) => {
		const state = getState();
		const currencyPair = state.spot.currencyPair;
		const market = marketToString(currencyPair);
		try {
			const marketFillsResponse = await getMarketFillsFromRelayer(market);
			const known_tokens = getKnownTokens();

			if (marketFillsResponse) {
				const fills = marketFillsResponse.records;
				if (fills.length > 0) {
					const filteredFills = fills
						.filter(
							(f) =>
								known_tokens.isKnownAddress(f.tokenQuoteAddress) &&
								known_tokens.isKnownAddress(f.tokenBaseAddress)
						)
						.map(mapRelayerFillToFill);
					if (filteredFills && filteredFills.length > 0) {
						const marketsFill = {};
						filteredFills.forEach((f) => {
							if (marketsFill[f.market]) {
								marketsFill[f.market].push(f);
							} else {
								marketsFill[f.market] = [f];
							}
						});
						dispatch(addMarketFills(marketsFill));
					}
				}
			}
			dispatch(setMarketFillState(ServerState.Done));
		} catch (error) {
			dispatch(setMarketFillState(ServerState.Error));
		}
	};
};

export const getAllOrders = (account, library) => {
	return async (dispatch, getState) => {
		const state = getState();
		const baseToken = state.spot.baseToken;
		const quoteToken = state.spot.quoteToken;
		const minOrderExpireTimeOnBooks = state.relayer.minOrderExpireTimeOnBooks;
		const makerAddresses = state.spot.makerAddresses;
		try {
			let uiOrders = [];
			// filter orders that will expire to avoid problems on confirmation but not filter
			//  user orders they maybe wanna cancel them
			const filterExpiredOrdersOnBook = (uiOrder) => {
				if (
					account &&
					(uiOrder.rawOrder.makerAddress.toLowerCase() === account ||
						uiOrder.rawOrder.takerAddress.toLowerCase() === account)
				) {
					return true;
				}
				if (
					minOrderExpireTimeOnBooks &&
					uiOrder.rawOrder.expirationTimeSeconds.minus(minOrderExpireTimeOnBooks).gt(todayInSeconds())
				) {
					return true;
				} else {
					return false;
				}
			};
			// filter orders that not meet the minimum defined, not filter user orders
			const minSizeOrdersOnBook = (uiOrder) => {
				if (
					account &&
					(uiOrder.rawOrder.makerAddress.toLowerCase() === account ||
						uiOrder.rawOrder.takerAddress.toLowerCase() === account)
				) {
					return true;
				}
				const currencyPair = getCurrencyPairByTokensSymbol(baseToken.symbol, quoteToken.symbol);
				const minAmountToken = unitsInTokenAmount(
					new BigNumber(currencyPair.config.minAmount).toString(),
					baseToken.decimals
				);

				if (uiOrder.filled && uiOrder.size.minus(uiOrder.filled).lt(minAmountToken)) {
					return false;
				} else {
					return true;
				}
			};

			// tslint:disable-next-line:prefer-conditional-expression
			uiOrders = (await getAllOrdersAsUIOrders(baseToken, quoteToken, makerAddresses, library))
				.filter(filterExpiredOrdersOnBook)
				.filter(minSizeOrdersOnBook);
			dispatch(setOrders(uiOrders));
			dispatch(setOrderBookState(ServerState.Done));
		} catch (err) {
			dispatch(setOrderBookState(ServerState.Error));
		}
	};
};

export const getUserOrders = (account, library) => {
	return async (dispatch, getState) => {
		const state = getState();
		const baseToken = state.spot.baseToken;
		const quoteToken = state.spot.quoteToken;

		try {
			const myUIOrders = await getUserOrdersAsUIOrders(baseToken, quoteToken, account, library);
			dispatch(setUserOrders(myUIOrders));
		} catch (err) {
			console.log(err);
		}
	};
};

export const getOrderbookAndUserOrders = (account, library) => {
	return async (dispatch) => {
		// tslint:disable-next-line:no-floating-promises
		dispatch(getAllOrders(account, library));
		// tslint:disable-next-line:no-floating-promises
		dispatch(getUserOrders(account, library));
	};
};

export const fetchTakerAndMakerFee = (amount, price, side, account, library) => {
	return async (dispatch, getState) => {
		const state = getState();
		const ethAccount = account;
		const baseToken = getBaseToken(state);
		const quoteToken = getQuoteToken(state);
		const contractWrappers = await getContractWrappers(library);

		const order = await buildLimitOrder(
			{
				account: ethAccount,
				amount,
				price,
				baseTokenAddress: baseToken.address,
				quoteTokenAddress: quoteToken.address,
				exchangeAddress: contractWrappers.exchange.address,
			},
			side,
			getExpirationTimeOrdersFromConfig()
		);

		const { makerFee, takerFee, makerFeeAssetData, takerFeeAssetData } = order;

		return {
			makerFee,
			takerFee,
			makerFeeAssetData,
			takerFeeAssetData,
		};
	};
};

export const submitLimitOrder = (signedOrder) => {
	return async (dispatch) => {
		try {
			const submitResult = await getRelayer().submitOrderAsync(signedOrder);
			// tslint:disable-next-line:no-floating-promises
			dispatch(getOrderbookAndUserOrders());

			return submitResult;
		} catch (error) {
			throw new RelayerException(error.message);
		}
	};
};

export const submitLimitMatchingOrder = (amount, price, side, ethAccount, library) => {
	return async (dispatch, getState) => {
		const state = getState();
		const gasInfo = getGasInfo(state);
		const gasPrice = gasInfo.gasPriceInWei;
		const baseToken = getBaseToken(state);
		const feePercentange = Number(getFeePercentage(state)) || FEE_PERCENTAGE;
		const feeRecipient = getFeeRecipient(state) || FEE_RECIPIENT;
		const isBuy = side === OrderSide.Buy;
		const allOrders = isBuy ? getOpenSellOrders(state) : getOpenBuyOrders(state);

		const { ordersToFill, amounts, remainingAmount } = buildMarketLimitMatchingOrders(
			{
				amount,
				price,
				orders: allOrders,
			},
			side
		);

		if (ordersToFill.length > 0) {
			const contractWrappers = await getContractWrappers(library);
			const quoteToken = getQuoteToken(state);

			const ethAmountRequired = amounts.reduce((total, currentValue) => {
				return total.plus(currentValue);
			}, ZERO);
			const wethAssetData = getWethAssetData();
			let takerWethFee = new BigNumber(0);

			for (const or of ordersToFill) {
				if (or.takerFeeAssetData.toLowerCase() === wethAssetData && or.takerFee.gt(0)) {
					takerWethFee = takerWethFee.plus(or.takerFee);
				}
			}
			const protocolFee = calculateWorstCaseProtocolFee(ordersToFill, gasPrice);
			// const feeAmount = ordersToFill.map(o => o.makerFee).reduce((p, c) => p.plus(c));
			const affiliateFeeAmount = ethAmountRequired
				.plus(protocolFee)
				.multipliedBy(feePercentange)
				.integerValue(BigNumber.ROUND_UP);

			const totalEthAmount = ethAmountRequired
				.plus(protocolFee.multipliedBy(1.3))
				.plus(affiliateFeeAmount)
				.plus(takerWethFee);

			// HACK(dekz): Forwarder not currently deployed in Ganache
			const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
			const isMarketBuyForwarder =
				isBuy &&
				isWeth(quoteToken.symbol) &&
				!isWhackd(baseToken.symbol) &&
				contractWrappers.forwarder.address !== NULL_ADDRESS;
			const orderSignatures = ordersToFill.map((o) => o.signature);

			let txHash;
			try {
				if (isMarketBuyForwarder) {
					txHash = await contractWrappers.forwarder
						.marketBuyOrdersWithEth(
							ordersToFill,
							amount,
							orderSignatures,
							[affiliateFeeAmount],
							[feeRecipient]
						)
						.sendTransactionAsync({
							from: ethAccount,
							value: totalEthAmount,
							gas: 1000000,
							gasPrice,
						});
				} else {
					if (isBuy) {
						txHash = await contractWrappers.exchange
							.marketBuyOrdersFillOrKill(ordersToFill, amount, orderSignatures)
							.sendTransactionAsync({
								from: ethAccount,
								value: protocolFee,
								gas: 1000000,
								gasPrice,
							});
					} else {
						txHash = await contractWrappers.exchange
							.marketSellOrdersFillOrKill(ordersToFill, amount, orderSignatures)
							.sendTransactionAsync({
								from: ethAccount,
								value: protocolFee,
								gas: 1000000,
								gasPrice,
							});
					}
				}
			} catch (e) {
				throw e;
			}
			// tslint:disable-next-line:no-floating-promises
			dispatch(getOrderbookAndUserOrders());
			const amountInReturn = sumTakerAssetFillableOrders(side, ordersToFill, amounts);
			return { txHash, amountInReturn };
		} else {
			return { remainingAmount };
		}
	};
};

export const submitMarketOrder = (amount, side, ethAccount, library) => {
	return async (dispatch, getState) => {
		const state = getState();
		const feeRecipient = getFeeRecipient(state) || FEE_RECIPIENT;
		const feePercentange = Number(getFeePercentage(state)) || Number(FEE_PERCENTAGE);
		const gasInfo = getGasInfo(state);
		const gasPrice = gasInfo.gasPriceInWei;
		const isBuy = side === OrderSide.Buy;
		const orders = isBuy ? getOpenSellOrders(state) : getOpenBuyOrders(state);
		const [ordersToFill, amounts, canBeFilled] = buildMarketOrders(
			{
				amount,
				orders,
			},
			side
		);

		if (canBeFilled) {
			const baseToken = getBaseToken(state);
			const quoteToken = getQuoteToken(state);
			const contractWrappers = await getContractWrappers(library);
			const wethAssetData = getWethAssetData();
			let takerWethFee = new BigNumber(0);
			// Check if the order is fillable using the forwarder
			const ethAmountRequired = amounts.reduce((total, currentValue) => {
				return total.plus(currentValue);
			}, ZERO);

			for (const or of ordersToFill) {
				if (or.takerFeeAssetData.toLowerCase() === wethAssetData && or.takerFee.gt(0)) {
					takerWethFee = takerWethFee.plus(or.takerFee);
				}
			}
			const protocolFee = calculateWorstCaseProtocolFee(ordersToFill, gasPrice);

			const affiliateFeeAmount = ethAmountRequired
				.plus(protocolFee)
				.multipliedBy(feePercentange)
				.integerValue(BigNumber.ROUND_UP);

			const totalEthAmount = ethAmountRequired
				.plus(protocolFee.multipliedBy(1.3))
				.plus(affiliateFeeAmount)
				.plus(takerWethFee);

			// HACK(dekz): Forwarder not currently deployed in Ganache
			const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
			const isMarketBuyForwarder =
				isBuy &&
				isWeth(quoteToken.symbol) &&
				// TODO: Remove this workaround, whacked is not working with forwarder
				!isWhackd(baseToken.symbol) &&
				contractWrappers.forwarder.address !== NULL_ADDRESS;
			const orderSignatures = ordersToFill.map((o) => o.signature);
			let txHash;
			try {
				if (isMarketBuyForwarder) {
					txHash = await contractWrappers.forwarder
						.marketBuyOrdersWithEth(
							ordersToFill,
							amount,
							orderSignatures,
							[affiliateFeeAmount],
							[feeRecipient]
						)
						.sendTransactionAsync({
							from: ethAccount,
							value: totalEthAmount,
							gas: 1000000,
							gasPrice,
						});
				} else {
					if (isBuy) {
						txHash = await contractWrappers.exchange
							.marketBuyOrdersFillOrKill(ordersToFill, amount, orderSignatures)
							.sendTransactionAsync({
								from: ethAccount,
								value: protocolFee.multipliedBy(1.2),
								gas: 1000000,
								gasPrice,
							});
					} else {
						txHash = await contractWrappers.exchange
							.marketSellOrdersFillOrKill(ordersToFill, amount, orderSignatures)
							.sendTransactionAsync({
								from: ethAccount,
								value: protocolFee.multipliedBy(1.2),
								gas: 1000000,
								gasPrice,
							});
					}
				}
			} catch (e) {
				throw e;
			}

			// tslint:disable-next-line:no-floating-promises
			dispatch(getOrderbookAndUserOrders());

			const amountInReturn = sumTakerAssetFillableOrders(side, ordersToFill, amounts);

			return { txHash, amountInReturn };
		} else {
			window.alert(INSUFFICIENT_ORDERS_TO_FILL_AMOUNT_ERR);
			throw new InsufficientOrdersAmountException();
		}
	};
};

export const cancelOrder = (order) => {
	return async (dispatch, getState) => {
		const state = getState();
		const baseToken = getBaseToken(state);
		const gasInfo = getGasInfo(state);
		const gasPrice = gasInfo.gasPriceInWei;

		const tx = cancelSignedOrder(order.rawOrder, gasPrice);

		// tslint:disable-next-line:no-floating-promises no-unsafe-any
		tx.then((transaction) => {
			// tslint:disable-next-line:no-floating-promises
			dispatch(getOrderbookAndUserOrders());
		});
	};
};

export const subscribeToRelayerWebsocketFillEvents = (ethAccount) => {
	return async (dispatch, getState) => {
		const onmessage = (ev) => {
			try {
				const state = getState();
				const marketMakerStats = getMarketMakerStats(state);
				const fillMessage = JSON.parse(ev.data);
				if (fillMessage.action === "FILL") {
					const fill = fillMessage.event;
					const known_tokens = getKnownTokens();
					if (
						known_tokens.isKnownAddress(fill.quoteTokenAddress) &&
						known_tokens.isKnownAddress(fill.baseTokenAddress)
					) {
						const newFill = {
							id: fill.id,
							amountQuote: new BigNumber(fill.filledQuoteTokenAmount),
							amountBase: new BigNumber(fill.filledBaseTokenAmount),
							tokenQuote: known_tokens.getTokenByAddress(fill.quoteTokenAddress),
							tokenBase: known_tokens.getTokenByAddress(fill.baseTokenAddress),
							side: fill.type === "BUY" ? OrderSide.Buy : OrderSide.Sell,
							price: fill.price,
							timestamp: new Date(fill.timestamp),
							makerAddress: fill.makerAddress,
							takerAddress: fill.takerAddress,
							market: fill.pair,
						};
						/* We are not using 0x market trades anymore

                           dispatch(addFills([newFill]));
                        */
						dispatch(
							addMarketFills({
								[fill.pair]: [newFill],
							})
						);
						// Compute market maker stats
						try {
							if (ethAccount && fill.makerAddress.toLowerCase() === ethAccount.toLowerCase()) {
								const statsIndex = marketMakerStats.findIndex(
									(m) => m.account === ethAccount && m.market === fill.pair
								);
								const known_tokens = getKnownTokens();
								const wethTokenAddress = known_tokens.getWethToken().address.toLowerCase();
								if (statsIndex !== -1) {
									const stats = marketMakerStats[statsIndex];
									const takerFeePaid =
										fill.takerFeeAddress.toLowerCase() === wethTokenAddress
											? new BigNumber(fill.takerFeePaid)
											: new BigNumber(0);
									const makerFeePaid =
										fill.makerFeeAddress.toLowerCase() === wethTokenAddress
											? new BigNumber(fill.makerFeePaid)
											: new BigNumber(0);

									stats.protocolFeesCollected = stats.protocolFeesCollected.plus(
										fill.protocolFeePaid
									);
									stats.totalWethFeesCollected = stats.totalWethFeesCollected.plus(
										takerFeePaid.plus(makerFeePaid)
									);
									stats.totalOrders = stats.totalOrders.plus(1);
									stats.endStats = new Date();
									if (fill.type === "BUY") {
										stats.totalBuyOrders = stats.totalBuyOrders.plus(1);
										stats.medianBuyPrice = stats.medianBuyPrice.plus(
											new BigNumber(fill.price)
												.minus(stats.medianBuyPrice)
												.dividedBy(stats.totalBuyOrders)
										);
										stats.totalBuyBaseVolume = stats.totalBuyBaseVolume.plus(
											fill.filledBaseTokenAmount
										);
										stats.totalBuyQuoteVolume = stats.totalBuyBaseVolume.plus(
											fill.filledQuoteTokenAmount
										);
									} else {
										stats.totalSellOrders = stats.totalBuyOrders.plus(1);
										stats.medianSellPrice = stats.medianSellPrice.plus(
											new BigNumber(fill.price)
												.minus(stats.medianSellPrice)
												.dividedBy(stats.totalSellOrders)
										);
										stats.totalSellBaseVolume = stats.totalSellBaseVolume.plus(
											fill.filledBaseTokenAmount
										);
										stats.totalSellQuoteVolume = stats.totalSellBaseVolume.plus(
											fill.filledQuoteTokenAmount
										);
									}
									marketMakerStats[statsIndex] = stats;
									dispatch(setMarketMakerStats(marketMakerStats));
								} else {
									const takerFeePaid =
										fill.takerFeeAddress.toLowerCase() === wethTokenAddress
											? new BigNumber(fill.takerFeePaid)
											: new BigNumber(0);
									const makerFeePaid =
										fill.makerFeeAddress.toLowerCase() === wethTokenAddress
											? new BigNumber(fill.makerFeePaid)
											: new BigNumber(0);

									const newStats = {
										market: fill.pair,
										account: ethAccount,
										protocolFeesCollected: new BigNumber(fill.protocolFeePaid || 0),
										totalWethFeesCollected: takerFeePaid.plus(makerFeePaid),
										totalOrders: new BigNumber(1),
										totalBuyOrders: fill.type === "BUY" ? new BigNumber(1) : new BigNumber(0),
										totalSellOrders: fill.type === "SELL" ? new BigNumber(1) : new BigNumber(0),
										medianBuyPrice:
											fill.type === "BUY" ? new BigNumber(fill.price) : new BigNumber(0),
										medianSellPrice:
											fill.type === "SELL" ? new BigNumber(fill.price) : new BigNumber(0),
										totalBuyBaseVolume:
											fill.type === "BUY"
												? new BigNumber(fill.filledBaseTokenAmount)
												: new BigNumber(0),
										totalBuyQuoteVolume:
											fill.type === "BUY"
												? new BigNumber(fill.filledQuoteTokenAmount)
												: new BigNumber(0),
										totalSellBaseVolume:
											fill.type === "SELL"
												? new BigNumber(fill.filledBaseTokenAmount)
												: new BigNumber(0),
										totalSellQuoteVolume:
											fill.type === "SELL"
												? new BigNumber(fill.filledQuoteTokenAmount)
												: new BigNumber(0),
										totalQuoteVolume: new BigNumber(fill.filledQuoteTokenAmount),
										totalBaseVolume: new BigNumber(fill.filledBaseTokenAmount),
										startingStats: new Date(),
										endStats: new Date(),
									};
									marketMakerStats.push(newStats);
									dispatch(setMarketMakerStats(marketMakerStats));
								}
							}
						} catch (error) {
							console.log(error);
						}
					}
				}
			} catch (error) {
				console.log(error);
			}
		};

		try {
			startWebsocketMarketsSubscription(onmessage);
		} catch (error) {
			console.log(error);
		}
	};
};
