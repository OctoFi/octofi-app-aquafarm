import { getUpdateAToken } from "../../services/aave/aave";
import { Protocol } from "../../utils/aave/types";
import { borrowAToken, lendingAToken, repayAToken, setATokenBalance, unLendingAToken } from "../aave/actions";
import { getDefiProtocol } from "../selectors";

export const lendingDefiToken = (token, defiToken, amount, isEth, account) => {
	return async (dispatch, getState) => {
		const state = getState();
		const protocol = getDefiProtocol(state);
		switch (protocol) {
			case Protocol.Aave:
				const txHash = dispatch(lendingAToken(token, defiToken, amount, isEth, account));
				return txHash;
			default:
				break;
		}
	};
};

export const borrowDefiToken = (token, defiToken, amount, isEth, account) => {
	return async (dispatch, getState) => {
		const state = getState();
		const protocol = getDefiProtocol(state);
		switch (protocol) {
			case Protocol.Aave:
				const txHash = dispatch(borrowAToken(token, defiToken, amount, isEth, account));
				return txHash;
			default:
				break;
		}
	};
};

export const repayDefiToken = (token, defiToken, amount, isEth, account) => {
	return async (dispatch, getState) => {
		const state = getState();
		const protocol = getDefiProtocol(state);
		switch (protocol) {
			case Protocol.Aave:
				const txHash = dispatch(repayAToken(token, defiToken, amount, isEth, account));
				return txHash;
			default:
				break;
		}
	};
};

export const unLendingDefiToken = (token, defiToken, amount, isEth, account) => {
	return async (dispatch, getState) => {
		const state = getState();
		const protocol = getDefiProtocol(state);
		switch (protocol) {
			case Protocol.Aave:
				const txHash = dispatch(unLendingAToken(token, defiToken, amount, isEth, account));
				return txHash;
			default:
				break;
		}
	};
};

export const updateDefiTokenBalance = (defiToken, ethAccount) => {
	return async (dispatch, getState) => {
		const state = getState();
		const protocol = getDefiProtocol(state);
		switch (protocol) {
			case Protocol.Aave:
				const token = await getUpdateAToken(ethAccount, defiToken);
				dispatch(setATokenBalance(token));
				break;

			default:
				break;
		}
	};
};
