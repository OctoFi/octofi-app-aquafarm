import { BigNumber } from "@0x/utils";
import { convertDateToUTCTimestamp } from "./timeUtils";

export const filterMarketsByString = (markets, str) => {
	return markets.filter((market) => {
		const baseLowerCase = market.currencyPair.base.toLowerCase();
		const quoteLowerCase = market.currencyPair.quote.toLowerCase();
		return `${baseLowerCase}/${quoteLowerCase}`.indexOf(str.toLowerCase()) !== -1;
	});
};

export const filterMarketsByTokenSymbol = (markets, tokenSymbol) => {
	return markets.filter(
		(market) => market.currencyPair.base === tokenSymbol || market.currencyPair.quote === tokenSymbol
	);
};

/**
 * Export current market as string
 */
export const marketToString = (currencyPair) => {
	return `${currencyPair.base.toUpperCase()}-${currencyPair.quote.toUpperCase()}`;
};

/**
 * Get Today fills at UTC time
 */
export const getTodayFillsUTC = (fills) => {
	if (fills && fills.length) {
		const startOfDay = new Date();
		startOfDay.setHours(0, 0, 0, 0);
		const startOfDayUtc = convertDateToUTCTimestamp(startOfDay);
		return fills.filter((f) => convertDateToUTCTimestamp(f.timestamp) > startOfDayUtc);
	} else {
		return null;
	}
};

export const getTodayHighPriceFromFills = (fills) => {
	if (fills && fills.length) {
		const todayFills = getTodayFillsUTC(fills);
		if (todayFills && todayFills.length) {
			return new BigNumber(Math.max(...todayFills.map((f) => Number(f.price))));
		} else {
			return null;
		}
	} else {
		return null;
	}
};

export const getTodayLowerPriceFromFills = (fills) => {
	if (fills && fills.length) {
		const todayFills = getTodayFillsUTC(fills);
		if (todayFills && todayFills.length) {
			return new BigNumber(Math.min(...todayFills.map((f) => Number(f.price))));
		} else {
			return null;
		}
	} else {
		return null;
	}
};

export const getTodayClosedOrdersFromFills = (fills) => {
	if (fills && fills.length) {
		const todayFills = getTodayFillsUTC(fills);
		if (todayFills && todayFills.length) {
			return todayFills.length;
		} else {
			return null;
		}
	} else {
		return null;
	}
};

/**
 * Export current market as string
 */
export const getLastPrice = (fills) => {
	if (fills && fills.length) {
		return fills[0].price;
	} else {
		return null;
	}
};

/**
 * Export current market as string
 */
export const marketToStringFromTokens = (base, quote) => {
	return `${base.symbol.toUpperCase()}-${quote.symbol.toUpperCase()}`;
};
