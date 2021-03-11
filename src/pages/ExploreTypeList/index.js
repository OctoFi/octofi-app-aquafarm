import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import BootstrapTable from 'react-bootstrap-table-next';
import styled from "styled-components";
import { useSelector , useDispatch } from "react-redux";

import ArrowUp from "../../components/Icons/ArrowUp";
import ArrowDown from "../../components/Icons/ArrowDown";
import { ResponsiveCard } from "../../components/Card";
import CurrencyLogo from "../../components/CurrencyLogo";
import CurrencyText from "../../components/CurrencyText";
import { fetchTokens } from "../../state/explore/actions";
import Loading from '../../components/Loading';
import Page from "../../components/Page";
import './style.scss';
import ResponsiveTable from "../../components/ResponsiveTable";
import MarketTokens from "./MarketTokens";

const CardTitle = styled.h2`
  font-size: 1rem;
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 20px;
  
  @media (min-width: 768px) {
    font-size: 1.25rem;
  }
`

const Logo = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 32px;
  background-color: ${({ theme }) => theme.text1};
  border: 2px solid ${({ theme }) => theme.text1};
  
  
  @media (max-width: 991px) {
    width: 24px;
    height: 24px;
    border-radius: 24px;
  }
`
const LogoContainer = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 32px;
  
  
  @media (max-width: 991px) {
    width: 24px;
    height: 24px;
    border-radius: 24px;
  }
`


const CellText = styled.span`
  font-weight: 500;
  font-size: .875rem;
  
  &.font-size-base {
    font-size: 1rem;
  }
  
  @media (max-width: 991px) {
    font-weight: 700;
    
    &.label {
    font-weight: 500;
    }
  }
`

const SymbolText = styled.span`
  font-weight: 500;
  font-size: 1rem;
  
  @media (max-width: 991px) {
    font-size: 0.875rem;
    font-weight: 400;
  }
`

const CustomTitle = styled.h4`
  color: ${({theme}) => theme.text1}
  font-size: 1.25rem;
  
  @media (max-width: 991px) {
    font-size: 0.875rem;
  }
`

const TokenSetCustomTitle = styled(CustomTitle)`
  font-size: 1rem;
`

const tokenSetsColumns = [

    {
        dataField: "id",
        text: "ID",
        formatter: (cellContent, row, rowIndex) => (<CellText className="font-weight-bold">{rowIndex + 1}</CellText>),
    },

    {
        dataField: "name",
        text: "NAME",
        formatter: (cellContent, row, rowIndex) => (
            <div key={rowIndex} className="d-flex flex-row-reverse flex-lg-row align-items-start align-items-lg-center py-lg-2 pr-lg-4">
                {row.image ? (<Logo src={row.image} alt={row.name}/>) : <LogoContainer><CurrencyLogo currency={row.currency}/></LogoContainer>}
                <div className="d-flex flex-column justify-content-center ml-lg-3 mr-3 mr-lg-0">
                    <TokenSetCustomTitle className={'font-weight-bold'}>{row.name}</TokenSetCustomTitle>
                </div>
            </div>
        ),
        style: {
            maxWidth: 250
        },
        notCentered: true
    },
    {
        dataField: "price_usd",
        text: "CURRENT PRICE",
        formatter: (cellContent, row) => (
            <CellText className={`label label-inline label-lg label-light-success`}>
                <CurrencyText>{row.price_usd}</CurrencyText>
            </CellText>
        ),
    },
    {
        dataField: "components",
        text: "ASSETS",
        formatter: (cellContent, row) => (
            <div className="d-flex align-items-center">
                {row.components.map(c => {
                    return (
                        <CellText className={`mr-lg-4 ml-2 font-size-base`}>
                            {c.symbol}
                        </CellText>
                    )
                })}
            </div>
        ),
    },
    {
        dataField: "natural_units",
        text: "NATURAL UNITS",
        formatter: (cellContent, row) => (
            <CellText className="font-weight-bold">
                {row.natural_unit}
            </CellText>
        ),
    },
    {
        dataField: "unit_shares",
        text: "UNIT SHARES",
        formatter: (cellContent, row) => (
            <CellText className="font-weight-bold">
                {row.unit_shares}
            </CellText>
        ),
    },
    {
        dataField: "market_cap",
        text: "MARKET CAP",
        formatter: (cellContent, row) => (
            <CellText>
                <CurrencyText>
                    {row.market_cap}
                </CurrencyText>
            </CellText>
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

            if(type === 'tokenSets') {
                setColumns(tokenSetsColumns)
            }
        } else {
            props.history.push('/tools/explore')
        }
    }, [props.match.params.type, exploreSets, dispatch, props.history])


    return (
        <Page title={'Explore'} morePadding>
            <Row>
                <Col xs={12}>
                    <ResponsiveCard marginTop={-30}>
                        {props.match.params.type === 'tokens' ? (
                            <MarketTokens />
                        ) : (
                            <>
                                <CardTitle>{data.title}</CardTitle>
                                {data.loading ? (
                                    <div className="d-flex align-items-center justify-content-center py-5">
                                        <Loading color={'primary'} width={40} height={40} active id={'explore-list-loading'}/>
                                    </div>
                                ) : (
                                    <>
                                        <BootstrapTable
                                            wrapperClasses="table-responsive d-none d-lg-block"
                                            bordered={false}
                                            classes="table table-head-custom table-borderless table-vertical-center overflow-hidden table-hover explore__table"
                                            bootstrap4
                                            remote
                                            keyField="id"
                                            columns={columns}
                                            data={data.data.slice(0, 100)}
                                        >
                                        </BootstrapTable>

                                        <ResponsiveTable centered size={'lg'} breakpoint={'lg'} columns={columns} data={data.data.slice(0, 100)} direction={'rtl'}/>
                                    </>
                                )}
                            </>
                        )}

                    </ResponsiveCard>
                </Col>
            </Row>
        </Page>
    )
}


export default ExploreTypeList
