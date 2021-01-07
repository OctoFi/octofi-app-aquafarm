import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import styled from "styled-components";
import { useSelector , useDispatch } from "react-redux";

import ArrowUp from "../../components/Icons/ArrowUp";
import ArrowDown from "../../components/Icons/ArrowDown";
import CustomCard, { CustomTitle as CardCustomTitle, CustomHeader } from "../../components/CustomCard";
import CurrencyLogo from "../../components/CurrencyLogo";
import CurrencyText from "../../components/CurrencyText";
import { fetchTokens } from "../../state/explore/actions";
import {NoRecordsFoundMessage, PleaseWaitMessage} from "../../components/_metronic/_helpers";
import {CircularProgress} from "@material-ui/core";

const Logo = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 48px;
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.075);
`

const CustomTitle = styled.h4`
  color: ${({theme}) => theme.text2}
`

const tokensColumns = [
    {
        dataField: "id",
        text: "ID",
        formatter: (cellContent, row, rowIndex) => (<span className="text-muted font-weight-bold">{rowIndex + 1}</span>),
    },
    {
        dataField: "asset",
        text: "Asset",
        formatter: (cellContent, row, rowIndex) => (
            <div key={rowIndex} className="d-flex align-items-center flex-row py-3">
                {row.image ? (<Logo src={row.image} alt={row.name}/>) : <CurrencyLogo size={'48px'} currency={row.currency}/>}
                <div className="d-flex flex-column justify-content-center ml-5">
                    <CustomTitle className={'font-weight-bolder mb-1'}>{row.name}</CustomTitle>
                    <span className="text-muted font-size-sm">{row.symbol.toUpperCase()}</span>
                </div>
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
const tokenSetsColumns = [

    {
        dataField: "id",
        text: "ID",
        formatter: (cellContent, row, rowIndex) => (<span className="text-muted font-weight-bold">{rowIndex + 1}</span>),
    },

    {
        dataField: "name",
        text: "Name",
        formatter: (cellContent, row, rowIndex) => (
            <div key={rowIndex} className="d-flex align-items-center flex-row py-3">
                {row.image ? (<Logo src={row.image} alt={row.name}/>) : <CurrencyLogo size={'48px'} currency={row.currency}/>}
                <div className="d-flex flex-column justify-content-center ml-5">
                    <CustomTitle className={'font-weight-bolder mb-1'}>{row.name}</CustomTitle>
                    <span className="text-muted font-size-sm">{row.short_description}</span>
                </div>
            </div>
        ),
    },
    {
        dataField: "price_usd",
        text: "Current Price",
        formatter: (cellContent, row) => (
            <span className={`font-weight-bold label label-inline label-lg label-light-success`}>
                <CurrencyText>{row.price_usd}</CurrencyText>
            </span>
        ),
    },
    {
        dataField: "components",
        text: "Assets",
        formatter: (cellContent, row) => (
            <div className="d-flex align-items-center">
                {row.components.map(c => {
                    return (
                        <span className={`font-weight-bold label label-inline label-lg label-light-primary mr-2`}>
                            {c.symbol}
                        </span>
                    )
                })}
            </div>
        ),
    },
    {
        dataField: "natural_units",
        text: "Natural Units",
        formatter: (cellContent, row) => (
            <span className="text-muted font-weight-bold">
                {row.natural_unit}
            </span>
        ),
    },
    {
        dataField: "unit_shares",
        text: "Unit Shares",
        formatter: (cellContent, row) => (
            <span className="text-muted font-weight-bold">
                {row.unit_shares}
            </span>
        ),
    },
    {
        dataField: "market_cap",
        text: "Market Cap",
        formatter: (cellContent, row) => (
            <span className={`font-weight-bold text-primary`}>
                <CurrencyText>
                    {row.market_cap}
                </CurrencyText>
            </span>
        ),
    },
]
const ExploreTypeList = props => {
    const [columns, setColumns] = useState([])
    const [data, setData] = useState({ data: [], loading: true, title: ''})
    const dispatch = useDispatch();
    const exploreSets = useSelector(state => state.explore);

    useEffect(() => {
        const type = props.match.params.type;
        if(type && ['tokens', 'tokenSets'].includes(type)) {
            if(exploreSets[type].data.length === 0) {
                dispatch(fetchTokens());
            }

            setData(exploreSets[type]);

            if(type === 'tokens') {
                setColumns(tokensColumns);
            } else {
                setColumns(tokenSetsColumns)
            }
        } else {
            props.history.push('/explore')
        }
    }, [props.match.params.type, exploreSets, dispatch, props.history])


    const breadCrumbs = [{
        pathname: '/explore',
        title: 'Explore'
    }, {
        pathname: props.match.url,
        title: props.match.params.type
    }];

    return (
        <Row data-breadcrumbs={JSON.stringify(breadCrumbs)} data-title={props.match.params.type}>
            <Col xs={12}>
                <CustomCard>
                    <CustomHeader className="card-header">
                        <CardCustomTitle className="card-title">{data.title}</CardCustomTitle>
                    </CustomHeader>
                    <div className="card-body">
                        {data.loading ? (
                            <div className="d-flex align-items-center justify-content-center py-10">
                                <CircularProgress color={'primary'} style={{ width: 40, height: 40 }}/>
                            </div>
                        ) : (
                            <BootstrapTable
                                wrapperClasses="table-responsive"
                                bordered={false}
                                classes="table table-head-custom table-vertical-center overflow-hidden table-dark-border"
                                bootstrap4
                                remote
                                keyField="id"
                                columns={columns}
                                data={data.data.slice(0, 100)}
                            >
                                <PleaseWaitMessage entities={data} />
                                <NoRecordsFoundMessage entities={data} />
                            </BootstrapTable>
                        )}
                    </div>
                </CustomCard>
            </Col>
        </Row>
    )
}


export default ExploreTypeList