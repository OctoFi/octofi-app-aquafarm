import { createAction } from "@reduxjs/toolkit";

export const saveAccount = createAction("account/save", (address: string) => {
	return {
		payload: {
			address,
		},
	};
});

export const haveEnoughBalance = createAction("account/balance", (haveBalance: boolean) => {
	return {
		payload: haveBalance,
	};
});
