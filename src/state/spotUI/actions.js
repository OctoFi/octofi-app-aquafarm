import { createAction } from "@reduxjs/toolkit";
import { BigNumber } from "@0x/utils";
import { signatureUtils } from "@0x/order-utils";

import { OrderSide, StepKind, ZERO } from "../../constants";
import { tokenAmountInUnitsToBigNumber } from "../../utils/spot/tokens";
import { getWethAssetData, isWeth } from "../../utils/known_tokens";
import { InsufficientTokenBalanceException } from "../../lib/exceptions/balance";
import {
	createBorrowTokenSteps,
	createBuySellLimitMatchingSteps,
	createBuySellLimitSteps,
	createBuySellMarketSteps,
	createLendingTokenSteps,
	createRepayTokenSteps,
} from "../../utils/spot/stepModalGeneration";
import * as selectors from "../selectors";
import { buildLimitOrder, buildMarketLimitMatchingOrders, buildMarketOrders } from "../../utils/spot/orders";
import { getGasInfo, searchToken } from "../selectors";
import { InsufficientOrdersAmountException, SignedOrderException } from "../../lib/exceptions/order";
import { getExpirationTimeFromSeconds, getExpirationTimeOrdersFromConfig } from "../../utils/spot/timeUtils";
import { getContractWrappers } from "../../utils/spot/contractWrapper";
import { MetamaskSubprovider } from "@0x/subproviders";
import { getTransactionOptions } from "../../utils/spot/transactions";
import { ConvertBalanceMustNotBeEqualException } from "../../lib/exceptions/convertBalance";

export const addMarketFills = createAction("ui/FILLS_MARKET_add");

export const setMakerAmountSelected = createAction("ui/MAKER_AMOUNT_SELECTED_set");

export const setOrderBuyPriceSelected = createAction("ui/ORDER_BUY_PRICE_SELECTED_set");

export const setOrderPriceSelected = createAction("ui/ORDER_PRICE_SELECTED_set");

export const setOrderSellPriceSelected = createAction("ui/ORDER_SELL_PRICE_SELECTED_set");

export const setStepsModalCurrentStep = createAction("ui/steps_modal/CURRENT_STEP_set");

export const setStepsModalPendingSteps = createAction("ui/steps_modal/PENDING_STEPS_set");

export const setStepsModalDoneSteps = createAction("ui/steps_modal/DONE_STEPS_set");

export const stepsModalAdvanceStep = createAction("ui/steps_modal/advance_step");

export const setOrderSecondsExpirationTime = createAction("ui/ORDER_SECONDS_EXPIRATION_TIME_set");

