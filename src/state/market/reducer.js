import { createReducer } from '@reduxjs/toolkit';

import {saveAllTokens, saveMarketCoins, saveSelectedCoin, setHistorical, setLoading} from './actions';

const initialState = {
    allTokens: {
        data: [],
        loading: false,
        page: 1,
        total: 0,
    },
    marketCoins: {
        data: [],
        loading: false,
    },
    selected: {
        id: null,
        data: null,
        loading: false,
    },
    historical: {
        id: null,
        data: {
            price: [],
            market_cap: [],
            total_volume: [],
        },
        days: 30,
        loading: false,
    }
}

export default createReducer(initialState, builder => {
    builder
        .addCase(setLoading, (state, { payload }) => {
            state[payload.type].loading = payload.value;
        })
        .addCase(saveAllTokens, (state, { payload }) => {
            state.allTokens.data = payload.data;
            state.allTokens.page = payload.page;
            state.allTokens.total = payload.total;
        })
        .addCase(saveMarketCoins, (state, { payload }) => {
            state.marketCoins.data = payload;
        })
        .addCase(saveSelectedCoin, (state, { payload }) => {
            state.selected.data = payload.data;
            state.selected.id = payload.id;
        })
        .addCase(setHistorical, (state, { payload }) => {
            state.historical.id = payload.id;
            state.historical.days = payload.days;
            state.historical.data = payload.data;
        })
})