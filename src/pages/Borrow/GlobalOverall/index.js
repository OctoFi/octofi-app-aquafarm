import { BigNumber } from "@0x/utils";
import { useDispatch, useSelector } from "react-redux";

import "./styles.scss";
import { useActiveWeb3React } from "../../../hooks";
import { getAaveCurrency, getAaveUserAccountData, getEthInUsd } from "../../../state/selectors";
import { getAaveOverall } from "../../../services/aave/aave";
import { setAaveUserAccountData } from "../../../state/aave/actions";
import React, { useEffect } from "react";
import useInterval from "../../../hooks/useInterval";
import Card from "../../../components/Card";
import BootstrapTable from "react-bootstrap-table-next";
import ResponsiveTable from "../../../components/ResponsiveTable";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

const StyledCard = styled(Card)`
	display: flex;
	flex-direction: column;
	align-items: stretch;

	& .card-body {
		padding: 24px 20px 20px;
	}

	@media (min-width: 1400px) {
		& .card-body {
			padding: 24px;
		}
	}
`;

const Text = styled.span`
	color: ${({ theme, variant }) => (variant ? theme[variant] : theme.text1)};
	font-size: 1rem;
	font-weight: 700;
`;

const GlobalOverall = (props) => {
	const { account } = useActiveWeb3React();
	const currencySelector = useSelector(getAaveCurrency);
	const isNative = currencySelector === "NATIVE";
	const dispatch = useDispatch();
	const userAccountData = useSelector(getAaveUserAccountData);
	const ethUsd = useSelector(getEthInUsd);
	const { t } = useTranslation();

	const fetchAaveGlobal = async () => {
		const userAcc = await getAaveOverall(account);
		dispatch(setAaveUserAccountData(userAcc));
	};

	// initial loading
	useEffect(() => {
		const loadingLendingPoolData = async () => {
			if (account) {
				await fetchAaveGlobal();
			}
		};

		loadingLendingPoolData();
	}, [account]);

	// Update global state
	useInterval(async () => {
		if (account) {
			await fetchAaveGlobal();
		}
	}, 30 * 1000);

	const formatETHField = (field = undefined) => {
		if (field) {
			return isNative
				? `${field.dividedBy("1e18").toFixed(3)} ETH`
				: ethUsd
				? `${field.dividedBy("1e18").multipliedBy(ethUsd).toFixed(3)} USD`
				: "- USD";
		} else {
			return "-";
		}
	};

	const totalLiquidity = formatETHField(userAccountData && userAccountData.totalLiquidity);
	const totalCollateralETH = formatETHField(userAccountData && userAccountData.totalCollateralETH);
	const totalBorrowsETH = formatETHField(userAccountData && userAccountData.totalBorrowsETH);
	const availableBorrowsETH = formatETHField(userAccountData && userAccountData.availableBorrowsETH);
	const currentLiquidationThreshold =
		(userAccountData && `${userAccountData.currentLiquidationThreshold.toFixed(0)} %`) || "-";
	const ltv = (userAccountData && `${userAccountData.ltv.toFixed(0)} %`) || "-";
	let healthFactor = "-";
	let healtFactorValue;
	// const healthFactor = (userAccountData && userAccountData.healthFactor.toFixed(3)) || '-';;
	if (userAccountData && userAccountData.totalBorrowsETH.gt(0)) {
		healthFactor = userAccountData && userAccountData.healthFactor.dividedBy("1e18").toFixed(3);
		healtFactorValue = new BigNumber(healthFactor);
	}

	const columns = [
		{
			dataField: "total_liquidity",
			text: t("borrow.totalLiquidity"),
			formatter: (cellContent, row, rowIndex) => {
				return <Text>{row.totalLiquidity}</Text>;
			},
		},
		{
			dataField: "total_collateral",
			text: t("borrow.totalCollateral"),
			formatter: (cellContent, row, rowIndex) => {
				return <Text>{row.totalCollateralETH}</Text>;
			},
		},
		{
			dataField: "total_borrows",
			text: t("borrow.totalBorrows"),
			formatter: (cellContent, row, rowIndex) => {
				return <Text>{row.totalBorrowsETH}</Text>;
			},
		},
		{
			dataField: "available",
			text: t("borrow.available"),
			formatter: (cellContent, row, rowIndex) => {
				return <Text>{row.availableBorrowsETH}</Text>;
			},
		},
		{
			dataField: "liquidation_threshold",
			text: t("borrow.liquidationThreshold"),
			formatter: (cellContent, row, rowIndex) => {
				return <Text>{row.currentLiquidationThreshold}</Text>;
			},
		},
		{
			dataField: "ltv",
			text: "LTV",
			formatter: (cellContent, row, rowIndex) => {
				return <Text>{row.ltv}</Text>;
			},
		},
		{
			dataField: "health_factor",
			text: t("borrow.healthFactor"),
			formatter: (cellContent, row, rowIndex) => {
				return <Text>{row.healthFactor}</Text>;
			},
		},
	];

	return (
		<StyledCard>
			<BootstrapTable
				wrapperClasses="d-none d-lg-block"
				bordered={false}
				classes="table table-head-custom table-borderless table-vertical-center overflow-hidden global-overall__table mb-0"
				bootstrap4
				keyField={"id"}
				remote
				data={[
					{
						totalLiquidity,
						totalCollateralETH,
						totalBorrowsETH,
						availableBorrowsETH,
						currentLiquidationThreshold,
						ltv,
						healthFactor,
					},
				]}
				columns={columns}
			/>
			<ResponsiveTable
				breakpoint={"lg"}
				columns={columns}
				data={[
					{
						totalLiquidity,
						totalCollateralETH,
						totalBorrowsETH,
						availableBorrowsETH,
						currentLiquidationThreshold,
						ltv,
						healthFactor,
					},
				]}
				direction={"rtl"}
				withoutBorder
			/>
		</StyledCard>
	);
};

export default GlobalOverall;
