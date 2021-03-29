import axios from "axios";
import { BigNumber } from "@0x/utils";
import { isWeth } from "../known_tokens";
import { ETHERSCAN_URL } from "./transactionLink";
import { NETWORK_ID } from "../../constants";
import { assetDataUtils } from "@0x/order-utils";
import { getContractWrappers } from "./contractWrapper";

const TOKEN_CONTRACT_ENDPOINT = "https://api.coingecko.com/api/v3/coins/ethereum/contract/";

export const tokensToTokenBalances = async (tokens, address = "", library) => {
	console.log(address);
	const contractWrappers = await getContractWrappers(library);
	const assetDatas = tokens.map((t) => assetDataUtils.encodeERC20AssetData(t.address));
	const [balances, allowances] = await contractWrappers.devUtils
		.getBatchBalancesAndAssetProxyAllowances(address, assetDatas)
		.callAsync();
	const tokenBalances = balances.map((_b, i) => {
		return {
			token: tokens[i],
			balance: balances[i],
			isUnlocked: allowances[i].isGreaterThan(0),
		};
	});
	return tokenBalances;
};
export const tokenToTokenBalance = async (token, address = "") => {
	const [tokenBalance] = await tokensToTokenBalances([token], address);
	return tokenBalance;
};

export const getTokenBalance = async (token, address = "") => {
	const balance = await tokenToTokenBalance(token, address);
	return balance.balance;
};

export const getTokenByAddress = async (address) => {
	const promiseTokenDataResolved = await axios.get(`${TOKEN_CONTRACT_ENDPOINT}${address.toLowerCase()}`);
	if (promiseTokenDataResolved.status === 200) {
		const data = await promiseTokenDataResolved.data;
		if (data) {
			return data;
		}
	}
	return Promise.reject("Could not get Token ");
};

export const unitsInTokenAmount = (units, decimals) => {
	const decimalsPerToken = new BigNumber(10).pow(decimals);
	return new BigNumber(units).multipliedBy(decimalsPerToken);
};

export const tokenAmountInUnitsToBigNumber = (amount, decimals) => {
	const decimalsPerToken = new BigNumber(10).pow(decimals);
	return amount.div(decimalsPerToken);
};

export const formatTokenSymbol = (symbol) => {
	return isWeth(symbol.toLowerCase()) ? "ETH" : symbol.toUpperCase();
};

export const formatTokenName = (name) => {
	return name === "Wrapped Ether" ? "Ethereum" : name;
};

export const tokenAmountInUnits = (amount, decimals, toFixedDecimals = 2) => {
	return tokenAmountInUnitsToBigNumber(amount, decimals).toFixed(Number(toFixedDecimals));
};

export const tokenSymbolToDisplayString = (symbol) => {
	return isWeth(symbol) ? "wETH" : symbol.toUpperCase();
};

export const getEtherscanLinkForToken = (token) => {
	return `${ETHERSCAN_URL[NETWORK_ID]}token/${token.address}`;
};
export const getEtherscanLinkForTokenAndAddress = (token, ethAccount) => {
	return `${ETHERSCAN_URL[NETWORK_ID]}token/${token.address}?a=${ethAccount}`;
};
