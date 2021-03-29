import axios from "axios";
import queryString from "query-string";

export default class OpenSeaApi {
	constructor() {
		this.baseURL = "https://api.opensea.io/api/v1/";
		this.instance = axios.create({
			baseURL: this.baseURL,
			timeout: 30000,
			headers: {
				"X-API-KEY": process.env.REACT_APP_OPENSEA_API_KEY,
			},
		});
	}

	get(type, payload = { params: {} }) {
		switch (type) {
			case "assets": {
				return this.fetchAllAssets(payload);
			}
			case "singleAsset": {
				return this.fetchSingleAsset(payload);
			}
			case "userAssets": {
				return this.fetchUserAssets(payload);
			}
			case "collections": {
				return this.fetchCollections(payload);
			}
			default: {
				return new Promise((resolve) => {
					resolve(null);
				});
			}
		}
	}

	fetchSingleAsset(payload) {
		return this.instance.get(`asset/${payload.tokenAddress}/${payload.tokenId}`);
	}

	fetchCollections(payload) {
		const query = queryString.stringify({
			...payload.params,
		});

		return this.instance.get(`collections?${query}`);
	}

	fetchAllAssets(payload) {
		const query = queryString.stringify({
			...payload.params,
		});
		return this.instance.get(`assets?${query}`);
	}

	fetchUserAssets(payload) {
		if (!payload.hasOwnProperty("address")) {
			return new Promise((resolve) => {
				resolve(null);
			});
		}
		const query = queryString.stringify({
			...payload.params,
			owner: payload.address,
		});
		return this.instance.get(`assets?${query}`);
	}
}
