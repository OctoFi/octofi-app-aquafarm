import React, {useContext, useEffect} from 'react';
import { Row, Col } from 'react-bootstrap';
import { useSelector, useDispatch } from "react-redux";
import { Link } from 'react-router-dom';

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

    const selected = marketData.selected.data || false;

    useEffect(() => {
        dispatch(fetchSelectedCoin(props.match.params.id));

        dispatch(fetchHistoricalData(props.match.params.id, 30));
    }, [dispatch, props.match.params.id]);

    return (
        <>
            <Row>
                <Col xs={12} className={'gutter-b'}>
                    <CustomCard>
                        {selected && selected.contract_address && (
                            <CustomHeader className="card-header d-flex align-items-center justify-content-between">
                                <CustomTitle className={'card-title'}>Do you wanna to Exchange {selected.name}?</CustomTitle>
                                <div className="d-flex align-items-center justify-content">
                                    <Link to={`/exchange?outputCurrency=${selected.contract_address}`} className="btn btn-outline-success mr-2">Buy</Link>
                                    <Link to={`/exchange?inputCurrency=${selected.contract_address}`} className="btn btn-outline-danger">Sell</Link>
                                </div>
                            </CustomHeader>
                        )}

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
                                description={`${selected && selected.name} Historical Price`}
                                days={marketData.historical.days}
                                currentData={selected && selected.market_data.current_price.usd}
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
                                description={`${selected && selected.name} Historical Market Cap`}
                                currentData={selected && selected.market_data.market_cap.usd}
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
                                description={`${selected && selected.name} Historical Total Volume`}
                                currentData={selected && selected.market_data.total_volume.usd}
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
                                {selected && selected.market_data.price_change_percentage_24h >= 0 ? (
                                    <ArrowUp fill={'#1BC5BD'} size={64}/>
                                ) : (
                                    <ArrowDown fill={'#F64E60'} size={64}/>
                                )}
                            <div className={`font-weight-bolder font-size-h2 mt-3 ${selected && selected.market_data.price_change_percentage_24h >= 0 ? 'text-success' : 'text-danger'}`}>
                                {selected && Number(selected.market_data.price_change_percentage_24h).toFixed(4)}%
                            </div>
                            <span className="text-muted text-hover-primary font-weight-bold font-size-lg mt-1">Daily Changes Percentage</span>
                        </div>
                    </CustomCard>
                </Col>
                <Col lg={3} md={6} xs={12} className={'gutter-b'}>
                    <CustomCard>
                        <div className="card-body">
                            {selected && selected.market_data.price_change_percentage_7d >= 0 ? (
                                <ArrowUp fill={'#1BC5BD'} size={64}/>
                            ) : (
                                <ArrowDown fill={'#F64E60'} size={64}/>
                            )}
                            <div className={`font-weight-bolder font-size-h2 mt-3 ${selected && selected.market_data.price_change_percentage_7d >= 0 ? 'text-success' : 'text-danger'}`}>
                                {selected && Number(selected.market_data.price_change_percentage_7d).toFixed(4)}%
                            </div>
                            <span className="text-muted text-hover-primary font-weight-bold font-size-lg mt-1">Weekly Changes Percentage</span>
                        </div>
                    </CustomCard>
                </Col>
                <Col lg={3} md={6} xs={12} className={'gutter-b'}>
                    <CustomCard>
                        <div className="card-body">
                            {selected && selected.market_data.price_change_percentage_30d >= 0 ? (
                                <ArrowUp fill={'#1BC5BD'} size={64}/>
                            ) : (
                                <ArrowDown fill={'#F64E60'} size={64}/>
                            )}
                            <div className={`font-weight-bolder font-size-h2 mt-3 ${selected && selected.market_data.price_change_percentage_30d >= 0 ? 'text-success' : 'text-danger'}`}>
                                {selected && Number(selected.market_data.price_change_percentage_30d).toFixed(4)}%
                            </div>
                            <span className="text-muted text-hover-primary font-weight-bold font-size-lg mt-1">Monthly Changes Percentage</span>
                        </div>
                    </CustomCard>
                </Col>
                <Col lg={3} md={6} xs={12} className={'gutter-b'}>
                    <CustomCard>
                        <div className="card-body">
                            {selected && selected.market_data.price_change_percentage_1y >= 0 ? (
                                <ArrowUp fill={'#1BC5BD'} size={64}/>
                            ) : (
                                <ArrowDown fill={'#F64E60'} size={64}/>
                            )}
                            <div className={`font-weight-bolder font-size-h2 mt-3 ${selected && selected.market_data.price_change_percentage_1y >= 0 ? 'text-success' : 'text-danger'}`}>
                                {selected && Number(selected.market_data.price_change_percentage_1y).toFixed(4)}%
                            </div>
                            <span className="text-muted text-hover-primary font-weight-bold font-size-lg mt-1">Yearly Changes Percentage</span>
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
                                <span className="font-size-h3 font-weight-bolder">${selected && selected.market_data.market_cap.usd}</span>
                            </Col>
                            <Col xs={12} md={4} className={'d-flex flex-column justify-content-center gutter-b'}>
                                <span className="text-muted font-size-sm font-weight-bold mb-2">All time High</span>
                                <span className="font-size-h3 font-weight-bolder text-success">${selected && selected.market_data.ath.usd}</span>
                            </Col>
                            <Col xs={12} md={4} className={'d-flex flex-column justify-content-center gutter-b'}>
                                <span className="text-muted font-size-sm font-weight-bold mb-2">All Time Low</span>
                                <span className="font-size-h3 font-weight-bolder text-danger">${selected && selected.market_data.atl.usd}</span>
                            </Col>
                        </div>
                    </CustomCard>
                </Col>
            </Row>
            <Row>
                <Col xs={12} className={'gutter-b'}>
                    <CustomCard>
                        <CustomHeader className={'card-header'}>
                            <CustomTitle className={'card-title'}>About</CustomTitle>
                        </CustomHeader>
                        <div className="card-body">
                            <div className="text-muted" dangerouslySetInnerHTML={{__html: selected && selected.description.en}} />
                        </div>
                    </CustomCard>
                </Col>
                <Col xs={12} className={'gutter-b'}>
                    <CustomCard>
                        <CustomHeader className={'card-header'}>
                            <CustomTitle className={'card-title'}>Coin Information</CustomTitle>
                        </CustomHeader>
                        <div className="card-body">
                            <Row>
                                <Col xs={12} md={6} className={'py-3'}>
                                    <Row>
                                        <Col xs={4}>
                                            <span className="font-weight-bolder font-size-lg">Currency Name</span>
                                        </Col>
                                        <Col xs={8}>
                                            <span className="font-weight-normal text-muted font-size-lg">{selected && selected.name}</span>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col xs={12} md={6} className={'py-3'}>
                                    <Row>
                                        <Col xs={4}>
                                            <span className="font-weight-bolder font-size-lg">Symbol</span>
                                        </Col>
                                        <Col xs={8}>
                                            <span className="font-weight-normal text-muted font-size-lg">{selected && selected.symbol.toUpperCase()}</span>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col xs={12} md={6} className={'py-3'}>
                                    <Row>
                                        <Col xs={4}>
                                            <span className="font-weight-bolder font-size-lg">Website</span>
                                        </Col>
                                        <Col xs={8}>
                                            <a
                                                href={selected && selected.links.homepage[0]}
                                                className="font-weight-normal text-muted font-size-lg"
                                                target={"_blank"}
                                                rel={'noopener noreferrer'}>{selected && selected.links.homepage[0]}</a>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col xs={12} md={6} className={'py-3'}>
                                    <Row>
                                        <Col xs={4}>
                                            <span className="font-weight-bolder font-size-lg">Whitepaper</span>
                                        </Col>
                                        <Col xs={8}>
                                            <a
                                                href={selected && selected.ico_data ? selected.ico_data.links.whitepaper : '#'}
                                                className="font-weight-normal text-muted font-size-lg"
                                                target={"_blank"}
                                                rel={'noopener noreferrer'}>
                                                {selected && selected.ico_data ? selected.ico_data.links.whitepaper : '-'}
                                            </a>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col xs={12} md={6} className={'py-3'}>
                                    <Row>
                                        <Col xs={4}>
                                            <span className="font-weight-bolder font-size-lg">Block Explorer</span>
                                        </Col>
                                        <Col xs={8}>
                                            <a
                                                href={selected && (selected.links.blockchain_site[0] ||'#')}
                                                className="font-weight-normal text-muted font-size-lg"
                                                target={"_blank"}
                                                rel={'noopener noreferrer'}>
                                                {selected && (selected.links.blockchain_site[0] || '-')}
                                            </a>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col xs={12} md={6} className={'py-3'}>
                                    <Row>
                                        <Col xs={4}>
                                            <span className="font-weight-bolder font-size-lg">Github</span>
                                        </Col>
                                        <Col xs={8}>
                                            <a
                                                href={selected && (selected.links.repos_url.github[0] ||'#')}
                                                className="font-weight-normal text-muted font-size-lg"
                                                target={"_blank"}
                                                rel={'noopener noreferrer'}>
                                                {selected && (selected.links.repos_url.github[0] || '-')}
                                            </a>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col xs={12} md={6} className={'py-3'}>
                                    <Row>
                                        <Col xs={4}>
                                            <span className="font-weight-bolder font-size-lg">Twitter</span>
                                        </Col>
                                        <Col xs={8}>
                                            <a
                                                href={selected && (selected.links.twitter_screen_name ? `https://twitter.com/${selected.links.twitter_screen_name}` : '#')}
                                                className="font-weight-normal text-muted font-size-lg"
                                                target={"_blank"}
                                                rel={'noopener noreferrer'}>
                                                {selected && (selected.links.twitter_screen_name ? `https://twitter.com/${selected.links.twitter_screen_name}` : '-')}
                                            </a>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col xs={12} md={6} className={'py-3'}>
                                    <Row>
                                        <Col xs={4}>
                                            <span className="font-weight-bolder font-size-lg">Facebook</span>
                                        </Col>
                                        <Col xs={8}>
                                            <a
                                                href={selected && (selected.links.facebook_username ? `https://facebook.com/${selected.links.facebook_username}` : '#')}
                                                className="font-weight-normal text-muted font-size-lg"
                                                target={"_blank"}
                                                rel={'noopener noreferrer'}>
                                                {selected && (selected.links.facebook_username ? `https://facebook.com/${selected.links.facebook_username}` : '-')}
                                            </a>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col xs={12} md={6} className={'py-3'}>
                                    <Row>
                                        <Col xs={4}>
                                            <span className="font-weight-bolder font-size-lg">Reddit</span>
                                        </Col>
                                        <Col xs={8}>
                                            <a
                                                href={selected && (selected.links.subreddit_url || '#')}
                                                className="font-weight-normal text-muted font-size-lg"
                                                target={"_blank"}
                                                rel={'noopener noreferrer'}>
                                                {selected && (selected.links.subreddit_url || '-')}
                                            </a>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col xs={12} md={6} className={'py-3'}>
                                    <Row>
                                        <Col xs={4}>
                                            <span className="font-weight-bolder font-size-lg">Telegram</span>
                                        </Col>
                                        <Col xs={8}>
                                            <a
                                                href={selected && (selected.links.telegram_channel_identifier ? `https://t.me/${selected.links.telegram_channel_identifier}` : '#')}
                                                className="font-weight-normal text-muted font-size-lg"
                                                target={"_blank"}
                                                rel={'noopener noreferrer'}>
                                                {selected && (selected.links.telegram_channel_identifier ? `https://t.me/${selected.links.telegram_channel_identifier}` : '-')}
                                            </a>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col xs={12} md={6} className={'py-3'}>
                                    <Row>
                                        <Col xs={4}>
                                            <span className="font-weight-bolder font-size-lg">Bitcoin Talk</span>
                                        </Col>
                                        <Col xs={8}>
                                            <a
                                                href={selected && (selected.links.bitcointalk_thread_identifier ? `https://bitcointalk.org/index.php?topic=${selected.links.bitcointalk_thread_identifier}` : '#')}
                                                className="font-weight-normal text-muted font-size-lg"
                                                target={"_blank"}
                                                rel={'noopener noreferrer'}>
                                                {selected && (selected.links.bitcointalk_thread_identifier ? `https://bitcointalk.org/index.php?topic=${selected.links.bitcointalk_thread_identifier}` : '-')}
                                            </a>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </div>
                    </CustomCard>
                </Col>
            </Row>
        </>
    )
}

export default CoinDetails;