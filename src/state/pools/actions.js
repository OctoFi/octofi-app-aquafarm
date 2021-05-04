import { createAction } from "@reduxjs/toolkit";

import * as Apis from "../../graphql";

export const setPools = createAction("pools/set", (type, data, pageSize, page) => {
	return {
		payload: {
			type,
			data,
			pageSize,
			page,
		},
	};
});
export const setListLoading = createAction("pools/loading", (type, value) => {
	return {
		payload: {
			type,
			value,
		},
	};
});

export const selectPool = createAction("pools/select", (type, selectedPool) => {
	return {
		payload: {
			type,
			selectedPool,
		},
	};
});

export const clearSelectedPool = createAction("pools/clearSelected");

export const fetchPools = (type, options) => {
	return async (dispatch) => {
		const api = new Apis[type]();
		dispatch(setListLoading(type, true));

		try {
			const response = await api.fetchPools(options);
			dispatch(setPools(type, response, options.pageSize, options.page));
			dispatch(setListLoading(type, false));
			return response;
		} catch (e) {
			dispatch(setListLoading(type, false));
			return false;
		}
	};
};
