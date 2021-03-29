import { assetDataUtils } from "@0x/order-utils";
import { AssetProxyId } from "@0x/types";

import ConfigIEO from "../constants/spot-config/mainnet/config-ieo.json";
import Config from "../constants/spot-config/mainnet/config.json";
import { getTokenByAddress } from "./spot/tokens";
import { getContract, isAddress } from "./index";
import { ERC20_ABI } from "../constants";

import {
	getWethTokenFromTokensMetaDataByNetworkId,
	mapTokensMetaDataFromForm,
	mapTokensMetaDataToTokenByNetworkId,
} from "./spot/tokenMetadata";
import { mapTokensIEOMetaDataToTokenByNetworkId } from "./spot/tokenIEOMetadata";

export class KnownTokens {
	_tokens = [];
	_tokensIEO = [];
	_wethToken;

	constructor(knownTokensMetadata) {
		this._tokens = mapTokensMetaDataToTokenByNetworkId(knownTokensMetadata).filter(
			(token) => !isWeth(token.symbol)
		);
		this._tokensIEO = mapTokensIEOMetaDataToTokenByNetworkId(ConfigIEO.tokens).filter(
			(token) => !isWeth(token.symbol)
		);
		this._wethToken = getWethTokenFromTokensMetaDataByNetworkId(knownTokensMetadata);
	}
	updateTokens = (knownTokensMetadata) => {
		this._tokens = mapTokensMetaDataFromForm(knownTokensMetadata).filter((token) => !isWeth(token.symbol));
	};

	getTokenBySymbol = (symbol) => {
		const symbolInLowerCaseScore = symbol.toLowerCase();
		let token = this._tokens.find((t) => t.symbol === symbolInLowerCaseScore);
		if (!token) {
			if (symbolInLowerCaseScore === "weth") {
				return this.getWethToken();
			}
		}
		if (!token) {
			token = this._tokensIEO.find((t) => t.symbol === symbolInLowerCaseScore);
		}
		if (!token) {
			const errorMessage = `Token with symbol ${symbol} not found in known tokens`;
			throw new Error(errorMessage);
		}
		return token;
	};

	getTokenByAddress = (address) => {
		const addressInLowerCase = address.toLowerCase();
		let token = this._tokens.find((t) => t.address.toLowerCase() === addressInLowerCase);
		if (!token) {
			// If it's not on the tokens list, we check if it's an wETH token
			// TODO - Maybe the this._tokens could be refactored to also have wETH inside
			token = this._wethToken.address === address ? this._wethToken : undefined;
		}
		if (!token) {
			token = this._tokensIEO.find((t) => t.address.toLowerCase() === addressInLowerCase);
		}
		if (!token) {
			throw new Error(`Token with address ${address} not found in known tokens`);
		}
		return token;
	};

	getTokenIEOByAddress = (address) => {
		const addressInLowerCase = address.toLowerCase();
		const token = this._tokensIEO.find((t) => t.address.toLowerCase() === addressInLowerCase);
		if (!token) {
			throw new Error(`Token with address ${address} not found in known tokens`);
		}
		return token;
	};

	getTokenByAssetData = (assetData) => {
		const tokenAddress = assetDataUtils.decodeAssetDataOrThrow(assetData).tokenAddress;
		return this.getTokenByAddress(tokenAddress);
	};

	isKnownAddress = (address) => {
		try {
			this.getTokenByAddress(address);
			return true;
		} catch (e) {
			return false;
		}
	};

	isKnownSymbol = (symbol) => {
		try {
			this.getTokenBySymbol(symbol);
			return true;
		} catch (e) {
			return false;
		}
	};

	isIEOKnownAddress = (address) => {
		try {
			this.getTokenIEOByAddress(address);
			return true;
		} catch (e) {
			return false;
		}
	};

	/**
	 * Checks if a Fill event is valid.
	 *
	 * A Fill event is considered valid if the order involves two ERC20 tokens whose addresses we know.
	 *
	 */
	isValidFillEvent = (fillEvent) => {
		const { makerAssetData, takerAssetData } = fillEvent.args;

		if (!isERC20AssetData(makerAssetData) || !isERC20AssetData(takerAssetData)) {
			return false;
		}

		const makerAssetAddress = assetDataUtils.decodeAssetDataOrThrow(makerAssetData).tokenAddress;
		const takerAssetAddress = assetDataUtils.decodeAssetDataOrThrow(takerAssetData).tokenAddress;

		if (!this.isKnownAddress(makerAssetAddress) || !this.isKnownAddress(takerAssetAddress)) {
			return false;
		}

		return true;
	};
	getTokenByName = (name) => {
		const nameInLowerCaseScore = name.toLowerCase();
		let token = this._tokens.find((t) => t.name.toLowerCase() === nameInLowerCaseScore);
		if (!token) {
			token = this._tokensIEO.find((t) => t.name.toLowerCase() === nameInLowerCaseScore);
		}
		if (!token) {
			throw new Error(`Token with name ${name} not found in known tokens`);
		}
		return token;
	};

