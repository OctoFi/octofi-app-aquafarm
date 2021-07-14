import axios from "axios";

export default class TransakApi {
	constructor(env) {
		this.instance = axios.create({
			baseURL:
				env === "PRODUCTION" ? "https://api.transak.com/api/v2/" : "https://staging-api.transak.com/api/v2/",
		});
	}

	get(type, payload = {}) {
		switch (type) {
			case "crypto": {
				return this.fetchCryptoCurrencies();
			}
			case "fiat": {
				return this.fetchFiatCurrency();
			}
			case "price": {
				return this.fetchConversionPrice(payload);
			}
			default: {
				return this.fetchCryptoCurrencies();
			}
		}
	}

	fetchCryptoCurrencies() {
		return this.instance.get("currencies/crypto-currencies");
	}

	fetchFiatCurrency() {
		return this.instance.get("currencies/fiat-currencies");
	}

	fetchConversionPrice(payload) {
		return this.instance.get(
			`/currencies/price?fiatCurrency=${payload.fiat}&cryptoCurrency=${payload.crypto}&isBuyOrSell=${
				payload.type || "BUY"
			}&${payload.amountType || "fiat"}Amount=${payload.amount}&network=${payload.network}&partnerApiKey=${
				process.env.REACT_APP_TRANSAK_API_KEY
			}`
		);
	}
}
