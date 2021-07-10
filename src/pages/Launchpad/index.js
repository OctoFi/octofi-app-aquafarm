import {Row, Col, Tab, Nav} from 'react-bootstrap';
import styled from "styled-components";
import React, { useState} from "react";
import { Link } from "react-router-dom";
import SVG from "react-inlinesvg";

import Page from '../../components/Page';
import Card from '../../components/Card';
import { InputGroupText, InputGroup, InputGroupFormControl, InputGroupAppend } from "../../components/Form";
import SearchIcon from "../../assets/images/search.svg";
import Upcoming from '../../assets/images/launchpad/upcoming.svg'
import Live from '../../assets/images/launchpad/live.svg'
import Failed from '../../assets/images/launchpad/failed.svg'
import Success from '../../assets/images/launchpad/success.svg'
import {useTranslation} from "react-i18next";
import PresaleTab from "./PresaleTab";
import {
    usePresales,
} from "../../hooks/usePresale";


const StyledCard = styled(Card)`
  padding: 20px;
  
  @media(max-width: 767px) {
    padding: 0;
  }
`

const FormControl = styled(InputGroupFormControl)`
  border: none !important;
  padding-left: 20px;
  padding-right: 12px;
`

const GroupText = styled(InputGroupText)`
  border: none !important;
  color: ${({ theme }) => theme.text4};
`

const Title = styled.h2`
  line-height: 1.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text1};
  margin-top: 0;
  margin-bottom: 1.5rem;
`

const CreateNew = styled(Link)`
  height: 2rem;
  max-height: 2rem;
  min-height: 2rem;
  min-width: 116px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.primaryLight};
  color: ${({ theme }) => theme.primary};
  border-radius: 12px;
  text-decoration: none;
  outline: none;
  padding: 5px 16px;
  font-size: .875rem;
  font-weight: 400;
  transition: 0.4s ease all;
  will-change: background-color, color;
  
  &:hover {
    background-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.bg1};
  }
  
  
  &:hover,
  &:focus,
  &:active {
    text-decoration: none;
    outline: none;
    box-shadow: none;
  }
`


const CustomNav = styled(Nav)`
	margin-bottom: 12px;
	min-width: 100%;
	overflow: auto;
	margin-left: -30px !important;
	margin-right: -30px !important;

	@media (min-width: 768px) {
		margin-left: 0 !important;
		margin-right: 0 !important;
	}
`;

const CustomNavItem = styled(Nav.Item)`
	padding: 0 5px 10px;

	@media (max-width: 767px) {
		padding: 0 5px 10px;
	}

	&:first-child {
		@media (max-width: 767px) {
			padding-left: 30px;
		}
	}
	&:last-child {
		@media (max-width: 767px) {
			padding-right: 30px;
		}
	}
`;

const CustomNavTitle = styled.span`
  font-size: .875rem;
  color: ${({ theme }) => theme.text1};
  font-weight: 400;
  margin-top: 1rem;
  display: block;
  
  @media (max-width: 767px) {
    font-size: 0.75rem;
  }
`


const CustomNavLink = styled(Nav.Link)`
	color: ${({ theme }) => theme.text1};
	background-color: transparent;
	padding: 12px 12px;
	min-height: 56px;
    font-size: .875rem;
	display: flex;
    flex-direction: column;
	align-items: center;
	justify-content: center;
    transition: 0.3s ease all;

	@media (max-width: 767px) {
		padding: 6px 8px;
		font-size: 0.75rem;
	}

	&:hover {
		color: ${({ theme }) => theme.success};
      
          & ${SVG} {
            opacity: 1;
          }
	}
  
    & ${SVG} {
      opacity: 0.5;
    }

	&.active {
		color: ${({ theme }) => theme.success} !important;
		background-color: transparent !important;
      
        & ${SVG} {
          opacity: 1;
        }
	}
`;

const Description = styled.p`
  margin-top: 0;
  margin-bottom: 57px;
  font-weight: 400;
  font-size: 0.875rem;
  line-height: 17px;
  color: ${({ theme }) => theme.text1};
`


