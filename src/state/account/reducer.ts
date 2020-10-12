import { createReducer } from "@reduxjs/toolkit";
import { saveAccount } from "./actions";

const initialState: string  | null = null;

export default createReducer(initialState, builder => {
    builder.addCase(saveAccount, (state, {payload}) => {
        return payload
    })
})