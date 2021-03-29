import { createSelector } from "@reduxjs/toolkit";
import { BigNumber } from "@0x/utils";

import {
	getLastPrice,
	getTodayClosedOrdersFromFills,
	getTodayHighPriceFromFills,
	getTodayLowerPriceFromFills,
	marketToString,
} from "../utils/spot/market";
import { OrderSide, USE_RELAYER_MARKET_UPDATES, ZERO } from "../constants";
import { OrderStatus } from "@0x/types";
import { mergeByPrice } from "../utils/spot/uiOrders";
import { isWeth } from "../utils/known_tokens";

export const getGasInfo = (state) => state.currency.gasInfo;
export const getMarketStats = (state) => state.spot.marketStats;
export const getCurrencyPair = (state) => state.spot.currencyPair;
export const getEthInUsd = (state) => state.spot.ethInUsd;
export const getBaseToken = (state) => state.spot.baseToken;
export const getOrderPriceSelected = (state) => state.spotUI.orderPriceSelected;
export const getMakerAmountSelected = (state) => state.spotUI.makerAmountSelected;
export const getQuoteToken = (state) => state.spot.quoteToken;
export const getQuoteInUsd = (state) => state.spot.quoteInUsd;
export const getTokensPrice = (state) => state.market.tokensPrice;
export const getMarketMakerStats = (state) => state.spot.marketMakerStats;
export const getMarketFills = (state) => state.spotUI.marketFills;
export const getOrderBuyPriceSelected = (state) => state.spotUI.orderBuyPriceSelected;
export const getOrderSellPriceSelected = (state) => state.spotUI.orderSellPriceSelected;
export const getStepsModalCurrentStep = (state) => state.spotUI.stepsModal.currentStep;
export const getIsAffiliate = (state) => state.spotUI.isAffiliate;
export const getOrderSecondsExpirationTime = (state) => state.spotUI.orderSecondsExpirationTime;
export const getOrders = (state) => state.relayer.orders;
export const getUserOrders = (state) => state.relayer.userOrders;
export const getOrderbookState = (state) => state.relayer.orderBookState;
export const getFeeRecipient = (state) => state.relayer.feeRecipient;
export const getFeePercentage = (state) => state.relayer.feePercentage;
export const getMinOrderExpireTimeOnBooks = (state) => state.relayer.minOrderExpireTimeOnBooks;
export const getDefiProtocol = (state) => state.aave.protocol;
export const getATokensData = (state) => state.aave.aTokensData;
export const getAaveCurrency = (state) => state.aave.currency;
export const getAaveLoadingState = (state) => state.aave.aaveLoadingState;
export const getAaveReservesGQLResponse = (state) => state.aave.aaveReservesGQLResponse;
export const getAaveUserAccountData = (state) => state.aave.userAccountData;

// Current market
export const getCurrentMarketFills = createSelector(getMarketFills, getCurrencyPair, (marketFills, currencyPair) => {
	const pair = marketToString(currencyPair);
	return marketFills[pair] ? marketFills[pair] : [];
});

export const getCurrentMarketTodayHighPrice = USE_RELAYER_MARKET_UPDATES
	? createSelector(getMarketStats, (stats) => {
			if (stats) {
				return new BigNumber(stats.price_max_24);
			} else {
				return new BigNumber(0);
			}
	  })
	: createSelector(getCurrentMarketFills, (marketFills) => {
			return getTodayHighPriceFromFills(marketFills);
	  });

export const getCurrentMarketTodayLowerPrice = USE_RELAYER_MARKET_UPDATES
	? createSelector(getMarketStats, (stats) => {
			if (stats) {
				return new BigNumber(stats.price_min_24);
			} else {
				return null;
			}
	  })
	: createSelector(getCurrentMarketFills, (marketFills) => {
			return getTodayLowerPriceFromFills(marketFills);
	  });

export const getCurrentMarketTodayQuoteVolume = USE_RELAYER_MARKET_UPDATES
	? createSelector(getMarketStats, (stats) => {
			if (stats) {
				return new BigNumber(stats.quote_volume_24);
			} else {
				return new BigNumber(0);
			}
	  })
	: createSelector(getCurrentMarketFills, () => {
			return new BigNumber(0);
	  });

