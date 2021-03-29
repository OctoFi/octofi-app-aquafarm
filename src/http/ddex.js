import axios from "axios";
import Web3 from "web3";
import { PROXY_URL } from "../constants";

export default class DDexApi {
	constructor(account = null, web3 = new Web3(process.env.REACT_APP_WSS_URL)) {
		this.baseURL = `${PROXY_URL}/ddex/v4`;
		this.web3 = web3;
		this.instance = axios.create({
			baseURL: this.baseURL,
			timeout: 30000,
		});
		this.account = account;
		this.authCode = null;
		this.authCodeExpire = null;

		this.instance.interceptors.response.use(
			(res) => {
				if (res.hasOwnProperty("data")) {
					return res.data.data;
				}
				return res;
			},
			(err) => {
				return err;
			}
		);
	}

	setAccount(account) {
		this.account = account;
	}

	setWeb3(web3Instance) {
		this.web3 = web3Instance;
	}

	isValidAuthCode = (expire) => {
		const validDate = 1000 * 60 * 60 * 24;
		const now = Date.now();

		return expire && !!(now - expire <= validDate && now > expire);
	};

	setAuthCode(authCode, expire) {
		if (this.isValidAuthCode(expire)) {
			this.authCode = authCode;
			this.authCodeExpire = expire;

			return true;
		}

		return false;
	}

	getMarkets() {
		return this.instance.get("markets");
	}

	getMarket(id) {
		return this.instance.get(`markets/${id}`);
	}

	getTickers() {
		return this.instance.get("markets/tickers");
	}

	getTicker(id) {
		return this.instance.get(`markets/${id}/ticker`);
	}

	getOrderbook(
		id,
		params = {
			level: 3,
		}
	) {
		return this.instance.get(`markets/${id}/orderbook`, {
			params,
		});
	}

	listTrades(
		id,
		params = {
			page: 1,
			perPage: 100,
		}
	) {
		return this.instance.get(`markets/${id}/trades`, {
			params,
		});
	}

	listCandles(id, params = {}) {
		return this.instance.get(`markets/${id}/candles`, {
			params,
		});
	}

	calculateFee(params = {}) {
		return this.instance.get("fees", {
			params,
		});
	}

	getGas() {
		return this.instance.get("fees/gas");
	}

	async signer(message) {
		return new Promise((resolve, reject) => {
			this.web3.eth.personal
				.sign(this.web3.utils.toHex(message), this.account)
				.then((sign) => {
					resolve(sign);
				})
				.catch((err) => {
					reject(err);
				});
		});
	}

	async getAuthCode() {
		if (this.account === null) {
			this.authCode = null;
			return null;
		}

		const now = Date.now();
		const message = "HYDRO-AUTHENTICATION@" + now;

		const sign = await this.signer(message);

		const HydroAuthentication = this.web3.utils.toHex(this.account) + "#" + message + "#" + sign;

		this.authCode = HydroAuthentication;
		this.authCodeExpire = now;
		return {
			authCode: HydroAuthentication,
			authCodeExpire: now,
		};
	}

	privateReqHandler = async () => {
		if (!this.authCode && this.isValidAuthCode(this.authCodeExpire)) {
			await this.getAuthCode();
		}
		return true;
	};

	async buildUnsignedOrder(body) {
		await this.privateReqHandler();
		try {
			const res = await this.instance.post("orders/build", body, {
				headers: {
					"Hydro-Authentication": this.authCode,
				},
			});

			return res;
		} catch (e) {
			return e;
		}
	}

	async signOrder(orderId) {
		const signature = await this.signer(orderId);
		return signature;
	}

	async placeOrder(body) {
		await this.privateReqHandler();
		return this.instance.post(
			"orders",
			{
				...body,
				method: 0,
			},
			{
				headers: {
					"Hydro-Authentication": this.authCode,
				},
			}
		);
	}

	async deleteOrder(orderId) {
		await this.privateReqHandler();
		return this.instance.delete(`orders/${orderId}`, {
			headers: {
				"Hydro-Authentication": this.authCode,
			},
		});
	}

	async getOrders(params) {
		await this.privateReqHandler();
		return this.instance.get(`orders`, {
			params,
			headers: {
				"Hydro-Authentication": this.authCode,
			},
		});
	}

	async getOrder(orderId) {
		await this.privateReqHandler();
		return this.instance.get(`orders/${orderId}`, {
			headers: {
				"Hydro-Authentication": this.authCode,
			},
		});
	}

	async getAccountTrades(
		marketId,
		params = {
			page: 1,
			perPage: 100,
		}
	) {
		await this.privateReqHandler();
		return this.instance.get(`markets/${marketId}/trades/mine`, {
			params,
			headers: {
				"Hydro-Authentication": this.authCode,
			},
		});
	}

	async getLockedBalances() {
		await this.privateReqHandler();
		return this.instance.get(`account/lockedBalances`, {
			headers: {
				"Hydro-Authentication": this.authCode,
			},
		});
	}

	async getPositions() {
		await this.privateReqHandler();
		return this.instance.get(`positions`, {
			headers: {
				"Hydro-Authentication": this.authCode,
			},
		});
	}
}
