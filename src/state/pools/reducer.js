import { createReducer } from "@reduxjs/toolkit";
import { setListLoading, setPools, selectPool, clearSelectedPool } from "./actions";

const initialState = {
	Uniswap: {
		data: [],
		loading: false,
		error: false,
		isFinished: false,
	},
	Balancer: {
		data: [],
		loading: false,
		error: false,
		isFinished: false,
	},
	Curve: {
		data: [],
		loading: false,
		error: false,
		isFinished: false,
	},
	Yearn: {
		data: [],
		loading: false,
		error: false,
		isFinished: false,
	},
	selected: {
		isUniswap: false,
		data: {
			poolName: "",
			address: "0x00",
		},
		type: "",
	},
};

export default createReducer(initialState, (builder) => {
	builder
		.addCase(setPools, (state, { payload }) => {
			if (payload.page === 1) {
				state[payload.type].data = payload.data;
			} else {
				state[payload.type].data = state[payload.type].data.concat(payload.data);
			}
			state[payload.type].isFinished = payload.data.length < payload.pageSize;
		})
		.addCase(setListLoading, (state, { payload }) => {
			state[payload.type].loading = payload.value;
		})
		.addCase(selectPool, (state, { payload }) => {
			state.selected.data = payload.selectedPool;
			state.selected.type = payload.type;
			state.selected.isUniswap = payload.type === "Uniswap";
		})
		.addCase(clearSelectedPool, (state) => {
			state.selected = {
				isUniswap: false,
				data: {
					poolName: "",
				},
				type: "",
			};
		});
});
