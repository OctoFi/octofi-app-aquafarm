import React from 'react';
import { Row, Col, Spinner } from 'react-bootstrap';
import { Route } from 'react-router-dom';
import { connect } from "react-redux";
import SVG from 'react-inlinesvg';
import styled from "styled-components";

import { useActiveWeb3React } from "../../hooks";
import ValueCard from "../../components/ValueCard";
import OverviewCard from "../../components/OverviewCard";
import ChartCard from "../../components/ChartCard";
import AssetModal from "../../components/AssetModal";
import WalletModal from "../../components/AssetModal/wallet";


const LoadingCol = styled(Col)`
  background-color: ${({ theme }) => theme.bg1}
`

const Dashboard = props => {
    const { account } = useActiveWeb3React();

    const clickOnAsset = (asset) => {
        if(asset === 'wallet') {
            props.history.push('/dashboard/wallet')
        } else {
            props.history.push(`/dashboard/asset/${asset}`)
        }
    }

    const showPlatform = (platform) => {
        props.history.push(`/platforms/${platform}`)
    }

    return props.loading ? (
        <Row>
            <LoadingCol xs={12}  className={'d-flex align-items-center justify-content-center rounded'} style={{ padding: '120px 0'}}>
                <Spinner size='lg' animation="border" role="status" variant={'primary'}>
                    <span className="sr-only">Loading...</span>
                </Spinner>
            </LoadingCol>
        </Row>
    ) : (
        <>
           <Row>
               <Col xs={12} md={4}>
                   <ValueCard className={'gutter-b'} title={'Total Assets'} value={props.overview.deposits.total + props.overview.wallet.total}/>
               </Col>
               <Col xs={12} md={4}>
                   <ValueCard className={'gutter-b'} title={'Total Debt'} value={props.overview.debts.total}/>
               </Col>
               <Col xs={12} md={4}>
                   <ValueCard className={'gutter-b'} title={'Net Worth'} value={props.overview.deposits.total + props.overview.wallet.total - props.overview.debts.total}/>
               </Col>
           </Row>
            <Row>
                <Col>
                    <ChartCard className="gutter-b card-stretch" chartColor={'success'} account={account}/>
                </Col>
            </Row>
            <Row className={'mt-5'}>
                <Col className={'gutter-b'}>
                    <h3 className={'mb-1'}>Account Overview</h3>
                </Col>
            </Row>
            <Row>
                {props.overview && Object.keys(props.overview).map(key => {
                    const account = props.overview[key];
                    return (
                        <Col key={key} span={12} md={4}>
                            <OverviewCard
                                clickHandler={clickOnAsset.bind(this, account.slug)}
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
                {props.transformedBalance.length > 0 ? props.transformedBalance.map((b, index) => {
                    return (
                        <Col key={index} span={12} md={4}>
                            <OverviewCard
                                clickHandler={showPlatform.bind(this, b.metadata.name)}
                                className={'gutter-b'} title={b.metadata.name} value={b.total.toFixed(4)}
                                image={b.metadata.logo.href}
                                />

                        </Col>
                    )
                }) : (
                    <Col xs={12}>
                        <div className="card card-custom bg-light-primary d-flex flex-column align-items-center justify-content-center py-8 px-4">
                            <SVG src={require('../../assets/images/svg/icons/Layout/Layout-4-blocks.svg')} width={48} height={48} />
                            <h5 className="text-primary font-weight-bolder mb-3 mt-5">
                                There is no <strong>Platform</strong>
                            </h5>
                            <span className="text-dark-50 font-weight-light font-size-lg">
                                Please make some transactions on investment platforms first.
                            </span>
                        </div>
                    </Col>
                )}
            </Row>
            <Route path={'/dashboard/asset/:asset'} component={AssetModal}/>
            <Route path={'/dashboard/wallet'} component={WalletModal}/>
        </>
    )
}

const mapStateToProps = state => {
    return {
        account: state.account,
        overview: state.balances.overview,
        transformedBalance: state.balances.transformedBalance,
        loading: state.balances.loading,
    }
}

export default connect(mapStateToProps)(Dashboard);