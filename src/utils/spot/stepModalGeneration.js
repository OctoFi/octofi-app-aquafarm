import { assetDataUtils } from "@0x/order-utils";
import { BigNumber } from "@0x/utils";

import { isWeth, isWhackd } from "../known_tokens";
import { OrderSide, StepKind } from "../../constants";
import { Protocol } from "../aave/types";
import { LENDING_POOL_CORE_ADDRESS } from "../aave/constants";

export const createBuySellLimitMatchingSteps = (
	baseToken,
	quoteToken,
	tokenBalances,
	wethTokenBalance,
	ethBalance,
	amount,
	side,
	price,
	price_avg,
	ordersToFill
) => {
	const buySellLimitMatchingFlow = [];
	const isBuy = side === OrderSide.Buy;
	const tokenToUnlock = isBuy ? quoteToken : baseToken;

	const unlockTokenStep = getUnlockTokenStepIfNeeded(tokenToUnlock, tokenBalances, wethTokenBalance);
	// Unlock token step should be added if it:
	// 1) it's a sell, or
	const isSell = unlockTokenStep && side === OrderSide.Sell;
	// 2) is a buy and
	// base token is not weth and is locked, or
	// base token is weth, is locked and there is not enouth plain ETH to fill the order
	const isBuyWithWethConditions =
		isBuy &&
		unlockTokenStep &&
		(!isWeth(tokenToUnlock.symbol) ||
			(isWeth(tokenToUnlock.symbol) && ethBalance.isLessThan(amount.multipliedBy(price))));
	if (isSell || isBuyWithWethConditions) {
		buySellLimitMatchingFlow.push(unlockTokenStep);
	}
	const order = ordersToFill[0];
	if (order.takerFee.isGreaterThan(0)) {
		const { tokenAddress } = assetDataUtils.decodeAssetDataOrThrow(order.takerFeeAssetData);
		if (!unlockTokenStep || (unlockTokenStep && unlockTokenStep.token.address !== tokenAddress)) {
			const unlockFeeTokenStep = getUnlockFeeAssetStepIfNeeded(
				[...tokenBalances, wethTokenBalance],
				tokenAddress
			);
			if (unlockFeeTokenStep) {
				buySellLimitMatchingFlow.push(unlockFeeTokenStep);
			}
		}
	}

	// wrap the necessary ether if necessary
	if (isWeth(quoteToken.symbol)) {
		const isWhackedBase = !!isWhackd(baseToken.symbol);
		const wrapEthStep = getWrapEthStepIfNeeded(
			amount,
			price,
			side,
			wethTokenBalance,
			ethBalance,
			undefined,
			true,
			isWhackedBase
		);
		if (wrapEthStep) {
			buySellLimitMatchingFlow.push(wrapEthStep);
		}
	}

	buySellLimitMatchingFlow.push({
		kind: StepKind.BuySellLimitMatching,
		amount,
		side,
		price,
		price_avg,
		token: baseToken,
	});
	return buySellLimitMatchingFlow;
};

export const getUnlockTokenStepIfNeeded = (token, tokenBalances, wethTokenBalance) => {
	const tokenBalance = isWeth(token.symbol)
		? wethTokenBalance
		: tokenBalances.find((tb) => tb.token.symbol === token.symbol);
	if (tokenBalance.isUnlocked) {
		return null;
	} else {
		return {
			kind: StepKind.ToggleTokenLock,
			token: tokenBalance.token,
			isUnlocked: false,
			context: "order",
		};
	}
};

export const getWrapEthStepIfNeeded = (
	amount,
	price,
	side,
	wethTokenBalance,
	ethBalance = undefined,
	feeBalance = undefined,
	isQuote = true,
	// Note: some tokens not work with forwarder, force wrap for these cases. TODO: Remove this workaraound
	forceWrap = false
) => {
	// Weth needed only when creating a buy order
	if (side === OrderSide.Sell && isQuote) {
		return null;
	}
	// Weth needed when creating a sell order and it is not a quote
	if (side === OrderSide.Buy && !isQuote) {
		return null;
	}

	let wethAmountNeeded = isQuote ? amount.multipliedBy(price) : amount;
	if (feeBalance) {
		wethAmountNeeded = wethAmountNeeded.plus(feeBalance);
	}

	// If we have enough WETH, we don't need to wrap
	if (wethTokenBalance.balance.isGreaterThan(wethAmountNeeded)) {
		return null;
	}

	// Weth needed only if not enough plain ETH to use forwarder
	if (ethBalance && ethBalance.isGreaterThan(wethAmountNeeded) && !forceWrap) {
		return null;
	}

	const wethBalance = wethTokenBalance.balance;
	const deltaWeth = wethBalance.minus(wethAmountNeeded);
	// Need to wrap eth only if weth balance is not enough
	if (deltaWeth.isLessThan(0)) {
		return {
			kind: StepKind.WrapEth,
			currentWethBalance: wethBalance,
			newWethBalance: wethAmountNeeded,
			context: "order",
		};
	} else {
		return null;
	}
};