export const startBuySellLimitMatchingSteps = (amount, price, side, tokenBalances, wethBalance, ethBalance) => {
	return async (dispatch, getState) => {
		const state = getState();
		const baseToken = selectors.getBaseToken(state);
		const quoteToken = selectors.getQuoteToken(state);
		const wethTokenBalance = wethBalance;
		const totalEthBalance = ethBalance.plus(wethTokenBalance);
		const quoteTokenBalance = searchToken({ tokenBalances, wethTokenBalance, tokenToFind: quoteToken });
		const baseTokenBalance = searchToken({ tokenBalances, wethTokenBalance, tokenToFind: baseToken });

		const allOrders =
			side === OrderSide.Buy ? selectors.getOpenSellOrders(state) : selectors.getOpenBuyOrders(state);
		const { ordersToFill, amounts, amountFill, amountsMaker } = buildMarketLimitMatchingOrders(
			{
				amount,
				price,
				orders: allOrders,
			},
			side
		);

		if (ordersToFill.length === 0) {
			return 0;
		}
		const totalFilledAmount = amounts.reduce((total, currentValue) => {
			return total.plus(currentValue);
		}, new BigNumber(0));

		let price_avg;
		if (side === OrderSide.Buy) {
			const takerFilledAmount = tokenAmountInUnitsToBigNumber(totalFilledAmount, quoteToken.decimals);
			const makerFilledAmount = tokenAmountInUnitsToBigNumber(amountFill, baseToken.decimals);
			price_avg = takerFilledAmount.div(makerFilledAmount);
		} else {
			const totalMakerAmount = amountsMaker.reduce((total, currentValue) => {
				return total.plus(currentValue);
			}, new BigNumber(0));

			const makerFilledAmount = tokenAmountInUnitsToBigNumber(totalMakerAmount, quoteToken.decimals);
			const takerFilledAmount = tokenAmountInUnitsToBigNumber(amountFill, baseToken.decimals);

			price_avg = makerFilledAmount.div(takerFilledAmount);
		}

		if (side === OrderSide.Sell) {
			// When selling, user should have enough BASE Token
			if (baseTokenBalance && baseTokenBalance.balance.isLessThan(totalFilledAmount)) {
				throw new InsufficientTokenBalanceException(baseToken.symbol);
			}
		} else {
			let takerWethFee = new BigNumber(0);
			const wethAssetData = getWethAssetData();
			for (const or of ordersToFill) {
				if (or.takerFeeAssetData.toLowerCase() === wethAssetData && or.takerFee.gt(0)) {
					takerWethFee = takerWethFee.plus(or.takerFee);
				}
			}
			// When buying and
			// if quote token is weth, should have enough ETH + WETH balance, or
			// if quote token is not weth, should have enough quote token balance
			const isEthAndWethNotEnoughBalance =
				isWeth(quoteToken.symbol) && totalEthBalance.isLessThan(totalFilledAmount.plus(takerWethFee));
			const isOtherQuoteTokenAndNotEnoughBalance =
				!isWeth(quoteToken.symbol) &&
				quoteTokenBalance &&
				quoteTokenBalance.balance.isLessThan(totalFilledAmount);
			if (isEthAndWethNotEnoughBalance || isOtherQuoteTokenAndNotEnoughBalance) {
				throw new InsufficientTokenBalanceException(quoteToken.symbol);
			}
		}

		const buySellLimitMatchingFlow = createBuySellLimitMatchingSteps(
			baseToken,
			quoteToken,
			tokenBalances,
			wethTokenBalance,
			ethBalance,
			amountFill,
			side,
			price,
			price_avg,
			ordersToFill
		);

		dispatch(setStepsModalCurrentStep(buySellLimitMatchingFlow[0]));
		dispatch(setStepsModalPendingSteps(buySellLimitMatchingFlow.slice(1)));
		dispatch(setStepsModalDoneSteps([]));
	};
};

export const startBuySellLimitSteps = (amount, price, side, orderFeeData, tokenBalances, wethBalance) => {
	return async (dispatch, getState) => {
		const state = getState();
		const baseToken = selectors.getBaseToken(state);
		const quoteToken = selectors.getQuoteToken(state);
		const wethTokenBalance = wethBalance;
		const buySellLimitFlow = createBuySellLimitSteps(
			baseToken,
			quoteToken,
			tokenBalances,
			wethTokenBalance,
			amount,
			price,
			side,
			orderFeeData
		);

		dispatch(setStepsModalCurrentStep(buySellLimitFlow[0]));
		dispatch(setStepsModalPendingSteps(buySellLimitFlow.slice(1)));
		dispatch(setStepsModalDoneSteps([]));
	};
};

