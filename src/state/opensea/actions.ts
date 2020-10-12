import { createAction } from "@reduxjs/toolkit";
import axios from 'axios';
import { openseaAssets } from "../../http/opensea";

export const setOpenSeaAssets = createAction('opensea/setAssets', (assets) => {
    return {
        payload: {
            assets
        }
    }
});

export const fetchOpenSeaAssets = (owner: string) => {
    return async (dispatch: (arg0: { payload: { assets: Array<Object>; } }) => void) => {
        try {
            const params = {
                owner,
                order_direction: 'desc',
                offset: '0',
                limit: '20'
            };
            const headers = {
                'X-API-KEY': process.env.REACT_APP_OPENSEA_KEY || '',
            };
            const res = await axios.get(openseaAssets, { headers, params });
            const assets = res.data.assets;
            dispatch(setOpenSeaAssets(assets));
        } catch (error) {
            console.log(error);
        }
    }
};
