import axios from 'axios';
import { useMemo } from 'react';

import { useActiveWeb3React } from "../../hooks";
import {cryptoExchangeRate} from "../../http/currency";
import {useAllTokenBalances, useETHBalances} from "../wallet/hooks";
import {ETHER} from "@uniswap/sdk";

export const useMemoTokenBalances = () => {
    const { chainId, account } = useActiveWeb3React();
    const walletBalances = useAllTokenBalances()
    const ethBalance = useETHBalances([account]);

    return useMemo(() => {
        return {
            ETHER: ethBalance[account] || null,
            ...walletBalances
        }
    }, [chainId, account, walletBalances])
}

export const getBalances = (balances, wallet, ethRate) => {
    return new Promise(async (resolve) => {
        const tokens = [];

        let finalResult = [];
        const total = {
            wallet: {
                balances: [],
                total: 0,
                title: 'Wallet',
                slug: 'wallet',
                variant: 'success',
            },
            deposits: {
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

        Object.keys(wallet).map(key => {
            const balance = Number(wallet[key] ? wallet[key].toSignificant(6) : 0);
            if(balance !== 0 || key === 'ETHER') {
                tokens.push({
                    address: key
                })
                total.wallet.balances.push({ address: key, balance: wallet[key] })
            }
        });

        if(balances.length > 0) {
            for(let i in balances) {
                for(let j in balances[i].balances) {
                    for(let k in balances[i].balances[j].balances) {
                        const data = balances[i].balances[j].balances[k];
                        tokens.push({
                            ...data.base.metadata,
                        })

                        for(let l in data.underlying) {
                            tokens.push({
                                ...data.underlying[l].metadata,
                            })
                        }
                    }
                }
            }
        }
        const res = await axios.get(`${cryptoExchangeRate}simple/token_price/ethereum?contract_addresses=${tokens.map(t => t.address).join(",")}&vs_currencies=USD`);
        const prices = res.data;

        if(balances.length > 0) {
            const transformedData = balances.map(currentBalance => {
                const transformedBalances = currentBalance.balances.map(cb => {
                    const finalBalances = cb.balances.map(innerBalance => {
                        const fiBalance = {};

                        const lowerAddress = innerBalance.base.metadata.address.toLowerCase();
                        const value = Number.parseInt(innerBalance.base.balance) / (10 ** innerBalance.base.metadata.decimals)

                        const balanceUSD = prices[lowerAddress] ? prices[lowerAddress].usd * value : 0;

                        fiBalance.base = {
                            ...innerBalance.base,
                            balanceUSD
                        }

                        if (innerBalance.underlying.length > 0) {
                            const underlyingBalance = innerBalance.underlying.map(ub => {
                                const lowerAddress = ub.metadata.address.toLowerCase();
                                const value = Number.parseInt(ub.balance) / (10 ** ub.metadata.decimals)
                                const balanceUSD = prices[lowerAddress] ? prices[lowerAddress].usd * value : 0;
                                return {
                                    ...ub,
                                    balanceUSD
                                }
                            })
                            fiBalance.total = underlyingBalance.reduce((result, value) => {
                                return result += value.balanceUSD
                            }, 0)
                            fiBalance.underlying = underlyingBalance;
                        } else {
                            fiBalance.underlying = [];
                            fiBalance.total = balanceUSD;
                        }
                        return fiBalance;
                    })
                    const result = {
                        balances: finalBalances,
                        total: finalBalances.reduce((result, item) => {
                            return result += item.total
                        }, 0),
                        metadata: cb.metadata
                    }
                    if (result.metadata.type === 'Asset') {
                        total.deposits.balances = total.deposits.balances.concat(...result.balances)
                        total.deposits.total += result.total;
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
            finalResult = transformedData;
        }

        if(total.wallet.balances.length > 0) {
            const transformedWalletBalance = total.wallet.balances.map(balance => {
                if(balance.address === 'ETHER') {
                    return {
                        metadata: ETHER,
                        balance: balance.balance || 0,
                        balanceUSD: balance.balance ? balance.balance.toSignificant(6) / ethRate : 0,
                    }
                } else {
                    const lowerAddress = balance.address.toLowerCase();
                    const balanceUSD = prices[lowerAddress] ? prices[lowerAddress].usd * Number(balance.balance.toSignificant(6)) : 0;
                    return {
                        metadata: balance.balance.currency,
                        balance: balance.balance,
                        balanceUSD
                    }
                }

            })
            total.wallet.balances = transformedWalletBalance;
            total.wallet.total = transformedWalletBalance.reduce((result, item) => {
                return result += item.balanceUSD;
            }, 0)
        }

        resolve({
            balances: finalResult,
            overview: total,
        })
    })
}
