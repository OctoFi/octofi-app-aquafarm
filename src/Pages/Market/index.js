import React, {useContext, useEffect, useState} from 'react';
import { useDispatch, useSelector } from "react-redux";
import {Row, Col, Tab, Nav, Form, FormControl} from 'react-bootstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import {CircularProgress} from "@material-ui/core";
import styled, {ThemeContext} from "styled-components";


import CustomCard, {CustomHeader} from "../../components/CustomCard";
import {fetchAllCoins, fetchCoinMarketPrices, fetchMarketCoins} from '../../state/market/actions';
import {NoRecordsFoundMessage, PleaseWaitMessage} from "../../components/_metronic/_helpers";
import CurrencyLogo from "../../components/CurrencyLogo";
import CurrencyText from "../../components/CurrencyText";
import ArrowUp from "../../components/Icons/ArrowUp";
import ArrowDown from "../../components/Icons/ArrowDown";
import {useIsDarkMode} from "../../state/user/hooks";
import paginationFactory, {PaginationProvider} from "react-bootstrap-table2-paginator";
import {Pagination} from "../../components/_metronic/_partials/controls";

const Logo = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 48px;
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.075);
`

const CustomTitle = styled.h4`
  color: ${({theme}) => theme.text2}
`

const MarketLink = styled.a`
  @media(max-width: 991px) {
    flex-basis: 100px;
  }