const Launchpad = props => {
    const [query, setQuery] = useState('');
    const { t } = useTranslation()
    const presales = usePresales()

    return (
        <Page title={false} networkSensitive={true}>
            <Row>
                <Col xs={{ span: 12, offset: 0 }} md={{ span: 6, offset: 3 }}>
                    <StyledCard>
                        <Row>
                            <Col xs={12}>
                                <Title>{t("launchpad.title")}</Title>
                            </Col>
                            <Col xs={12} className={'d-flex align-items-stretch flex-column mb-3'}>
                                <div className="align-self-end mb-3">
                                    <CreateNew to={'/launchpad/new'}>{t("launchpad.createNew")}</CreateNew>
                                </div>
                                <InputGroup bg={"darker"}>
                                    <FormControl
                                        id={'launchpad-search'}
                                        value={query}
                                        onChange={e => setQuery(e.target.value)}
                                        placeholder={t("launchpad.searchPlaceholder")}

                                    />
                                    <InputGroupAppend>
                                        <GroupText >
                                            <SVG src={SearchIcon} />
                                        </GroupText>
                                    </InputGroupAppend>
                                </InputGroup>
                            </Col>
                            <Col xs={12}>
                                <Tab.Container defaultActiveKey={'upcoming'}>
                                    <Row>
                                        <Col xs={12}>
                                            <CustomNav
                                                fill
                                                variant="pills"
                                                className={"d-flex flex-row align-items-center flex-nowrap"}
                                            >
                                                <CustomNavItem className={"flex-grow-1"}>
                                                    <CustomNavLink eventKey="upcoming">
                                                        <SVG src={Upcoming} width={24} height={24}/>
                                                        <CustomNavTitle>Upcoming</CustomNavTitle>
                                                    </CustomNavLink>
                                                </CustomNavItem>
                                                <CustomNavItem className={"flex-grow-1"}>
                                                    <CustomNavLink eventKey="live">
                                                        <SVG src={Live} width={24} height={24}/>
                                                        <CustomNavTitle>Live</CustomNavTitle>
                                                    </CustomNavLink>
                                                </CustomNavItem>
                                                <CustomNavItem className={"flex-grow-1"}>
                                                    <CustomNavLink eventKey="success">
                                                        <SVG src={Success} width={24} height={24}/>
                                                        <CustomNavTitle>Success</CustomNavTitle>
                                                    </CustomNavLink>
                                                </CustomNavItem>
                                                <CustomNavItem className={"flex-grow-1"}>
                                                    <CustomNavLink eventKey="failed">
                                                        <SVG src={Failed} width={24} height={24}/>
                                                        <CustomNavTitle>Failed</CustomNavTitle>
                                                    </CustomNavLink>
                                                </CustomNavItem>
                                            </CustomNav>
                                        </Col>
                                        <Col xs={12}>
                                            <Description>{t("launchpad.blockNumberWarning")}</Description>
                                        </Col>
                                        <Col xs={12}>

                                            <Tab.Content className={"bg-transparent"}>
                                                <Tab.Pane eventKey="upcoming">
                                                    <PresaleTab
                                                        state={0}
                                                        presales={presales}
                                                        query={query}
                                                    />
                                                </Tab.Pane>
                                                <Tab.Pane eventKey="live">
                                                    <PresaleTab
                                                        state={1}
                                                        presales={presales}
                                                        query={query}
                                                    />
                                                </Tab.Pane>
                                                <Tab.Pane eventKey="success">
                                                    <PresaleTab
                                                        state={2}
                                                        presales={presales}
                                                        query={query}
                                                    />
                                                </Tab.Pane>
                                                <Tab.Pane eventKey="failed">
                                                    <PresaleTab
                                                        state={3}
                                                        presales={presales}
                                                        query={query}
                                                    />
                                                </Tab.Pane>
                                            </Tab.Content>
                                        </Col>
                                    </Row>
                                </Tab.Container>
                            </Col>
                        </Row>
                    </StyledCard>
                </Col>
            </Row>
        </Page>
    )
}

export default Launchpad;