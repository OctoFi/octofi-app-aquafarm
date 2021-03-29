import { createAction } from "@reduxjs/toolkit";
import axios from "axios";

import { getGasEstimationInfoAsync } from "../../utils/spot/gasEstimation";
import { currencyExchangeRate, cryptoExchangeRate } from "../../http/currency";

export const setCurrenciesRates = createAction("currency/setRates", (rates) => {
	return {
		payload: {
			rates,
		},
	};
});
export const changeSelectedCurrency = createAction("currency/changeSelected", (id) => {
	return {
		payload: {
			id,
		},
	};
});

export const setGasPrice = createAction("currency/setGasPrice", (data) => {
	return {
		payload: data,
	};
});

export const changeGasPrice = createAction("currency/changeGas", (type) => {
	return {
		payload: type,
	};
});

export const setGasInfo = createAction("currency/setGasInfo");

export const fetchCurrencies = (id: string) => {
	return async (dispatch: (arg0: { payload: { rates: any } | { id: string }; type: string }) => void) => {
		try {
			const res = await axios.get(`${currencyExchangeRate}latest?base=USD`);
			const cryptoRes = await axios.get(
				`${cryptoExchangeRate}simple/price?ids=bitcoin,link,ethereum,usd-coin&vs_currencies=usd`
			);

			const rates = {
				...res.data.rates,
			};
			rates.BTC = 1 / cryptoRes.data.bitcoin.usd;
			rates.ETH = 1 / cryptoRes.data.ethereum.usd;
			rates.LINK = 1 / cryptoRes.data.link.usd;
			rates.USDC = 1 / cryptoRes.data["usd-coin"];

			dispatch(setCurrenciesRates(rates));
			dispatch(changeSelectedCurrency(id));
		} catch (error) {
			console.log(error);
		}
	};
};

export const getGasPrice = () => {
	return async (dispatch: (arg0: { payload: any }) => void) => {
		try {
			const res = await axios.get("https://gasprice.poa.network/");
			dispatch(setGasPrice(res.data));
		} catch (error) {
			console.log(error);
		}
	};
};

export const updateGasInfo = () => {
	return async (dispatch: any) => {
		const fetchedGasInfo = await getGasEstimationInfoAsync();
		// @ts-ignore
		dispatch(setGasInfo(fetchedGasInfo));
	};
};
