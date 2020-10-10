import React from 'react';
import ValueCard from "../../components/ValueCard";
import { Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import { AppState } from "../../state";

const OpenSea = () => {
    const overview = useSelector((state: AppState) => state.balances.overview)

    return (
        <>
            <Row>
                <Col xs={12} md={4}>
                    <ValueCard className={'gutter-b'} title={'Total Assets'} value={overview.deposits.total + overview.wallet.total}/>
                </Col>
                <Col xs={12} md={4}>
                    <ValueCard className={'gutter-b'} title={'Total Debt'} value={overview.debts.total}/>
                </Col>
                <Col xs={12} md={4}>
                    <ValueCard className={'gutter-b'} title={'Net Worth'} value={overview.deposits.total + overview.wallet.total - overview.debts.total}/>
                </Col>
            </Row>
        </>
    )
}

export default OpenSea;