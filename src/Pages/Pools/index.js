import React, { Component } from 'react';
import { connect } from "react-redux";
import { Row, Col } from 'react-bootstrap';
import { Route, Switch } from 'react-router-dom';

import PoolsCard from "./PoolsCard";
import AddLiquidityModal from "../../components/AddLiquidityModal";
import RemoveLiquidityModal from "../../components/RemoveLiquidityModal";
import UniswapLiquidityModal from '../../components/AddLiquidityModal/uniswap';
import * as actions from '../../state/pools/actions';
import ValueCard from "../../components/ValueCard";

class Pools extends Component {
    investButtonClick = () => {
        this.props.history.push("/pools/ETH/undefined");
    }
    addLiquidityDialog = (type, pool) => {
        if(type === 'Uniswap') {
            const currencyA = pool.token0.symbol.toUpperCase() === 'ETH' ? 'ETH' : pool.token0.id;
            const currencyB = pool.token1.id
            this.props.history.push(`/pools/${currencyA}/${currencyB}`)
        } else {
            this.props.setSelectedPool(type, pool);
            this.props.history.push(`/pools/ETH/`)
        }
    }
    removeLiquidityDialog = (type, pool) => {
        this.props.setSelectedPool(type, pool);
        this.props.history.push(`/pools/remove/ETH/`)
    }
    render() {

        const breadCrumbs = [{
            pathname: this.props.match.url,
            title: 'Pools'
        }];
        return (
            <>
                <Row data-breadcrumbs={JSON.stringify(breadCrumbs)} data-title={'Pools'}>
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
                        <PoolsCard investHandler={this.investButtonClick} addLiquidityHandler={this.addLiquidityDialog} removeLiquidityHandler={this.removeLiquidityDialog}/>
                    </Col>
                </Row>
                <Switch>
                    <Route path={'/pools/remove/ETH'} exact component={RemoveLiquidityModal}/>
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
        setSelectedPool: (type, pool) => dispatch(actions.selectPool(type, pool))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Pools);