export const getUnlockFeeAssetStepIfNeeded = (tokenBalances, feeTokenAddress) => {
	const balance = tokenBalances.find(
		(tokenBalance) => tokenBalance.token.address.toLowerCase() === feeTokenAddress.toLowerCase()
	);
	if (!balance) {
		throw new Error(`Unknown fee token: ${feeTokenAddress}`);
	}
	if (!balance.isUnlocked) {
		return {
			kind: StepKind.ToggleTokenLock,
			token: balance.token,
			isUnlocked: false,
			context: "order",
		};
	}
	return null;
};

export const createBuySellLimitSteps = (
	baseToken,
	quoteToken,
	tokenBalances,
	wethTokenBalance,
	amount,
	price,
	side,
	orderFeeData,
	is_ieo = undefined
) => {
	const buySellLimitFlow = [];
	let unlockTokenStep;

	// unlock base and quote tokens if necessary

	unlockTokenStep =
		side === OrderSide.Buy
			? // If it's a buy -> the quote token has to be unlocked
			  getUnlockTokenStepIfNeeded(quoteToken, tokenBalances, wethTokenBalance)
			: // If it's a sell -> the base token has to be unlocked
			  getUnlockTokenStepIfNeeded(baseToken, tokenBalances, wethTokenBalance);

	if (unlockTokenStep) {
		buySellLimitFlow.push(unlockTokenStep);
	}

	if (orderFeeData.makerFee.isGreaterThan(0)) {
		const { tokenAddress } = assetDataUtils.decodeAssetDataOrThrow(orderFeeData.makerFeeAssetData);
		if (!unlockTokenStep || unlockTokenStep.token.address !== tokenAddress) {
			const unlockFeeTokenStep = getUnlockFeeAssetStepIfNeeded(
				[...tokenBalances, wethTokenBalance],
				tokenAddress
			);
			if (unlockFeeTokenStep) {
				buySellLimitFlow.push(unlockFeeTokenStep);
			}
		}
	}

	// wrap the necessary ether if it is one of the traded tokens
	if (isWeth(baseToken.symbol) || isWeth(quoteToken.symbol)) {
		let feeBalance = new BigNumber(0);
		// check if maker fee data is Weth
		try {
			if (orderFeeData.makerFee.isGreaterThan(0)) {
				const { tokenAddress } = assetDataUtils.decodeAssetDataOrThrow(orderFeeData.makerFeeAssetData);
				// check if needs to pay fee token
				if (wethTokenBalance.token.address.toLowerCase() === tokenAddress.toLowerCase()) {
					feeBalance = orderFeeData.makerFee;
				}
			}
		} catch (e) {
			console.log(e);
		}
		const isWethQuote = !!isWeth(quoteToken.symbol.toLowerCase());
		const wrapEthStep = getWrapEthStepIfNeeded(
			amount,
			price,
			side,
			wethTokenBalance,
			undefined,
			feeBalance,
			isWethQuote
		);
		if (wrapEthStep) {
			buySellLimitFlow.push(wrapEthStep);
		}
	}

	buySellLimitFlow.push({
		kind: StepKind.BuySellLimit,
		amount,
		price,
		side,
		token: baseToken,
		is_ieo,
	});

	return buySellLimitFlow;
};

export const createBuySellMarketSteps = (
	baseToken,
	quoteToken,
	tokenBalances,
	wethTokenBalance,
	ethBalance,
	amount,
	side,
	price,
	ordersToFill
) => {
	const buySellMarketFlow = [];
	const isBuy = side === OrderSide.Buy;
	const tokenToUnlock = isBuy ? quoteToken : baseToken;

	const unlockTokenStep = getUnlockTokenStepIfNeeded(tokenToUnlock, tokenBalances, wethTokenBalance);
	// Unlock token step should be added if it:
	// 1) it's a sell, or
	const isSell = unlockTokenStep && side === OrderSide.Sell;
	// 2) is a buy and
	// base token is not weth and is locked, or
	// base token is weth, is locked and there is not enouth plain ETH to fill the order
	const isBuyWithWethConditions =
		isBuy &&
		unlockTokenStep &&
		(!isWeth(tokenToUnlock.symbol) ||
			(isWeth(tokenToUnlock.symbol) && ethBalance.isLessThan(amount.multipliedBy(price))));
	if (isSell || isBuyWithWethConditions) {
		buySellMarketFlow.push(unlockTokenStep);
	}
	// Note: We assume that fees are constructed the same way on the other orders
	const order = ordersToFill[0];
	// unlock fees if the taker fee is positive
	if (order.takerFee.isGreaterThan(0)) {
		const { tokenAddress } = assetDataUtils.decodeAssetDataOrThrow(order.takerFeeAssetData);
		if (!unlockTokenStep || (unlockTokenStep && unlockTokenStep.token.address !== tokenAddress)) {
			const unlockFeeStep = getUnlockFeeAssetStepIfNeeded([...tokenBalances, wethTokenBalance], tokenAddress);
			if (unlockFeeStep) {
				buySellMarketFlow.push(unlockFeeStep);
			}
		}
	}

	// wrap the necessary ether if necessary
	if (isWeth(quoteToken.symbol)) {
		const isWhackedBase = isWhackd(baseToken.symbol) ? true : false;
		const wrapEthStep = getWrapEthStepIfNeeded(
			amount,
			price,
			side,
			wethTokenBalance,
			ethBalance,
			undefined,
			true,
			isWhackedBase
		);
		if (wrapEthStep) {
			buySellMarketFlow.push(wrapEthStep);
		}
	}

	buySellMarketFlow.push({
		kind: StepKind.BuySellMarket,
		amount,
		side,
		token: baseToken,
		context: "order",
	});
	return buySellMarketFlow;
};

