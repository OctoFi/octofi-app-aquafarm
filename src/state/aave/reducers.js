import { createReducer } from "@reduxjs/toolkit";

import { AaveGlobalLoadingState, AaveLoadingState, Protocol } from "../../utils/aave/types";
import * as actions from "./actions";

const initialState = {
	protocol: Protocol.Aave,
	aTokensData: [],
	aaveReservesGQLResponse: [],
	aaveLoadingState: AaveLoadingState.NotLoaded,
	aaveGlobalLoadingState: AaveGlobalLoadingState.NotLoaded,
	currency: "NATIVE",
};

export default createReducer(initialState, (builder) => {
	builder
		.addCase(actions.initializeAaveData, (state, action) => {
			return {
				...state,
				...action.payload,
			};
		})
		.addCase(actions.setATokenBalances, (state, action) => {
			return { ...state, aTokensData: action.payload };
		})
		.addCase(actions.setAaveCurrency, (state, action) => {
			return { ...state, currency: action.payload };
		})
		.addCase(actions.setAaveLoadingState, (state, action) => {
			return { ...state, aaveLoadingState: action.payload };
		})
		.addCase(actions.setAaveUserAccountData, (state, action) => {
			return { ...state, userAccountData: action.payload };
		})
		.addCase(actions.setAaveReservesGQLResponse, (state, action) => {
			return { ...state, aaveReservesGQLResponse: action.payload };
		})
		.addCase(actions.setATokenBalance, (state, action) => {
			const aToken = action.payload;
			const aTokensData = state.aTokensData;
			const index = aTokensData.findIndex((it) => it.address === aToken.address);
			aTokensData[index] = aToken;
			return { ...state, aTokensData };
		});
});
