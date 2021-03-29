import { RELAYER_RPS, RELAYER_URL, RELAYER_WS_URL } from "../constants";
import { AssetProxyId } from "@0x/types";
import { tokenAmountInUnitsToBigNumber } from "../utils/spot/tokens";
import { assetDataUtils } from "@0x/order-utils";
import { HttpClient } from "@0x/connect";
import { Orderbook } from "@0x/orderbook";
import { RateLimit } from "async-sema";
import { getAvailableMarkets } from "./markets";
import { v1 as uuidv1 } from "uuid";

export class Relayer {
	_client;
	_rateLimit;
	_orderbook;

	constructor(options) {
		this._orderbook = Orderbook.getOrderbookForWebsocketProvider({
			httpEndpoint: RELAYER_URL,
			websocketEndpoint: RELAYER_WS_URL,
		});
		this._client = new HttpClient(RELAYER_URL);
		this._rateLimit = RateLimit(options.rps); // requests per second
	}

	getOrderbook() {
		return this._orderbook;
	}

	async getAllOrdersAsync(baseTokenAssetData, quoteTokenAssetData) {
		/*
        @Note Somehow this is failing and not getting buy orders at first, so we opt in to do two awaits in concurrent
        const [sellOrders, buyOrders] = await Promise.all([
                this._getOrdersAsync(baseTokenAssetData, quoteTokenAssetData),
                this._getOrdersAsync(quoteTokenAssetData, baseTokenAssetData),
            ]);*/
		const sellOrders = await this._getOrdersAsync(baseTokenAssetData, quoteTokenAssetData);
		const buyOrders = await this._getOrdersAsync(quoteTokenAssetData, baseTokenAssetData);
		return [...sellOrders, ...buyOrders];
	}

	async getOrderConfigAsync(orderConfig) {
		await this._rateLimit();
		return this._client.getOrderConfigAsync(orderConfig);
	}

	async getUserOrdersAsync(account, baseTokenAssetData, quoteTokenAssetData) {
		const [sellOrders, buyOrders] = await Promise.all([
			this._getOrdersAsync(baseTokenAssetData, quoteTokenAssetData, account),
			this._getOrdersAsync(quoteTokenAssetData, baseTokenAssetData, account),
		]);

		return [...sellOrders, ...buyOrders];
	}

	async getCurrencyPairPriceAsync(baseToken, quoteToken) {
		const asks = await this._getOrdersAsync(
			assetDataUtils.encodeERC20AssetData(baseToken.address),
			assetDataUtils.encodeERC20AssetData(quoteToken.address)
		);

		if (asks.length) {
			const lowestPriceAsk = asks[0];

			const { makerAssetAmount, takerAssetAmount } = lowestPriceAsk;
			const takerAssetAmountInUnits = tokenAmountInUnitsToBigNumber(takerAssetAmount, quoteToken.decimals);
			const makerAssetAmountInUnits = tokenAmountInUnitsToBigNumber(makerAssetAmount, baseToken.decimals);
			return takerAssetAmountInUnits.div(makerAssetAmountInUnits);
		}

		return null;
	}

	async getCurrencyPairMarketDataAsync(baseToken, quoteToken) {
		// await this._rateLimit();
		const baseTokenAssetData = assetDataUtils.encodeERC20AssetData(baseToken.address);
		const quoteTokenAssetData = assetDataUtils.encodeERC20AssetData(quoteToken.address);
		const [asks, bids] = await Promise.all([
			this._getOrdersAsync(baseTokenAssetData, quoteTokenAssetData),
			this._getOrdersAsync(quoteTokenAssetData, baseTokenAssetData),
		]);

		const marketData = {
			bestAsk: null,
			bestBid: null,
			spreadInPercentage: null,
		};

		if (asks.length) {
			const lowestPriceAsk = asks[0];
			const { makerAssetAmount, takerAssetAmount } = lowestPriceAsk;
			const takerAssetAmountInUnits = tokenAmountInUnitsToBigNumber(takerAssetAmount, quoteToken.decimals);
			const makerAssetAmountInUnits = tokenAmountInUnitsToBigNumber(makerAssetAmount, baseToken.decimals);
			marketData.bestAsk = takerAssetAmountInUnits.div(makerAssetAmountInUnits);
		}

		if (bids.length) {
			const highestPriceBid = bids[bids.length - 1];
			const { makerAssetAmount, takerAssetAmount } = highestPriceBid;
			const takerAssetAmountInUnits = tokenAmountInUnitsToBigNumber(takerAssetAmount, baseToken.decimals);
			const makerAssetAmountInUnits = tokenAmountInUnitsToBigNumber(makerAssetAmount, quoteToken.decimals);
			marketData.bestBid = makerAssetAmountInUnits.div(takerAssetAmountInUnits);
		}
		if (marketData.bestAsk && marketData.bestBid) {
			const spread = marketData.bestAsk.minus(marketData.bestBid).dividedBy(marketData.bestAsk);
			marketData.spreadInPercentage = spread.multipliedBy(100);
		}

		return marketData;
	}

