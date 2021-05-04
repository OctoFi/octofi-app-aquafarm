import { createReducer } from "@reduxjs/toolkit";
import { saveBalances, toggleLoading, setAccountOverview, setTransformedBalances } from "./actions";

const initialState = {
	data: [],
	transformedBalance: [],
	overview: {
		wallet: {
			balances: [],
			total: 0,
			title: "Wallet",
			slug: "wallet",
			variant: "success",
		},
		deposits: {
			balances: [],
			total: 0,
			title: "Deposits",
			slug: "deposits",
			variant: "success",
		},
		debts: {
			balances: [],
			total: 0,
			title: "Debts",
			slug: "debts",
			variant: "danger",
		},
	},
	loading: false,
};

export default createReducer(initialState, (builder) => {
	builder
		.addCase(saveBalances, (state, { payload }) => {
			return {
				...state,
				data: payload,
			};
		})
		.addCase(toggleLoading, (state, { payload }) => {
			return {
				...state,
				loading: payload,
			};
		})
		.addCase(setAccountOverview, (state, { payload }) => {
			return {
				...state,
				overview: payload,
			};
		})
		.addCase(setTransformedBalances, (state, { payload }) => {
			return {
				...state,
				transformedBalance: payload,
			};
		});
});
