import { getAvailableMarkets } from "../../common/markets";
import { getKnownTokens } from "../../utils/known_tokens";
import { getCurrencyPairByTokensSymbol } from "../../utils/spot/knownCurrencyPair";
import queryString from "query-string";
import { createReducer } from "@reduxjs/toolkit";
import * as actions from "./actions";

const parsedUrl = new URL(window.location.href.replace("#/", ""));
const base = parsedUrl.searchParams.get("base") || getAvailableMarkets()[0].base;
const quote = parsedUrl.searchParams.get("quote") || getAvailableMarkets()[0].quote;
let currencyPair;

const known_tokens = getKnownTokens();

try {
	currencyPair = getCurrencyPairByTokensSymbol(base, quote);
} catch (e) {
	currencyPair = getCurrencyPairByTokensSymbol(getAvailableMarkets()[0].base, getAvailableMarkets()[0].quote);
}

const getMakerAddresses = () => {
	const makerAddressesString = queryString.parse(queryString.extract(window.location.hash)).makerAddresses;
	if (!makerAddressesString) {
		return null;
	}
	const makerAddresses = makerAddressesString.split(",");
	return makerAddresses.map((a) => a.toLowerCase());
};

const initialMarketState = {
	currencyPair,
	baseToken: known_tokens.getTokenBySymbol(currencyPair.base),
	quoteToken: known_tokens.getTokenBySymbol(currencyPair.quote),
	markets: null,
	ethInUsd: null,
	tokensPrice: null,
	marketStats: null,
	makerAddresses: getMakerAddresses(),
	marketsStats: [],
	marketMakerStats: [],
};

export default createReducer(initialMarketState, (builder) => {
	builder
		.addCase(actions.setCurrencyPair, (state, { payload }) => {
			return { ...state, currencyPair: payload };
		})
		.addCase(actions.setMarketTokens, (state, { payload }) => {
			return {
				...state,
				baseToken: payload.baseToken,
				quoteToken: payload.quoteToken,
			};
		})
		.addCase(actions.setMarketStats, (state, { payload }) => {
			return {
				...state,
				marketStats: payload,
			};
		})
		.addCase(actions.fetchMarketPriceQuoteStart, (state, action) => {
			return {
				...state,
				quoteInUsd: null,
			};
		})
		.addCase(actions.fetchMarketPriceQuoteUpdate, (state, { payload }) => {
			return {
				...state,
				quoteInUsd: payload,
			};
		})
		.addCase(actions.fetchMarketPriceQuoteError, (state, { payload }) => {
			return {
				...state,
				quoteInUsd: null,
			};
		})
		.addCase(actions.setMarketsStats, (state, { payload }) => {
			return { ...state, marketsStats: payload };
		})
		.addCase(actions.setMarkets, (state, { payload }) => {
			return { ...state, markets: payload };
		})
		.addCase(actions.fetchERC20MarketsError, (state, { payload }) => {
			return state;
		})
		.addCase(actions.fetchMarketPriceEtherStart, (state, { payload }) => {
			return state;
		})
		.addCase(actions.fetchMarketPriceEtherError, (state, { payload }) => {
			return state;
		})
		.addCase(actions.fetchMarketPriceEtherUpdate, (state, { payload }) => {
			return { ...state, ethInUsd: payload };
		})
		.addCase(actions.fetchMarketPriceTokensStart, (state, { payload }) => {
			return state;
		})
		.addCase(actions.fetchMarketPriceTokensUpdate, (state, { payload }) => {
			return { ...state, tokensPrice: payload };
		})
		.addCase(actions.fetchMarketPriceTokensError, (state, { payload }) => {
			return state;
		})
		.addCase(actions.setMarketMakerStats, (state, action) => {
			return { ...state, marketMakerStats: action.payload };
		});
});
