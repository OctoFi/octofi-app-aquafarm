import axios from "axios";
import queryString from "query-string";
import { PROXY_URL } from "../../constants";

export default class StealthexApi {
	constructor(apiKey = process.env.REACT_APP_STEALTHEX_API_KEY) {
		this.baseURL = `${PROXY_URL}/stealthex/api/v2`;
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
			fixed: process.env.REACT_APP_STEALTHEX_FIXED_RATE,
		};

		if (stringify) {
			return queryString.stringify(result);
		}

		return result;
	}

	fetchAllCurrencies() {
		let query = this.injectApiKey({}, true);

		return this.instance.get(`currency?${query}`);
	}

	fetchAllPairs(payload) {
		let query = this.injectApiKey(payload.query || {}, true);

		return this.instance.get(`pairs?${query}`);
	}

	fetchCurrencyInfo(payload) {
		let query = this.injectApiKey(payload.query || {}, true);

		return this.instance.get(`currency/${payload.symbol}?${query}`);
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

		return this.instance.get(`estimate/${payload.currency_from}/${payload.currency_to}?${query}`, {
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				accept: "application/json",
			},
		});
	}

	async getExchange(payload) {
		try {
			const rate = await this.getRate(payload);
			const range = await this.getRange(payload);
			return {
				...rate,
				...range,
			};
		} catch (e) {
			return {
				estimated_amount: null,
				min_amount: null,
				max_amount: null,
			};
		}
	}

	getRange(payload) {
		let query = this.injectApiKey(payload.query || {}, true);

		return this.instance.get(`range/${payload.currency_from}/${payload.currency_to}?${query}`, {
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				accept: "application/json",
			},
		});
	}

	postNewExchange(payload) {
		let query = this.injectApiKey({}, true);
		return this.instance.post(`exchange?${query}`, JSON.stringify(payload.data), {
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				accept: "application/json",
			},
		});
	}
}
