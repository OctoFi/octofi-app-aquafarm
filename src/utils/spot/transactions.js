import { TX_DEFAULTS } from "../../constants";

export const getTransactionOptions = (gasPrice) => {
	let options = {
		gasPrice,
	};

	if (process.env.NODE_ENV === "development") {
		options = {
			...options,
			...TX_DEFAULTS,
		};
	}

	return options;
};
