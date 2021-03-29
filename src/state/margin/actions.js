import { createAction } from "@reduxjs/toolkit";
import { ServerState } from "../../constants";

export const setState = createAction("margin/setState", (newState, property) => {
	return {
		payload: {
			newState,
			property,
		},
	};
});

export const setMarkets = createAction("margin/setMarkets");

export const setSelectedMarket = createAction("margin/setSelectedMarket");

export const setTrades = createAction("margin/setTrades");

export const setOrders = createAction("margin/setOrders");

export const setOrderbook = createAction("margin/setOrderbook");

export const setPositions = createAction("margin/setPositions");

export const setMarketStats = createAction("margin/setMarketStats");

export const setMakerAmountSelected = createAction("margin/setMakerAmount");

export const setOrderBuyPriceSelected = createAction("margin/setOrderBuyPrice");

export const setOrderPriceSelected = createAction("margin/setOrderPrice");

export const setOrderSellPriceSelected = createAction("margin/setOrderSellPrice");

export const setAuthCode = createAction("margin/setAuthCode");

export const setAuthCodeExpire = createAction("margin/setAuthCodeExpire");

export const setPrivateData = createAction("margin/setPrivateData");

export const setFee = createAction("margin/setFee");

export const setGasPrice = createAction("margin/setGasPrice");

export const setUserTrades = createAction("margin/setUserTrades");

export const setLockedBalances = createAction("margin/setLockedBalances");

export const fetchMarkets = (api) => {
	return async (dispatch) => {
		dispatch(setState(ServerState.Loading, "markets"));
		try {
			const { markets } = await api.getMarkets();

			dispatch(setMarkets(markets));
			dispatch(setState(ServerState.Done, "markets"));

			return markets;
		} catch (e) {
			dispatch(setState(ServerState.Error, "markets"));
		}
	};
};

export const fetchTrades = (api) => {
	return async (dispatch, getState) => {
		dispatch(setState(ServerState.Loading, "trades"));
		const store = getState();
		const market = store.margin.selectedMarket;
		try {
			const { trades } = await api.listTrades(market);
			dispatch(setTrades(trades));
			dispatch(setState(ServerState.Done, "trades"));
		} catch (e) {
			dispatch(setState(ServerState.Error, "trades"));
		}
	};
};

export const fetchOrderbook = (api) => {
	return async (dispatch, getState) => {
		dispatch(setState(ServerState.Loading, "orderbook"));
		const store = getState();
		const market = store.margin.selectedMarket;
		try {
			const { orderbook } = await api.getOrderbook(market);
			dispatch(setOrderbook(orderbook));
			dispatch(setState(ServerState.Done, "orderbook"));
		} catch (e) {
			dispatch(setState(ServerState.Error, "orderbook"));
		}
	};
};

export const fetchOrders = (api) => {
	return async (dispatch, getState) => {
		const store = getState();
		const market = store.margin.selectedMarket;
		if (store.margin.authCode) {
			dispatch(setState(ServerState.Loading, "orders"));
			try {
				const { orders } = await api.getOrders({
					marketId: market,
				});
				dispatch(setOrders(orders));
				dispatch(setState(ServerState.Done, "orders"));
			} catch (e) {
				dispatch(setState(ServerState.Error, "orders"));
			}
		}
	};
};

export const fetchPositions = (api) => {
	return async (dispatch, getState) => {
		const store = getState();
		if (store.margin.authCode) {
			dispatch(setState(ServerState.Loading, "positions"));
			try {
				const { positions } = await api.getPositions();
				dispatch(setPositions(positions));
				dispatch(setState(ServerState.Done, "positions"));
			} catch (e) {
				dispatch(setState(ServerState.Error, "positions"));
			}
		}
	};
};

export const fetchMarketStats = (api) => {
	return async (dispatch, getState) => {
		dispatch(setState(ServerState.Loading, "marketStats"));
		const store = getState();
		const market = store.margin.selectedMarket;
		try {
			const { ticker } = await api.getTicker(market);
			dispatch(setMarketStats(ticker));
			dispatch(setState(ServerState.Done, "marketStats"));
		} catch (e) {
			dispatch(setState(ServerState.Error, "marketStats"));
		}
	};
};

export const calculateFee = (api, params) => {
	return async (dispatch) => {
		dispatch(setState(ServerState.Loading, "fees"));
		try {
			const { fees } = await api.calculateFee(params);
			dispatch(setFee(fees));
			dispatch(setState(ServerState.Done, "fees"));
		} catch (e) {
			dispatch(setState(ServerState.Error, "fees"));
		}
	};
};

export const getGasPrice = (api) => {
	return async (dispatch) => {
		dispatch(setState(ServerState.Loading, "gas"));
		try {
			const { gas } = await api.getGas();
			dispatch(setGasPrice(gas));
			dispatch(setState(ServerState.Done, "gas"));
		} catch (e) {
			dispatch(setState(ServerState.Error, "gas"));
		}
	};
};

export const fetchUserTrades = (api) => {
	return async (dispatch, getState) => {
		const store = getState();
		const market = store.margin.selectedMarket;
		if (store.margin.authCode) {
			dispatch(setState(ServerState.Loading, "userTrades"));
			try {
				const { trades } = await api.getAccountTrades(market);
				dispatch(setUserTrades(trades));
				dispatch(setState(ServerState.Done, "userTrades"));
			} catch (e) {
				dispatch(setState(ServerState.Error, "userTrades"));
			}
		}
	};
};

export const fetchUserLockedBalances = (api) => {
	return async (dispatch, getState) => {
		const store = getState();
		if (store.margin.authCode) {
			dispatch(setState(ServerState.Loading, "lockedBalances"));
			try {
				const { lockedBalances } = await api.getLockedBalances();
				dispatch(setLockedBalances(lockedBalances));
				dispatch(setState(ServerState.Done, "lockedBalances"));
			} catch (e) {
				dispatch(setState(ServerState.Error, "lockedBalances"));
			}
		}
	};
};
