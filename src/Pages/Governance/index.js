import React, {useEffect, useState, useContext} from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import {useDispatch, useSelector} from "react-redux";
import { ThemeContext } from 'styled-components';
import _ from 'lodash';

import CustomCard, { CustomHeader, CustomTitle } from "../../components/CustomCard";
import SpaceCard from "../../components/SpaceCard";
import {fetchSpaces} from "../../state/governance/actions";
import {CircularProgress} from "@material-ui/core";
import {useIsDarkMode} from "../../state/user/hooks";

const Governance = (props) => {
    const dispatch = useDispatch();
    const [search, setSearch] = useState('')
    const {loading, spaces} = useSelector(state => state.governance);
    const [transformedSpaces, setTransformedSpaces] = useState([]);
    const darkMode = useIsDarkMode();
    const theme = useContext(ThemeContext);

    useEffect(() => {
        dispatch(fetchSpaces());
    }, [dispatch])

    useEffect(() => {
        const pinnedSpaces = process.env.REACT_APP_GOVERNANCE_PINNED.split(',').map(space => space.trim());
        const list = Object.keys(spaces).map(key => {
            return {
                ...spaces[key],
                pinned: !!pinnedSpaces.includes(key),
                key
            };
        });
        const newSpaces = _.orderBy(list, ['pinned'], ['desc']).filter(
            space =>
                JSON.stringify(space)
                    .toLowerCase()
                    .includes(search.toLowerCase())
        );
        setTransformedSpaces(newSpaces);
    }, [search, spaces])

    const searchHandler = (e) => {
        setSearch(e.target.value);
    }

    const breadCrumbs = [{
        pathname: props.match.url,
        title: 'Governance'
    }];

    return (
        <>
            <Row data-breadcrumbs={JSON.stringify(breadCrumbs)} data-title={'Governance'}>
                <Col xs={12}>
                    <CustomCard>
                        <CustomHeader className="card-header d-flex flex-row align-items-center justify-content-between">
                            <CustomTitle className="card-title">Spaces</CustomTitle>
                            <div>
                                <Form.Control placeholder={'Search'} onChange={searchHandler}
                                    style={darkMode ? {
                                        backgroundColor: theme.bg2,
                                        borderColor: theme.bg4,
                                        color: theme.text1,
                                    } : {}}
                                />
                            </div>
                        </CustomHeader>
                        <div className="card-body">
                            {loading ? (
                                <div className="d-flex align-items-center justify-content-center py-6 w-100">
                                    <CircularProgress color={'primary'} style={{ width: 40, height: 40 }}/>
                                </div>
                            ) : (
                                <Row>
                                    {transformedSpaces.map(space => {
                                        return (
                                            <Col
                                                className={'d-flex'}
                                                xl={3} lg={4} md={6} xs={12}>
                                                <SpaceCard
                                                    symbolIndex={'space'}
                                                    id={space.key}
                                                    name={space.name}
                                                    symbol={space.symbol}
                                                    pinned={space.pinned}
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