	async getSellCollectibleOrdersAsync(collectibleAddress, wethAddress) {
		await this._rateLimit();
		const result = await this._client.getOrdersAsync({
			makerAssetProxyId: AssetProxyId.ERC721,
			takerAssetProxyId: AssetProxyId.ERC20,
			makerAssetAddress: collectibleAddress,
			takerAssetAddress: wethAddress,
		});

		return result.records.map((record) => record.order);
	}

	async submitOrderAsync(order) {
		await this._rateLimit();
		return this._client.submitOrderAsync(order);
	}

	async _getOrdersAsync(makerAssetData, takerAssetData, makerAddress = undefined) {
		const apiOrders = await this._orderbook.getOrdersAsync(makerAssetData, takerAssetData);
		const orders = apiOrders.map((o) => o.order);
		if (makerAddress) {
			return orders.filter((o) => o.makerAddress.toLowerCase() === makerAddress.toLowerCase());
		} else {
			return orders;
		}
	}
}

let relayer;
export const getRelayer = () => {
	if (!relayer) {
		relayer = new Relayer({ rps: RELAYER_RPS });
	}

	return relayer;
};

export const getMarketFillsFromRelayer = async (pair, page = 0, perPage = 100) => {
	const headers = new Headers({
		"content-type": "application/json",
	});

	const init = {
		method: "GET",
		headers,
	};
	// Get only last 100 trades
	const response = await fetch(
		`${RELAYER_URL}/markets/${pair}/history?page=${page}&perPage=${(page + 1) * perPage}`,
		init
	);
	if (response.ok) {
		return await response.json();
	} else {
		return null;
	}
};

export const getMarketStatsFromRelayer = async (pair) => {
	const headers = new Headers({
		"content-type": "application/json",
	});

	const init = {
		method: "GET",
		headers,
	};
	// Get only last 100 trades
	const response = await fetch(`${RELAYER_URL}/markets/stats/${pair}`, init);
	if (response.ok) {
		return await response.json();
	} else {
		return null;
	}
};

export const getAllMarketsStatsFromRelayer = async () => {
	const headers = new Headers({
		"content-type": "application/json",
	});

	const init = {
		method: "GET",
		headers,
	};
	const pairs = getAvailableMarkets()
		.map((c) => `${c.base.toUpperCase()}-${c.quote.toUpperCase()}`)
		.join(",");

	// Get only last 100 trades
	const response = await fetch(`${RELAYER_URL}/markets/all-stats?pairs=${pairs}`, init);
	if (response.ok) {
		return await response.json();
	} else {
		return null;
	}
};

let relayerSocket;

export const getWebsocketRelayerConnection = () => {
	if (!relayerSocket) {
		relayerSocket = new WebSocket(RELAYER_WS_URL);
	}
	return relayerSocket;
};

export const startWebsocketMarketsSubscription = (cb_onmessage) => {
	const socket = getWebsocketRelayerConnection();
	const uuid = uuidv1();
	const requestAll = {
		type: "SUBSCRIBE",
		topic: "BOOK",
		market: "ALL_FILLS_OPTS",
		requestId: uuid,
	};
	socket.onopen = (event) => {
		socket.send(JSON.stringify(requestAll));
	};
	socket.onerror = (event) => {
		socket.close();
	};

	socket.onclose = (event) => {
		setTimeout(() => {
			relayerSocket = null;
			startWebsocketMarketsSubscription(cb_onmessage);
		}, 3000);
	};
	socket.onmessage = (event) => {
		cb_onmessage(event);
	};

	return socket;
};
