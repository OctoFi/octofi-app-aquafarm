import { getKnownTokens } from "../known_tokens";
import { OrderSide } from "../../constants";
import BigNumber from "bignumber.js";

export const mapRelayerFillToFill = (fill) => {
	const known_tokens = getKnownTokens();
	return {
		id: fill.id,
		amountQuote: new BigNumber(fill.filledTokenQuoteAmount),
		amountBase: new BigNumber(fill.filledTokenBaseAmount),
		tokenQuote: known_tokens.getTokenByAddress(fill.tokenQuoteAddress),
		tokenBase: known_tokens.getTokenByAddress(fill.tokenBaseAddress),
		side: fill.side === "BUY" ? OrderSide.Buy : OrderSide.Sell,
		price: fill.price,
		timestamp: new Date(Number(fill.created_at)),
		makerAddress: fill.makerAddress,
		takerAddress: fill.takerAddress,
		market: fill.pair,
	};
};
