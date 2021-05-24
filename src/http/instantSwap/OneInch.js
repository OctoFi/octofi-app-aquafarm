import axios from "axios";
import { ONE_INCH_FEE_PERCENTAGE, ONE_INCH_REFERRER_ACCOUNT } from "../../constants";

export default class OneInchApi {
	constructor() {
		this.instance = axios.create({
			baseURL: "https://api.1inch.exchange/v3.0/1/",
		});
	}

	get(type, payload = {}) {
		switch (type) {
			case "tokens": {
				return this.getTokens();
			}
			case "protocols": {
				return this.getProtocols();
			}
			case "healthcheck": {
				return this.getHealthcheck();
			}
			case "quote": {
				return this.getQuote(payload);
			}
			case "swap": {
				return this.getSwap(payload);
			}
			case "spender": {
				return this.getSpender();
			}
			case "approve": {
				return this.getApprove(payload);
			}
			default: {
				break;
			}
		}
	}

	getTokens() {
		return this.instance.get("tokens");
	}

	getProtocols() {
		return this.instance.get("protocols");
	}
	getHealthcheck() {
		return this.instance.get("healthcheck");
	}
	getQuote(payload) {
		return this.instance.get(`quote`, {
			params: payload,
		});
	}

	getSwap(payload) {
		return this.instance.get(`swap`, {
			params: {
				...payload,
				referrerAddress: ONE_INCH_REFERRER_ACCOUNT,
				fee: ONE_INCH_FEE_PERCENTAGE,
			},
		});
	}

	getSpender() {
		return this.instance.get("approve/spender");
	}

	getApprove(payload) {
		return this.instance.get(`approve/calldata`, {
			params: payload,
		});
	}
}