export const startBuySellMarketSteps = (amount, side, tokenBalances, wethBalance, ethBalance) => {
	return async (dispatch, getState) => {
		const state = getState();
		const baseToken = selectors.getBaseToken(state);
		const quoteToken = selectors.getQuoteToken(state);
		const wethTokenBalance = wethBalance.balance;
		const totalEthBalance = ethBalance.plus(wethTokenBalance);
		const quoteTokenBalance = searchToken({
			tokenBalances,
			wethTokenBalance: wethBalance,
			tokenToFind: quoteToken,
		});
		const baseTokenBalance = searchToken({ tokenBalances, wethTokenBalance: wethBalance, tokenToFind: baseToken });

		const orders = side === OrderSide.Buy ? selectors.getOpenSellOrders(state) : selectors.getOpenBuyOrders(state);
		// tslint:disable-next-line:no-unused-variable
		const [ordersToFill, filledAmounts, canBeFilled] = buildMarketOrders(
			{
				amount,
				orders,
			},
			side
		);
		if (!canBeFilled) {
			throw new InsufficientOrdersAmountException();
		}

		const totalFilledAmount = filledAmounts.reduce((total, currentValue) => {
			return total.plus(currentValue);
		}, ZERO);

		const price = totalFilledAmount.div(amount);

		if (side === OrderSide.Sell) {
			// When selling, user should have enough BASE Token
			if (baseTokenBalance && baseTokenBalance.balance.isLessThan(totalFilledAmount)) {
				throw new InsufficientTokenBalanceException(baseToken.symbol);
			}
		} else {
			let takerWethFee = new BigNumber(0);
			const wethAssetData = getWethAssetData();
			for (const or of ordersToFill) {
				if (or.takerFeeAssetData.toLowerCase() === wethAssetData && or.takerFee.gt(0)) {
					takerWethFee = takerWethFee.plus(or.takerFee);
				}
			}
			// When buying and
			// if quote token is weth, should have enough ETH + WETH balance, or
			// if quote token is not weth, should have enough quote token balance
			const isEthAndWethNotEnoughBalance =
				isWeth(quoteToken.symbol) && totalEthBalance.isLessThan(totalFilledAmount.plus(takerWethFee));
			const ifOtherQuoteTokenAndNotEnoughBalance =
				!isWeth(quoteToken.symbol) &&
				quoteTokenBalance &&
				quoteTokenBalance.balance.isLessThan(totalFilledAmount);
			if (isEthAndWethNotEnoughBalance || ifOtherQuoteTokenAndNotEnoughBalance) {
				throw new InsufficientTokenBalanceException(quoteToken.symbol);
			}
		}

		const buySellMarketFlow = createBuySellMarketSteps(
			baseToken,
			quoteToken,
			tokenBalances,
			wethBalance,
			ethBalance,
			amount,
			side,
			price,
			ordersToFill
		);

		dispatch(setStepsModalCurrentStep(buySellMarketFlow[0]));
		dispatch(setStepsModalPendingSteps(buySellMarketFlow.slice(1)));
		dispatch(setStepsModalDoneSteps([]));
	};
};

export const signMessage = (provider, params) => {
	return new Promise((resolve, reject) => {
		provider.sendAsync(params, (err, result) => {
			if (err) return reject(err);
			if (result.error) {
				return reject(result.error);
			}

			return resolve(result.result);
		});
	});
};

export const createSignedOrder = (amount, price, side, ethAccount, web3, library) => {
	return async (dispatch, getState) => {
		const state = getState();
		const baseToken = selectors.getBaseToken(state);
		const quoteToken = selectors.getQuoteToken(state);
		const isAffiliate = selectors.getIsAffiliate(state);
		let affiliateAddress;
		if (isAffiliate) {
			affiliateAddress = selectors.getFeeRecipient(state);
		}

		const orderSecondsExpirationTime = selectors.getOrderSecondsExpirationTime(state);
		const expirationTimeSeconds = orderSecondsExpirationTime
			? getExpirationTimeFromSeconds(orderSecondsExpirationTime)
			: getExpirationTimeOrdersFromConfig();
		try {
			const contractWrappers = await getContractWrappers(web3);

			const order = await buildLimitOrder(
				{
					account: ethAccount,
					amount,
					price,
					baseTokenAddress: baseToken.address,
					quoteTokenAddress: quoteToken.address,
					exchangeAddress: contractWrappers.exchange.address,
				},
				side,
				expirationTimeSeconds,
				affiliateAddress
			);

			const provider = new MetamaskSubprovider(web3);
			return signatureUtils.ecSignTypedDataOrderAsync(provider, order, ethAccount);
		} catch (error) {
			throw new SignedOrderException(error.message);
		}
	};
};

export const startMultipleBuySellLimitSteps = (
	amountBuy,
	priceBuy,
	orderBuyFeeData,
	amountSell,
	priceSell,
	orderSellFeeData,
	tokenBalances,
	wethTokenBalance
) => {
	return async (dispatch, getState) => {
		const state = getState();
		const baseToken = selectors.getBaseToken(state);
		const quoteToken = selectors.getQuoteToken(state);

		const buyLimitFlow = createBuySellLimitSteps(
			baseToken,
			quoteToken,
			tokenBalances,
			wethTokenBalance,
			amountBuy,
			priceBuy,
			OrderSide.Buy,
			orderBuyFeeData
		);

		const sellLimitFlow = createBuySellLimitSteps(
			baseToken,
			quoteToken,
			tokenBalances,
			wethTokenBalance,
			amountSell,
			priceSell,
			OrderSide.Sell,
			orderSellFeeData
		);
		buyLimitFlow.push(...sellLimitFlow);

		dispatch(setStepsModalCurrentStep(buyLimitFlow[0]));
		dispatch(setStepsModalPendingSteps(buyLimitFlow.slice(1)));
		dispatch(setStepsModalDoneSteps([]));
	};
};

