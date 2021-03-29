import { marketFilters } from "../constants";
import { pairs } from "../constants";
import BigNumber from "bignumber.js";
import { mapCurrencyPairMetaToCurrencyPair } from "../utils/spot/currencyPairMetadata";

const allFilter = {
	text: "ALL",
	value: null,
};

const TOKENS_MARKET_PRICE_API_ENDPOINT = "https://api.coingecko.com/api/v3/";

const ETH_MARKET_PRICE_API_ENDPOINT =
	"https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true";

export const getMarketFilters = () => {
	const configMarketFilters = marketFilters;
	if (!configMarketFilters) {
		return [];
	} else {
		return [...configMarketFilters, allFilter];
	}
};

export const getMarketPriceEther = async () => {
	const promisePriceEtherResolved = await fetch(ETH_MARKET_PRICE_API_ENDPOINT);
	if (promisePriceEtherResolved.status === 200) {
		const data = await promisePriceEtherResolved.json();
		if (data && data.ethereum) {
			const priceTokenUSD = new BigNumber(data.ethereum.usd);
			return priceTokenUSD;
		}
	}

	return Promise.reject("Could not get ETH price");
};

export const marketToString = (currencyPair) => {
	return `${currencyPair.base.toUpperCase()}-${currencyPair.quote.toUpperCase()}`;
};

let availableMarkets = [];
export const getAvailableMarkets = () => {
	if (!availableMarkets.length) {
		availableMarkets = pairs.map(mapCurrencyPairMetaToCurrencyPair);
	}
	return availableMarkets;
};

export const getMarketPriceQuote = async (quoteId) => {
	const promisePriceQuoteResolved = await fetch(
		`${TOKENS_MARKET_PRICE_API_ENDPOINT}simple/price?ids=${quoteId}&vs_currencies=usd&include_24hr_change=true`
	);
	if (promisePriceQuoteResolved.status === 200) {
		const data = await promisePriceQuoteResolved.json();
		if (data && data[`quoteId`]) {
			const priceTokenUSD = new BigNumber(data[`quoteId`].usd);
			return priceTokenUSD;
		}
	}

	return Promise.reject("Could not get Quote price");
};

export const getMarketPriceTokens = async (tokensBalance) => {
	// Reduce this to only a 1 string, if we have more than 50 tokens this will not work

	const accToken = tokensBalance
		.map((tb) => tb.token)
		.filter((t) => t.c_id !== null)
		.map((t) => t.c_id)
		.reduce((p, c, i) => {
			if (i === 0) {
				return `${c}`;
			} else {
				return `${p},${c}`;
			}
		});
	const promisePriceTokensResolved = await fetch(
		`${TOKENS_MARKET_PRICE_API_ENDPOINT}simple/price?ids=${accToken}&vs_currencies=usd&include_24hr_change=true`
	);

	if (promisePriceTokensResolved.status === 200) {
		const data = await promisePriceTokensResolved.json();

		if (data) {
			const tokensPrices = [];
			Object.keys(data).forEach((id) => {
				const priceStats = data[id];
				const ind = tokensBalance.findIndex((tb) => tb.token.c_id === id);
				if (ind !== -1) {
					tokensPrices.push({
						c_id: tokensBalance[ind].token.c_id,
						price_usd: new BigNumber(priceStats.usd),
						price_usd_24h_change: new BigNumber(priceStats.usd_24h_change),
					});
				}
			});
			return tokensPrices;
		}
	}
	return Promise.reject("Could not get Tokens price");
};
