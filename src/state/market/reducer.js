import { createReducer } from "@reduxjs/toolkit";

import {
	saveAllTokens,
	saveMarketCoins,
	saveSelectedCoin,
	setHistorical,
	setLoading,
	setCoinMarketPrices,
	setCoinPriceLoading,
} from "./actions";

const initialState = {
	allTokens: {
		data: [],
		loading: false,
		page: 1,
		total: 0,
	},
	marketCoins: {
		data: [],
		prices: {
			data: {},
			loading: {},
		},
		loading: false,
	},
	selected: {
		id: null,
		data: null,
		loading: false,
	},
	historical: {
		id: null,

		data: {
			30: {
				price: [],
				market_cap: [],
				total_volume: [],
			},
		},
		loading: false,
	},
};

export default createReducer(initialState, (builder) => {
	builder
		.addCase(setLoading, (state, { payload }) => {
			state[payload.type].loading = payload.value;
		})
		.addCase(saveAllTokens, (state, { payload }) => {
			state.allTokens.data = payload.data;
			state.allTokens.page = payload.page;
			state.allTokens.total = payload.total;
		})
		.addCase(saveMarketCoins, (state, { payload }) => {
			state.marketCoins.data = payload;
		})
		.addCase(saveSelectedCoin, (state, { payload }) => {
			state.selected.data = payload.data;
			state.selected.id = payload.id;
		})
		.addCase(setHistorical, (state, { payload }) => {
			state.historical.id = payload.id;
			state.historical.data = payload.data;
		})
		.addCase(setCoinPriceLoading, (state, { payload }) => {
			state.marketCoins.prices.loading[payload.id] = payload.value;
		})
		.addCase(setCoinMarketPrices, (state, { payload }) => {
			state.marketCoins.prices.data[payload.id] = payload.result;
		});
});
