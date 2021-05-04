import {useActiveWeb3React} from "./index";
import {useMemo} from "react";
import {getContract} from "../utils";


export function useSwapTokenContract(tokenAddress, ABI, withSignerIfPossible = true) {
	const { library, account } = useActiveWeb3React()

	return useMemo(() => {
		try {
			return getContract(tokenAddress, ABI, library, withSignerIfPossible ? account : undefined)
		} catch {
			return null
		}
	}, [tokenAddress, library, withSignerIfPossible, account, ABI])
}