import { createAction } from "@reduxjs/toolkit";
import ExploreApi from "../../http/explore";

const exploreApi = new ExploreApi();

export const setExploreSection = createAction('explore/set', (id, data) => {
    return {
        payload: {
            id, data
        },
    }
})

export const fetchTokens = () => {
    return dispatch => {
        Object.keys(exploreApi.requestBaseURLs).map(baseId => {
            exploreApi.get(baseId)
                .then(response => {
                    if(response.hasOwnProperty('gainers')) {
                        Object.keys(response).map(key => {
                            const data = response[key];
                            dispatch(setExploreSection(key, data));
                        })
                    } else {
                        dispatch(setExploreSection(baseId, response));
                    }
                })
        })
    }

}