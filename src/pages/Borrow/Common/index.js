import { Col, Nav, Row, Tab } from "react-bootstrap";
import styled from "styled-components";

import { ResponsiveCard } from "../../../components/Card";
import React, { useEffect } from "react";
import { GET_AAVE_RESERVES } from "../../../services/aave/gql";
import { useQuery } from "@apollo/client";
import { getAaveGraphClient } from "../../../services/aave/aave";
import { useDispatch, useSelector } from "react-redux";
import { useActiveWeb3React } from "../../../hooks";
import { getAaveLoadingState } from "../../../state/selectors";
import { fetchAave, initAave, setAaveReservesGQLResponse } from "../../../state/aave/actions";
import { AaveLoadingState } from "../../../utils/aave/types";
import useInterval from "../../../hooks/useInterval";
import LendingBalance from "../LendingBalance";
import BorrowBalance from "../BorrowBalance";
import { useTranslation } from "react-i18next";

const HeaderCol = styled(Col)`
	margin: -10px 0 20px;

	@media (min-width: 768px) {
		margin-bottom: 25px;
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

const BorrowCommon = (props) => {
	const { account } = useActiveWeb3React();
	const { loading, error, data } = useQuery(GET_AAVE_RESERVES, {
		client: getAaveGraphClient(),
		pollInterval: 1000,
	});
	const dispatch = useDispatch();
	const aaveLoadingState = useSelector(getAaveLoadingState);
	const { t } = useTranslation();

	useEffect(() => {
		if (!loading && !error && data) {
			dispatch(setAaveReservesGQLResponse(data.reserves));
			if (aaveLoadingState === AaveLoadingState.NotLoaded) {
				dispatch(initAave(account));
			} else {
				dispatch(fetchAave(account));
			}
		}
	}, [loading, data, account]);

	// Update Aaave state each 60 seconds
	useInterval(async () => {
		if (account && data && !loading && !error) {
			dispatch(fetchAave(account));
		}
	}, 60 * 1000);

	return (
		<ResponsiveCard>
			<Tab.Container defaultActiveKey="deposit">
				<Row>
					<HeaderCol
						xs={12}
						className={
							"d-flex flex-column-reverse flex-lg-row align-items-stretch align-items-lg-start justify-content-start justify-content-lg-between"
						}
					>
						<CustomNav fill variant="pills" className={"d-flex flex-row align-items-center flex-nowrap"}>
							<CustomNavItem>
								<CustomNavLink eventKey="deposit">{t("deposit")}</CustomNavLink>
							</CustomNavItem>
							<CustomNavItem>
								<CustomNavLink eventKey="borrow">{t("borrow.title")}</CustomNavLink>
							</CustomNavItem>
						</CustomNav>
					</HeaderCol>

					<Col xs={12}>
						<Tab.Content className={"bg-transparent"}>
							<Tab.Pane eventKey="deposit">
								<LendingBalance />
							</Tab.Pane>
							<Tab.Pane eventKey="borrow">
								<BorrowBalance />
							</Tab.Pane>
						</Tab.Content>
					</Col>
				</Row>
			</Tab.Container>
		</ResponsiveCard>
	);
};

export default BorrowCommon;
