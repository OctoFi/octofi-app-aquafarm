import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import PlatformLogo from "../../components/PlatformLogo";
import { toAbsoluteUrl} from "../../components/_metronic/_helpers";
import CurrencyText from "../../components/CurrencyText";
import SVG from "react-inlinesvg";
import {fetchPools} from "../../state/pools/actions";
import ExchangeIcon from "../../components/Icons/Exchange";
import {CircularProgress} from "@material-ui/core";
import {PoolsTable} from "./PoolsTable";
import {shorten} from "../../state/governance/hooks";
import {usePoolsBalances} from "../../state/pools/hooks";
import {useActiveWeb3React} from "../../hooks";

const CustomTitle = styled.h4`
  color: ${({theme}) => theme.text2}
`

const PoolTab = props => {
    const { account } = useActiveWeb3React();
    const loader = useRef(null);
    const [page, setPage] = useState(1);
    const [virtualPage, setVirtualPage] = useState(1);
    const [pools, setPools] = useState([]);
    const [shownListLength, setShownListLength] = useState(0);
    const { query } = props;

    const filterHandler = useCallback(() => {
        if(query.length > 0) {
            return pools.filter(pool => JSON.stringify(pool).toLowerCase().includes(query.toLowerCase()));
        } else {
            return pools;
        }
    }, [query, pools, virtualPage, page])

    const filteredPools = useMemo(() => {
        const data = filterHandler().slice(0, virtualPage * 10)
        setShownListLength(data.length);
        return data;
    }, [props.query, virtualPage, pools])

    const balances = usePoolsBalances(account, filteredPools.map(p => p.hasOwnProperty('id') ? p.id : p.address), props.type);
    // if(props.type === 'Uniswap') {
    //     console.log(balances[0]);
    // }

    const fetchPools = async () => {
        const res = await props.fetchPools(props.type || 'Uniswap', {
            pageSize: 200,
            page: page,
        });
        if(res) {
            setPools(pools => pools.concat(res));
        }
    }

    const handleObserver = (entities) => {
        const target = entities[0];
        if (target.isIntersecting) {
            if(((virtualPage + 1) % 20 === 0 && !props.pools[props.type].isFinished) || shownListLength < virtualPage * 10) {
                setPage(page => page + 1)
            }
            setVirtualPage(page => page + 1);
        }
    }


    let columns = {
        Uniswap: [
            {
                dataField: "id",
                text: "ID",
                formatter: (cellContent, row, rowIndex) => (
                    <span className="text-muted font-weight-bold">{rowIndex + 1}</span>),
            },
            {
                dataField: "poolName",
                text: "Available Pools",
                formatter: (cellContent, row, rowIndex) => {
                    return (
                        <div key={rowIndex} className="d-flex align-items-center flex-row py-3">
                            <PlatformLogo size={48} platform={'uniswap'} name={'Uniswap-v2'}/>
                            <div className="d-flex flex-column justify-content-center ml-5">
                                <CustomTitle
                                    className={'font-weight-bolder mb-1'}>{row.token0.symbol}-{row.token1.symbol}</CustomTitle>
                                <span className="text-muted font-size-sm">Uniswap-v2</span>
                            </div>
                        </div>
                    )
                },
            },
            {
                dataField: "totalSupply",
                text: "Total Supply",
                formatter: (cellContent, row) => (<span
                    className={'font-weight-bold text-muted'}><CurrencyText>{row.totalSupply}</CurrencyText></span>),
            },
            {
                dataField: "volume",
                text: "Volume",
                formatter: (cellContent, row) => (<span
                    className={'font-weight-bold text-muted'}><CurrencyText>{row.volumeUSD}</CurrencyText></span>),
            },
            {
                dataField: "transactions",
                text: "Txn Count",
                formatter: (cellContent, row) => (
                    <span className={'font-weight-bold text-muted'}>{row.txCount}</span>),
            },
            {
                dataField: "actions",
                text: "",
                formatter: (cellContent, row, rowIndex, { addLiquidityDialog, balances, removeLiquidityDialog }) => {
                    const pool = {
                        poolName: `${row.token0.symbol}-${row.token1.symbol}`,
                        token0: row.token0,
                        token1: row.token1,
                        address: row.id
                    }
                    return (
                        <div className="d-flex align-items-center justify-content-end">

                            {Number(balances[0][row.id]) > 0 ? (
                                <button className="btn btn-danger mr-2"
                                        onClick={() => removeLiquidityDialog('Uniswap', pool)}>
                                    <span className={'svg-inner-white pr-3'}>
                                        <SVG src={toAbsoluteUrl("/media/svg/icons/Navigation/Down-2.svg")}/>
                                    </span>
                                    Withdraw
                                </button>
                            ) : null}
                            <button className="btn btn-primary"
                                    onClick={() => addLiquidityDialog('Uniswap', pool)}>
                                    <span className={'svg-inner-white pr-3'}>
                                        <SVG src={toAbsoluteUrl("/media/svg/icons/Navigation/Up-2.svg")}/>
                                    </span>
                                Add Liquidity
                            </button>
                        </div>
                    )
                },
                formatExtraData: {
                    addLiquidityDialog: props.addLiquidityHandler,
                    removeLiquidityDialog: props.removeLiquidityHandler,
                    balances: balances
                },

            }
        ],
        Balancer: [
            {
                dataField: "id",
                text: "ID",
                formatter: (cellContent, row, rowIndex) => (
                    <span className="text-muted font-weight-bold">{rowIndex + 1}</span>),
            },
            {
                dataField: "poolName",
                text: "Available Pools",
                formatter: (cellContent, row, rowIndex) => {
                    return (
                        <div key={rowIndex} className="d-flex align-items-center flex-row py-3">
                            <PlatformLogo size={48} platform={'balancer'} name={'balancer'}/>
                            <div className="d-flex flex-column justify-content-center ml-5">
                                <CustomTitle
                                    className={'font-weight-bolder mb-1'}>{row.tokens.map(t => t.symbol).join("-")}</CustomTitle>
                                <span className="text-muted font-size-sm">Balancer</span>
                            </div>
                        </div>
                    )
                },
            },
            {
                dataField: "liquidity",
                text: "Liquidity",
                formatter: (cellContent, row) => (<span
                    className={'font-weight-bold text-muted'}><CurrencyText>{row.liquidity}</CurrencyText></span>),
            },
            {
                dataField: "volume",
                text: "Total Swap Volume",
                formatter: (cellContent, row) => (<span
                    className={'font-weight-bold text-muted'}><CurrencyText>{row.totalSwapVolume}</CurrencyText></span>),
            },
            {
                dataField: "swapFee",
                text: "Swap Fee",
                formatter: (cellContent, row) => (
                    <span className={'font-weight-bold text-muted'}>{row.swapFee}</span>),
            },
            {

                dataField: "actions",
                text: "",
                formatter: (cellContent, row, rowIndex, { addLiquidityDialog, balances, removeLiquidityDialog }) => {
                    const pool = {
                        poolName: row.tokens.map(t => t.symbol).join("-"),
                        address: row.id
                    }
                    return (
                        <div className="d-flex align-items-center justify-content-end">

                            {Number(balances[0][row.id]) > 0 ? (
                                <button className="btn btn-danger mr-2"
                                        onClick={() => removeLiquidityDialog('Balancer', pool)}>
                                    <span className={'svg-inner-white pr-3'}>
                                        <SVG src={toAbsoluteUrl("/media/svg/icons/Navigation/Down-2.svg")}/>
                                    </span>
                                    Withdraw
                                </button>
                            ) : null}
                            <button className="btn btn-primary"
                                    onClick={() => addLiquidityDialog('Balancer', pool)}>
                                    <span className={'svg-inner-white pr-3'}>
                                        <SVG src={toAbsoluteUrl("/media/svg/icons/Navigation/Up-2.svg")}/>
                                    </span>
                                Add Liquidity
                            </button>
                        </div>
                    )
                },
                formatExtraData: {
                    addLiquidityDialog: props.addLiquidityHandler,
                    removeLiquidityDialog: props.removeLiquidityHandler,
                    balances: balances
                },
            }
        ],
        Curve: [
            {
                dataField: "id",
                text: "ID",
                formatter: (cellContent, row, rowIndex) => (
                    <span className="text-muted font-weight-bold">{rowIndex + 1}</span>),
            },
            {
                dataField: "poolName",
                text: "Available Pools",
                formatter: (cellContent, row, rowIndex) => {
                    return (
                        <div key={rowIndex} className="d-flex align-items-center flex-row py-3">
                            <PlatformLogo size={48} platform={'curve'} name={'Curve'}/>
                            <div className="d-flex flex-column justify-content-center ml-5">
                                <CustomTitle
                                    className={'font-weight-bolder mb-1'}>{row.poolToken ? row.poolToken.name : row.coins.length > 0 ? row.coins.map(c => c.symbol).join('-') : shorten(row.address, 'name')}</CustomTitle>
                                <span className="text-muted font-size-sm">Curve</span>
                            </div>
                        </div>
                    )
                },
            },
            {
                dataField: "virtualPrice",
                text: "Virtual Price",
                formatter: (cellContent, row) => (
                    <span className={'font-weight-bold text-muted'}><CurrencyText>{row.virtualPrice}</CurrencyText></span>),
            },
            {
                dataField: "SwapFee",
                text: "fee",
                formatter: (cellContent, row) => (<span className={'font-weight-bold text-muted'}>{row.fee}</span>),
            },
            {

                dataField: "actions",
                text: "",
                formatter: (cellContent, row, rowIndex, { addLiquidityDialog, balances, removeLiquidityDialog }) => {
                    const pool = {
                        poolName: row.poolToken ? row.poolToken.name : row.coins.length > 0 ? row.coins.map(c => c.symbol).join('-') : shorten(row.address, 'name'),
                        address: row.address
                    }
                    return (
                        <div className="d-flex align-items-center justify-content-end">

                            {Number(balances[0][row.id]) > 0 ? (
                                <button className="btn btn-danger mr-2"
                                        onClick={() => removeLiquidityDialog('Curve', pool)}>
                                    <span className={'svg-inner-white pr-3'}>
                                        <SVG src={toAbsoluteUrl("/media/svg/icons/Navigation/Down-2.svg")}/>
                                    </span>
                                    Withdraw
                                </button>
                            ) : null}
                            <button className="btn btn-primary"
                                    onClick={() => addLiquidityDialog('Curve', pool)}>
                                    <span className={'svg-inner-white pr-3'}>
                                        <SVG src={toAbsoluteUrl("/media/svg/icons/Navigation/Up-2.svg")}/>
                                    </span>
                                Add Liquidity
                            </button>
                        </div>
                    )
                },
                formatExtraData: {
                    addLiquidityDialog: props.addLiquidityHandler,
                    removeLiquidityDialog: props.removeLiquidityHandler,
                    balances: balances
                },
            }
        ],
        Yearn: [
            {
                dataField: "id",
                text: "ID",
                formatter: (cellContent, row, rowIndex) => (
                    <span className="text-muted font-weight-bold">{rowIndex + 1}</span>),
            },
            {
                dataField: "poolName",
                text: "Available Pools",
                formatter: (cellContent, row, rowIndex) => {
                    return (
                        <div key={rowIndex} className="d-flex align-items-center flex-row py-3">
                            <PlatformLogo size={48} platform={'yearn'} name={'yearn'}/>
                            <div className="d-flex flex-column justify-content-center ml-5">
                                <CustomTitle
                                    className={'font-weight-bolder mb-1'}>{row.shareToken ? row.shareToken.name : row.underlyingToken.name}</CustomTitle>
                                <span className="text-muted font-size-sm">yEarn</span>
                            </div>
                        </div>
                    )
                },
            },
            {
                dataField: "totalSupply",
                text: "Total Supply",
                formatter: (cellContent, row) => (<span
                    className={'font-weight-bold text-muted'}><CurrencyText>{row.totalSupply}</CurrencyText></span>),
            },
            {
                dataField: "available",
                text: "Available Vault",
                formatter: (cellContent, row) => (
                    <span className={'font-weight-bold text-muted'}>{Number(row.available).toFixed(6)}</span>),
            },
            {
                dataField: "vaultBalance",
                text: "Vault Balance",
                formatter: (cellContent, row) => (
                    <span className={'font-weight-bold text-muted'}>{Number(row.vaultBalance).toFixed(6)}</span>),
            },
            {

                dataField: "actions",
                text: "",
                formatter: (cellContent, row, rowIndex, { addLiquidityDialog, balances, removeLiquidityDialog }) => {
                    const pool = {
                        poolName: row.shareToken ? row.shareToken.name : row.underlyingToken.name,
                        address: row.id
                    }
                    return (
                        <div className="d-flex align-items-center justify-content-end">
                            {Number(balances[0][row.id]) > 0 ? (
                                <button className="btn btn-danger mr-2"
                                        onClick={() => removeLiquidityDialog('Yearn', pool)}>
                                    <span className={'svg-inner-white pr-3'}>
                                        <SVG src={toAbsoluteUrl("/media/svg/icons/Navigation/Down-2.svg")}/>
                                    </span>
                                    Withdraw
                                </button>
                            ) : null}
                            <button className="btn btn-primary"
                                    onClick={() => addLiquidityDialog('Yearn', pool)}>
                                    <span className={'svg-inner-white pr-3'}>
                                        <SVG src={toAbsoluteUrl("/media/svg/icons/Navigation/Up-2.svg")}/>
                                    </span>
                                Add Liquidity
                            </button>
                        </div>
                    )
                },
                formatExtraData: {
                    addLiquidityDialog: props.addLiquidityHandler,
                    removeLiquidityDialog: props.removeLiquidityHandler,
                    balances: balances
                },
            }
        ],
    }

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '20px',
            threshold: 0,
        }

        const observer = new IntersectionObserver(handleObserver, options);
        if (loader.current) {
            observer.observe(loader.current)
        }
    }, [])

    useEffect(() => {
        fetchPools()
    }, [page])

    useEffect(() => {
        setVirtualPage(1);
    }, [query])

    useEffect(() => {
        if(shownListLength < virtualPage * 10 && !props.pools[props.type].isFinished) {
            setPage(page => page + 1);
        }
    }, [shownListLength, pools])

    return (
        <>
            {(!props.pools[props.type].loading || pools.length > 1) && (
                <PoolsTable entities={filteredPools} columns={columns[props.type]}/>
            )}
            {(props.pools[props.type].isFinished && filteredPools.length === 0) && (
                <div className="d-flex flex-column align-items-center justify-content-center py-8 px-4">
                    <ExchangeIcon size={48} fill={'#6993FF'}/>
                    <h5 className="text-primary font-weight-bolder mb-3 mt-5">
                        There is no <strong>Pool</strong> in <strong>{props.type}</strong> platform
                    </h5>
                    <span className="text-muted font-weight-light font-size-lg">
                        Please choose another platform.
                    </span>
                </div>
            )}
            <div className="d-flex align-items-center justify-content-center" ref={loader}>
                {(!props.pools[props.type].isFinished || (filteredPools.length === 0 && page > 1)) && (
                    <div className="py-6">
                        <CircularProgress color={'primary'} style={{width: 40, height: 40}}/>
                    </div>
                )}
            </div>
        </>
    )
}


const mapStateToProps = state => {
    return {
        pools: state.pools
    }
}

const mapDispatchToProps = dispatch => {
    return {
        fetchPools: (type, options) => dispatch(fetchPools(type, options))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PoolTab);