import { createAction } from "@reduxjs/toolkit";
import defiSdk from "../../utils/getDefiSdk";
import { getBalances } from "./hooks";

export const saveBalances = createAction("balances/save", (balances) => {
	return {
		payload: balances,
	};
});

export const toggleLoading = createAction("balances/loading", (state) => {
	return {
		payload: state,
	};
});

export const fetchBalances = (account) => {
	return async (dispatch) => {
		if (!account) return;
		dispatch(toggleLoading(true));
		const balances = await defiSdk.getAccountBalances(account);
		dispatch(saveBalances(balances));
		dispatch(toggleLoading(false));
	};
};

export const setTransformedBalances = createAction("balances/transformed", (balances) => {
	return {
		payload: balances,
	};
});

export const setAccountOverview = createAction("balances/overview", (overview) => {
	return {
		payload: overview,
	};
});

export const fetchTransformedBalances = (balances, wallet, ethBalance) => {
	return async (dispatch) => {
		const res = await getBalances(balances, wallet, ethBalance);

		dispatch(setTransformedBalances(res.balances));
		dispatch(setAccountOverview(res.overview));
	};
};
