import React, {useEffect, useState} from 'react';
import {Row, Col } from 'react-bootstrap';
import {useDispatch, useSelector} from "react-redux";
import styled from 'styled-components';
import _ from 'lodash';

import SpaceCard from "../../components/SpaceCard";
import {fetchSpaces} from "../../state/governance/actions";
import Page from "../../components/Page";
import SearchIcon from "../../assets/images/search.svg";
import {useTranslation} from "react-i18next";
import SVG from "react-inlinesvg";
import { InputGroupText, InputGroup, InputGroupPrepend, InputGroupFormControl as FormControl } from "../../components/Form";

const PageTitle = styled.h2`
  color: ${({ theme }) => theme.text1};
  font-weight: 700;
  font-size: 1.25rem;
  margin: -20px 0 45px;
  
  
  @media (max-width: 991px) {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.text3};
    margin: -10px 0 20px;
    
  }
`

const StyledInputGroup = styled(InputGroup)`
  margin: -148px 0 45px;
  
  
  @media (max-width: 991px) {
    margin: 0 0 20px;
    
  }
`

const Governance = (props) => {
    const dispatch = useDispatch();
    const [search, setSearch] = useState('')
    const {loading, spaces} = useSelector(state => state.governance);
    const [transformedSpaces, setTransformedSpaces] = useState([]);
    const { t } = useTranslation();

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


    return (
        <Page title={t('governance.title')}>
            <Row>
                <Col xs={12} className={'d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center justify-content-between'}>
                    <PageTitle className="card-title">{t('governance.spaces')}</PageTitle>
                    <StyledInputGroup className={'w-auto'}>
                        <InputGroupPrepend>
                            <InputGroupText>
                                <SVG src={SearchIcon}/>
                            </InputGroupText>
                        </InputGroupPrepend>
                        <FormControl id="inlineFormInputGroup" placeholder={t('search')} onChange={searchHandler} />
                    </StyledInputGroup>
                </Col>
                <Col xs={12}>
                    {loading ? (
                        <Row className={'custom-row'}>
                            {[...Array(12)].map((value, i) => {
                                return (
                                    <Col
                                        key={`loading-${i}`}
                                        className={'d-flex'}
                                        xl={3} lg={4} md={6} xs={6}>
                                        <SpaceCard
                                            symbolIndex={'space'}
                                            id={`loading-${i}`}
                                            name={`loading-${i}`}
                                            symbol={`loading-${i}`}
                                            pinned={false}
                                            loading={true}
                                        />
                                    </Col>
                                )
                            })}
                        </Row>
                    ) : (
                        <Row className={'custom-row'}>
                            {transformedSpaces.map((space, i) => {
                                return (
                                    <Col
                                        key={`space-${i}`}
                                        className={'d-flex'}
                                        xl={3} lg={4} md={6} xs={6}>
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
                </Col>
            </Row>
        </Page>
    )
}

export default Governance;