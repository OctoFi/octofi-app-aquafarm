import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { save, load } from "redux-localstorage-simple";
import thunk from "redux-thunk";

import application from "./application/reducer";
import { updateVersion } from "./global/actions";
import user from "./user/reducer";
import transactions from "./transactions/reducer";
import swap from "./swap/reducer";
import mint from "./mint/reducer";
import lists from "./lists/reducer";
import burn from "./burn/reducer";
import multicall from "./multicall/reducer";
import account from "./account/reducer";
import currency from "./currency/reducer";
import pools from "./pools/reducer";
import balances from "./balances/reducer";
import explore from "./explore/reducer";
import market from "./market/reducer";
import governance from "./governance/reducer";
import relayer from "./relayer/reducer";
import spot from "./spot/reducer";
import spotUI from "./spotUI/reducer";
import aave from "./aave/reducers";
import margin from "./margin/reducer";

const rootReducer = combineReducers({
	application,
	aave,
	user,
	transactions,
	swap,
	mint,
	burn,
	multicall,
	lists,
	currency,
	pools,
	account,
	balances,
	explore,
	market,
	governance,
	relayer,
	spot,
	spotUI,
	margin,
});

const PERSISTED_KEYS: string[] = ["user", "transactions", "currency", "lists"];

export const store = configureStore({
	reducer: rootReducer,
	middleware: [save({ states: PERSISTED_KEYS }), thunk],
	preloadedState: load({ states: PERSISTED_KEYS }),
});

store.dispatch(updateVersion());

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof rootReducer>;

export default {
	store,
};
