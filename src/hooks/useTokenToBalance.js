import { useMemo, useState, useEffect } from "react";
import { tokensToTokenBalances } from "../utils/spot/tokens";
import { useActiveWeb3React } from "./index";
import { useSelector } from "react-redux";
import { getBaseToken, getQuoteToken, searchToken } from "../state/selectors";
import { getKnownTokens } from "../utils/known_tokens";
import { useETHBalances } from "../state/wallet/hooks";
import { BigNumber } from "@0x/utils";

export const useTokenToBalance = (tokens, address, library) => {
	const [balances, setBalances] = useState([]);

	const fetchBalances = async () => {
		if (address) {
			const res = await tokensToTokenBalances(tokens, address, library);
			setBalances(res);
		}
	};
	useEffect(() => {
		fetchBalances();
	}, [address, tokens]);

	return useMemo(() => {
		if (balances.length > 0) {
			return balances;
		} else {
			return [];
		}
	}, [address, balances, tokens]);
};

export const useSpotBalances = () => {
	const { account, library } = useActiveWeb3React();

	const baseToken = useSelector(getBaseToken);
	const quoteToken = useSelector(getQuoteToken);

	const knownTokens = useMemo(() => {
		return getKnownTokens();
	}, []);
	const tokens = useMemo(() => {
		return knownTokens.getTokens();
	}, []);

	const wethToken = useMemo(() => {
		return knownTokens.getWethToken();
	}, []);

	const t = useMemo(() => {
		return [...tokens, wethToken];
	}, [wethToken, tokens]);
	const allBalances = useTokenToBalance(t, account, window.ethereum || library);

	const ethBalance = useETHBalances([account]);

	const wethBalance = useMemo(() => {
		return allBalances.find((b) => b.token.symbol === wethToken.symbol);
	}, [allBalances]);

	const tokensBalance = useMemo(() => {
		return allBalances.filter((b) => b.token.symbol !== wethToken.symbol);
	}, [allBalances]);

	const ethereumBalance = useMemo(() => {
		const ETH = ethBalance[account] ? ethBalance[account].toExact() : null;
		const bn = new BigNumber(ETH * 10 ** 18);

		return {
			token: ethBalance[account] ? ethBalance[account].currency : undefined,
			balance: bn,
		};
	}, [ethBalance]);

	const totalEthBalance = useMemo(() => {
		if (wethBalance && ethereumBalance) {
			let total = wethBalance.balance;
			if (ethereumBalance.token !== undefined) {
				total = ethereumBalance.balance.plus(wethBalance.balance);
			}

			return total;
		} else {
			return undefined;
		}
	}, [ethereumBalance, wethBalance]);

	const baseTokenBalance = useMemo(() => {
		return searchToken({ tokenBalances: tokensBalance, wethTokenBalance: wethBalance, tokenToFind: baseToken });
	}, [baseToken, tokensBalance, wethBalance]);

	const quoteTokenBalance = useMemo(() => {
		return searchToken({ tokenBalances: tokensBalance, wethTokenBalance: wethBalance, tokenToFind: quoteToken });
	}, [quoteToken, tokensBalance, wethBalance]);

	return useMemo(() => {
		return {
			quoteTokenBalance,
			baseTokenBalance,
			totalEthBalance,
			ethBalance: ethereumBalance,
			wethBalance,
			tokensBalance,
		};
	}, [account, baseToken, quoteToken, allBalances, baseTokenBalance, quoteTokenBalance]);
};