export const createRepayTokenSteps = (defiToken, token, wethTokenBalance, ethBalance, amount, isEth, protocol) => {
	const repayTokenFlow = [];
	if (isEth) {
		if (amount.isGreaterThan(ethBalance)) {
			const newWethBalance = wethTokenBalance.minus(amount.minus(ethBalance));
			const currentWethBalance = wethTokenBalance;
			const wrapEthStep = {
				kind: StepKind.WrapEth,
				currentWethBalance,
				newWethBalance,
				context: "standalone",
			};
			repayTokenFlow.push(wrapEthStep);
			// unwrapp eth here
		}
	} else {
		const unlockTokenStep = getUnlockLendingTokenStepIfNeeded(defiToken, token, protocol);
		if (unlockTokenStep) {
			repayTokenFlow.push(unlockTokenStep);
		}
	}
	const isBorrow = false;

	repayTokenFlow.push({
		kind: StepKind.RepayToken,
		amount,
		token,
		defiToken,
		isEth,
		isBorrow,
	});
	return repayTokenFlow;
};

export const createBorrowTokenSteps = (
	defiToken,
	token,
	// tokenBalances: TokenBalance[],
	wethTokenBalance,
	ethBalance,
	amount,
	isEth,
	protocol
) => {
	const borrowTokenFlow = [];
	if (isEth) {
		if (amount.isGreaterThan(ethBalance)) {
			const newWethBalance = wethTokenBalance.minus(amount.minus(ethBalance));
			const currentWethBalance = wethTokenBalance;
			const wrapEthStep = {
				kind: StepKind.WrapEth,
				currentWethBalance,
				newWethBalance,
				context: "standalone",
			};
			borrowTokenFlow.push(wrapEthStep);
			// unwrapp eth here
		}
	} else {
		/* const unlockTokenStep = getUnlockLendingTokenStepIfNeeded(defiToken, token, protocol);
        if (unlockTokenStep) {
            borrowTokenFlow.push(unlockTokenStep);
        }*/
	}
	const isBorrow = true;

	borrowTokenFlow.push({
		kind: StepKind.BorrowToken,
		amount,
		token,
		defiToken,
		isEth,
		isBorrow,
	});
	return borrowTokenFlow;
};

export const createLendingTokenSteps = (defiToken, token, wethTokenBalance, ethBalance, amount, isEth, protocol) => {
	const lendingTokenFlow = [];
	if (isEth) {
		if (amount.isGreaterThan(ethBalance)) {
			const newWethBalance = wethTokenBalance.minus(amount.minus(ethBalance));
			const currentWethBalance = wethTokenBalance;
			const wrapEthStep = {
				kind: StepKind.WrapEth,
				currentWethBalance,
				newWethBalance,
				context: "standalone",
			};
			lendingTokenFlow.push(wrapEthStep);
			// unwrapp eth here
		}
	} else {
		const unlockTokenStep = getUnlockLendingTokenStepIfNeeded(defiToken, token, protocol);
		if (unlockTokenStep) {
			lendingTokenFlow.push(unlockTokenStep);
		}
	}

	lendingTokenFlow.push({
		kind: StepKind.LendingToken,
		amount,
		token,
		defiToken,
		isEth,
		isLending: true,
	});
	return lendingTokenFlow;
};

export const getUnlockLendingTokenStepIfNeeded = (defiToken, token, protocol) => {
	let address;
	switch (protocol) {
		case Protocol.Aave:
			address = LENDING_POOL_CORE_ADDRESS;
			break;
		case Protocol.Bzx:
			address = defiToken.address;
			break;
		default:
			break;
	}

	if (defiToken.isUnlocked) {
		return null;
	} else {
		return {
			kind: StepKind.ToggleTokenLock,
			token,
			address,
			isUnlocked: false,
			context: "lending",
		};
	}
};
