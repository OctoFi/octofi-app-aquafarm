import axios from "axios";

export default class DexAgApi {
	constructor() {
		this.instance = axios.create({
			baseURL: "https://api-v2.dex.ag/",
		});
	}

	get(type, payload = {}) {
		switch (type) {
			case "tokens": {
				return this.getTokens();
			}
			case "trade": {
				return this.getTrade(payload);
			}
			default: {
				break;
			}
		}
	}

	getTokens() {
		return this.instance.get("token-list-full");
	}

	async getTrade(payload) {
		let res;
		if (payload.params.recipient) {
			res = await this.instance.get("tradeAndSend", {
				params: payload.params,
			});
		} else {
			res = await this.instance.get("trade", {
				params: payload.params,
			});
		}
		const data = res.data;
		return data;
	}
}
