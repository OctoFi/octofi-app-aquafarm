import React, {useContext, useEffect} from 'react';
import { Row, Col } from 'react-bootstrap';
import { useSelector, useDispatch } from "react-redux";

import CustomCard, { CustomHeader, CustomTitle } from "../../components/CustomCard";
import HistoricalChart from "../../components/HistoricalChart";
import {ThemeContext} from "styled-components";
import {useIsDarkMode} from "../../state/user/hooks";
import {fetchSelectedCoin, fetchHistoricalData} from "../../state/market/actions";
import ArrowUp from "../../components/Icons/ArrowUp";
import ArrowDown from "../../components/Icons/ArrowDown";

const CoinDetails = props => {
    const theme = useContext(ThemeContext);
    const darkMode = useIsDarkMode();
    const dispatch = useDispatch();
    const marketData = useSelector(state => state.market);

    const changeRangeHandler = (days) => {
        dispatch(fetchHistoricalData(props.match.params.id, days));
    }

    console.log(marketData.selected.data);
    useEffect(() => {
        dispatch(fetchSelectedCoin(props.match.params.id));
        changeRangeHandler(30);
    }, []);

    return (
        <>
            <Row>
                <Col xs={12} className={'gutter-b'}>
                    <CustomCard>
                        <div className="card-body px-0 pt-0">

                            <HistoricalChart
                                theme={theme}
                                darkMode={darkMode}
                                variant={'primary'}
                                color={theme.primary1}
                                series={[{
                                    name: 'Price',
                                    data: marketData.historical.data.prices
                                }]}
                                loading={marketData.historical.loading}
                                description={`${marketData.selected.data && marketData.selected.data.name} Historical Price`}
                                days={marketData.historical.days}
                                currentData={marketData.selected.data && marketData.selected.data.market_data.current_price.usd}
                                changeRangeHandler={changeRangeHandler}
                            />
                        </div>
                    </CustomCard>
                </Col>
            </Row>
            <Row>
                <Col xs={12} md={6} className={'gutter-b'}>
                    <CustomCard>
                        <div className="card-body px-0 pt-0">

                            <HistoricalChart
                                theme={theme}
                                darkMode={darkMode}
                                variant={'success'}
                                color={theme.green1}
                                series={[{
                                    name: 'Market Cap',
                                    data: marketData.historical.data.market_caps
                                }]}
                                loading={marketData.historical.loading}
                                days={marketData.historical.days}
                                description={`${marketData.selected.data && marketData.selected.data.name} Historical Market Cap`}
                                currentData={marketData.selected.data && marketData.selected.data.market_data.market_cap.usd}
                                minHeight={250}
                                changeRangeHandler={changeRangeHandler}
                            />
                        </div>
                    </CustomCard>
                </Col>
                <Col xs={12} md={6} className={'gutter-b'}>
                    <CustomCard>
                        <div className="card-body px-0 pt-0">

                            <HistoricalChart
                                theme={theme}
                                darkMode={darkMode}
                                variant={'warning'}
                                color={theme.yellow2}
                                series={[{
                                    name: 'Total Volume',
                                    data: marketData.historical.data.total_volumes
                                }]}
                                loading={marketData.historical.loading}
                                days={marketData.historical.days}
                                minHeight={250}
                                description={`${marketData.selected.data && marketData.selected.data.name} Historical Total Volume`}
                                currentData={marketData.selected.data && marketData.selected.data.market_data.total_volume.usd}
                                changeRangeHandler={changeRangeHandler}
                            />
                        </div>
                    </CustomCard>
                </Col>
            </Row>
            <Row>
                <Col lg={3} md={6} xs={12} className={'gutter-b'}>
                    <CustomCard>
                        <div className="card-body">
                                {marketData.selected.data && marketData.selected.data.market_data.price_change_percentage_24h >= 0 ? (
                                    <ArrowUp fill={'#1BC5BD'} size={64}/>
                                ) : (
                                    <ArrowDown fill={'#F64E60'} size={64}/>
                                )}
                            <div className={`font-weight-bolder font-size-h2 mt-3 ${marketData.selected.data && marketData.selected.data.market_data.price_change_percentage_24h >= 0 ? 'text-success' : 'text-danger'}`}>
                                {marketData.selected.data && marketData.selected.data.market_data.price_change_percentage_24h.toFixed(4)}%
                            </div>
                            <a href="#" className="text-muted text-hover-primary font-weight-bold font-size-lg mt-1">Daily Changes Percentage</a>
                        </div>
                    </CustomCard>
                </Col>
                <Col lg={3} md={6} xs={12} className={'gutter-b'}>
                    <CustomCard>
                        <div className="card-body">
                            {marketData.selected.data && marketData.selected.data.market_data.price_change_percentage_7d >= 0 ? (
                                <ArrowUp fill={'#1BC5BD'} size={64}/>
                            ) : (
                                <ArrowDown fill={'#F64E60'} size={64}/>
                            )}
                            <div className={`font-weight-bolder font-size-h2 mt-3 ${marketData.selected.data && marketData.selected.data.market_data.price_change_percentage_7d >= 0 ? 'text-success' : 'text-danger'}`}>
                                {marketData.selected.data && marketData.selected.data.market_data.price_change_percentage_7d.toFixed(4)}%
                            </div>
                            <a href="#" className="text-muted text-hover-primary font-weight-bold font-size-lg mt-1">Weekly Changes Percentage</a>
                        </div>
                    </CustomCard>
                </Col>
                <Col lg={3} md={6} xs={12} className={'gutter-b'}>
                    <CustomCard>
                        <div className="card-body">
                            {marketData.selected.data && marketData.selected.data.market_data.price_change_percentage_30d >= 0 ? (
                                <ArrowUp fill={'#1BC5BD'} size={64}/>
                            ) : (
                                <ArrowDown fill={'#F64E60'} size={64}/>
                            )}
                            <div className={`font-weight-bolder font-size-h2 mt-3 ${marketData.selected.data && marketData.selected.data.market_data.price_change_percentage_30d >= 0 ? 'text-success' : 'text-danger'}`}>
                                {marketData.selected.data && marketData.selected.data.market_data.price_change_percentage_30d.toFixed(4)}%
                            </div>
                            <a href="#" className="text-muted text-hover-primary font-weight-bold font-size-lg mt-1">Monthly Changes Percentage</a>
                        </div>
                    </CustomCard>
                </Col>
                <Col lg={3} md={6} xs={12} className={'gutter-b'}>
                    <CustomCard>
                        <div className="card-body">
                            {marketData.selected.data && marketData.selected.data.market_data.price_change_percentage_1y >= 0 ? (
                                <ArrowUp fill={'#1BC5BD'} size={64}/>
                            ) : (
                                <ArrowDown fill={'#F64E60'} size={64}/>
                            )}
                            <div className={`font-weight-bolder font-size-h2 mt-3 ${marketData.selected.data && marketData.selected.data.market_data.price_change_percentage_1y >= 0 ? 'text-success' : 'text-danger'}`}>
                                {marketData.selected.data && marketData.selected.data.market_data.price_change_percentage_1y.toFixed(4)}%
                            </div>
                            <a href="#" className="text-muted text-hover-primary font-weight-bold font-size-lg mt-1">Yearly Changes Percentage</a>
                        </div>
                    </CustomCard>
                </Col>
            </Row>
            <Row>
                <Col xs={12} className={'gutter-b'}>
                    <CustomCard>
                        <CustomHeader className={'card-header'}>
                            <CustomTitle className={'card-title'}>Coin Stats</CustomTitle>
                        </CustomHeader>
                        <div className="card-body d-flex align-items-center justify-content-between row pb-2">
                            <Col xs={12} md={4} className={'d-flex flex-column justify-content-center gutter-b'}>
                                <span className="text-muted font-size-sm font-weight-bold mb-2">Market Cap</span>
                                <span className="font-size-h3 font-weight-bolder">${marketData.selected.data && marketData.selected.data.market_data.market_cap.usd}</span>
                            </Col>
                            <Col xs={12} md={4} className={'d-flex flex-column justify-content-center gutter-b'}>
                                <span className="text-muted font-size-sm font-weight-bold mb-2">All time High</span>
                                <span className="font-size-h3 font-weight-bolder text-success">${marketData.selected.data && marketData.selected.data.market_data.ath.usd}</span>
                            </Col>
                            <Col xs={12} md={4} className={'d-flex flex-column justify-content-center gutter-b'}>
                                <span className="text-muted font-size-sm font-weight-bold mb-2">All Time Low</span>
                                <span className="font-size-h3 font-weight-bolder text-danger">${marketData.selected.data && marketData.selected.data.market_data.atl.usd}</span>
                            </Col>
                        </div>
                    </CustomCard>
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    <CustomCard>
                        <CustomHeader className={'card-header'}>
                            <CustomTitle className={'card-title'}>About</CustomTitle>
                        </CustomHeader>
                        <div className="card-body">
                            <div className="text-muted" dangerouslySetInnerHTML={{__html: marketData.selected.data && marketData.selected.data.description.en}} />
                        </div>
                    </CustomCard>
                </Col>
            </Row>
        </>
    )
}

export default CoinDetails;