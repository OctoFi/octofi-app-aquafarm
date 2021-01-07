import React from 'react';
import { Button , Row, Col } from 'react-bootstrap';
import { useDispatch } from "react-redux";
import {changeGasPrice} from "../../state/currency/actions";

const GasPrice = props => {
    const dispatch = useDispatch();
    const changeSelectedGas = (gas) => {
        dispatch(changeGasPrice(gas))
    }
    return (
        <Row className={'d-flex align-items-center justify-content-between px-4 pb-3'}>
            {Array.isArray(props.gasList) && props.gasList.map((item) => {
                const [gas, value] = item;
                return (
                    <Col xs={3}>
                        <Button onClick={() => changeSelectedGas(gas)} key={gas} variant={gas === props.selected ? "light-primary" : 'outline-primary'} className={'w-100 mb-3 d-flex flex-column justify-content-center align-items-center py-4 px-4'}>
                            <span className={'font-weight-bolder font-size-lg'}>
                                {gas}
                            </span>
                            <span className="opacity-70 font-size-sm">
                                ({Number.parseInt(value)} Gwei)
                            </span>
                        </Button>
                    </Col>
                )
            })}
        </Row>
    )
}

export default GasPrice;