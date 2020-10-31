import React, {useEffect} from 'react';
import { Row, Col } from 'react-bootstrap';
import {useDispatch, useSelector} from "react-redux";

import CustomCard, { CustomHeader, CustomTitle } from "../../components/CustomCard";
import SpaceCard from "../../components/SpaceCard";
import {fetchSpaces} from "../../state/governance/actions";
import {CircularProgress} from "@material-ui/core";

const Governance = () => {
    const dispatch = useDispatch();
    const {loading, spaces} = useSelector(state => state.governance);

    useEffect(() => {
        dispatch(fetchSpaces());
    }, [dispatch])

    return (
        <>
            <Row>
                <Col xs={12}>
                    <CustomCard>
                        <CustomHeader className="card-header">
                            <CustomTitle className="card-title">Spaces</CustomTitle>
                        </CustomHeader>
                        <div className="card-body">
                            {loading ? (
                                <div className="d-flex align-items-center justify-content-center py-6 w-100">
                                    <CircularProgress color={'primary'} style={{ width: 40, height: 40 }}/>
                                </div>
                            ) : (
                                <Row>
                                    {Object.keys(spaces).map(key => {
                                        let space = spaces[key];
                                        return (
                                            <Col
                                                className={'d-flex'}
                                                xl={3} lg={4} md={6} xs={12}>
                                                <SpaceCard
                                                    symbolIndex={'space'}
                                                    id={key}
                                                    name={space.name}
                                                    symbol={space.symbol}
                                                />
                                            </Col>
                                        )
                                    })}

                                </Row>
                            )}
                        </div>
                    </CustomCard>
                </Col>
            </Row>
        </>
    )
}

export default Governance;