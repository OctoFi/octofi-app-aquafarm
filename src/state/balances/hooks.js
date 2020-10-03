import { BigNumber } from '@ethersproject/bignumber'
import {useAllTokens, useCurrency} from "../../hooks/Tokens";
import { useSelector } from "react-redux";
import {useTradeExactIn} from "../../hooks/Trades";
import {tryParseAmount} from "../swap/hooks";

export const useSwapInfo = (meta, value) => {
    const rates = useSelector(state => state.currency.currenciesRate)
    const currency = useCurrency(meta.address);
    const eth = useCurrency('ETH');
    const parsedAmount = tryParseAmount(`${value}`, currency ?? undefined);
    const relevantTokenBalances = useTradeExactIn(parsedAmount , eth)

    return {
        currency,
        balanceUSD: relevantTokenBalances!== null && rates.hasOwnProperty('ETH') &&  (
            relevantTokenBalances.executionPrice.toSignificant(6)  * value / rates.ETH
        )
    }
}


export const useBalances = (balances) => {
    const total = {
        assets: {
            balances: [],
            total: 0,
            title: 'Deposits',
            slug: 'deposits',
            variant: 'success'
        },
        debts: {
            balances: [],
            total: 0,
            title: 'Debts',
            slug: 'debts',
            variant: 'danger'
        }
    }
    if(balances.length > 0) {
        const transformedData = balances.map(currentBalance => {
            const transformedBalances = currentBalance.balances.map(cb => {
                const finalBalances = cb.balances.map(innerBalance => {
                    const fiBalance = {};
                    if(innerBalance.underlying.length > 0) {
                        const underlyingBalance = innerBalance.underlying.map(ub => {
                            const value = Number.parseInt(ub.balance) / (10 ** ub.metadata.decimals)
                            // eslint-disable-next-line react-hooks/rules-of-hooks
                            const balancedValue = useSwapInfo(ub.metadata, value);
                            return {
                                ...ub,
                                ...balancedValue,
                            }
                        })
                        fiBalance.total = underlyingBalance.reduce((result, value) => {
                            return result += value.balanceUSD
                        }, 0)
                        fiBalance.underlying = underlyingBalance;
                        fiBalance.base = innerBalance.base
                    } else {
                        const value = Number.parseInt(innerBalance.base.balance) / (10 ** innerBalance.base.metadata.decimals)
                        // eslint-disable-next-line react-hooks/rules-of-hooks
                        const balancedValue = useSwapInfo(innerBalance.base.metadata, value);

                        fiBalance.underlying = [];
                        fiBalance.base = {
                            ...innerBalance.base,
                            ...balancedValue
                        }
                        fiBalance.total = balancedValue.balanceUSD;
                    }
                    return fiBalance;
                })
                const result =  {
                    balances: finalBalances,
                    total: finalBalances.reduce((result, item) => {
                        return result += item.total
                    }, 0),
                    metadata: cb.metadata
                }
                if(result.metadata.type === 'Asset') {
                    total.assets.balances = total.assets.balances.concat(...result.balances)
                    total.assets.total += result.total;
                } else {
                    total.debts.balances = total.debts.balances.concat(...result.balances);
                    total.debts.total += result.total;
                }
                return result;
            })
            return {
                balances: transformedBalances,
                metadata: currentBalance.metadata,
                total: transformedBalances.reduce((result, item) => {
                    const sign = item.metadata.type === 'Debt' ? -1 : 1;
                    return result += sign * item.total;
                }, 0)
            }
        })
        return {
            balances: transformedData,
            overview: total,
        };
    }

    return {
        balances: [],
        overview: total,
    };
}
