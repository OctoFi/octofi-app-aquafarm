import { UI_DECIMALS_DISPLAYED_ORDER_SIZE } from "../../constants";

export const padRightSplitted = (numBg, decimals = UI_DECIMALS_DISPLAYED_ORDER_SIZE) => {
	const numBgToFixed = numBg.toFixed(decimals);
	const numBgToString = numBg.toString();

	const decimalPlaces = (numBgToString.split(".")[1] || []).length;

	let diff = "";
	let num = numBgToFixed;
	if (!numBg.isZero() && decimalPlaces < decimals) {
		diff = numBgToFixed.replace(numBgToString, "");
		num = numBgToString;
	}

	return {
		num,
		diff,
	};
};

export const truncateAddress = (address) => {
	return `${address.slice(0, 7)}...${address.slice(address.length - 5)}`;
};
