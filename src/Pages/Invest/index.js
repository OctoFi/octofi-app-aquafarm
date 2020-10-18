import React, { Component } from 'react';
import {Col, Row, Nav, Tab} from "react-bootstrap";
import { connect } from 'react-redux';
import { withSnackbar } from 'notistack';

import ValueCard from "../../components/ValueCard";
import CustomCard, { CustomHeader, CustomTitle } from "../../components/CustomCard";
import TokenSet from "../../http/tokenSet";
import {CircularProgress} from "@material-ui/core";
// import Protocol from "../../lib/protocol";

class Invest extends Component {
    constructor(props) {
        super(props);

        this.tokenSetApi = new TokenSet(process.env.REACT_APP_TOKEN_SET_BASE_URL);
        // this.protocol = new Protocol();

        this.state = {
            loading: true,
            rebalances: [],
            error: false,
            types: ['funds', 'trading_pool', '']
        }
    }

    async componentDidMount() {
        this.fetchRebalances();
        // this.protocol.get().rebalancing.getDetailsAsync('0xe0a84699a583d467001fcfE1d52930cF6f3b0BFa')
        //     .then(response => {
        //         console.log(response);
        //     })
        //     .catch(error => {
        //         console.log(error);
        //     })
    }

    fetchRebalances = () => {
        this.setState({
            loading: true,
            error: false,
        })
        this.tokenSetApi.fetchAllSets()
            .then(response => {
                console.log(response);
                if(response.data.hasOwnProperty('rebalancing_sets')) {
                    this.setState({
                        rebalances: [
                            ...response.data.rebalancing_sets
                        ],
                        error: false,
                        loading: false,
                    })
                } else {
                    this.setState({
                        rebalances: [],
                        error: false,
                        loading: false,
                    })
                }
            })
            .catch(error => {
                this.props.enqueueSnackbar(error.error.message, { variant: 'error' })
                this.setState({
                    rebalances: [],
                    error: true,
                    loading: false,
                })
            })
    }


    render() {

        // Table columns
        // const columns = [
        //     {
        //         dataField: "id",
        //         text: "ID",
        //         formatter: (cellContent, row, rowIndex) => (<span className="text-muted font-weight-bold">{rowIndex + 1}</span>),
        //     },
        //     {
        //         dataField: "tokenSet",
        //         text: "Token Set name",
        //         formatter: (cellContent, row, rowIndex) => {
        //             return (
        //                 <div key={rowIndex} className="d-flex align-items-center flex-row py-3">
        //                     <PlatformLogo size={48} platform={row.image} name={row.name}/>
        //                     <div className="d-flex flex-column justify-content-center ml-5">
        //                         <CustomTitle className={'font-weight-bolder mb-1'}>{row.name}</CustomTitle>
        //                         <span className="text-muted font-size-sm">{row.short_description}</span>
        //                     </div>
        //                 </div>
        //             )
        //         },
        //     },
        //     {
        //         dataField: "tokenSet",
        //         text: "Token Set name",
        //         formatter: (cellContent, row, rowIndex) => {
        //             return (
        //                 <div key={rowIndex} className="d-flex align-items-center flex-row py-3">
        //                     <PlatformLogo size={48} platform={row.image} name={row.name}/>
        //                     <div className="d-flex flex-column justify-content-center ml-5">
        //                         <CustomTitle className={'font-weight-bolder mb-1'}>{row.name}</CustomTitle>
        //                         <span className="text-muted font-size-sm">{row.short_description}</span>
        //                     </div>
        //                 </div>
        //             )
        //         },
        //     },
            // {
            //     dataField: "usdLiquidity",
            //     text: "Liquidity",
            //     sort: true,
            //     formatter: (cellContent, row) => (<span className={'font-weight-bold text-muted'}><CurrencyText>{row.usdLiquidity}</CurrencyText></span>),
            //     sortCaret: sortCaret,
            //     headerSortingClasses,
            // },
            // {
            //     dataField: "usdVolume",
            //     text: "Volume (24h)",
            //     sort: true,
            //     formatter: (cellContent, row) => (<span className={'font-weight-bold text-muted'}><CurrencyText>{row.usdVolume}</CurrencyText></span>),
            //     sortCaret: sortCaret,
            //     headerSortingClasses,
            // },
            // {
            //     dataField: "roi",
            //     text: "ROI",
            //     sort: true,
            //     formatter: (cellContent, row) => (<span className={`font-weight-bold ${!row.roi && 'text-muted'}`}>{row.roi ? `${row.roi.toFixed(3)}%` : 'N/A'}</span>),
            //     sortCaret: sortCaret,
            // },
            // {
            //     dataField: "actions",
            //     text: "",
            //     sort: false,
            //     sortCaret: sortCaret,
            //     formatter: (
            //         cellContent,
            //         row,
            //         rowIndex,
            //         { addLiquidityDialog }
            //     ) => {
            //         return (
            //             <div className="d-flex align-items-center justify-content-end">
            //                 <button className="btn btn-primary" onClick={addLiquidityDialog.bind(this, row.exchange, row)}>
            //                 <span className={'svg-inner-white pr-3'}>
            //                     <SVG src={toAbsoluteUrl("/media/svg/icons/Navigation/Up-2.svg")} />
            //                 </span>
            //                     Add Liquidity
            //                 </button>
            //             </div>
            //         )
            //     },
            //     formatExtraData: {
            //         addLiquidityDialog: poolsUIProps.addLiquidityDialog,
            //     },
            // },
        // ];

        return (
            <>
                <Row>
                    <Col xs={12} md={4}>
                        <ValueCard className={'gutter-b'} title={'Total Assets'} value={this.props.overview.deposits.total + this.props.overview.wallet.total}/>
                    </Col>
                    <Col xs={12} md={4}>
                        <ValueCard className={'gutter-b'} title={'Total Debt'} value={this.props.overview.debts.total}/>
                    </Col>
                    <Col xs={12} md={4}>
                        <ValueCard className={'gutter-b'} title={'Net Worth'} value={this.props.overview.deposits.total + this.props.overview.wallet.total - this.props.overview.debts.total}/>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <CustomCard>
                            <Tab.Container id="token-sets" defaultActiveKey="portfolios">
                                <CustomHeader className={'card-header'}>
                                    <CustomTitle className={'card-title'}>Token Sets</CustomTitle>
                                </CustomHeader>
                                <div className="card-body">

                                    {this.state.loading && !this.state.error ? (
                                        <div className="d-flex align-items-center justify-content-center py-6" ref={this.loader}>
                                            <CircularProgress color={'primary'} style={{ width: 40, height: 40 }}/>
                                        </div>
                                    ) : (
                                        <div>
                                            content
                                        </div>
                                    )}

                                </div>
                            </Tab.Container>
                        </CustomCard>

                    </Col>
                </Row>
            </>
        )
    }
}

const mapStateToProps = state => {
    return {
        account: state.account,
        overview: state.balances.overview,
    }
}


export default connect(mapStateToProps)(withSnackbar(Invest));