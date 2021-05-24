import axios from "axios";
import Web3 from "web3";

import { marketCoins } from "../constants";
import ChainLinkABI from "../constants/abis/chainlinkABI.json";

export default class MarketApi {
	constructor() {
		this.ids = marketCoins.map((coin) => {
			return coin.id;
		});
		this.baseURL = "https://api.coingecko.com/api/v3";
	}

	get(type, payload = null) {
		switch (type) {
			case "marketCoins": {
				return this.fetchMarketCoins(payload);
			}
			case "all": {
				return this.fetchAllCoins(payload);
			}
			case "selected": {
				return this.fetchSelectedCoin(payload);
			}
			case "selectedContract": {
				return this.fetchSelectedContract(payload);
			}
			case "historical": {
				return this.fetchCoinHistorical(payload);
			}
			case "allHistorical": {
				return this.fetchHistorical(payload);
			}
			case "historicalContract": {
				return this.fetchContractHistorical(payload);
			}
			case "allHistoricalContract": {
				return this.fetchHistoricalContract(payload);
			}
			case "global": {
				return this.fetchGlobalData(payload);
			}
			case "single": {
				return this.fetchSinglePrice(payload);
			}
			case "search": {
				return this.fetchSearch(payload);
			}
			case "searchedCoins": {
				return this.fetchSearchedCoins(payload);
			}
			default: {
				return new Promise((resolve) => {
					resolve(null);
				});
			}
		}
	}

	fetchSearch(payload) {
		return new Promise(async (resolve, reject) => {
			try {
				const res = await axios.get(`${this.baseURL}/search?locale=${payload.locale}&query=${payload.query}`);
				resolve(res.data?.coins);
			} catch (e) {
				reject(e);
			}
		});
	}

	fetchSearchedCoins(payload) {
		return axios.get(
			`${
				this.baseURL
			}/coins/markets?vs_currency=USD&price_change_percentage=1h,24h,7d,30d,60d,200d,1y&ids=${payload.ids.join(
				","
			)}&sparkline=true&per_page=${payload.pageSize || 10}&page=${payload.page || 1}`
		);
	}

	fetchMarketCoins() {
		return axios.get(
			`${
				this.baseURL
			}/coins/markets?vs_currency=USD&price_change_percentage=1h,24h,7d,30d,60d,200d,1y&ids=${this.ids.join(
				","
			)}&sparkline=true`
		);
	}

	fetchGlobalData() {
		return axios.get(`${this.baseURL}/global`);
	}

	fetchAllCoins(payload) {
		return axios.get(
			`${this.baseURL}/coins/markets?vs_currency=USD&price_change_percentage=1h,24h,7d,30d,60d,200d,1y&per_page=${payload.pageSize}&page=${payload.page}&sparkline=true`
		);
	}

	fetchSelectedCoin(payload) {
		return axios.get(`${this.baseURL}/coins/${payload.id}`);
	}

	fetchSelectedContract(payload) {
		return axios.get(`${this.baseURL}/coins/ethereum/contract/${payload.address}`);
	}

	fetchCoinHistorical(payload) {
		return axios.get(`${this.baseURL}/coins/${payload.id}/market_chart?vs_currency=USD&days=${payload.days}`);
	}

	async fetchHistorical(payload) {
		const days = [1, 7, 30, 365];
		try {
			const res = await Promise.all(
				days.map((day) =>
					this.fetchCoinHistorical({
						id: payload.id,
						days: day,
					})
				)
			);

			const result = {};
			for (let i in days) {
				result[days[i]] = res[i].data;
			}

			return result;
		} catch (e) {
			return [];
		}
	}

	fetchContractHistorical(payload) {
		return axios.get(
			`${this.baseURL}/coins/ethereum/contract/${payload.address}/market_chart?vs_currency=USD&days=${payload.days}`
		);
	}

	async fetchHistoricalContract(payload) {
		const days = [1, 7, 30, 365];
		try {
			const res = await Promise.all(
				days.map((day) =>
					this.fetchContractHistorical({
						address: payload.address,
						days: day,
					})
				)
			);
			const result = {};
			for (let i in days) {
				result[days[i]] = res[i].data;
			}

			return result;
		} catch (e) {
			return [];
		}
	}

	async fetchSinglePrice(payload) {
		const web3 = new Web3(process.env.REACT_APP_NETWORK_URL);
		const coin = marketCoins.find((marketCoin) => marketCoin.symbol.toLowerCase() === payload.symbol.toLowerCase());
		const links = {
			coingecko: `${this.baseURL}/simple/price?ids=${coin.id}&vs_currencies=USD`,
			paprika: `https://api.coinpaprika.com/v1/coins/${coin.paprikaId}/ohlcv/latest`,
			diadata: `https://api.diadata.org/v1/quotation/${coin.symbol}`,
			chainlink: `https://etherscan.io/address/${coin.address}`,
		};
		const result = {};
		let coingecko, diadata, paprika, chainlinkPrice;
		let decimals;
		try {
			coingecko = await axios.get(links.coingecko);
			result.coingecko = coingecko.data[coin.id].usd;
		} catch (e) {
			result.coingecko = 0;
		}
		try {
			diadata = await axios.get(links.diadata);
			result.diadata = Number(diadata.data.Price);
		} catch (e) {
			result.diadata = 0;
		}
		try {
			paprika = await axios.get(links.paprika);
			result.paprika = paprika.data[0].close;
		} catch (e) {
			result.paprika = 0;
		}
		try {
			const priceFeed = new web3.eth.Contract(ChainLinkABI, coin.address);
			decimals = await priceFeed.methods.decimals().call();
			chainlinkPrice = await priceFeed.methods.latestRoundData().call();
			result.chainlink = chainlinkPrice.answer / 10 ** decimals;
		} catch (e) {
			result.chainlink = 0;
		}

		return {
			result,
			links,
		};
	}
}
