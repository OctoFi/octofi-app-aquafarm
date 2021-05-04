import { getKnownTokens } from "../known_tokens";
import { assetDataUtils } from "@0x/order-utils";
import { OrderSide, UI_DECIMALS_DISPLAYED_PRICE_ETH } from "../../constants";
import { tokenAmountInUnitsToBigNumber } from "./tokens";

export const ordersToUIOrders = (orders, baseToken, ordersInfo = undefined) => {
	if (ordersInfo) {
		return ordersToUIOrdersWithOrdersInfo(orders, ordersInfo, baseToken);
	} else {
		return ordersToUIOrdersWithoutOrderInfo(orders, baseToken);
	}
};

const ordersToUIOrdersWithoutOrderInfo = (orders, baseToken) => {
	const baseTokenEncoded = assetDataUtils.encodeERC20AssetData(baseToken.address);

	return orders.map((order, i) => {
		const makerAssetAddress = assetDataUtils.decodeAssetDataOrThrow(order.makerAssetData).tokenAddress;
		const makerAssetTokenDecimals = getKnownTokens().getTokenByAddress(makerAssetAddress).decimals;
		const makerAssetAmountInUnits = tokenAmountInUnitsToBigNumber(order.makerAssetAmount, makerAssetTokenDecimals);

		const takerAssetAddress = assetDataUtils.decodeAssetDataOrThrow(order.takerAssetData).tokenAddress;
		const takerAssetTokenDecimals = getKnownTokens().getTokenByAddress(takerAssetAddress).decimals;
		const takerAssetAmountInUnits = tokenAmountInUnitsToBigNumber(order.takerAssetAmount, takerAssetTokenDecimals);

		const side = order.takerAssetData === baseTokenEncoded ? OrderSide.Buy : OrderSide.Sell;
		const isSell = side === OrderSide.Sell;

		const size = side === OrderSide.Sell ? order.makerAssetAmount : order.takerAssetAmount;
		const filled = null;
		const status = null;
		const price = isSell
			? takerAssetAmountInUnits.div(makerAssetAmountInUnits)
			: makerAssetAmountInUnits.div(takerAssetAmountInUnits);

		return {
			rawOrder: order,
			side,
			size,
			filled,
			price,
			status,
		};
	});
};

// The user has web3 and the order info could be retrieved from the contract
const ordersToUIOrdersWithOrdersInfo = (orders, ordersInfo, baseToken) => {
	if (ordersInfo.length !== orders.length) {
		throw new Error(
			`AssertionError: Orders info length does not match orders length: ${ordersInfo.length} !== ${orders.length}`
		);
	}

	const selectedTokenEncoded = assetDataUtils.encodeERC20AssetData(baseToken.address);

	return orders.map((order, i) => {
		const orderInfo = ordersInfo[i];

		const side = order.takerAssetData === selectedTokenEncoded ? OrderSide.Buy : OrderSide.Sell;
		const isSell = side === OrderSide.Sell;
		const size = isSell ? order.makerAssetAmount : order.takerAssetAmount;

		const makerAssetAddress = assetDataUtils.decodeAssetDataOrThrow(order.makerAssetData).tokenAddress;
		const makerAssetTokenDecimals = getKnownTokens().getTokenByAddress(makerAssetAddress).decimals;
		const makerAssetAmountInUnits = tokenAmountInUnitsToBigNumber(order.makerAssetAmount, makerAssetTokenDecimals);

		const takerAssetAddress = assetDataUtils.decodeAssetDataOrThrow(order.takerAssetData).tokenAddress;
		const takerAssetTokenDecimals = getKnownTokens().getTokenByAddress(takerAssetAddress).decimals;
		const takerAssetAmountInUnits = tokenAmountInUnitsToBigNumber(order.takerAssetAmount, takerAssetTokenDecimals);

		const filled = isSell
			? orderInfo.orderTakerAssetFilledAmount.div(order.takerAssetAmount).multipliedBy(order.makerAssetAmount)
			: orderInfo.orderTakerAssetFilledAmount;
		const price = isSell
			? takerAssetAmountInUnits.div(makerAssetAmountInUnits)
			: makerAssetAmountInUnits.div(takerAssetAmountInUnits);
		const status = orderInfo.orderStatus;

		return {
			rawOrder: order,
			side,
			size,
			filled,
			price,
			status,
		};
	});
};

export const mergeByPrice = (orders, precision = UI_DECIMALS_DISPLAYED_PRICE_ETH) => {
	const initialValue = {};
	const ordersByPrice = orders.reduce((acc, order) => {
		acc[order.price.toFixed(precision)] = acc[order.price.toFixed(precision)] || [];
		acc[order.price.toFixed(precision)].push(order);
		return acc;
	}, initialValue);

	// Returns an array of OrderBookItem
	return Object.keys(ordersByPrice)
		.map((price) => {
			return ordersByPrice[price].reduce((acc, order) => {
				return {
					...acc,
					size: acc.size.plus(order.size),
				};
			});
		})
		.map((order) => {
			let newSize = order.size;
			if (order.filled) {
				newSize = order.size.minus(order.filled);
			}

			return {
				side: order.side,
				price: order.price,
				size: newSize,
			};
		});
};
