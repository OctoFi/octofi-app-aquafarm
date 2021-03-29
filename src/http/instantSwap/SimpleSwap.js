import axios from "axios";
import queryString from "query-string";

export default class SimpleSwapApi {
	constructor(apiKey = process.env.REACT_APP_SIMPLESWAP_API_KEY) {
		this.baseURL = "https://api.simpleswap.io/v1/";
		this.instance = axios.create({
			baseURL: this.baseURL,
		});
		this.apiKey = apiKey;

		this.instance.interceptors.response.use((response) => {
			if (response.hasOwnProperty("data")) {
				return response.data;
			}
			return response;
		});
	}

	get(type, payload = {}) {
		switch (type) {
			case "currencies": {
				return this.fetchAllCurrencies();
			}
			case "pairs": {
				return this.fetchAllPairs(payload);
			}
			case "currencyInfo": {
				return this.fetchCurrencyInfo(payload);
			}
			case "rate": {
				return this.getRate(payload);
			}
			case "exchange": {
				return this.getExchange(payload);
			}
			case "range": {
				return this.getRange(payload);
			}
			case "markets": {
				return this.getMarkets();
			}
			default: {
				return new Promise((resolve, reject) => {
					reject("Unresolvable method called");
				});
			}
		}
	}

	set(type, payload = {}) {
		switch (type) {
			case "exchange": {
				return this.postNewExchange(payload);
			}
			default: {
				return new Promise((resolve, reject) => {
					reject("Unresolvable method called");
				});
			}
		}
	}

	injectApiKey(obj, stringify = false) {
		let result = {
			...obj,
			api_key: this.apiKey,
		};

		if (stringify) {
			return queryString.stringify(result);
		}

		return result;
	}

	fetchAllCurrencies() {
		let query = this.injectApiKey({}, true);

		return this.instance.get(`get_all_currencies?${query}`);
	}

	fetchAllPairs(payload) {
		let query = this.injectApiKey(payload.query || {}, true);

		return this.instance.get(`get_all_pairs?${query}`);
	}

	fetchCurrencyInfo(payload) {
		let query = this.injectApiKey(payload.query || {}, true);

		return this.instance.get(`get_currency?${query}`);
	}

	getRate(payload) {
		let query = this.injectApiKey(
			payload.query
				? {
						...payload.query,
						amount: 1,
				  }
				: {},
			true
		);

		return this.instance.get(`get_estimated?${query}`);
	}

	async getExchange(payload) {
		try {
			const rate = await this.getRate(payload);
			const range = await this.getRange(payload);

			return {
				rate,
				...range,
			};
		} catch (e) {
			return {
				rate: null,
				min: null,
				max: null,
			};
		}
	}

	getRange(payload) {
		let query = this.injectApiKey(payload.query || {}, true);

		return this.instance.get(`get_ranges?${query}`);
	}

	getMarkets() {
		let query = this.injectApiKey({}, true);

		return this.instance.get(`get_market_info?${query}`);
	}

	postNewExchange(payload) {
		let query = this.injectApiKey({}, true);
		return this.instance.post(`create_exchange?${query}`, JSON.stringify(payload.data), {
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				accept: "application/json",
			},
		});
	}
}
