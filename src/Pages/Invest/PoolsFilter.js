import React, { useMemo } from "react";
import { Formik } from "formik";
import { isEqual } from "lodash";
import { usePoolsUIContext } from "./PoolsUIProvider";

const prepareFilter = (queryParams, values) => {
    const { searchText } = values;
    const newQueryParams = { ...queryParams };
    const filter = {};
    filter.label = searchText;
    newQueryParams.filter = filter;
    return newQueryParams;
};

export function PoolsFilter({ listLoading }) {
    // Pools UI Context
    const poolsUIContext = usePoolsUIContext();
    const poolsUIProps = useMemo(() => {
        return {
            queryParams: poolsUIContext.queryParams,
            setQueryParams: poolsUIContext.setQueryParams,
        };
    }, [poolsUIContext]);

    // queryParams, setQueryParams,
    const applyFilter = (values) => {
        const newQueryParams = prepareFilter(poolsUIProps.queryParams, values);
        if (!isEqual(newQueryParams, poolsUIProps.queryParams)) {
            newQueryParams.pageNumber = 1;
            // update list by queryParams
            poolsUIProps.setQueryParams(newQueryParams);
        }
    };

    return (
        <>
            <Formik
                initialValues={{
                    searchText: "",
                }}
                onSubmit={(values) => {
                    applyFilter(values);
                }}
            >
                {({
                      values,
                      handleSubmit,
                      handleBlur,
                      setFieldValue,
                  }) => (
                    <form onSubmit={handleSubmit} className="form form-label-right">
                        <div className="form-group row">
                            <div className="col-lg-6">
                                <input
                                    type="text"
                                    className="form-control"
                                    name="searchText"
                                    placeholder="Search..."
                                    onBlur={handleBlur}
                                    value={values.searchText}
                                    onChange={(e) => {
                                        setFieldValue("searchText", e.target.value);
                                        handleSubmit();
                                    }}
                                />
                                <small className="form-text text-muted">
                                    Filter by <b>Token</b>, <b>Protocol</b>, etc.
                                </small>
                            </div>
                        </div>
                    </form>
                )}
            </Formik>
        </>
    );
}
