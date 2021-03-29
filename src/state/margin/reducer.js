import { createReducer } from "@reduxjs/toolkit";
import { DEFAULT_MARGIN_MARKET, ServerState } from "../../constants";
import * as actions from "./actions";

const initialState = {
	markets: {
		state: ServerState.NotLoaded,
		data: null,
	},
	trades: {
		state: ServerState.NotLoaded,
		data: null,
	},
	orderbook: {
		state: ServerState.NotLoaded,
		data: {
			asks: [],
			bids: [],
		},
	},
	orders: {
		state: ServerState.NotLoaded,
		data: null,
	},
	positions: {
		state: ServerState.NotLoaded,
		data: null,
	},
	marketStats: {
		state: ServerState.NotLoaded,
		data: null,
	},
	fee: {
		state: ServerState.NotLoaded,
		data: null,
	},
	gas: {
		state: ServerState.NotLoaded,
		data: null,
	},
	userTrades: {
		state: ServerState.NotLoaded,
		data: null,
	},
	lockedBalances: {
		state: ServerState.NotLoaded,
		data: null,
	},
	authCode: null,
	authCodeExpire: null,
	accessToPrivate: false,
	gasPrice: null,
	selectedMarket: DEFAULT_MARGIN_MARKET,
	selectedMarketStats: null,
	orderPriceSelected: null,
	orderBuyPriceSelected: null,
	orderSellPriceSelected: null,
	makerAmountSelected: null,
};

export default createReducer(initialState, (builder) => {
	builder
		.addCase(actions.setState, (state, action) => {
			const { property, newState } = action.payload;
			return {
				...state,
				[property]: {
					...state[property],
					state: newState,
				},
			};
		})
		.addCase(actions.setMarkets, (state, action) => {
			return {
				...state,
				markets: {
					...state.markets,
					data: action.payload,
				},
			};
		})
		.addCase(actions.setTrades, (state, action) => {
			return {
				...state,
				trades: {
					...state.trades,
					data: action.payload,
				},
			};
		})
		.addCase(actions.setOrders, (state, action) => {
			return {
				...state,
				orders: {
					...state.orders,
					data: action.payload,
				},
			};
		})
		.addCase(actions.setPositions, (state, action) => {
			return {
				...state,
				positions: {
					...state.positions,
					data: action.payload,
				},
			};
		})
		.addCase(actions.setOrderbook, (state, action) => {
			return {
				...state,
				orderbook: {
					...state.orderbook,
					data: action.payload,
				},
			};
		})
		.addCase(actions.setMarketStats, (state, action) => {
			return {
				...state,
				marketStats: {
					...state.marketStats,
					data: action.payload,
				},
			};
		})
		.addCase(actions.setSelectedMarket, (state, action) => {
			return {
				...state,
				selectedMarket: action.payload.id,
				selectedMarketStats: action.payload,
			};
		})
		.addCase(actions.setMakerAmountSelected, (state, action) => {
			return { ...state, makerAmountSelected: action.payload };
		})
		.addCase(actions.setOrderBuyPriceSelected, (state, action) => {
			return { ...state, orderBuyPriceSelected: action.payload };
		})
		.addCase(actions.setOrderPriceSelected, (state, action) => {
			return { ...state, orderPriceSelected: action.payload };
		})
		.addCase(actions.setOrderSellPriceSelected, (state, action) => {
			return { ...state, orderSellPriceSelected: action.payload };
		})
		.addCase(actions.setAuthCode, (state, action) => {
			return {
				...state,
				authCode: action.payload,
			};
		})
		.addCase(actions.setAuthCodeExpire, (state, action) => {
			return {
				...state,
				authCodeExpire: action.payload,
			};
		})
		.addCase(actions.setPrivateData, (state, action) => {
			return {
				...state,
				accessToPrivate: true,
			};
		})
		.addCase(actions.setFee, (state, action) => {
			return {
				...state,
				fee: {
					...state.fee,
					data: action.payload,
				},
			};
		})
		.addCase(actions.setGasPrice, (state, action) => {
			return {
				...state,
				gas: {
					...state.gas,
					data: action.payload,
				},
			};
		})
		.addCase(actions.setUserTrades, (state, action) => {
			return {
				...state,
				userTrades: {
					...state.userTrades,
					data: action.payload,
				},
			};
		})
		.addCase(actions.setLockedBalances, (state, action) => {
			return {
				...state,
				lockedBalances: {
					...state.lockedBalances,
					data: action.payload,
				},
			};
		});
});
