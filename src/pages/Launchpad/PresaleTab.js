import { Row, Col } from 'react-bootstrap';
import {useTranslation} from "react-i18next";
import styled from "styled-components";

import Dropdown from "../../components/UI/Dropdown";
import LaunchpadCard from "../../components/LaunchpadCard";
import {useMemo} from "react";

const PresaleCount = styled.div`
  font-weight: bold;
  font-size: 1.25rem;
  line-height: 1.5rem;
  color: ${({ theme }) => theme.text1};
`

const NoPresale = styled.span`
  font-size: 0.875rem;
  font-weight: 400;
  padding: 2rem 0 1rem;
  display: block;
`

const PresaleTab = ({ query, state, presales}) => {
    const { t } = useTranslation();

    const filteredPresales = useMemo(() => {
        if(!presales) {
            return []
        }
        const stateFiltered = presales.filter(item => item.state === state);
        if(query === '' || !query) {
            return stateFiltered;
        }
        return presales.filter(item => JSON.stringify(item).indexOf(query) > -1);
    }, [query, state, presales])

    return (
        <Row>
            <Col xs={12} className={'d-flex align-items-center justify-content-between mb-3'}>
                <PresaleCount>{filteredPresales.length} Presale</PresaleCount>
            </Col>
            <Col xs={12} className={'d-flex align-items-stretch flex-column'}>
                {filteredPresales.length === 0 ? (
                    <NoPresale>{t('launchpad.noPresale')}</NoPresale>
                ) : filteredPresales.map((item, _i) => {
                    return (
                        <LaunchpadCard
                            address={item?.contractAddress}
                            presale={item}
                            key={item?.contractAddress || `presale-${state}-${_i}`}
                        />
                    )
                })}
            </Col>
        </Row>
    )
}

export default PresaleTab;