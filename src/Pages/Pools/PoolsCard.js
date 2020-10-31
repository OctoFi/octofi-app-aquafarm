import React, { Component } from "react";
import styled from 'styled-components';

import CustomCard from "../../components/CustomCard";
import {Nav, Tab} from "react-bootstrap";
import PoolsTab from "./PoolsTab";


const CustomTitle = styled.span`
  font-weight: bolder;
  color: ${({ theme }) => theme.text1}
`

export class PoolsCard extends Component {
    render() {
        return (
            <CustomCard className={`gutter-b`}>
                {/* begin::Header */}
                <div className="card-header border-0 py-5">
                    <h3 className="card-title align-items-start flex-column">
                        <CustomTitle>
                            Explore Opportunities
                        </CustomTitle>
                        <span className="text-muted mt-3 font-weight-bold font-size-sm">
                        Add liquidity to earn fees, incentives, voting rights, etc.
                    </span>
                    </h3>
                    <div className="card-toolbar">
                        <button
                            type={'button'}
                            className="btn btn-success font-weight-bolder font-size-lg px-9 py-3"
                            onClick={this.props.investHandler}
                        >
                            Invest
                        </button>
                    </div>
                </div>
                {/* end::Header */}

                {/*begin::body*/}
                <div className="card-body pt-4">

                    <Tab.Container defaultActiveKey={'Uniswap'}>
                        <div className="d-flex align-items-center">
                            <Nav fill variant="pills" className="flex-row w-100 card-title font-weight-normal font-size-base d-flex" >
                                <Nav.Item className={'flex-grow-1'}>
                                    <Nav.Link eventKey="Uniswap">Uniswap</Nav.Link>
                                </Nav.Item>
                                <Nav.Item className={'flex-grow-1'}>
                                    <Nav.Link eventKey="Balancer">Balancer</Nav.Link>
                                </Nav.Item>
                                <Nav.Item className={'flex-grow-1'}>
                                    <Nav.Link eventKey="Curve">Curve</Nav.Link>
                                </Nav.Item>
                                <Nav.Item className={'flex-grow-1'}>
                                    <Nav.Link eventKey="Yearn">yEarn</Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </div>

                        <Tab.Content className={'bg-transparent'}>
                            <Tab.Pane eventKey="Uniswap">
                                <PoolsTab type={'Uniswap'} addLiquidityHandler={this.props.addLiquidityHandler}/>
                            </Tab.Pane>
                            <Tab.Pane eventKey="Balancer">
                                <PoolsTab type={'Balancer'} addLiquidityHandler={this.props.addLiquidityHandler}/>
                            </Tab.Pane>
                            <Tab.Pane eventKey="Curve">
                                <PoolsTab type={'Curve'} addLiquidityHandler={this.props.addLiquidityHandler}/>
                            </Tab.Pane>
                            <Tab.Pane eventKey="Yearn">
                                <PoolsTab type={'Yearn'} addLiquidityHandler={this.props.addLiquidityHandler}/>
                            </Tab.Pane>
                        </Tab.Content>

                    </Tab.Container>
                </div>
                {/*end::body*/}
            </CustomCard>
        );
    }
}

