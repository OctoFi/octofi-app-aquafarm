import { BigNumber } from "@0x/utils";

import { DEFAULT_ESTIMATED_TRANSACTION_TIME_MS, DEFAULT_GAS_PRICE, GWEI_IN_WEI } from "../../constants";

const ETH_GAS_STATION_API_BASE_URL = "https://ethgasstation.info";

export const getGasEstimationInfoAsync = async () => {
	let fetchedAmount;

	try {
		fetchedAmount = await fetchFastAmountInWeiAsync();
	} catch (e) {
		fetchedAmount = undefined;
	}

	const info = fetchedAmount || {
		gasPriceInWei: DEFAULT_GAS_PRICE,
		estimatedTimeMs: DEFAULT_ESTIMATED_TRANSACTION_TIME_MS,
	};

	return info;
};

const fetchFastAmountInWeiAsync = async () => {
	const res = await fetch(`${ETH_GAS_STATION_API_BASE_URL}/json/ethgasAPI.json`);
	const gasInfo = await res.json();
	// Eth Gas Station result is gwei * 10
	const gasPriceInGwei = new BigNumber(gasInfo.fast / 10);
	// Time is in minutes
	const estimatedTimeMs = gasInfo.fastWait * 60 * 1000; // Minutes to MS
	return { gasPriceInWei: gasPriceInGwei.multipliedBy(GWEI_IN_WEI), estimatedTimeMs };
};
