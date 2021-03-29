import axios from "axios";
import _ from "lodash";

import { encodeQuery } from "../lib/helper";

export default class ExploreApi {
	constructor() {
		this.requestBaseURLs = {
			tokens: "https://api.coingecko.com/api/v3/coins",
			tokenSets: "https://api.tokensets.com/public/v1/rebalancing_sets",
			pools: "https://data-api.defipulse.com/api/v1/blocklytics/pools",
			trending: "https://api.coingecko.com/api/v3/search/trending",
			derivatives: "https://api.coingecko.com/api/v3/derivatives",
			topTokens:
				"https://api.coingecko.com/api/v3/coins/markets?vs_currency=USD&category=decentralized_finance_defi&price_change_percentage=1h,24h,7d,30d,60d,200d,1y",
		};
	}

	get(type) {
		switch (type) {
			case "tokens": {
				return this.fetchTokens();
			}
			case "tokenSets": {
				return this.fetchTokenSets();
			}
			case "pools": {
				return this.fetchPools({
					pageSize: 10,
					page: 1,
					orderBy: "volumeUSD",
					orderDirection: "desc",
				});
			}
			case "trending": {
				return this.fetchTrending();
			}
			case "derivatives": {
				return this.fetchDerivatives();
			}
			case "topTokens": {
				return this.fetchDefiTokens();
			}
			default: {
				return new Promise((resolve, reject) => {
					resolve(null);
				});
			}
		}
	}

	fetchTokens() {
		return axios
			.get(
				`${this.requestBaseURLs.tokens}/markets?vs_currency=USD&price_change_percentage=1h,24h,7d,30d,60d,200d,1y`
			)
			.then((response) => {
				return response.data;
			})
			.catch((error) => {
				return error;
			});
	}

	fetchDefiTokens() {
		return new Promise(async (resolve, reject) => {
			try {
				const res = await axios.get(`${this.requestBaseURLs.topTokens}`);
				const defiTokens = res.data;
				const sortedTokens = _.sortBy(defiTokens, (t) => t.price_change_percentage_24h);
				const filteredTokens = _.filter(sortedTokens, (t) => t.price_change_percentage_24h !== null);
				const losers = filteredTokens.slice(0, 5);
				const gainers = filteredTokens.slice(-5).reverse();
				resolve({
					losers,
					gainers,
				});
			} catch (error) {
				reject(error);
			}
		});
	}
	fetchTokenSets() {
		return axios
			.get(this.requestBaseURLs.tokenSets)
			.then((response) => {
				return response.data.rebalancing_sets;
			})
			.catch((error) => {
				return error;
			});
	}

	fetchPools(p) {
		const query = encodeQuery({
			"api-key": process.env.REACT_APP_API_KEY,
			platform: "uniswap,uniswap-v2,curve,balancer,mooniswap,sushiswap",
			orderBy: "usdLiquidity",
			direction: "desc",
		});
		return axios
			.get(`${this.requestBaseURLs.pools}/v1/exchanges?${query}`)
			.then((response) => {
				return response.data.results;
			})
			.catch((error) => {
				return error;
			});
	}
	fetchTrending() {
		return new Promise(async (resolve, reject) => {
			try {
				const trending = await axios.get(this.requestBaseURLs.trending);
				const result = [];
				for (let i in trending.data.coins) {
					const res = await axios.get(
						`${this.requestBaseURLs.tokens}/${trending.data.coins[i].item.id}?community_data=false&developer_data=false`
					);
					result.push(res.data);
				}
				resolve(result);
			} catch (error) {
				reject(error);
			}
		});
	}
	fetchDerivatives() {
		return new Promise(async (resolve, reject) => {
			try {
				const res = await axios.get(this.requestBaseURLs.derivatives);
				const data = res.data;
				const sortedTokens = _.sortBy(data, (d) => -1 * d?.volume_24h);
				resolve(sortedTokens);
			} catch (error) {
				reject(error);
			}
		});
	}
}
