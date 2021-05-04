import { createReducer } from "@reduxjs/toolkit";

import { setExploreSection } from "./actions";
import { exploreSections } from "../../constants";

const initialState = {
	...exploreSections,
};

export default createReducer(initialState, (builder) => {
	builder.addCase(setExploreSection, (state, { payload }) => {
		state[payload.id] = {
			...state[payload.id],
			loading: false,
			data: payload.data,
		};
	});
});
