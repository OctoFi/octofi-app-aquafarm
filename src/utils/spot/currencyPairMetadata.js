import {
	MAX_AMOUNT_TOKENS_IN_UNITS,
	UI_DECIMALS_DISPLAYED_ORDER_SIZE,
	UI_DECIMALS_DISPLAYED_PRICE_ETH,
} from "../../constants";

export const mapCurrencyPairMetaToCurrencyPair = (currencyPair) => {
	if (currencyPair.config) {
		return {
			base: currencyPair.base,
			quote: currencyPair.quote,
			config: {
				basePrecision:
					currencyPair.config.basePrecision !== undefined
						? Number(currencyPair.config.basePrecision)
						: UI_DECIMALS_DISPLAYED_ORDER_SIZE,
				pricePrecision:
					currencyPair.config.pricePrecision !== undefined
						? Number(currencyPair.config.pricePrecision)
						: UI_DECIMALS_DISPLAYED_PRICE_ETH,
				minAmount: currencyPair.config.minAmount !== undefined ? currencyPair.config.minAmount : 0,
				maxAmount:
					currencyPair.config.maxAmount !== undefined
						? Number(currencyPair.config.maxAmount)
						: MAX_AMOUNT_TOKENS_IN_UNITS,
				quotePrecision:
					currencyPair.config.quotePrecision !== undefined
						? Number(currencyPair.config.quotePrecision)
						: UI_DECIMALS_DISPLAYED_PRICE_ETH,
			},
		};
	} else {
		return {
			base: currencyPair.base,
			quote: currencyPair.quote,
			config: {
				basePrecision: UI_DECIMALS_DISPLAYED_ORDER_SIZE,
				pricePrecision: UI_DECIMALS_DISPLAYED_PRICE_ETH,
				minAmount: 0,
				maxAmount: MAX_AMOUNT_TOKENS_IN_UNITS,
				quotePrecision: UI_DECIMALS_DISPLAYED_PRICE_ETH,
			},
		};
	}
};
