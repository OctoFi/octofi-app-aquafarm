import { Row, Col } from "react-bootstrap";
import styled from "styled-components";

import ResponsiveTable from "../../components/ResponsiveTable";
import TokenSetsApi from "../../http/tokenSet";
import React, { useState, useEffect } from "react";
import Img from "../../components/UI/Img";
import CurrencyText from "../../components/CurrencyText";
import ArrowUp from "../../components/Icons/ArrowUp";
import ArrowDown from "../../components/Icons/ArrowDown";
import BootstrapTable from "react-bootstrap-table-next";
import "./styles.scss";
import Loading from "../../components/Loading";
import { fetchCoinMarketPrices } from "../../state/market/actions";
import { useTranslation } from "react-i18next";

const api = new TokenSetsApi();

const Title = styled.span`
	font-size: 1.125rem;
	font-weight: bold;
	margin-left: 20px;
	line-height: 1.35;
	display: block;

	@media (max-width: 991px) {
		margin-left: 0;
		margin-right: 12px;
		font-size: 0.875rem;
	}
`;

const LogoContainer = styled.div`
	max-width: 55px;
	max-height: 55px;
	min-width: 55px;
	min-height: 55px;
	height: 55px;
	width: 55px;
	border-radius: 12px;
	background-color: ${({ theme }) => theme.text1};
	display: flex;
	align-items: center;
	justify-content: center;

	& img {
		width: 40px;
		height: 40px;
	}

	@media (max-width: 991px) {
		max-width: 40px;
		max-height: 40px;
		min-width: 40px;
		min-height: 40px;
		height: 40px;
		width: 40px;

		& img {
			width: 24px;
			height: 24px;
		}
	}
`;

const CellText = styled.span`
	font-size: 0.875rem;
	font-weight: 500;
	line-height: 1;

	@media (max-width: 991px) {
		font-size: 0.75rem;
	}
`;

const CellBoldText = styled(CellText)`
	font-weight: 700;
`;

