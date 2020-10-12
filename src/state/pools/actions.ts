import { createAction } from "@reduxjs/toolkit";
import axios from "axios";

import { encodeQuery } from "../../lib/helper";

export const setPools = createAction('pools/fetch', (pools, total) => {
    return {
        payload: {
            total,
            pools,
        }
    }
});
export const setListLoading = createAction<boolean>('pools/loading');

export const setIsUniswap = createAction<boolean>('pools/uniswap');

export const selectPool = createAction('pools/select', (selectedPool) => {
    return {
        payload: selectedPool
    }
})

export const clearSelectedPool = createAction('pools/clearSelected');

export const fetchPools = (options: { offset: number, limit: number }) => {
    return (dispatch: (arg0: { payload: { total: any; pools: any; } | boolean | undefined; type: string; }) => void) => {
        const query = encodeQuery({
            'api-key': process.env.REACT_APP_API_KEY,
            ...options
        });
        dispatch(setListLoading(true));
        axios.get(`https://data-api.defipulse.com/api/v1/blocklytics/pools/v1/exchanges?${query}`)
            .then(response => {
                const data = response.data;
                dispatch(setPools(data.results, data.query.totalRows))
                dispatch(setListLoading(false));
            })
            .catch(error => {
                console.log(error);
                dispatch(setListLoading(false));
            })
    }
}