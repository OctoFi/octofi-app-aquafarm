import React, {createContext, useContext, useState, useCallback} from "react";
import {isEqual, isFunction} from "lodash";
import {initialFilter} from "./PoolsUIHelper";

const PoolsUIContext = createContext();

export function usePoolsUIContext() {
    return useContext(PoolsUIContext);
}

export const PoolsUIConsumer = PoolsUIContext.Consumer;

export function PoolsUIProvider({poolsUIEvents, children}) {
    const [queryParams, setQueryParamsBase] = useState(initialFilter);
    const [ids, setIds] = useState([]);
    const setQueryParams = useCallback(nextQueryParams => {
        setQueryParamsBase(prevQueryParams => {
            if (isFunction(nextQueryParams)) {
                nextQueryParams = nextQueryParams(prevQueryParams);
            }

            if (isEqual(prevQueryParams, nextQueryParams)) {
                return prevQueryParams;
            }

            return nextQueryParams;
        });
    }, []);

    const value = {
        queryParams,
        setQueryParamsBase,
        ids,
        setIds,
        setQueryParams,
        investButtonClick: poolsUIEvents.investButtonClick,
        addLiquidityDialog: poolsUIEvents.addLiquidityDialog,
    };

    return <PoolsUIContext.Provider value={value}>{children}</PoolsUIContext.Provider>;
}