const TokenSetTab = (props) => {
	const [sets, setSets] = useState([]);
	const [setsHistorical, setSetsHistorical] = useState([]);
	const [loading, setLoading] = useState(false);
	const { t } = useTranslation();

	const { active, tabKey } = props;

	const getTokenSets = async (key) => {
		let data;
		setLoading(true);
		try {
			if (key === "portfolios") {
				const res = await api.fetchPortfolios();
				data = res.data.portfolios;
				let ids = data.map((row) => row.address);
				const historicalRes = await api.getTokenSetsHitorical(ids);

				setSetsHistorical(historicalRes);
			} else {
				const res = await api.fetchAllSets();
				data = res.data.rebalancing_sets;
				let ids = data.map((row) => row.address);
				const historicalRes = await api.getTokenSetsHitorical(ids);

				setSetsHistorical(historicalRes);
			}

			setSets(data);
		} catch (e) {
			setSets([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (active && sets.length === 0) {
			getTokenSets(tabKey);
		}
	}, [active, tabKey]);

	const columns = [
		{
			dataField: "name",
			text: t("name"),
			formatter: (cellContent, row) => {
				return (
					<div className="d-flex align-items-center flex-row-reverse flex-lg-row">
						<LogoContainer>
							<Img src={row.image} alt={row.name} />
						</LogoContainer>
						<Title>{row.name}</Title>
					</div>
				);
			},
		},
		{
			dataField: "market_cap",
			text: t("table.marketCap"),
			formatter: (cellContent, row) => {
				return (
					<CellText>
						<CurrencyText>{row.market_cap}</CurrencyText>
					</CellText>
				);
			},
		},
		{
			dataField: "price",
			text: t("table.price"),
			formatter: (cellContent, row) => {
				return (
					<CellBoldText>
						<CurrencyText>{row.price_usd}</CurrencyText>
					</CellBoldText>
				);
			},
		},
		{
			dataField: "24h_changes",
			text: t("tokensets.oneDay"),
			formatter: (cellContent, row, index, { historical }) => {
				const h = historical[index] || {};

				return (
					<CellText
						className={`label px-3 px-lg-2 label-inline label-lg ${
							h?.market_data?.price_change_percentage_24h >= 0
								? "label-light-success"
								: "label-light-danger"
						} `}
					>
						<span className="mr-2 d-none d-lg-flex">
							{h?.market_data?.price_change_percentage_24h >= 0 || !h ? (
								<ArrowUp fill={"#1BC5BD"} size={14} />
							) : (
								<ArrowDown fill={"#F64E60"} size={14} />
							)}
						</span>
						{(h.market_data?.price_change_percentage_24h &&
							h?.market_data?.price_change_percentage_24h.toFixed(2) + "%") ||
							"-"}
					</CellText>
				);
			},
			formatExtraData: {
				historical: setsHistorical,
			},
		},
		{
			dataField: "7d_changes",
			text: t("tokensets.week"),
			formatter: (cellContent, row, index, { historical }) => {
				const h = historical[index] || {};

				return (
					<CellText
						className={`label px-3 px-lg-2 label-inline label-lg ${
							h?.market_data?.price_change_percentage_7d >= 0
								? "label-light-success"
								: "label-light-danger"
						} `}
					>
						<span className="mr-2 d-none d-lg-flex">
							{h?.market_data?.price_change_percentage_7d >= 0 || !h ? (
								<ArrowUp fill={"#1BC5BD"} size={14} />
							) : (
								<ArrowDown fill={"#F64E60"} size={14} />
							)}
						</span>
						{(h.market_data?.price_change_percentage_7d &&
							h?.market_data?.price_change_percentage_7d.toFixed(2) + "%") ||
							"-"}
					</CellText>
				);
			},
			formatExtraData: {
				historical: setsHistorical,
			},
		},
		{
			dataField: "30d_changes",
			text: t("tokensets.month"),
			formatter: (cellContent, row, index, { historical }) => {
				const h = historical[index] || {};

				return (
					<CellText
						className={`label px-3 px-lg-2 label-inline label-lg ${
							h?.market_data?.price_change_percentage_30d >= 0
								? "label-light-success"
								: "label-light-danger"
						} `}
					>
						<span className="mr-2 d-none d-lg-flex">
							{h?.market_data?.price_change_percentage_30d >= 0 || !h ? (
								<ArrowUp fill={"#1BC5BD"} size={14} />
							) : (
								<ArrowDown fill={"#F64E60"} size={14} />
							)}
						</span>
						{(h.market_data?.price_change_percentage_30d &&
							h?.market_data?.price_change_percentage_30d.toFixed(2) + "%") ||
							"-"}
					</CellText>
				);
			},
			formatExtraData: {
				historical: setsHistorical,
			},
		},
		{
			dataField: "200d_changes",
			text: t("tokensets.sixMonth"),
			formatter: (cellContent, row, index, { historical }) => {
				const h = historical[index] || {};

				return (
					<CellText
						className={`label px-3 px-lg-2 label-inline label-lg ${
							h?.market_data?.price_change_percentage_200d >= 0
								? "label-light-success"
								: "label-light-danger"
						} `}
					>
						<span className="mr-2 d-none d-lg-flex">
							{h?.market_data?.price_change_percentage_200d >= 0 || !h ? (
								<ArrowUp fill={"#1BC5BD"} size={14} />
							) : (
								<ArrowDown fill={"#F64E60"} size={14} />
							)}
						</span>
						{(h.market_data?.price_change_percentage_200d &&
							h?.market_data?.price_change_percentage_200d.toFixed(2) + "%") ||
							"-"}
					</CellText>
				);
			},
			formatExtraData: {
				historical: setsHistorical,
			},
		},
		{
			dataField: "1y_changes",
			text: t("tokensets.year"),
			formatter: (cellContent, row, index, { historical }) => {
				const h = historical[index] || {};

				return (
					<CellText
						className={`label px-3 px-lg-2 label-inline label-lg ${
							h?.market_data?.price_change_percentage_1y >= 0
								? "label-light-success"
								: "label-light-danger"
						} `}
					>
						<span className="mr-2 d-none d-lg-flex">
							{h?.market_data?.price_change_percentage_1y >= 0 || !h ? (
								<ArrowUp fill={"#1BC5BD"} size={14} />
							) : (
								<ArrowDown fill={"#F64E60"} size={14} />
							)}
						</span>
						{(h.market_data?.price_change_percentage_1y &&
							h?.market_data?.price_change_percentage_1y.toFixed(2) + "%") ||
							"-"}
					</CellText>
				);
			},
			formatExtraData: {
				historical: setsHistorical,
			},
		},
	];

	const rowEvents = {
		onClick: (e, row) => {
			window.open(
				`https://www.tokensets.com/${tabKey === "portfolios" ? "portfolio" : "set"}/${row.id}`,
				"_blank"
			);
		},
	};

	return (
		<Row>
			<Col xs={12}>
				{loading ? (
					<div className="w-100 h-100 d-flex align-items-center justify-content-center py-5">
						<Loading width={40} height={40} id={`token-sets-${tabKey || "rebalancing"}`} active />
					</div>
				) : (
					<>
						<BootstrapTable
							wrapperClasses="table-responsive d-none d-lg-block"
							bordered={false}
							classes="table table-head-custom table-borderless table-vertical-center table-hover overflow-hidden tokensets__table"
							bootstrap4
							remote
							keyField="id"
							data={sets === null ? [] : sets}
							columns={columns}
							rowEvents={rowEvents}
						></BootstrapTable>
						<ResponsiveTable breakpoint={"lg"} columns={columns} data={sets} direction={"rtl"} />
					</>
				)}
			</Col>
		</Row>
	);
};

export default TokenSetTab;