`

const Market = props => {
    const [filter, setFilter] = useState("");
    const [page, setPage] = useState(1);
    const [expanded, setExpanded] = useState([]);
    const [marketCoinsData, setMarketCoinsData] = useState([]);
    const [allTokensData, setAllTokensData] = useState([]);
    const [pageSize, setPageSize] = useState(50);
    const dispatch = useDispatch();
    const marketCoins = useSelector(state => state.market.marketCoins);
    const allTokens = useSelector(state => state.market.allTokens);
    const darkMode = useIsDarkMode();
    const theme = useContext(ThemeContext);

    useEffect(() => {
        dispatch(fetchMarketCoins());
    }, [dispatch])

    useEffect(() => {
        dispatch(fetchAllCoins(page, pageSize));
    }, [page, pageSize, dispatch])

    useEffect(() => {
        const filterText = filter.trim().toLowerCase();
        if(filterText.length > 0) {
            setAllTokensData(allTokens.data.filter(token => token.name.toLowerCase().indexOf(filterText) > -1 || token.symbol.toLowerCase().indexOf(filterText) > -1))
        } else {
            setAllTokensData(allTokens.data)
        }
    }, [allTokens, filter])

    useEffect(() => {
        const filterText = filter.trim().toLowerCase();
        if(filterText.length > 0) {
            setMarketCoinsData(marketCoins.data.filter(token => token.name.toLowerCase().indexOf(filterText) > -1 || token.symbol.toLowerCase().indexOf(filterText) > -1))
        } else {
            setMarketCoinsData(marketCoins.data)
        }
    }, [marketCoins, filter])

    const columns = (hasPagination, hasCoinFetch = false) => [
        {
            dataField: "id",
            text: "ID",
            formatter: (cellContent, row, rowIndex) => hasPagination ? ((page - 1) * pageSize) + rowIndex + 1 : rowIndex + 1,
        },
        {
            dataField: "asset",
            text: "Asset",
            formatter: (cellContent, row, rowIndex) => (
                <div key={rowIndex} className="d-flex align-items-center flex-row py-3">
                    {row.image ? (<Logo src={row.image} alt={row.name}/>) : <CurrencyLogo size={'48px'} currency={row.currency}/>}
                    <div className="d-flex flex-column justify-content-center ml-5 mr-auto">
                        <CustomTitle className={'font-weight-bolder mb-1'}>{row.name}</CustomTitle>
                        <span className="text-muted font-size-sm">{row.symbol.toUpperCase()}</span>
                    </div>
                    {hasCoinFetch && (<button className="btn btn-primary btn-sm">Aggregations <ArrowDown size={18} fill={'white'} /></button>)}

                </div>
            ),
        },
        {
            dataField: "price",
            text: "Price",
            formatter: (cellContent, row) => (<span className={'font-weight-bold text-muted'}><CurrencyText>{row.current_price}</CurrencyText></span>),
        },
        {
            dataField: "change_percentage_24h",
            text: "24h",
            formatter: (cellContent, row) => (
                <span className={`font-weight-bold label label-inline label-lg ${row.price_change_percentage_24h >= 0 ? 'label-light-success' : 'label-light-danger'} `}>
                    <span className="mr-2">
                        {row.price_change_percentage_24h >= 0 ? (
                            <ArrowUp fill={'#1BC5BD'} size={14}/>
                        ) : (
                            <ArrowDown fill={'#F64E60'} size={14}/>
                        )}
                    </span>
                    {row.price_change_percentage_24h && row.price_change_percentage_24h.toFixed(4)}%
                </span>),
        },
        {
            dataField: "change_percentage_7d",
            text: "7 days",
            formatter: (cellContent, row) => (
                <span className={`font-weight-bold label label-inline label-lg ${row.price_change_percentage_7d_in_currency >= 0 ? 'label-light-success' : 'label-light-danger'} `}>
                    <span className="mr-2">
                        {row.price_change_percentage_7d_in_currency >= 0 ? (
                            <ArrowUp fill={'#1BC5BD'} size={14}/>
                        ) : (
                            <ArrowDown fill={'#F64E60'} size={14}/>
                        )}
                    </span>
                    {row.price_change_percentage_7d_in_currency && row.price_change_percentage_7d_in_currency.toFixed(4)}%
                </span>),
        },
        {
            dataField: "change_percentage_30d",
            text: "1 Month",
            formatter: (cellContent, row) => (
                <span className={`font-weight-bold label label-inline label-lg ${row.price_change_percentage_30d_in_currency >= 0 ? 'label-light-success' : 'label-light-danger'} `}>
                    <span className="mr-2">
                        {row.price_change_percentage_30d_in_currency >= 0 ? (
                            <ArrowUp fill={'#1BC5BD'} size={14}/>
                        ) : (
                            <ArrowDown fill={'#F64E60'} size={14}/>
                        )}
                    </span>
                    {row.price_change_percentage_30d_in_currency && row.price_change_percentage_30d_in_currency.toFixed(4)}%
                </span>),
        },
        {
            dataField: "change_percentage_200d",
            text: "6 Month",
            formatter: (cellContent, row) => (
                <span className={`font-weight-bold label label-inline label-lg ${row.price_change_percentage_200d_in_currency >= 0 ? 'label-light-success' : 'label-light-danger'} `}>
                    <span className="mr-2">
                        {row.price_change_percentage_200d_in_currency >= 0 ? (
                            <ArrowUp fill={'#1BC5BD'} size={14}/>
                        ) : (
                            <ArrowDown fill={'#F64E60'} size={14}/>
                        )}
                    </span>
                    {row.price_change_percentage_200d_in_currency && row.price_change_percentage_200d_in_currency.toFixed(4)}%
                </span>),
        },
        {
            dataField: "change_percentage_1y",
            text: "A Year",
            formatter: (cellContent, row) => (
                <span className={`font-weight-bold label label-inline label-lg ${row.price_change_percentage_1y_in_currency >= 0 ? 'label-light-success' : 'label-light-danger'} `}>
                    <span className="mr-2">
                        {row.price_change_percentage_1y_in_currency >= 0 ? (
                            <ArrowUp fill={'#1BC5BD'} size={14}/>
                        ) : (
                            <ArrowDown fill={'#F64E60'} size={14}/>
                        )}
                    </span>
                    {row.price_change_percentage_1y_in_currency && row.price_change_percentage_1y_in_currency.toFixed(4)}%
                </span>),
        },
        {
            dataField: "market_cap",
            text: "Market Cap",
            formatter: (cellContent, row) => (
                <span className={`font-weight-bold text-primary`}>
                    <CurrencyText>
                        {row.market_cap}
                    </CurrencyText>
                </span>),
        },
    ]

    const rowEvents = {
        onClick: (e, row) => {
            if(e.target.tagName === 'BUTTON') {
                if(expanded.includes(row.id)) {
                    setExpanded(expanded.filter(exRow => exRow !== row.id))
                } else {
                    dispatch(fetchCoinMarketPrices({
                        id: row.id,
                        symbol: row.symbol,
                    }))
                    setExpanded(expanded.concat(row.id));
                }
            } else {
                props.history.push(`/market/${row.id}`);
            }
        }
    }

    const changeFilter = (e) => {
        const filterText = e.target.value.trim().toLowerCase();
        setFilter(filterText);
    }

    const changeTableHandler = (type, data) => {
        if(data.page) {
            setPage(data.page);
        }
        if(data.sizePerPage) {
            setPageSize(data.sizePerPage);
        }
    }

    const paginationOptions = {
        custom: true,
        totalSize: allTokens.total,
        sizePerPageList: [
            { text: "10", value: 10 },
            { text: "20", value: 20 },
            { text: "50", value: 50 },
            { text: "100", value: 100 },
            { text: "250", value: 250 },
        ],
        sizePerPage: pageSize,
        page: page,
    };

    const expandRow = {
        renderer: (row) => {
            const loading = marketCoins.prices.loading[row.id];
            const coinPrices = marketCoins.prices.data[row.id];
            return loading ? (

                <div className="d-flex flex-column flex-lg-row align-items-center justify-content-center py-6">
                    <CircularProgress color={'primary'} style={{ width: 40, height: 40 }} />
                </div>
            ) : (
                <div className="d-flex flex-column flex-lg-row align-items-lg-center py-4 px-6">
                    {(coinPrices && coinPrices.hasOwnProperty('links')) ? Object.keys(coinPrices.links).map(market => {
                        return (
                            <div className="d-flex flex-row justify-content-lg-center justify-content-start flex-grow-1 mb-3 mb-lg-0 flex-lg-column" key={market}>
                                <MarketLink className="text-muted mb-lg-1 mr-2 mr-lg-0 font-size-base" href={coinPrices.links[market]} target={"_blank"} rel={'noopener noreferrer'}>{market} ↗</MarketLink>
                                <span className={`${coinPrices.result[market] >= row.current_price ? 'text-success' : 'text-danger'} font-weight-bold font-size-h4`} style={{ flex: '1'}}>
                                        <CurrencyText>
                                            {coinPrices.result[market]}
                                        </CurrencyText>
                                    </span>
                            </div>
                        )
                    }) : (
                        <div className="d-flex flex-column flex-lg-row align-items-center justify-content-center py-6">
                            <span className="text-muted">Something went wrong on loading data from api</span>
                        </div>
                    )}
                </div>
            )
        },
        expanded: expanded
    }


    const breadCrumbs = [{
        pathname: props.match.url,
        title: 'Market'
    }];


    return (
        <>
            <Row data-breadcrumbs={JSON.stringify(breadCrumbs)} data-title={'Market'}>
                <Col xs={12}>
                    <Tab.Container defaultActiveKey="featured">
                        <CustomCard>
                            <CustomHeader className="card-header">
                                <Nav fill variant="pills" className="flex-row w-100 card-title font-weight-normal font-size-base d-flex" >
                                    <Nav.Item className={'flex-grow-1'}>
                                        <Nav.Link eventKey="featured">Price Oracle Beta</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item className={'flex-grow-1'}>
                                        <Nav.Link eventKey="all">All Assets</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </CustomHeader>
                            <div className="card-body">

                                <Tab.Content className={'bg-transparent'}>
                                    <Tab.Pane eventKey="featured">
                                        {marketCoins.loading ? (
                                            <div className="d-flex align-items-center justify-content-center py-10">
                                                <CircularProgress color={'primary'} style={{ width: 40, height: 40 }}/>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="d-flex align-items-center justify-content-center gutter-b">
                                                    <Form.Control
                                                        value={filter}
                                                        onChange={changeFilter}
                                                        placeholder={"Search Asset"}
                                                        style={darkMode ? {
                                                            backgroundColor: theme.bg2,
                                                            borderColor: theme.bg4,
                                                            color: theme.text1,
                                                        } : {}}
                                                    />
                                                </div>
                                                <BootstrapTable
                                                    wrapperClasses="table-responsive"
                                                    bordered={false}
                                                    classes={`table table-head-custom table-vertical-center overflow-hidden table-dark-border table-hover ${darkMode && 'table-hover--dark'}`}
                                                    bootstrap4
                                                    remote
                                                    keyField="id"
                                                    columns={columns(false, true)}
                                                    data={marketCoinsData}
                                                    rowEvents={rowEvents}
                                                    expandRow={expandRow}
                                                >
                                                    <PleaseWaitMessage entities={marketCoinsData} />
                                                    <NoRecordsFoundMessage entities={marketCoinsData} />
                                                </BootstrapTable>
                                            </>
                                        )}
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="all">

                                        <div className="d-flex align-items-center justify-content-center gutter-b">
                                            <Form.Control
                                                value={filter}
                                                onChange={changeFilter}
                                                placeholder={"Search Asset"}
                                                style={darkMode ? {
                                                    backgroundColor: theme.bg2,
                                                    borderColor: theme.bg4,
                                                    color: theme.text1,
                                                } : {}}
                                            />
                                        </div>
                                        <PaginationProvider pagination={paginationFactory(paginationOptions)}>
                                            {({ paginationProps, paginationTableProps }) => {
                                                return (
                                                    <Pagination
                                                        isLoading={allTokens.loading}
                                                        paginationProps={paginationProps}
                                                    >
                                                        <BootstrapTable
                                                            wrapperClasses="table-responsive"
                                                            bordered={false}
                                                            classes={`table table-head-custom table-vertical-center overflow-hidden table-dark-border table-hover ${darkMode && 'table-hover--dark'}`}
                                                            bootstrap4
                                                            remote
                                                            keyField="id"
                                                            columns={columns(true)}
                                                            data={allTokensData}
                                                            rowEvents={rowEvents}
                                                            onTableChange={changeTableHandler}
                                                            {...paginationTableProps}
                                                        >
                                                            <PleaseWaitMessage entities={allTokensData} />
                                                            <NoRecordsFoundMessage entities={allTokensData} />
                                                        </BootstrapTable>
                                                    </Pagination>
                                                );
                                            }}
                                        </PaginationProvider>
                                    </Tab.Pane>
                                </Tab.Content>
                            </div>
                        </CustomCard>
                    </Tab.Container>
                </Col>
            </Row>
        </>
    )
}

export default Market;