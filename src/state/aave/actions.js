import { BigNumber } from "@0x/utils";
import { createAction } from "@reduxjs/toolkit";

import {
	getAaveOverall,
	getAllATokens,
	getAllATokensV2,
	getATokenContractWrapper,
	getLendingPool,
} from "../../services/aave/aave";
import { AAVE_ETH_TOKEN } from "../../utils/aave/constants";
import { AaveLoadingState } from "../../utils/aave/types";
import { isWeth } from "../../utils/known_tokens";
import { getTransactionOptions } from "../../utils/spot/transactions";
import { getAaveReservesGQLResponse } from "../selectors";
import { DEFAULT_GAS_PRICE } from "../../constants";
import { Web3Wrapper } from "@0x/web3-wrapper";
import Web3 from "web3";

export const initializeAaveData = createAction("aave/init");

export const setAaveLoadingState = createAction("aave/AAVE_LOADING_STATE_set");

export const setATokenBalance = createAction("aave/ATOKEN_BALANCE_set");

export const setAaveReservesGQLResponse = createAction("aave/RESERVES_GQL_RESPONSE_set");

export const setATokenBalances = createAction("aave/ATOKEN_BALANCES_set");

export const setAaveUserAccountData = createAction("aave/USER_ACCOUNT_DATA_set");

export const setAaveCurrency = createAction("aave/AAVE_CURRENCY_set");

export const initAave = (ethAccount) => {
	return async (dispatch, getState) => {
		const state = getState();
		const aaveReservesGQL = getAaveReservesGQLResponse(state);
		dispatch(setAaveLoadingState(AaveLoadingState.Loading));
		try {
			dispatch(setAaveReservesGQLResponse(aaveReservesGQL));
			const aTokens = await getAllATokensV2(aaveReservesGQL, ethAccount);

			dispatch(
				initializeAaveData({
					aTokensData: aTokens,
				})
			);
			dispatch(setAaveLoadingState(AaveLoadingState.Done));
		} catch (error) {
			dispatch(setAaveLoadingState(AaveLoadingState.Error));
		}
	};
};

export const fetchAave = (ethAccount) => {
	return async (dispatch, getState) => {
		const state = getState();
		const aaveReservesGQL = getAaveReservesGQLResponse(state);
		try {
			const aTokens = await getAllATokensV2(aaveReservesGQL, ethAccount);
			dispatch(setATokenBalances(aTokens));
		} catch (error) {
			console.log(error);
		}
	};
};

export const fetchAaveGlobal = (ethAccount) => {
	return async (dispatch, getState) => {
		const state = getState();
		const aaveReservesGQL = getAaveReservesGQLResponse(state);
		try {
			const aTokens = await getAllATokens(aaveReservesGQL, ethAccount);
			dispatch(setATokenBalances(aTokens));
		} catch (error) {
			console.log(error);
		}
	};
};

export const lendingAToken = (token, aToken, amount, isEth, ethAccount) => {
	return async (dispatch) => {
		const gasPrice = DEFAULT_GAS_PRICE;
		const web3 = new Web3(Web3.givenProvider || new Web3.providers.HttpProvider(process.env.REACT_APP_NETWORK_URL));
		let web3Wrapper;
		let txHash;
		if (web3.currentProvider) {
			web3Wrapper = new Web3Wrapper(web3.currentProvider);
			const lendingPoolWrapper = await getLendingPool(
				{
					from: ethAccount.toLowerCase(),
					gas: "400000",
				},
				web3Wrapper.getProvider()
			);
			if (isEth) {
				txHash = await lendingPoolWrapper.deposit(AAVE_ETH_TOKEN, amount, 69).sendTransactionAsync({
					from: ethAccount.toLowerCase(),
					value: amount.toString(),
					gasPrice: getTransactionOptions(gasPrice).gasPrice,
				});
			} else {
				txHash = await lendingPoolWrapper.deposit(token.address, amount, 69).sendTransactionAsync({
					from: ethAccount.toLowerCase(),
					gasPrice: getTransactionOptions(gasPrice).gasPrice,
				});
			}

			const tx = web3Wrapper.awaitTransactionSuccessAsync(txHash);

			tx.then(async () => {
				const userAcc = await getAaveOverall(ethAccount);
				dispatch(setAaveUserAccountData(userAcc));
			});
		}

		/*web3Wrapper.awaitTransactionSuccessAsync(tx).then(() => {
            // tslint:disable-next-line:no-floating-promises
            dispatch(updateTokenBalancesOnToggleTokenLock(token, isUnlocked));
        });*/

		return txHash;
	};
};

