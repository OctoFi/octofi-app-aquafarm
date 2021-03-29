import { createReducer } from "@reduxjs/toolkit";

import { setLoading, setSpaces, setProposals } from "./actions";

const initialState = {
	loading: false,
	spaces: {},
	proposals: {},
};

export default createReducer(initialState, (builder) => {
	builder
		.addCase(setLoading, (state, { payload }) => {
			state.loading = payload.value || false;
		})
		.addCase(setSpaces, (state, { payload }) => {
			state.spaces = payload.spaces;
		})
		.addCase(setProposals, (state, { payload }) => {
			state.proposals[payload.id] = payload.proposals;
		});
});
