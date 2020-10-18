import { createAction } from "@reduxjs/toolkit";

import { emitter } from "../../lib/helper";
import marketApi from '../../http/market';

const api = new marketApi();

export const saveMarketCoins = createAction('market/save', (data) => {
    return {
        payload: data,
    }
})

export const saveAllTokens = createAction('market/all', (data, page, total) => {
    return {
        payload: {
            data,
            page,
            total
        }
    }
})

export const saveSelectedCoin = createAction('market/selected', (data, id) => {
    return {
        payload: {
            data,
            id,
        }
    }
})

export const setLoading = createAction('market/loading', (type, value) => {
    return {
        payload: {
            type,
            value,
        }
    }
})

export const setHistorical = createAction('market/historical', (data, id, days) => {
    return {
        payload: {
            data,
            id,
            days
        }
    }
})

export const fetchMarketCoins = () => {
    return dispatch => {
        dispatch(setLoading('marketCoins', true))
        api.get('marketCoins')
            .then(response => {
                dispatch(saveMarketCoins(response))
                dispatch(setLoading('marketCoins', false))
            })
            .catch(error => {
                dispatch(setLoading('marketCoins', false))
            })
    }
}

export const fetchAllCoins = (page, pageSize) => {
    return async dispatch => {
        dispatch(setLoading('allTokens', true));
        try {
            const globalResponse = await api.get('global');
            const response = await api.get('all', { pageSize, page })
            dispatch(saveAllTokens(response, page, globalResponse.data.active_cryptocurrencies))
            dispatch(setLoading('allTokens', false))
        } catch(error) {
            dispatch(setLoading('allTokens', false))

        }
    }
}

export const fetchSelectedCoin = (id) => {
    return dispatch => {
        dispatch(setLoading('selected', true))
        api.get('selected', { id })
            .then(response => {
                dispatch(saveSelectedCoin(response, id))
                dispatch(setLoading('selected', false))
            })
            .catch(error => {
                dispatch(setLoading('selected', false))
                emitter.emit('change-route', {
                    path: '/market'
                })
            })
    }
}

export const fetchHistoricalData = (id, days) => {
    return dispatch => {
        dispatch(setLoading('historical', true))
        api.get('historical', { id, days })
            .then(response => {
                dispatch(setHistorical(response, id, days))
                dispatch(setLoading('historical', false))
            })
            .catch(error => {
                dispatch(setLoading('historical', false))
            })
    }
}