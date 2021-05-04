import { useMemo } from "react";

import { useTokenBalance } from "../state/wallet/hooks";

export const useMemoTokenBalance = (account, token) => {
	const balance = useTokenBalance(account, token);

	return useMemo(() => {
		return balance;
	}, [account, typeof balance]);
};
