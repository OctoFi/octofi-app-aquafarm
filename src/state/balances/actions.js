import { createAction } from '@reduxjs/toolkit';
import defiSdk from "../../utils/getDefiSdk";
import { useCurrency } from "../../hooks/Tokens";


export const saveBalances = createAction('balances/save', (balances) => {
    return {
        payload: balances
    }
})

export const toggleLoading = createAction('balances/loading', (state) => {
    return {
        payload: state,
    }
})

export const fetchBalances = (account) => {
    return async dispatch => {
        if(!account) return;
        dispatch(toggleLoading(true));
        const balances = await defiSdk.getAccountBalances(account);
        dispatch(saveBalances(balances));
        dispatch(toggleLoading(false))
    }
}