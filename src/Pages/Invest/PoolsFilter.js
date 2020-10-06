import React, { useMemo } from "react";
import { Formik } from "formik";
import { isEqual } from "lodash";
import { usePoolsUIContext } from "./PoolsUIProvider";

const prepareFilter = (queryParams, values) => {
    const { platform, tags } = values;
    const newQueryParams = { ...queryParams };
    const filter = {};
    filter.platform = platform;
    filter.tags = tags;
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
                    platform: 'all',
                    tags: ''
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
                            <div className="col-lg-3 col-md-6 col-12 mb-2">
                                <select
                                    className="form-control"
                                    name="platform"
                                    placeholder="Filter by Platform"
                                    onChange={(e) => {
                                        setFieldValue("platform", e.target.value);
                                        handleSubmit();
                                    }}
                                    onBlur={handleBlur}
                                    value={values.platform}
                                >
                                    <option value="all">All</option>
                                    <option value="uniswap-v2">Uniswap</option>
                                    <option value="balancer">Balancer</option>
                                    <option value="curve">Curve</option>
                                    <option value="bancor">Bancor</option>
                                </select>
                                <small className="form-text text-muted">
                                    Filter by <b>Tags</b>, <b>Protocol</b>, etc.
                                </small>
                            </div>
                            <div className="col-lg-3 col-lg-3 col-md-6 col-12">
                                <select
                                    className="form-control"
                                    name="tags"
                                    placeholder="Filter by Tag"
                                    onChange={(e) => {
                                        setFieldValue("tags", e.target.value);
                                        handleSubmit();
                                    }}
                                    onBlur={handleBlur}
                                    value={values.tags}
                                >
                                    <option value="stable">Stable</option>
                                    <option value="incentivized">Incentivized</option>
                                    <option value="goods">Goods</option>
                                    <option value="new">New</option>
                                </select>
                            </div>
                        </div>
                    </form>
                )}
            </Formik>
        </>
    );
}
