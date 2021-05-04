import { useMemo, useCallback } from "react";
import { useMultipleContractSingleData } from "../multicall/hooks";
import ERC20_INTERFACE from "../../constants/abis/erc20";
import ERC20_ABI from "../../constants/abis/erc20.json";
import { isAddress } from "../../utils";
import { ApprovalState } from "../../constants";
import { useActiveWeb3React } from "../../hooks";
import { getContract } from "../../utils";
import { useHasPendingApproval, useTransactionAdder } from "../../state/transactions/hooks";
import { useSingleCallResult } from "../../state/multicall/hooks";

Number.prototype.toFixedNoRounding = function (n) {
	const reg = new RegExp("^-?\\d+(?:\\.\\d{0," + n + "})?", "g");
	const a = this.toString().match(reg)[0];
	const dot = a.indexOf(".");
	if (dot === -1) {
		// integer, insert decimal dot and pad up zeros
		return a + "." + "0".repeat(n);
	}
	const b = n - (a.length - dot) + 1;
	return b > 0 ? a + "0".repeat(b) : a;
};

export const usePoolsBalances = (address = undefined, tokens = [], type = "uniswap") => {
	let validatedTokenAddresses = useMemo(() => tokens.filter((token) => isAddress(token) !== false), [tokens]);
	if (type === "Curve") {
		validatedTokenAddresses = [];
	}
	const balances = useMultipleContractSingleData(validatedTokenAddresses, ERC20_INTERFACE, "balanceOf", [address]);

	const anyLoading = useMemo(() => balances.some((callState) => callState.loading), [balances]);

	return [
		useMemo(
			() =>
				address && tokens.length > 0
					? tokens.reduce((memo, token, i) => {
							const value = balances?.[i]?.result?.[0];
							const amount = value ? value.toString() : undefined;
							if (amount) {
								memo[token] = (amount / 10 ** 18).toFixedNoRounding(6);
							}
							return memo;
					  }, {})
					: {},
			[address, tokens, balances]
		),
		anyLoading,
	];
};

export const usePoolBalance = (address = undefined, token) => {
	let balances = usePoolsBalances(address, [token]);
	return useMemo(() => {
		const value = balances?.[0]?.[token];
		const amount = value ? value.toString() : undefined;
		return amount;
	}, [address, token, balances]);
};

export function usePoolApproveCallback(pool, amountToApprove, spender) {
	const parsedAmountA = `${amountToApprove * 10 ** 18}`;
	const token = pool.address === "0x00" ? "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" : pool.address;
	const { account, library } = useActiveWeb3React();
	const tokenContract = getContract(token, ERC20_ABI, library, account);
	const inputs = useMemo(() => [account, spender || "0x79B6C6F8634ea477ED725eC23b7b6Fcb41F00E58"], [
		account,
		spender,
	]);
	const currentAllowance = useSingleCallResult(tokenContract, "allowance", inputs).result;
	const pendingApproval = useHasPendingApproval(token, spender);

	const approvalState = useMemo(() => {
		if (!parsedAmountA || !spender) return ApprovalState.UNKNOWN;
		// we might not have enough data to know whether or not we need to approve
		if (!currentAllowance) return ApprovalState.UNKNOWN;

		// parsedAmountA will be defined if currentAllowance is
		return Number(currentAllowance.toString()) < Number(parsedAmountA)
			? pendingApproval
				? ApprovalState.PENDING
				: ApprovalState.NOT_APPROVED
			: ApprovalState.APPROVED;
	}, [parsedAmountA, currentAllowance, pendingApproval, spender]);

	const addTransaction = useTransactionAdder();

	const approve = useCallback(async () => {
		if (approvalState !== ApprovalState.NOT_APPROVED) {
			console.error("approve was called unnecessarily");
			return;
		}
		if (!token) {
			console.error("no token");
			return;
		}

		if (!tokenContract) {
			console.error("tokenContract is null");
			return;
		}

		if (!parsedAmountA) {
			console.error("missing amount to approve");
			return;
		}

		if (!spender) {
			console.error("no spender");
			return;
		}

		return tokenContract.functions
			.approve(spender, parsedAmountA)
			.then((response) => {
				addTransaction(response, {
					summary: "Approve " + pool.poolName,
					approval: { tokenAddress: token, spender: spender },
				});
			})
			.catch((error) => {
				console.debug("Failed to approve token", error);
				throw error;
			});
	}, [approvalState, token, tokenContract, parsedAmountA, spender, addTransaction]);

	return [approvalState, approve];
}
