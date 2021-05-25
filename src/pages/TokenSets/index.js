import styled from "styled-components";
import { Row, Col, Tab, Nav } from "react-bootstrap";

import Page from "../../components/Page";
import { ResponsiveCard } from "../../components/Card";
import { useState } from "react";
import TokenSetTab from "./TokenSetTab";
import { useTranslation } from "react-i18next";

const Card = styled(ResponsiveCard)`
	& > .card-body {
		padding: 40px 30px 34px;
	}
`;

const HeaderCol = styled(Col)`
	margin: -10px 0 0;
`;

const CustomNavLink = styled(Nav.Link)`
	border-radius: 18px !important;
	color: ${({ theme }) => theme.primary};
	background-color: ${({ theme }) => theme.primaryLight};
	white-space: nowrap;
	padding: 14px 24px;
	min-height: 56px;
	font-weight: 500;
	display: flex;
	align-items: center;
	justify-content: center;

	@media (max-width: 767px) {
		padding: 6px 15px;
		font-size: 1rem;
		min-height: 32px;
		border-radius: 12px !important;
	}

	&:hover {
		color: ${({ theme }) => theme.primary};
	}

	&.active {
		color: ${({ theme }) => theme.text1};
		background-color: ${({ theme }) => theme.primary};
	}
`;

const CustomNav = styled(Nav)`
	margin-left: -30px !important;
	margin-right: -30px !important;
	overflow: auto;

	@media (min-width: 768px) {
		margin-left: -10px !important;
		margin-right: -10px !important;
	}
`;

const CustomNavItem = styled(Nav.Item)`
	flex-grow: initial !important;

	padding: 0 10px 10px;

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

const StyledCard = styled(Card)`
	margin-top: 40px;

	@media (max-width: 767px) {
		margin-top: 20px;
	}
`;

const TokenSets = (props) => {
	const [activeKey, setActiveKey] = useState("portfolios");
	const { t } = useTranslation();

	return (
		<Page>
			<StyledCard>
				<Tab.Container defaultActiveKey={"portfolios"} onSelect={(k) => setActiveKey(k)}>
					<Row>
						<HeaderCol
							xs={12}
							className={
								"d-flex flex-column-reverse flex-lg-row align-items-stretch align-items-lg-start justify-content-start justify-content-lg-between"
							}
						>
							<CustomNav
								fill
								variant="pills"
								className={"d-flex flex-row align-items-center flex-nowrap"}
							>
								<CustomNavItem>
									<CustomNavLink eventKey="portfolios">{t("tokensets.portfolios")}</CustomNavLink>
								</CustomNavItem>
								<CustomNavItem>
									<CustomNavLink eventKey="rebalancing_sets">
										{t("tokensets.rebalancingSets")}
									</CustomNavLink>
								</CustomNavItem>
							</CustomNav>
						</HeaderCol>

						<Col xs={12}>
							<Tab.Content className={"bg-transparent"}>
								<Tab.Pane eventKey="portfolios">
									<TokenSetTab tabKey={"portfolios"} active={activeKey === "portfolios"} />
								</Tab.Pane>
								<Tab.Pane eventKey="rebalancing_sets">
									<TokenSetTab
										tabKey={"rebalancing_sets"}
										active={activeKey === "rebalancing_sets"}
									/>
								</Tab.Pane>
							</Tab.Content>
						</Col>
					</Row>
				</Tab.Container>
			</StyledCard>
		</Page>
	);
};

export default TokenSets;
