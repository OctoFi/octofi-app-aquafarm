import { createAction } from "@reduxjs/toolkit";

import { getKnownTokens } from "../../utils/known_tokens";
import { ServerState, USE_ORDERBOOK_PRICES, USE_RELAYER_MARKET_UPDATES } from "../../constants";
import {
	fetchPastMarketFills,
	getOrderbookAndUserOrders,
	setMarketFillState,
	setMarketsStatsState,
	setOrderBookState,
} from "../relayer/actions";
import {
	getAvailableMarkets,
	getMarketPriceEther,
	getMarketPriceQuote,
	getMarketPriceTokens,
	marketToString,
} from "../../common/markets";
import { getAllMarketsStatsFromRelayer, getMarketStatsFromRelayer, getRelayer } from "../../common/relayer";
import { getCurrencyPair, getOrderBook } from "../selectors";

export const setCurrencyPair = createAction("market/CURRENCY_PAIR_set");

export const setMarketTokens = createAction("market/MARKET_TOKENS_set", ({ baseToken, quoteToken }) => {
	return {
		payload: { baseToken, quoteToken },
	};
});

export const setMarketStats = createAction("market/MARKET_STATS_set");

export const setMarketsStats = createAction("market/MARKETS_STATS_set");

export const fetchMarketPriceQuoteStart = createAction("market/PRICE_QUOTE_fetch_request");

export const fetchMarketPriceQuoteUpdate = createAction("market/PRICE_QUOTE_fetch_success");
// Market Price Quote Actions
export const fetchMarketPriceQuoteError = createAction("market/PRICE_QUOTE_fetch_failure");

export const setMarkets = createAction("market/MARKETS_set");

export const fetchERC20MarketsError = createAction("market/ERC20_MARKETS_TOKENS_fetch_failure");

export const fetchMarketPriceEtherStart = createAction("market/PRICE_ETHER_fetch_request");

export const fetchMarketPriceEtherError = createAction("market/PRICE_ETHER_fetch_failure");

export const fetchMarketPriceEtherUpdate = createAction("market/PRICE_ETHER_fetch_success");

export const fetchMarketPriceTokensStart = createAction("market/PRICE_TOKENS_fetch_request");

export const fetchMarketPriceTokensUpdate = createAction("market/PRICE_TOKENS_fetch_success");

export const fetchMarketPriceTokensError = createAction("market/PRICE_TOKENS_fetch_failure");

export const setMarketMakerStats = createAction("market/MARKET_MAKER_STATS_set");

export const changeMarket = (currencyPair, account, library) => {
	return async (dispatch, getState) => {
		const state = getState();
		const oldQuoteToken = state.market.quoteToken;
		const knownTokens = getKnownTokens();
		dispatch(setOrderBookState(ServerState.NotLoaded));
		dispatch(setMarketFillState(ServerState.NotLoaded));
		try {
			const newQuoteToken = knownTokens.getTokenBySymbol(currencyPair.quote);
			dispatch(
				setMarketTokens({
					baseToken: knownTokens.getTokenBySymbol(currencyPair.base),
					quoteToken: newQuoteToken,
				})
			);
			dispatch(setCurrencyPair(currencyPair));

			// if quote token changed, update quote price
			if (oldQuoteToken !== newQuoteToken) {
				try {
					await dispatch(updateMarketPriceQuote());
				} catch (e) {
					console.log(e);
				}
			}
		} catch (e) {
			console.log(e);
		}
		if (USE_RELAYER_MARKET_UPDATES) {
			// tslint:disable-next-line:no-floating-promises
			dispatch(fetchPastMarketFills());
			// tslint:disable-next-line:no-floating-promises
			dispatch(updateMarketStats());
		}

		// tslint:disable-next-line:no-floating-promises
		dispatch(getOrderbookAndUserOrders(account, library));
	};
};

export const updateMarketStats = () => {
	return async (dispatch, getState) => {
		const state = getState();
		const currencyPair = state.spot.currencyPair;
		const market = marketToString(currencyPair);
		try {
			const marketStats = await getMarketStatsFromRelayer(market);
			if (marketStats) {
				dispatch(setMarketStats(marketStats));
			}
		} catch (error) {
			console.log(error);
		}
	};
};

export const updateMarketPriceQuote = () => {
	return async (dispatch, getState) => {
		dispatch(fetchMarketPriceQuoteStart());
		const state = getState();
		try {
			const quoteToken = state.market.quoteToken;
			if (quoteToken && quoteToken.c_id) {
				// if ethereum price is already fetched we use it
				if (quoteToken.c_id === "ethereum" && state.market.ethInUsd) {
					dispatch(fetchMarketPriceQuoteUpdate(state.market.ethInUsd));
				} else {
					const marketPriceQuoteData = await getMarketPriceQuote(quoteToken.c_id);
					dispatch(fetchMarketPriceQuoteUpdate(marketPriceQuoteData));
				}
			} else {
				throw new Error("Quote Token Need ID");
			}
		} catch (err) {
			dispatch(fetchMarketPriceQuoteError(err));
		}
	};
};

