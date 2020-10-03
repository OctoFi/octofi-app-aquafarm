import { createReducer } from "@reduxjs/toolkit";
import {saveBalances, toggleLoading} from "./actions";

const initialState = {
    data: [],
    loading: false,
};


export default createReducer(initialState, builder => {
    builder
        .addCase(saveBalances, (state, {payload}) => {
            return {
                ...state,
                data: payload
            }
        })
        .addCase(toggleLoading, (state, {payload}) => {
            return {
                ...state,
                loading: payload,
            }
        })
})