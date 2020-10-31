import React from 'react';
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

const CustomTitle = styled.h4`
  color: ${({theme}) => theme.text2}
`

class PoolsTab extends React.Component {
    constructor(props) {
        super(props);
        this.loader = React.createRef();

        this.state = {
            page: 1,
        }
    }

    componentDidMount() {
        const options = {
            root: null,
            rootMargin: "0px",
            threshold: 0
        };
        // initialize IntersectionObserver
        // and attaching to Load More div
        const observer = new IntersectionObserver(this.handleObserver, options);
        if (this.loader.current) {
            observer.observe(this.loader.current)
        }
    }

    handleObserver = (entities) => {
        const target = entities[0];
        if (target.isIntersecting && !this.props.pools[this.props.type].isFinished) {
            this.props.fetchPools(this.props.type || 'Uniswap', {
                pageSize: 10,
                page: this.state.page,
            });
            this.setState(prevState => {
                return {
                    page: prevState.page + 1
                }
            })
        }
    }

    render() {
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
                    formatter: (cellContent, row, rowIndex, { addLiquidityDialog }) => {
                        const pool = {
                            poolName: `${row.token0.symbol}-${row.token1.symbol}`,
                            token0: row.token0,
                            token1: row.token1,
                            address: row.id
                        }
                        return (
                            <div className="d-flex align-items-center justify-content-end">
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
                        addLiquidityDialog: this.props.addLiquidityHandler,
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
                    formatter: (cellContent, row, rowIndex, { addLiquidityDialog }) => {
                        const pool = {
                            poolName: row.tokens.map(t => t.symbol).join("-"),
                            address: row.id
                        }
                        return (
                            <div className="d-flex align-items-center justify-content-end">
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
                        addLiquidityDialog: this.props.addLiquidityHandler,
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
                    formatter: (cellContent, row, rowIndex, { addLiquidityDialog }) => {
                        const pool = {
                            poolName: row.poolToken ? row.poolToken.name : row.coins.length > 0 ? row.coins.map(c => c.symbol).join('-') : shorten(row.address, 'name'),
                            address: row.address
                        }
                        return (
                            <div className="d-flex align-items-center justify-content-end">
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
                        addLiquidityDialog: this.props.addLiquidityHandler,
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
                    formatter: (cellContent, row, rowIndex, { addLiquidityDialog }) => {
                        const pool = {
                            poolName: row.shareToken ? row.shareToken.name : row.underlyingToken.name,
                            address: row.id
                        }
                        return (
                            <div className="d-flex align-items-center justify-content-end">
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
                        addLiquidityDialog: this.props.addLiquidityHandler,
                    },
                }
            ],
        }

        return (
            <>
                {(!this.props.pools[this.props.type].loading || this.props.pools[this.props.type].data.length > 1) && (
                    <PoolsTable entities={this.props.pools[this.props.type].data} columns={columns[this.props.type]}/>
                )}
                {(this.props.pools[this.props.type].isFinished && this.props.pools[this.props.type].data.length === 0) && (
                    <div className="d-flex flex-column align-items-center justify-content-center py-8 px-4">
                        <ExchangeIcon size={48} fill={'#6993FF'}/>
                        <h5 className="text-primary font-weight-bolder mb-3 mt-5">
                            There is no <strong>Pool</strong> in <strong>{this.props.type}</strong> platform
                        </h5>
                        <span className="text-muted font-weight-light font-size-lg">
                        Please choose another platform.
                    </span>
                    </div>
                )}
                <div className="d-flex align-items-center justify-content-center" ref={this.loader}>
                    {!this.props.pools[this.props.type].isFinished && (
                        <div className="py-6">
                            <CircularProgress color={'primary'} style={{width: 40, height: 40}}/>
                        </div>
                    )}
                </div>
            </>
        )

    }
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

export default connect(mapStateToProps, mapDispatchToProps)(PoolsTab);