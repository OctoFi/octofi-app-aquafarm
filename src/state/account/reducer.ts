import { createReducer } from "@reduxjs/toolkit";
import { haveEnoughBalance, saveAccount } from "./actions";

interface initialInterface {
	address: string;
	enoughCoinBalance: boolean;
}
const initialState: initialInterface = {
	address: "",
	enoughCoinBalance: false,
};

export default createReducer(initialState, (builder) => {
	// @ts-ignore
	builder
		.addCase(saveAccount, (state, { payload }) => {
			return (state.address = payload.address);
		})
		.addCase(haveEnoughBalance, (state, { payload }) => {
			state.enoughCoinBalance = payload;
		});
});