export const startLendingTokenSteps = (
	amount,
	token,
	defiToken,
	isEth,
	protocol,
	ethBalance,
	wethBalance,
	totalEthBalance
) => {
	return async (dispatch, getState) => {
		const isEthAndWethNotEnoughBalance = isEth && totalEthBalance.isLessThan(amount);

		if (isEthAndWethNotEnoughBalance) {
			throw new InsufficientTokenBalanceException(token.symbol);
		}

		const lendingTokenFlow = createLendingTokenSteps(
			defiToken,
			token,
			wethBalance,
			ethBalance,
			amount,
			isEth,
			protocol
		);

		dispatch(setStepsModalCurrentStep(lendingTokenFlow[0]));
		dispatch(setStepsModalPendingSteps(lendingTokenFlow.slice(1)));
		dispatch(setStepsModalDoneSteps([]));
	};
};

export const startBorrowTokenSteps = (
	amount,
	token,
	defiToken,
	isEth,
	protocol,
	ethBalance,
	wethBalance,
	totalEthBalance
) => {
	return async (dispatch, getState) => {
		const isEthAndWethNotEnoughBalance = isEth && totalEthBalance.isLessThan(amount);

		if (isEthAndWethNotEnoughBalance) {
			throw new InsufficientTokenBalanceException(token.symbol);
		}

		const borrowTokenFlow = createBorrowTokenSteps(
			defiToken,
			token,
			wethBalance,
			ethBalance,
			amount,
			isEth,
			protocol
		);

		dispatch(setStepsModalCurrentStep(borrowTokenFlow[0]));
		dispatch(setStepsModalPendingSteps(borrowTokenFlow.slice(1)));
		dispatch(setStepsModalDoneSteps([]));
	};
};

export const startRepayTokenSteps = (
	amount,
	token,
	defiToken,
	isEth,
	protocol,
	ethBalance,
	wethBalance,
	totalEthBalance
) => {
	return async (dispatch, getState) => {
		const isEthAndWethNotEnoughBalance = isEth && totalEthBalance.isLessThan(amount);

		if (isEthAndWethNotEnoughBalance) {
			throw new InsufficientTokenBalanceException(token.symbol);
		}

		const repayTokenFlow = createRepayTokenSteps(
			defiToken,
			token,
			wethBalance,
			ethBalance,
			amount,
			isEth,
			protocol
		);

		dispatch(setStepsModalCurrentStep(repayTokenFlow[0]));
		dispatch(setStepsModalPendingSteps(repayTokenFlow.slice(1)));
		dispatch(setStepsModalDoneSteps([]));
	};
};

export const startUnLendingTokenSteps = (amount, token, defiToken, isEth) => {
	return async (dispatch) => {
		const unLendingTokenStep = {
			kind: StepKind.UnLendingToken,
			amount,
			token,
			isEth,
			defiToken,
			isLending: false,
		};

		dispatch(setStepsModalCurrentStep(unLendingTokenStep));
		dispatch(setStepsModalPendingSteps([]));
		dispatch(setStepsModalDoneSteps([]));
	};
};

export const updateWethBalance = (currentWethBalance, newWethBalance, ethAccount, library) => {
	return async (dispatch, getState) => {
		const contractWrappers = await getContractWrappers(library);
		const state = getState();
		const gasPrice = getGasInfo(state).gasPriceInWei;
		const wethBalance = currentWethBalance;

		let txHash;
		const wethToken = contractWrappers.weth9;
		if (wethBalance.isLessThan(newWethBalance)) {
			txHash = await wethToken.deposit().sendTransactionAsync({
				value: newWethBalance.minus(wethBalance),
				from: ethAccount,
				...getTransactionOptions(gasPrice),
			});
		} else if (wethBalance.isGreaterThan(newWethBalance)) {
			txHash = await wethToken.withdraw(wethBalance.minus(newWethBalance)).sendTransactionAsync({
				from: ethAccount,
				...getTransactionOptions(gasPrice),
			});
		} else {
			throw new ConvertBalanceMustNotBeEqualException(wethBalance, newWethBalance);
		}

		return txHash;
	};
};
