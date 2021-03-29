import mitt from "mitt";
import { DEFAULT_DECIMALS } from "../constants";
import BigNumber from "bignumber.js";
import _ from "lodash";

export const toAbsoluteUrl = (pathname) => process.env.PUBLIC_URL + pathname;

export function getCurrentUrl(location) {
	return location.pathname.split(/[?#]/)[0];
}

export function checkIsActive(location, url) {
	const current = getCurrentUrl(location);
	if (!current || !url) {
		return false;
	}

	if (current === url) {
		return true;
	}

	if (current.indexOf(url) > -1) {
		return true;
	}

	return false;
}

export const emitter = mitt();

export function encodeQuery(data) {
	let query = "";
	for (let d in data) query += encodeURIComponent(d) + "=" + encodeURIComponent(data[d]) + "&";
	return query.slice(0, -1);
}

export const formatMoney = (amount, decimalCount = 2, decimal = ".", thousands = ",") => {
	try {
		decimalCount = Math.abs(decimalCount);
		decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

		const negativeSign = amount < 0 ? "-" : "";

		let i = parseInt((amount = Math.abs(Number(amount) || 0).toFixed(decimalCount))).toString();
		let j = i.length > 3 ? i.length % 3 : 0;

		return (
			negativeSign +
			(j ? i.substr(0, j) + thousands : "") +
			i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) +
			(decimalCount
				? decimal +
				  Math.abs(amount - i)
						.toFixed(decimalCount)
						.slice(2)
				: "")
		);
	} catch (e) {
		console.log(e);
	}
};

export function toUnitAmount(baseAmount, tokenContract = null) {
	const decimals = tokenContract && tokenContract.decimals != null ? tokenContract.decimals : DEFAULT_DECIMALS;

	const amountBN = new BigNumber(baseAmount.toString());
	return amountBN.div(new BigNumber(10).pow(decimals));
}

export const sortedData = (data, sortObj) => {
	if (!sortObj.field) {
		return data;
	}
	return _.orderBy(
		data,
		[
			function (o) {
				return o[sortObj.field] !== null
					? o[sortObj.field]
					: sortObj.order === "asc"
					? Number.MAX_SAFE_INTEGER
					: Number.MIN_SAFE_INTEGER;
			},
		],
		[sortObj.order || "asc"]
	);
};
