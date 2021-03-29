import { ERC20TokenContract } from "@0x/contract-wrappers";
import { BigNumber } from "@0x/utils";
import ApolloClient from "apollo-boost";

import {
	AAVE_ETH_TOKEN,
	AAVE_GRAPH_URI,
	AAVE_READER_ADDRESS,
	LENDING_POOL_ADDRESS,
	LENDING_POOL_CORE_ADDRESS,
} from "../../utils/aave/constants";
import { getTokenizedRegistryAddress } from "../../utils/bzx/contracts";
import { getKnownTokens } from "../../utils/known_tokens";
import { getContractWrappers } from "../../utils/spot/contractWrapper";
import Web3 from "web3";

const web3 = new Web3(Web3.givenProvider || new Web3.providers.HttpProvider(process.env.REACT_APP_NETWORK_URL));

export const getATokenContractWrapper = async (address, partialTxData, library) => {
	const ATokenContract = (await import("../../utils/aave/contract_wrappers/atoken")).AtokenContract;
	return new ATokenContract(address, library, partialTxData);
};

export const getLendingPool = async (partialTxData, library) => {
	const LendingPoolContract = (await import("../../utils/aave/contract_wrappers/lending_pool")).LendingPoolContract;
	return new LendingPoolContract(LENDING_POOL_ADDRESS.toLowerCase(), library, partialTxData);
};

export const getAaveReader = async (partialTxData, library) => {
	const AaveReaderContract = (await import("../../utils/aave/contract_wrappers/aave_reader")).AaveReaderContract;
	return new AaveReaderContract(AAVE_READER_ADDRESS.toLowerCase(), library, partialTxData);
};

export const getTokenizedRegistryContractWrapper = async (partialTxData, library) => {
	const TokenizedRegistryContract = (await import("../../utils/bzx/tokenizedRegistry")).TokenizedRegistryContract;
	return new TokenizedRegistryContract(getTokenizedRegistryAddress(), library, partialTxData);
};

let client;
export const getAaveGraphClient = () => {
	if (!client) {
		client = new ApolloClient({ uri: AAVE_GRAPH_URI });
	}
	return client;
};

export const getAllATokens = async (aaveReservesGQL, ethAccount = undefined) => {
	const aTokens = [];
	const known_tokens = getKnownTokens();

	for (const tk of aaveReservesGQL) {
		try {
			let token;
			if (tk.id === AAVE_ETH_TOKEN) {
				token = known_tokens.getWethToken();
			} else {
				token = known_tokens.getTokenByAddress(tk.id);
			}

			let aTokenBalance;
			let isUnlocked;
			let borrowBalance;
			if (ethAccount) {
				const contractWrappers = await getContractWrappers();
				const lendingPool = await getLendingPool({}, web3.currentProvider);
				/*const tkContract = await getATokenContractWrapper(tk.aToken.id.toLowerCase(), { from: ethAccount });
                aTokenBalance = await tkContract.balanceOf(ethAccount).callAsync();*/
				const userReserveData = await lendingPool.getUserReserveData(tk.id, ethAccount).callAsync();
				aTokenBalance = userReserveData[0];
				borrowBalance = userReserveData[1];
				if (tk.id === AAVE_ETH_TOKEN) {
					isUnlocked = true;
				} else {
					const erc20Token = new ERC20TokenContract(token.address, contractWrappers.getProvider());
					const allowance = await erc20Token.allowance(ethAccount, LENDING_POOL_CORE_ADDRESS).callAsync();
					isUnlocked = allowance.isGreaterThan("10000e18");
				}
			}
			aTokens.push({
				address: tk.aToken.id,
				name: tk.name,
				symbol: tk.symbol,
				token,
				isUnlocked,
				balance: aTokenBalance,
				borrowBalance,
				liquidityRate: new BigNumber(tk.liquidityRate),
				variableBorrowRate: new BigNumber(tk.variableBorrowRate),
				stableBorrowRate: new BigNumber(tk.stableBorrowRate),
			});
		} catch (e) {
			// tslint:disable-next-line:no-console
			console.error(`There was a problem with Atoken wrapper  ${tk.name}`, e);
		}
	}
	return aTokens;
};

