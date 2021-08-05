import React from "react";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { Spinner } from "react-bootstrap";
import BootstrapTable from "react-bootstrap-table-next";
import styled from "styled-components";

import StyledCard from "../../../../components/Card";
import { useActiveWeb3React } from "../../../../hooks";
import ResponsiveTable from "../../../../components/ResponsiveTable";
import "./styles.scss";

const Card = styled(StyledCard)`
	display: flex;
	flex-direction: column;
	align-items: stretch;
	margin-bottom: 20px;

	& .card-body {
		padding: 24px 20px 20px;
	}

	@media (min-width: 1400px) {
		width: 570px;
		height: 103px;
		margin-bottom: 10px;

		& .card-body {
			padding: 24px;
		}
	}
`;

const Text = styled.span`
	color: ${({ theme, variant }) => (variant ? theme[variant] : theme.text1)};
	font-size: 0.875rem;
	font-weight: 500;
`;

const MarketDetails = (props) => {
	const { account } = useActiveWeb3React();
	const { t } = useTranslation();
	const { selectedMarket, marketStats } = props;

	let content;

	if (!account || !selectedMarket || !marketStats) {
		content = (
			<div className="w-100 h-100 d-flex align-items-center justify-content-center">
				<Spinner
					animation="border"
					variant="primary"
					id={`spots-markets-details-${props.isMobile ? "mobile" : "desktop"}`}
				/>
			</div>
		);
	} else {
		const columns = [
			{
				dataField: "project",
				text: t("project"),
				formatter: (cellContent, row) => {
					return (
						<div className="d-flex align-items-center">
							<Text>{row?.marketStats?.marketId}</Text>
						</div>
					);
				},
			},
			{
				dataField: "last_price",
				text: t("table.price"),
				formatter: (cellContent, row) => {
					return <Text>{row?.marketStats?.price || "-"}</Text>;
				},
			},
			{
				dataField: "max_price",
				text: t("table.24_high"),
				formatter: (cellContent, row) => {
					return <Text>{row?.marketStats?.high || "-"}</Text>;
				},
			},
			{
				dataField: "min_price",
				text: t("table.24_low"),
				formatter: (cellContent, row) => {
					return <Text>{row?.marketStats?.low || "-"}</Text>;
				},
			},
			{
				dataField: "volume",
				text: t("table.24_volume"),
				formatter: (cellContent, row) => {
					return <Text>{row?.marketStats?.volume || "-"}</Text>;
				},
			},
		];

		content = (
			<>
				<BootstrapTable
					wrapperClasses="d-none d-lg-block"
					bordered={false}
					classes="table table-head-custom table-borderless table-vertical-center overflow-hidden market-details__table"
					bootstrap4
					keyField={"id"}
					remote
					data={[{ marketStats: marketStats }]}
					columns={columns}
				/>
				<ResponsiveTable
					breakpoint={"lg"}
					columns={columns}
					data={[{ marketStats: marketStats }]}
					direction={"rtl"}
					withoutBorder
				/>
			</>
		);
	}

	return <Card>{content}</Card>;
};

const mapStateToProps = (state) => {
	return {
		selectedMarket: state.margin.selectedMarket,
		marketStats: state.margin.marketStats.data,
	};
};

export default connect(mapStateToProps)(MarketDetails);