export const getCurrentMarketTodayClosedOrders = USE_RELAYER_MARKET_UPDATES
	? createSelector(getMarketStats, (stats) => {
			if (stats) {
				return stats.total_orders;
			} else {
				return 0;
			}
	  })
	: createSelector(getCurrentMarketFills, (marketFills) => {
			return getTodayClosedOrdersFromFills(marketFills);
	  });

export const getCurrentMarketLastPrice = USE_RELAYER_MARKET_UPDATES
	? createSelector(getMarketStats, (stats) => {
			if (stats) {
				return stats.last_price;
			} else {
				return 0;
			}
	  })
	: createSelector(getCurrentMarketFills, (marketFills) => {
			return getLastPrice(marketFills);
	  });

// Orderbook

export const getOpenOrders = createSelector(getOrders, (orders) => {
	return orders.filter((order) => order.status === OrderStatus.Fillable);
});

export const getOpenBuyOrders = createSelector(getOpenOrders, (orders) => {
	return orders.filter((order) => order.side === OrderSide.Buy).sort((o1, o2) => o2.price.comparedTo(o1.price));
});

export const getOpenSellOrders = createSelector(getOpenOrders, (orders) => {
	return orders.filter((order) => order.side === OrderSide.Sell).sort((o1, o2) => o2.price.comparedTo(o1.price));
});

export const getMySizeOrders = createSelector(getUserOrders, (userOrders) => {
	return userOrders
		.filter((userOrder) => userOrder.status === OrderStatus.Fillable)
		.map((order) => {
			let newSize = order.size;
			if (order.filled) {
				newSize = order.size.minus(order.filled);
			}
			return {
				size: newSize,
				side: order.side,
				price: order.price,
			};
		});
});

export const getOrderBook = createSelector(
	getOpenSellOrders,
	getOpenBuyOrders,
	getMySizeOrders,
	getCurrencyPair,
	(sellOrders, buyOrders, mySizeOrders, currencyPair) => {
		const orderBook = {
			sellOrders: mergeByPrice(sellOrders, currencyPair.config.pricePrecision),
			buyOrders: mergeByPrice(buyOrders, currencyPair.config.pricePrecision),
			mySizeOrders,
		};
		return orderBook;
	}
);

export const getSpread = createSelector(getOpenBuyOrders, getOpenSellOrders, (buyOrders, sellOrders) => {
	if (!buyOrders.length || !sellOrders.length) {
		return ZERO;
	}

	const lowestPriceSell = sellOrders[sellOrders.length - 1].price;
	const highestPriceBuy = buyOrders[0].price;

	return lowestPriceSell.minus(highestPriceBuy);
});

export const getSpreadInPercentage = createSelector(getSpread, getOpenSellOrders, (absSpread, sellOrders) => {
	if (!sellOrders.length) {
		return ZERO;
	}

	const lowestPriceSell = sellOrders[sellOrders.length - 1].price;
	return absSpread.dividedBy(lowestPriceSell).multipliedBy(100);
});

export const getTotalQuoteBuyOrders = createSelector(getOpenBuyOrders, (orders) => {
	return orders.length > 0
		? orders
				.map((o) => o.rawOrder.makerAssetAmount.minus(new BigNumber(o.filled || 0).multipliedBy(o.price)))
				.reduce((p, c) => p.plus(c))
		: new BigNumber(0);
});

export const getTotalBaseSellOrders = createSelector(getOpenSellOrders, (orders) => {
	return orders.length > 0
		? orders.map((o) => o.size.minus(new BigNumber(o.filled || 0))).reduce((p, c) => p.plus(c))
		: new BigNumber(0);
});

export const searchToken = ({ tokenBalances, tokenToFind, wethTokenBalance }) => {
	if (tokenToFind && isWeth(tokenToFind.symbol)) {
		return wethTokenBalance;
	}
	return (
		tokenBalances.find((tokenBalance) => tokenBalance.token.symbol === (tokenToFind && tokenToFind.symbol)) || null
	);
};
