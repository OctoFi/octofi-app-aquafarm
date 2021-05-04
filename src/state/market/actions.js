import { createAction } from "@reduxjs/toolkit";

import { emitter } from "../../lib/helper";
import marketApi from "../../http/market";

const api = new marketApi();

export const saveMarketCoins = createAction("market/save", (data) => {
	return {
		payload: data,
	};
});

export const saveAllTokens = createAction("market/all", (data, page, total) => {
	return {
		payload: {
			data,
			page,
			total,
		},
	};
});

export const saveSelectedCoin = createAction("market/selected", (data, id) => {
	return {
		payload: {
			data,
			id,
		},
	};
});

export const setLoading = createAction("market/loading", (type, value) => {
	return {
		payload: {
			type,
			value,
		},
	};
});

export const setHistorical = createAction("market/historical", (data, id, days) => {
	return {
		payload: {
			data,
			id,
			days,
		},
	};
});

export const setCoinMarketPrices = createAction("market/prices", (id, result) => {
	return {
		payload: {
			id,
			result,
		},
	};
});

export const setCoinPriceLoading = createAction("market/priceLoading", (value, id) => {
	return {
		payload: {
			value,
			id,
		},
	};
});

export const fetchCoinMarketPrices = (payload) => {
	return (dispatch) => {
		dispatch(setCoinPriceLoading(true, payload.id));
		api.get("single", payload)
			.then((response) => {
				dispatch(setCoinMarketPrices(payload.id, response));
				dispatch(setCoinPriceLoading(false, payload.id));
			})
			.catch((error) => {
				dispatch(setCoinPriceLoading(false, payload.id));
			});
	};
};

export const fetchMarketCoins = () => {
	return (dispatch) => {
		dispatch(setLoading("marketCoins", true));
		api.get("marketCoins")
			.then((response) => {
				dispatch(saveMarketCoins(response.data));
				dispatch(setLoading("marketCoins", false));
			})
			.catch((error) => {
				dispatch(setLoading("marketCoins", false));
			});
	};
};

export const fetchAllCoins = (page, pageSize) => {
	return async (dispatch) => {
		dispatch(setLoading("allTokens", true));
		try {
			const globalResponse = await api.get("global");
			const response = await api.get("all", { pageSize, page });
			dispatch(saveAllTokens(response.data, page, globalResponse.data.data.active_cryptocurrencies));
			dispatch(setLoading("allTokens", false));
		} catch (error) {
			dispatch(setLoading("allTokens", false));
		}
	};
};

export const fetchSelectedCoin = (id) => {
	return async (dispatch) => {
		dispatch(setLoading("selected", true));

		try {
			const res = await api.get("selected", { id });
			dispatch(saveSelectedCoin(res.data, id));
			dispatch(setLoading("selected", false));
		} catch (e) {
			dispatch(setLoading("selected", false));
			emitter.emit("change-route", {
				path: "/market",
			});
		}
	};
};
export const fetchSelectedContract = (address) => {
	return async (dispatch) => {
		dispatch(setLoading("selected", true));

		try {
			const res = await api.get("selectedContract", { address });
			dispatch(saveSelectedCoin(res.data, address));
			dispatch(setLoading("selected", false));
		} catch (e) {
			dispatch(setLoading("selected", false));
			emitter.emit("change-route", {
				path: "/dashboard",
			});
		}
	};
};

export const fetchHistoricalData = (id) => {
	return (dispatch) => {
		dispatch(setLoading("historical", true));
		api.get("allHistorical", { id })
			.then((response) => {
				dispatch(setHistorical(response, id));
				dispatch(setLoading("historical", false));
			})
			.catch((error) => {
				dispatch(setLoading("historical", false));
			});
	};
};

export const fetchContractHistoricalData = (address) => {
	return (dispatch) => {
		dispatch(setLoading("historical", true));
		api.get("historicalContract", { address })
			.then((response) => {
				dispatch(setHistorical(response, address));
				dispatch(setLoading("historical", false));
			})
			.catch((error) => {
				dispatch(setLoading("historical", false));
			});
	};
};