export const fetchMarkets = () => {
	return async (dispatch, getState) => {
		const knownTokens = getKnownTokens();
		const relayer = getRelayer();
		if (!USE_ORDERBOOK_PRICES) {
			const marketsStats = await getAllMarketsStatsFromRelayer();
			dispatch(setMarketsStats(marketsStats));
			dispatch(setMarketsStatsState(ServerState.Done));
			const state = getState();
			const currencyPair = getCurrencyPair(state);
			const market = marketToString(currencyPair);
			if (marketsStats && marketsStats.length > 0) {
				const singleMarket = marketsStats.find((m) => m.pair === market);
				if (singleMarket) {
					dispatch(setMarketStats(singleMarket));
				}
			}
		}
		let markets = await Promise.all(
			getAvailableMarkets().map(async (availableMarket) => {
				try {
					const baseToken = knownTokens.getTokenBySymbol(availableMarket.base);
					const quoteToken = knownTokens.getTokenBySymbol(availableMarket.quote);
					if (USE_ORDERBOOK_PRICES) {
						const marketData = await relayer.getCurrencyPairMarketDataAsync(baseToken, quoteToken);
						return {
							currencyPair: availableMarket,
							...marketData,
						};
					} else {
						return {
							currencyPair: availableMarket,
							bestAsk: null,
							bestBid: null,
							spreadInPercentage: null,
						};
					}
				} catch (err) {
					return {
						currencyPair: availableMarket,
						bestAsk: null,
						bestBid: null,
						spreadInPercentage: null,
					};
				}
			})
		);

		markets = markets.filter((value) => {
			return value && value.currencyPair;
		});

		if (USE_RELAYER_MARKET_UPDATES) {
			// tslint:disable-next-line:no-floating-promises
			dispatch(fetchPastMarketFills());
			// tslint:disable-next-line:no-floating-promises
			dispatch(updateMarketStats());
		}

		if (markets && markets.length > 0) {
			dispatch(setMarkets(markets));
		}
		return markets;
	};
};

export const updateMarketPriceEther = () => {
	return async (dispatch) => {
		dispatch(fetchMarketPriceEtherStart());

		try {
			const marketPriceEtherData = await getMarketPriceEther();
			dispatch(fetchMarketPriceEtherUpdate(marketPriceEtherData));
		} catch (err) {
			dispatch(fetchMarketPriceEtherError(err));
		}
	};
};

export const updateMarketPriceTokens = (tokenBalances, wethBalance) => {
	return async (dispatch) => {
		dispatch(fetchMarketPriceTokensStart());
		try {
			let tBalances = [];
			wethBalance ? (tBalances = [...tokenBalances, wethBalance]) : (tBalances = [...tokenBalances]);
			const tokensPrices = await getMarketPriceTokens(tBalances);
			dispatch(fetchMarketPriceTokensUpdate(tokensPrices));
		} catch (err) {
			dispatch(fetchMarketPriceTokensError(err));
		}
	};
};

export const updateERC20Store = (account, library) => {
	return async (dispatch, getState) => {
		const state = getState();
		try {
			const knownTokens = getKnownTokens();
			const currencyPair = getCurrencyPair(state);
			const baseToken = knownTokens.getTokenBySymbol(currencyPair.base);
			const quoteToken = knownTokens.getTokenBySymbol(currencyPair.quote);

			dispatch(setMarketTokens({ baseToken, quoteToken }));
			dispatch(getOrderbookAndUserOrders(account, library));

			// await dispatch(fetchMarkets());
		} catch (error) {
			const knownTokens = getKnownTokens();
			const currencyPair = getCurrencyPair(state);
			const baseToken = knownTokens.getTokenBySymbol(currencyPair.base);
			const quoteToken = knownTokens.getTokenBySymbol(currencyPair.quote);

			dispatch(setMarketTokens({ baseToken, quoteToken }));
			dispatch(getOrderBook());
		}
	};
};

export const updateERC20Markets = () => {
	return async (dispatch) => {
		try {
			// tslint:disable-next-line:no-floating-promises
			dispatch(fetchMarkets());
			if (USE_RELAYER_MARKET_UPDATES) {
				dispatch(updateMarketStats());
			}
		} catch (error) {
			dispatch(fetchERC20MarketsError(error));
		}
	};
};