	getWethToken = () => {
		return this._wethToken;
	};

	getTokens = () => {
		return this._tokens;
	};
	findToken = (data) => {
		if (!data) {
			return null;
		}
		if (this.isKnownSymbol(data)) {
			return this.getTokenBySymbol(data);
		}

		if (this.isKnownAddress(data)) {
			return this.getTokenByAddress(data);
		}
		return null;
	};
	/**
	 * Try to find token, if not exists in current list it will try to
	 * fetch it
	 */
	findTokenOrFetchIt = async (data, library, account) => {
		if (!data) {
			return null;
		}
		let token = this.findToken(data);
		if (token) {
			return token;
		} else {
			if (isAddress(data)) {
				token = await this._fetchTokenMetadata(data, library, account);
				if (token) {
					return token;
				} else {
					return null;
				}
			}
		}
		return null;
	};
	pushToken = (token) => {
		this._tokens.push(token);
	};
	pushTokenIEO = (token) => {
		this._tokensIEO.push(token);
	};
	// Could be address or symbol
	addTokenByAddress = async (data, library, account) => {
		if (this.isKnownSymbol(data) || this.isKnownAddress(data)) {
			return null;
		}
		if (isAddress(data)) {
			const token = await this._fetchTokenMetadata(data, library, account);
			if (token) {
				this._tokens.push(token);
				return token;
			} else {
				return null;
			}
		}
	};
	/**
	 * Adds metadata from Coingecko
	 */
	fetchTokenMetadaFromGecko = async (token, library, account) => {
		try {
			const tokenData = await getTokenByAddress(token.address.toLowerCase(), library, account);
			const thumbImage = tokenData.image.thumb;
			let t;
			t = {
				...token,
				c_id: tokenData.id,
				icon: thumbImage.substring(0, thumbImage.indexOf("?")),
				displayDecimals: 2,
				minAmount: 0,
			};
			return t;
		} catch (e) {
			return token;
		}
	};

	_fetchTokenMetadata = async (address, library, account) => {
		try {
			let token = await getTokenMetadaDataFromContract(address, library, account);
			if (!token) {
				return null;
			}
			try {
				const tokenData = await getTokenByAddress(address.toLowerCase());
				const thumbImage = tokenData.image.thumb;
				token = {
					...token,
					c_id: tokenData.id,
					icon: thumbImage.substring(0, thumbImage.indexOf("?")),
					displayDecimals: 2,
					minAmount: 0,
				};
				return token;
			} catch (e) {
				return token;
			}
		} catch (e) {
			return null;
		}
	};
}

let knownTokens;
export const getKnownTokens = (knownTokensMetadata = Config.tokens) => {
	if (!knownTokens) {
		knownTokens = new KnownTokens(knownTokensMetadata);
	}
	return knownTokens;
};

export const getTokenMetadaDataFromContract = async (address, library, account = undefined) => {
	try {
		const contract = await getContract(address.toLowerCase(), ERC20_ABI, library, account);
		const name = await contract.name().callAsync();
		const symbol = (await contract.symbol().callAsync()).toLowerCase();
		const decimals = Number(await contract.decimals().callAsync());
		const token = {
			address: address.toLowerCase(),
			decimals,
			name,
			symbol,
			primaryColor: "#081e6e",
			displayDecimals: 2,
			minAmount: 0,
			listed: false,
			isStableCoin: false,
		};
		return token;
	} catch (e) {
		return null;
	}
};

export const isERC20AssetData = (assetData) => {
	try {
		const asset = assetDataUtils.decodeAssetDataOrThrow(assetData);
		if (asset.assetProxyId === AssetProxyId.ERC20) {
			return true;
		} else {
			return false;
		}
	} catch (e) {
		return false;
	}
};

export const isZrx = (token) => {
	return token === "zrx";
};

export const isWeth = (token) => {
	return token === "weth";
};

export const isWhackd = (token) => {
	return token === "whackd";
};

export const isWethToken = (token) => {
	if (token.symbol.toLowerCase() === "weth") {
		return true;
	} else {
		return false;
	}
};

export const getWethAssetData = () => {
	const known_tokens = getKnownTokens();
	const wethToken = known_tokens.getWethToken();
	return assetDataUtils.encodeERC20AssetData(wethToken.address).toLowerCase();
};
