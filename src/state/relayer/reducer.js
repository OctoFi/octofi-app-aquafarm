import { createReducer } from "@reduxjs/toolkit";

import { FEE_PERCENTAGE, FEE_RECIPIENT, MIN_ORDER_EXPIRATION_TIME_ON_ORDERBOOK, ServerState } from "../../constants";
import * as actions from "./actions";

const initialRelayerState = {
	orders: [],
	userOrders: [],
	accountMarketStats: [],
	ieoOrders: [],
	userIEOOrders: [],
	feePercentage: FEE_PERCENTAGE,
	feeRecipient: FEE_RECIPIENT,
	orderBookState: ServerState.NotLoaded,
	marketsStatsState: ServerState.NotLoaded,
	marketFillsState: ServerState.NotLoaded,
	minOrderExpireTimeOnBooks: MIN_ORDER_EXPIRATION_TIME_ON_ORDERBOOK,
};

export default createReducer(initialRelayerState, (builder) => {
	builder
		.addCase(actions.setOrders, (state, { payload }) => {
			return {
				...state,
				orders: payload,
			};
		})
		.addCase(actions.setUserOrders, (state, { payload }) => {
			return {
				...state,
				userOrders: payload,
			};
		})
		.addCase(actions.setMarketFillState, (state, { payload }) => {
			return {
				...state,
				marketFillsState: payload,
			};
		})
		.addCase(actions.setOrderBookState, (state, { payload }) => {
			return {
				...state,
				orderBookState: payload,
			};
		})
		.addCase(actions.setMarketsStatsState, (state, { payload }) => {
			return {
				...state,
				marketsStatsState: payload,
			};
		})
		.addCase(actions.setMinOrderExpireTimeOnBooks, (state, { payload }) => {
			return { ...state, minOrderExpireTimeOnBooks: payload };
		});
});
