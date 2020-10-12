import React, { Component } from 'react';
import { connect } from "react-redux";
import { Row, Col } from 'react-bootstrap';
import { Route, Switch } from 'react-router-dom';

import { PoolsUIProvider } from "./PoolsUIProvider";
import { PoolsCard } from "./PoolsCard";
import AddLiquidityModal from "../../components/AddLiquidityModal";
import UniswapLiquidityModal from '../../components/AddLiquidityModal/uniswap';
import * as actions from '../../state/pools/actions';
import ValueCard from "../../components/ValueCard";

class Pools extends Component {
    investButtonClick = () => {
        this.props.history.push("/pools/ETH/undefined", );
    }
    addLiquidityDialog = (id, pool) => {
        if(pool.platform.toLowerCase() === 'uniswap-v2') {
            const currencyA = pool.assets[0].symbol.toUpperCase() === 'ETH' ? 'ETH' : pool.assets[0].address;
            const currencyB = pool.assets[1].address
            this.props.history.push(`/pools/${currencyA}/${currencyB}`)
        } else {
            this.props.setSelectedPool(pool);
            this.props.history.push(`/pools/ETH/`)
        }
    }
    render() {
        return (
            <>
                <Row>
                    <Col span={12} md={4}>
                        <ValueCard className={'gutter-b'} title={'Total Assets'} value={this.props.overview.deposits.total + this.props.overview.wallet.total}/>
                    </Col>
                    <Col span={12} md={4}>
                        <ValueCard className={'gutter-b'} title={'Total Debt'} value={this.props.overview.debts.total}/>
                    </Col>
                    <Col span={12} md={4}>
                        <ValueCard className={'gutter-b'} title={'Net Worth'} value={this.props.overview.deposits.total + this.props.overview.wallet.total - this.props.overview.debts.total}/>
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        <PoolsUIProvider poolsUIEvents={{
                            investButtonClick: this.investButtonClick,
                            addLiquidityDialog: this.addLiquidityDialog,
                        }}>
                            <PoolsCard />
                        </PoolsUIProvider>
                    </Col>
                </Row>
                <Switch>
                    <Route path={'/pools/:currencyIdA/:currencyIdB'} exact component={UniswapLiquidityModal}/>
                    <Route path={'/pools/ETH'} exact component={AddLiquidityModal}/>
                </Switch>
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

const mapDispatchToProps = dispatch => {
    return {
        setSelectedPool: (pool) => dispatch(actions.selectPool(pool))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Pools);