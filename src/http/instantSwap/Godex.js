import axios from "axios";

export default class GodexApi {
	constructor() {
		this.instance = axios.create({
			baseURL: "https://api.godex.io/api/v1/",
		});
	}

	get(type, payload = {}) {
		switch (type) {
			case "tokens": {
				return this.getTokens();
			}
			case "rate": {
				return this.getRate(payload);
			}
			case "transaction": {
				return this.createTransaction(payload);
			}
			case "getTransaction": {
				return this.getTransaction(payload);
			}
			case "getTransactionStatus": {
				return this.getTransactionStatus(payload);
			}
			default: {
				break;
			}
		}
	}

	getTokens() {
		return this.instance.get("coins");
	}

	getRate(payload) {
		return this.instance.post("info", payload);
	}
	createTransaction(payload) {
		return this.instance.post("transaction", payload);
	}
	getTransaction({ id }) {
		return this.instance.get(`transaction/${id}`);
	}
	getTransactionStatus({ id }) {
		return this.instance.get(`transaction/${id}/status`);
	}
}