export const unLendingAToken = (token, aToken, amount, isEth, ethAccount) => {
	return async (dispatch, getState) => {
		const state = getState();
		const gasPrice = DEFAULT_GAS_PRICE;
		const web3 = new Web3(Web3.givenProvider || new Web3.providers.HttpProvider(process.env.REACT_APP_NETWORK_URL));
		const web3Wrapper = new Web3Wrapper(web3.currentProvider);
		const aTokenWrapper = await getATokenContractWrapper(
			aToken.address,
			{
				from: ethAccount.toLowerCase(),
				gas: "800000",
			},
			web3Wrapper.getProvider()
		);

		const txHash = await aTokenWrapper.redeem(amount).sendTransactionAsync({
			from: ethAccount.toLowerCase(),
			gasPrice: getTransactionOptions(gasPrice).gasPrice,
		});

		const tx = web3Wrapper.awaitTransactionSuccessAsync(txHash);

		tx.then(async () => {
			const userAcc = await getAaveOverall(ethAccount);
			dispatch(setAaveUserAccountData(userAcc));
		});

		/*web3Wrapper.awaitTransactionSuccessAsync(tx).then(() => {
            // tslint:disable-next-line:no-floating-promises
            dispatch(updateTokenBalancesOnToggleTokenLock(token, isUnlocked));
        });*/
		// tslint:disable-next-line: no-floating-promises

		return txHash;
	};
};

export const borrowAToken = (token, aToken, amount, isEth, ethAccount) => {
	return async (dispatch, getState) => {
		const state = getState();
		const gasPrice = DEFAULT_GAS_PRICE;
		const web3 = new Web3(Web3.givenProvider || new Web3.providers.HttpProvider(process.env.REACT_APP_NETWORK_URL));
		const web3Wrapper = new Web3Wrapper(web3.currentProvider);
		const lendingPoolWrapper = await getLendingPool(
			{
				from: ethAccount.toLowerCase(),
				gas: "800000",
			},
			web3Wrapper.getProvider()
		);
		let address;
		if (isWeth(aToken.token.symbol)) {
			address = AAVE_ETH_TOKEN;
		} else {
			address = aToken.token.address;
		}

		const txHash = await lendingPoolWrapper.borrow(address, amount, new BigNumber(2), 69).sendTransactionAsync({
			from: ethAccount.toLowerCase(),
			gasPrice: getTransactionOptions(gasPrice).gasPrice,
		});

		const tx = web3Wrapper.awaitTransactionSuccessAsync(txHash);

		tx.then(async () => {
			const userAcc = await getAaveOverall(ethAccount);
			dispatch(setAaveUserAccountData(userAcc));
		});

		return txHash;
	};
};

export const repayAToken = (token, aToken, amount, isEth, ethAccount) => {
	return async (dispatch, getState) => {
		const state = getState();
		const gasPrice = DEFAULT_GAS_PRICE;
		const web3 = new Web3(Web3.givenProvider || new Web3.providers.HttpProvider(process.env.REACT_APP_NETWORK_URL));
		const web3Wrapper = new Web3Wrapper(web3.currentProvider);
		const lendingPoolWrapper = await getLendingPool(
			{
				from: ethAccount.toLowerCase(),
				gas: "300000",
			},
			web3Wrapper.getProvider()
		);
		let address;
		let txHash;
		if (isWeth(aToken.token.symbol) || aToken.token.symbol.toLowerCase() === "eth") {
			address = AAVE_ETH_TOKEN;
			let amountRepay = amount;
			const borrowBalance = aToken.borrowBalance;
			if (borrowBalance.minus(borrowBalance).dividedBy(borrowBalance).isLessThan(0.01)) {
				amountRepay = amount.plus(amount.multipliedBy(0.001)).integerValue(BigNumber.ROUND_DOWN);
			}
			txHash = await lendingPoolWrapper
				.repay(address, amountRepay, ethAccount.toLowerCase())
				.sendTransactionAsync({
					from: ethAccount.toLowerCase(),
					gasPrice: getTransactionOptions(gasPrice).gasPrice,
					value: amountRepay,
				});
		} else {
			address = aToken.token.address;
			// if we pass -1 on the amount it will pay all the borrow balance, we assume when amount is 99 % of borrowedbalance user, wants to pay
			// all the borrow balance.
			const borrowBalance = aToken.borrowBalance;
			let amountRepay = amount;
			if (borrowBalance.minus(borrowBalance).dividedBy(borrowBalance).isLessThan(0.01)) {
				amountRepay = amount.plus(amount.multipliedBy(0.001)).integerValue(BigNumber.ROUND_DOWN);
			}

			txHash = await lendingPoolWrapper
				.repay(address, amountRepay, ethAccount.toLowerCase())
				.sendTransactionAsync({
					from: ethAccount.toLowerCase(),
					gasPrice: getTransactionOptions(gasPrice).gasPrice,
				});
		}

		const tx = web3Wrapper.awaitTransactionSuccessAsync(txHash);

		tx.then(async () => {
			const userAcc = await getAaveOverall(ethAccount);
			dispatch(setAaveUserAccountData(userAcc));
		});

		return txHash;
	};
};
