import { createReducer } from "@reduxjs/toolkit";
import {setListLoading, setPools, selectPool, setIsUniswap, clearSelectedPool} from "./actions";

interface initialProps {
    listLoading: boolean,
    totalCount: number,
    entities: any,
    isUniswap: boolean,
    selected: {
        "assets"?: any,
        "exchange"?: string,
        "ownershipToken"?: string,
        "platform"?: string,
        "poolName"?: string,
        "roi"?: number,
        "tags"?: any,
        "usdLiquidity"?: number,
        "usdVolume"?: number
    }
}

const initialState: initialProps = {
    listLoading: false,
    totalCount: 0,
    entities: [],
    selected: {
        "assets": [],
        "exchange": '',
        "ownershipToken": '',
        "platform": '',
        "poolName": '',
        "roi": 0,
        "tags": [],
        "usdLiquidity": 0,
        "usdVolume": 0
    },
    isUniswap: false,
}

export default createReducer(initialState, builder => {
    builder
        .addCase(setPools, (state, { payload }) => {
            return {
                ...state,
                totalCount: payload.total,
                entities: [
                    ...payload.pools
                ]
            }
        })
        .addCase(setListLoading, (state, { payload }) => {
            return {
                ...state,
                listLoading: payload,
            }
        })
        .addCase(selectPool, (state, { payload }) => {
            return {
                ...state,
                selected: payload,
            }
        })
        .addCase(setIsUniswap, (state, { payload }) => {
            return {
                ...state,
                isUniswap: payload,
            }
        })
        .addCase(clearSelectedPool, (state) => {
            return {
                ...state,
                selected: initialState.selected,
                isUniswap: false,
            }
        })
})