export const getAllATokensV2 = async (aaveReservesGQL, ethAccount = undefined) => {
	const aTokens = [];
	const known_tokens = getKnownTokens();
	const reservesAddresses = aaveReservesGQL.map((r) => r.id.toLowerCase());
	let aaveBalances = [];
	if (ethAccount) {
		const aaveReader = await getAaveReader({}, web3.currentProvider);
		aaveBalances = await aaveReader.getBatchATokensData(ethAccount, reservesAddresses).callAsync();
	}

	for (let index = 0; index < aaveReservesGQL.length; index++) {
		const tk = aaveReservesGQL[index];
		try {
			let token;
			if (tk.id === AAVE_ETH_TOKEN) {
				token = known_tokens.getWethToken();
			} else {
				token = known_tokens.getTokenByAddress(tk.id);
			}

			let aTokenBalance;
			let isUnlocked;
			let borrowBalance;
			if (ethAccount) {
				aTokenBalance = aaveBalances[index].balance;
				borrowBalance = aaveBalances[index].borrowBalance;
				if (tk.id === AAVE_ETH_TOKEN) {
					isUnlocked = true;
				} else {
					const allowance = aaveBalances[index].allowance;
					isUnlocked = allowance.isGreaterThan("10000e18");
				}
			}
			aTokens.push({
				address: tk.aToken.id,
				name: tk.name,
				symbol: tk.symbol,
				token,
				isUnlocked,
				balance: aTokenBalance,
				borrowBalance,
				liquidityRate: new BigNumber(tk.liquidityRate),
				variableBorrowRate: new BigNumber(tk.variableBorrowRate),
				stableBorrowRate: new BigNumber(tk.stableBorrowRate),
			});
		} catch (e) {
			// tslint:disable-next-line:no-console
			// console.error(`There was a problem with Atoken wrapper  ${tk.name}`, e);
		}
	}
	return aTokens;
};

export const getAaveOverall = async (ethAccount) => {
	const lendingPoolContract = await getLendingPool({}, web3.currentProvider);
	const userAccountData = await lendingPoolContract.getUserAccountData(ethAccount).callAsync();
	const userAcc = {
		totalLiquidity: userAccountData[0],
		totalCollateralETH: userAccountData[1],
		totalBorrowsETH: userAccountData[2],
		totalFeesETH: userAccountData[3],
		availableBorrowsETH: userAccountData[4],
		currentLiquidationThreshold: userAccountData[5],
		ltv: userAccountData[6],
		healthFactor: userAccountData[7],
	};

	return userAcc;
};

/*export const getAllATokens = async (ethAccount: string): Promise<[ATokenData[]]> => {

};*/
/**
 * Updates allowance and balance
 */
export const getUpdateAToken = async (ethAccount, aToken) => {
	let aTokenBalance;
	let isUnlocked;
	let reserve;
	if (ethAccount) {
		if (aToken.token.symbol.toLowerCase() === "weth" || aToken.token.symbol.toLowerCase() === "eth") {
			reserve = AAVE_ETH_TOKEN;
		} else {
			reserve = aToken.token.address;
		}
		const aaveReader = await getAaveReader({}, web3.currentProvider);
		const aaveBalances = await aaveReader.getBatchATokensData(ethAccount, [reserve]).callAsync();

		if (reserve === AAVE_ETH_TOKEN) {
			isUnlocked = true;
			aTokenBalance = aaveBalances[0].balance;
		} else {
			const allowance = aaveBalances[0].allowance;
			isUnlocked = allowance.isGreaterThan("10000e18");
			aTokenBalance = aaveBalances[0].balance;
		}
	}
	return {
		...aToken,
		balance: aTokenBalance,
		isUnlocked,
	};
};
