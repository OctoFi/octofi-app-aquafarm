import { BigNumber } from "@0x/utils";
import { tokenAmountInUnits } from "./tokens";

export const computeOrderSizeFromInventoryBalance = (amount, inventoryBalance, isBuy) => {
	if (isBuy) {
		return amount.multipliedBy(2).multipliedBy(inventoryBalance);
	} else {
		return amount.multipliedBy(2).multipliedBy(new BigNumber(1).minus(inventoryBalance));
	}
};

export const computePriceFromQuote = (isSell, quote, baseToken, quoteToken) => {
	const bestQuote = quote.bestCaseQuoteInfo;
	const quoteTokenAmount = isSell ? bestQuote.makerAssetAmount : bestQuote.takerAssetAmount;
	const baseTokenAmount = isSell ? bestQuote.takerAssetAmount : bestQuote.makerAssetAmount;
	const quoteTokenAmountUnits = new BigNumber(tokenAmountInUnits(quoteTokenAmount, quoteToken.decimals, 18));
	const baseTokenAmountUnits = new BigNumber(tokenAmountInUnits(baseTokenAmount, baseToken.decimals, 18));
	const price = quoteTokenAmountUnits.div(baseTokenAmountUnits);
	return price;
};

export const computeSpreadPercentage = (buyPrice, sellPrice) => {
	return sellPrice.minus(buyPrice).div(sellPrice).multipliedBy(100);
};

export const getPricesFromSpread = (buyPrice, sellPrice, newSpreadPercentage) => {
	const newSpreadUnits = newSpreadPercentage.dividedBy(100);
	// Increment = (BuyPrice - SellPrice *(1-newSpread))/(2 - newSpread)
	const incrementPrice = buyPrice
		.minus(sellPrice.multipliedBy(new BigNumber(1).minus(newSpreadUnits)))
		.dividedBy(new BigNumber(2).minus(newSpreadUnits));
	const newBuyPrice = buyPrice.minus(incrementPrice);
	const newSellPrice = sellPrice.plus(incrementPrice);
	return [newBuyPrice, newSellPrice];
};
