import React, { Component } from 'react';
import {Col, Row, Nav, Tab} from "react-bootstrap";
import { connect } from 'react-redux';

import ValueCard from "../../components/ValueCard";
import CustomCard, { CustomHeader } from "../../components/CustomCard";
import TokenSet from "../../http/tokenSet";

class Invest extends Component {
    constructor(props) {
        super(props);

        this.tokenSetApi = new TokenSet(process.env.REACT_APP_TOKEN_SET_BASE_URL);

        this.state = {
            loading: true,
            rebalances: {

            },
            error: false,
            types: ['funds', 'trading_pool', '']
        }
    }

    async componentDidMount() {
        this.fetchRebalances();
    }

    fetchRebalances = () => {
        this.tokenSetApi.fetchAllSets()
            .then(response => {
                console.log(response);
            })
            .catch(error => {
                console.log(error);
            })
    }

    render() {
        return (
            <>
                <Row>
                    <Col xs={12} md={4}>
                        <ValueCard className={'gutter-b'} title={'Total Assets'} value={this.props.overview.deposits.total + this.props.overview.wallet.total}/>
                    </Col>
                    <Col xs={12} md={4}>
                        <ValueCard className={'gutter-b'} title={'Total Debt'} value={this.props.overview.debts.total}/>
                    </Col>
                    <Col xs={12} md={4}>
                        <ValueCard className={'gutter-b'} title={'Net Worth'} value={this.props.overview.deposits.total + this.props.overview.wallet.total - this.props.overview.debts.total}/>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <CustomCard>
                            <Tab.Container id="token-sets" defaultActiveKey="portfolios">
                                <CustomHeader className={'card-header'}>
                                    <div className="card-title font-size-sm font-weight-normal w-100">
                                        <Nav variant="pills" fill className={'w-100'} >
                                            <Nav.Item>
                                                <Nav.Link eventKey="portfolios">Portfolios</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="socialTradingSets">Social Trading Sets</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="roboSets">Robo Sets</Nav.Link>
                                            </Nav.Item>
                                            <Nav.Item>
                                                <Nav.Link eventKey="traders">Traders</Nav.Link>
                                            </Nav.Item>
                                        </Nav>
                                    </div>
                                </CustomHeader>
                                <div className="card-body">
                                    <Tab.Content style={{ backgroundColor: 'transparent' }}>
                                        <Tab.Pane eventKey="portfolios">
                                            portfolios
                                        </Tab.Pane>
                                        <Tab.Pane eventKey="socialTradingSets">
                                            socialTradingSets
                                        </Tab.Pane>
                                        <Tab.Pane eventKey="roboSets">
                                            roboSets
                                        </Tab.Pane>
                                        <Tab.Pane eventKey="traders">
                                            traders
                                        </Tab.Pane>
                                    </Tab.Content>
                                </div>
                            </Tab.Container>
                        </CustomCard>

                    </Col>
                </Row>
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


export default connect(mapStateToProps)(Invest);