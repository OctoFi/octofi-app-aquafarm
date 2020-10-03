import React, { useState, } from 'react';
import { Row, Col, Spinner } from 'react-bootstrap';
import { Route } from 'react-router-dom';
import { connect } from "react-redux";

import ValueCard from "../../components/ValueCard";
import OverviewCard from "../../components/OverviewCard";
import ChartCard from "../../components/ChartCard";
import AssetModal from "../../components/AssetModal";
import { useBalances } from "../../state/balances/hooks";

const Dashboard = props => {
    const {balances, overview} = useBalances(props.balances);

    const clickOnAsset = (asset, title, data) => {
        props.history.push(`/dashboard/${asset}`, {
            title,
            data
        })
    }

    return props.loading ? (
        <Row>
            <Col xs={12}  className={'d-flex align-items-center justify-content-center bg-white rounded'} style={{ padding: '120px 0'}}>
                <Spinner size='lg' animation="border" role="status" variant={'primary'}>
                    <span className="sr-only">Loading...</span>
                </Spinner>
            </Col>
        </Row>
    ) : (
        <>
           <Row>
               <Col span={12} md={4}>
                   <ValueCard className={'gutter-b'} title={'Total Assets'} value={overview.assets.total}/>
               </Col>
               <Col span={12} md={4}>
                   <ValueCard className={'gutter-b'} title={'Total Debt'} value={overview.debts.total}/>
               </Col>
               <Col span={12} md={4}>
                   <ValueCard className={'gutter-b'} title={'Net Worth'} value={overview.assets.total - overview.debts.total}/>
               </Col>
           </Row>
            <Row>
                <Col>
                    <ChartCard className="gutter-b card-stretch" chartColor={'success'}/>
                </Col>
            </Row>
            <Row className={'mt-5'}>
                <Col className={'gutter-b'}>
                    <h3 className={'mb-1'}>Account Overview</h3>
                </Col>
            </Row>
            <Row>
                {overview && Object.keys(overview).map(key => {
                    const account = overview[key];
                    return (
                        <Col key={key} span={12} md={4}>
                            <OverviewCard
                                clickHandler={clickOnAsset.bind(this, account.slug, account.title, account.balances)}
                                icon={(<i className={`flaticon2-gear text-${account.variant}`}/>)}
                                theme={account.variant}
                                className={'gutter-b'}
                                title={account.title}
                                value={account.total}/>
                        </Col>
                    )
                })}
            </Row>

            <Row className={'mt-5'}>
                <Col className={'gutter-b'}>
                    <h3 className={'mb-1'}>Platforms</h3>
                </Col>
            </Row>
            <Row>
                {balances && balances.map((b, index) => {
                    return (
                        <Col key={index} span={12} md={4}>
                            <OverviewCard
                                className={'gutter-b'} title={b.metadata.name} value={b.total.toFixed(4)}
                                image={b.metadata.logo.href}
                                />

                        </Col>
                    )
                })}
            </Row>
            <Route path={'/dashboard/:asset'} component={AssetModal}/>
        </>
    )
}

const mapStateToProps = state => {
    return {
        account: state.account,
        balances: state.balances.data,
        loading: state.balances.loading,
    }
}

export default connect(mapStateToProps)(Dashboard);