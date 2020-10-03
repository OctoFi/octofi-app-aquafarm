import { createReducer } from "@reduxjs/toolkit";
import { setListLoading, setPools } from "./actions";

const initialState = {
    listLoading: false,
    totalCount: 0,
    entities: []
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
})