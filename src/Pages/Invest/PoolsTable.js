import React, { useEffect, useMemo } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory, {
    PaginationProvider,
} from "react-bootstrap-table2-paginator";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import {
    getHandlerTableChange,
    NoRecordsFoundMessage,
    PleaseWaitMessage,
    sortCaret,
    headerSortingClasses, toAbsoluteUrl,
} from "../../components/_metronic/_helpers";
import * as uiHelpers from "./PoolsUIHelper";
import { Pagination } from "../../components/_metronic/_partials/controls";
import { usePoolsUIContext } from "./PoolsUIProvider";
import * as actions from '../../state/pools/actions';
import CurrencyText from "../../components/CurrencyText";
import PlatformLogo from "../../components/PlatformLogo";
import SVG from "react-inlinesvg";

export function PoolsTable() {
    // Pools UI Context
    const poolsUIContext = usePoolsUIContext();
    const poolsUIProps = useMemo(() => {
        return {
            ids: poolsUIContext.ids,
            setIds: poolsUIContext.setIds,
            queryParams: poolsUIContext.queryParams,
            setQueryParams: poolsUIContext.setQueryParams,
            investButtonClick: poolsUIContext.investButtonClick,
            addLiquidityDialog: poolsUIContext.addLiquidityDialog,
        };
    }, [poolsUIContext]);

    // Getting current state of pools list from store (Redux)
    const { currentState } = useSelector(
        (state) => ({ currentState: state.pools }),
        shallowEqual
    );
    const { totalCount, entities, listLoading } = currentState;
    // Pools Redux state
    const dispatch = useDispatch();
    useEffect(() => {
        // clear selections list
        poolsUIProps.setIds([]);
        const params = {
            limit: poolsUIProps.queryParams.pageSize,
            offset: poolsUIProps.queryParams.pageSize * (poolsUIProps.queryParams.pageNumber - 1),
        }
        if(poolsUIProps.queryParams.filter.platform !== 'all') {
            params.platform = poolsUIProps.queryParams.filter.platform;
        }
        if(poolsUIProps.queryParams.filter.tags !== '') {
            params.tags = poolsUIProps.queryParams.filter.tags;
        }
        if(poolsUIProps.queryParams.sortField !== 'id') {
            params.orderBy = poolsUIProps.queryParams.sortField;
        }

        if(!(poolsUIProps.queryParams.sortOrder === 'asc' && poolsUIProps.queryParams.sortField === 'id')) {
            params.direction = poolsUIProps.queryParams.sortOrder;
        }
        // server call by queryParams
        dispatch(actions.fetchPools(params));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [poolsUIProps.queryParams, dispatch]);
    // Table columns
    const columns = [
        {
            dataField: "id",
            text: "ID",
            sort: true,
            formatter: (cellContent, row, rowIndex) => (<span className="text-muted font-weight-bold">{poolsUIProps.queryParams.pageSize * (poolsUIProps.queryParams.pageNumber - 1) + rowIndex + 1}</span>),
            sortCaret: sortCaret,
            headerSortingClasses,
        },
        {
            dataField: "poolName",
            text: "Available Pools",
            sort: true,
            formatter: (cellContent, row, rowIndex) => {
                return (
                    <div key={rowIndex} className="d-flex align-items-center flex-row py-3">
                        <PlatformLogo size={48} platform={row.platform} name={row.name}/>
                        <div className="d-flex flex-column justify-content-center ml-5">
                            <h4 className={'font-weight-bolder text-dark mb-1'}>{row.poolName}</h4>
                            <span className="text-muted font-size-sm">{row.platform}</span>
                        </div>
                    </div>
                )
            },
            sortCaret: sortCaret,
            headerSortingClasses,
        },
        {
            dataField: "usdLiquidity",
            text: "Liquidity",
            sort: true,
            formatter: (cellContent, row) => (<span className={'font-weight-bold'}><CurrencyText>{row.usdLiquidity}</CurrencyText></span>),
            sortCaret: sortCaret,
            headerSortingClasses,
        },
        {
            dataField: "usdVolume",
            text: "Volume (24h)",
            sort: true,
            formatter: (cellContent, row) => (<span className={'font-weight-bold'}><CurrencyText>{row.usdVolume}</CurrencyText></span>),
            sortCaret: sortCaret,
            headerSortingClasses,
        },
        {
            dataField: "roi",
            text: "ROI",
            sort: true,
            formatter: (cellContent, row) => (<span className={`font-weight-bold ${!row.roi && 'text-muted'}`}>{row.roi ? `${row.roi.toFixed(3)}%` : 'N/A'}</span>),
            sortCaret: sortCaret,
        },
        {
            dataField: "actions",
            text: "",
            sort: false,
            sortCaret: sortCaret,
            formatter: (
                cellContent,
                row,
                rowIndex,
                { addLiquidityDialog }
            ) => {
                return (
                    <div className="d-flex align-items-center justify-content-end">
                        <button className="btn btn-primary" onClick={addLiquidityDialog.bind(this, row.exchange, row)}>
                            <span className={'svg-inner-white pr-3'}>
                                <SVG src={toAbsoluteUrl("/media/svg/icons/Navigation/Up-2.svg")} />
                            </span>
                            Add Liquidity
                        </button>
                    </div>
                )
            },
            formatExtraData: {
                addLiquidityDialog: poolsUIProps.addLiquidityDialog,
            },
        },
    ];
    // Table pagination properties
    const paginationOptions = {
        custom: true,
        totalSize: totalCount,
        sizePerPageList: uiHelpers.sizePerPageList,
        sizePerPage: poolsUIProps.queryParams.pageSize,
        page: poolsUIProps.queryParams.pageNumber,
    };
    return (
        <>
            <PaginationProvider pagination={paginationFactory(paginationOptions)}>
                {({ paginationProps, paginationTableProps }) => {
                    return (
                        <Pagination
                            isLoading={listLoading}
                            paginationProps={paginationProps}
                        >
                            <BootstrapTable
                                wrapperClasses="table-responsive"
                                bordered={false}
                                classes="table table-head-custom table-vertical-center overflow-hidden"
                                bootstrap4
                                remote
                                keyField="id"
                                data={entities === null ? [] : entities}
                                columns={columns}
                                defaultSorted={uiHelpers.defaultSorted}
                                onTableChange={getHandlerTableChange(
                                    poolsUIProps.setQueryParams
                                )}
                                {...paginationTableProps}
                            >

                                <PleaseWaitMessage entities={entities} />
                                <NoRecordsFoundMessage entities={entities} />
                            </BootstrapTable>
                        </Pagination>
                    );
                }}
            </PaginationProvider>
        </>
    );
}
