import axios from "axios";
import { ZERO_ADDRESS } from "../constants";

class TokenSetApi {
	/**
	 * Create api class for token set api
	 * @param baseUrl
	 */
	constructor(baseUrl = "https://api.tokensets.com/") {
		this.baseURL = baseUrl;

		this.request = axios.create({
			baseURL: this.baseURL,
			timeout: 30000,
		});
	}

	/**
	 * Create base get option for every request
	 * @param endpoint
	 * @param requestOptions
	 * @returns {Promise<AxiosResponse<any>>}
	 */
	async get(endpoint, requestOptions = {}) {
		try {
			return await this.request.get(endpoint, requestOptions);
		} catch (err) {
			return err;
		}
	}

	// Rebalances api
	async fetchAllSets() {
		return await this.get("public/v1/rebalancing_sets");
	}

	// Portfolios api
	async fetchPortfolios() {
		return await this.get("public/v2/portfolios");
	}

	async fetchHistoricalData(contractAddress = ZERO_ADDRESS) {
		return await axios.get(`https://api.coingecko.com/api/v3/coins/ethereum/contract/${contractAddress}`);
	}

	promisify(inner) {
		return new Promise(async (resolve, reject) => {
			try {
				const res = await inner();
				if (res.data) {
					resolve(res.data);
				}
			} catch (e) {
				resolve({});
			}
		});
	}

	async getTokenSetsHistorical(ids) {
		const promises = [];
		for (let i in ids) {
			promises.push(this.promisify(() => this.fetchHistoricalData(ids[i])));
		}

		const result = await Promise.all(promises);
		return result;
	}
}

export default TokenSetApi;
