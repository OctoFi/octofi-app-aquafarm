import { BigNumber } from "@0x/utils";

export const todayInSeconds = () => {
	return Math.floor(Date.now() / 1000);
};

export const convertDateToUTCTimestamp = (date) => {
	return date.getTime() - date.getTimezoneOffset() * 60000;
};

// Default to 7 days
export const getExpirationTimeOrdersFromConfig = () => {
	return new BigNumber(
		Math.floor(new Date().valueOf() / 1000) + (Number(process.env.REACT_APP_EXPIRE_ORDERS_TIME) || 3600 * 24 * 7)
	);
};

export const getExpirationTimeFromSeconds = (seconds) => {
	return new BigNumber(Math.floor(new Date().valueOf() / 1000) + seconds.toNumber());
};
