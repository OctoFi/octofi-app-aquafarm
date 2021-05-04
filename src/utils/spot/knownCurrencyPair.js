import { getAvailableMarkets } from "../../common/markets";

export const getCurrencyPairByTokensSymbol = (base, quote) => {
	const currencyPair = getAvailableMarkets().find(
		(m) => m.base === base.toLowerCase() && m.quote === quote.toLowerCase()
	);
	if (!currencyPair) {
		throw new Error(`Currency pair with base token ${base} and quote token ${quote} not found in known markets`);
	}
	return currencyPair;
};

export const getCurrencyPairFromTokens = (base, quote) => {
	const currencyPair = getAvailableMarkets().find(
		(m) => m.base === base.symbol.toLowerCase() && m.quote === quote.symbol.toLowerCase()
	);
	if (!currencyPair) {
		throw new Error(`Currency pair with base token ${base} and quote token ${quote} not found in known markets`);
	}
	return currencyPair;
};
