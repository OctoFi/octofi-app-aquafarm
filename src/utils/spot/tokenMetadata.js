import { NETWORK_ID, UI_DECIMALS_DISPLAYED_DEFAULT_PRECISION, Network } from "../../constants";

export const getWethTokenFromTokensMetaDataByNetworkId = (tokensMetaData) => {
	const tokenMetaData = tokensMetaData.find((t) => t.symbol === "weth");
	if (!tokenMetaData) {
		throw new Error("WETH Token MetaData not found");
	}
	return {
		address: tokenMetaData.addresses[NETWORK_ID],
		symbol: tokenMetaData.symbol,
		decimals: tokenMetaData.decimals,
		name: tokenMetaData.name,
		primaryColor: tokenMetaData.primaryColor,
		icon: tokenMetaData.icon,
		displayDecimals:
			tokenMetaData.displayDecimals !== undefined
				? Number(tokenMetaData.displayDecimals)
				: UI_DECIMALS_DISPLAYED_DEFAULT_PRECISION,
		id: tokenMetaData.id || undefined,
		c_id: tokenMetaData.c_id || undefined,
		minAmount: tokenMetaData.minAmount || 0,
		maxAmount: tokenMetaData.maxAmount || undefined,
		precision:
			tokenMetaData.precision !== undefined ? tokenMetaData.precision : UI_DECIMALS_DISPLAYED_DEFAULT_PRECISION,
		website: tokenMetaData.website || undefined,
		description: tokenMetaData.description || undefined,
		verisafe_sticker: undefined,
		listed: true,
		isStableCoin: tokenMetaData.isStableCoin ? true : false,
	};
};

export const mapTokensMetaDataToTokenByNetworkId = (tokensMetaData) => {
	return tokensMetaData
		.filter((tokenMetaData) => tokenMetaData.addresses[NETWORK_ID])
		.map((tokenMetaData) => {
			let address = tokenMetaData.addresses[NETWORK_ID];
			if (NETWORK_ID === Network.Mainnet) {
				if (tokenMetaData.mainnetAddress) {
					address = tokenMetaData.mainnetAddress;
				}
			}
			return {
				address,
				symbol: tokenMetaData.symbol,
				decimals: tokenMetaData.decimals,
				name: tokenMetaData.name,
				primaryColor: tokenMetaData.primaryColor,
				icon: tokenMetaData.icon,
				displayDecimals:
					tokenMetaData.displayDecimals !== undefined
						? Number(tokenMetaData.displayDecimals)
						: UI_DECIMALS_DISPLAYED_DEFAULT_PRECISION,
				id: tokenMetaData.id || undefined,
				c_id: tokenMetaData.c_id || undefined,
				minAmount: tokenMetaData.minAmount || 0,
				maxAmount: tokenMetaData.maxAmount || undefined,
				precision:
					tokenMetaData.precision !== undefined
						? tokenMetaData.precision
						: UI_DECIMALS_DISPLAYED_DEFAULT_PRECISION,
				website: tokenMetaData.website || undefined,
				description: tokenMetaData.description || undefined,
				verisafe_sticker: tokenMetaData.verisafe_sticker || undefined,
				listed: true,
				isStableCoin: tokenMetaData.isStableCoin ? true : false,
			};
		});
};

export const mapTokensMetaDataFromForm = (tokensMetaData) => {
	return tokensMetaData
		.filter((tokenMetaData) => tokenMetaData.mainnetAddress)
		.map((tokenMetaData) => {
			return {
				address: tokenMetaData.mainnetAddress || "",
				symbol: tokenMetaData.symbol,
				decimals: Number(tokenMetaData.decimals),
				name: tokenMetaData.name,
				primaryColor: tokenMetaData.primaryColor,
				icon: tokenMetaData.icon,
				displayDecimals:
					tokenMetaData.displayDecimals !== undefined
						? Number(tokenMetaData.displayDecimals)
						: UI_DECIMALS_DISPLAYED_DEFAULT_PRECISION,
				id: tokenMetaData.id || undefined,
				c_id: tokenMetaData.c_id || undefined,
				minAmount: Number(tokenMetaData.minAmount) || 0,
				maxAmount: Number(tokenMetaData.maxAmount) || undefined,
				precision:
					tokenMetaData.precision !== undefined
						? Number(tokenMetaData.precision)
						: UI_DECIMALS_DISPLAYED_DEFAULT_PRECISION,
				website: tokenMetaData.website || undefined,
				description: tokenMetaData.description || undefined,
				verisafe_sticker: tokenMetaData.verisafe_sticker || undefined,
				listed: true,
				isStableCoin: tokenMetaData.isStableCoin ? true : false,
			};
		});
};
