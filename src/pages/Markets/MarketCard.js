import React, { useMemo, useState } from "react";
import { Row, Col, Tab, Nav } from "react-bootstrap";

import { ResponsiveCard } from "../../components/Card";
import styled from "styled-components";
import SearchIcon from "../../assets/images/search.svg";
import { MarketTable } from "./MarketTable";
import { Link } from "react-router-dom";
import { changeMarket } from "../../state/spot/actions";
import { withRouter } from "react-router-dom";
import { useActiveWeb3React } from "../../hooks";
import { useDispatch } from "react-redux";
import { marketToString } from "../../utils/spot/market";
import { sortedData } from "../../lib/helper";
import {
	InputGroupFormControl as FormControl,
	InputGroup,
	InputGroupText,
	InputGroupPrepend,
} from "../../components/Form";
import { useTranslation } from "react-i18next";
import SVG from "react-inlinesvg";

const CustomResponsiveCard = styled(ResponsiveCard)`
	margin-top: 20px;

	@media (min-width: 768px) {
		margin-top: 0;
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

const HeaderCol = styled(Col)`
	margin: -10px 0 20px;

	@media (min-width: 768px) {
		margin-bottom: 25px;
	}
`;

const CustomInputGroup = styled(InputGroup)`
	margin-bottom: 30px;
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
const PoolsButton = styled.button`
	border-radius: 12px;
	background-color: ${({ theme }) => theme.bg1};
	padding: 6px 20px;
	max-height: 40px;
	min-height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	white-space: nowrap;
	font-size: 1rem;
	font-family: inherit;
	font-weight: 500;
	border: none;
	outline: none;
	text-decoration: none;

	&:hover,
	&:focus,
	&:active {
		text-decoration: none;
		outline: none;
		box-shadow: none;
	}
`;

const TradeButton = styled(PoolsButton)`
	color: ${({ theme }) => theme.primary};
	width: 100%;

	&:hover {
		color: ${({ theme }) => theme.bg1};
		background-color: ${({ theme }) => theme.primary};
	}
`;

const StyledLink = styled(Link)`
	text-decoration: none;
	&:hover,
	&:focus,
	&:active {
		text-decoration: none;
		outline: none;
		box-shadow: none;
	}
`;

const Text = styled.span`
	font-size: 0.875rem;
	font-weight: ${({ fontWeight }) => fontWeight || 700};
	color: ${({ color, theme }) => (color ? theme[color] : theme.text1)};

	@media (max-width: 991px) {
		font-weight: 500;
	}
`;

const MarketCard = (props) => {
	const { account, library } = useActiveWeb3React();
	const [query, setQuery] = useState("");
	const dispatch = useDispatch();
	const { t } = useTranslation();
	const [sort, setSort] = useState({
		field: false,
		order: "desc",
	});

	const columns = [
		{
			dataField: "pair",
			text: t("pair"),
			formatter: (cellContent, row) => {
				return <Text>{row.pair}</Text>;
			},
			sort: true,
		},
		{
			dataField: "last_price",
			text: t("table.price"),
			formatter: (cellContent, row) => {
				const price = Number(row.last_price);
				return <Text>{price.toFixed(6)}</Text>;
			},
			sort: true,
		},
		{
			dataField: "last_price_change",
			text: t("table.24_price"),
			formatter: (cellContent, row) => {
				const percent = Number(row.last_price_change);

				return (
					<Text color={percent > 0 ? "success" : percent < 0 ? "danger" : "text1"}>
						{percent > 0 ? "+" : ""}
						{percent?.toFixed(2)}%
					</Text>
				);
			},
			sort: true,
		},
		{
			dataField: "price_max_24",
			text: t("table.24_high"),
			formatter: (cellContent, row) => {
				const price = Number(row.price_max_24);
				return <Text>{price.toFixed(6)}</Text>;
			},
			sort: true,
		},
		{
			dataField: "price_min_24",
			text: t("table.24_low"),
			formatter: (cellContent, row) => {
				const price = Number(row.price_min_24);
				return <Text>{price.toFixed(6)}</Text>;
			},
			sort: true,
		},
		{
			dataField: "volume_24",
			text: t("table.24_volume"),
			formatter: (cellContent, row) => {
				return <Text>{row.volume_24}</Text>;
			},
			sort: true,
		},
		{
			dataField: "actions",
			text: t("table.actions"),
			formatter: (cellContent, row, rowIndex, { markets }) => {
				const market =
					markets && markets.find((m) => row.pair.toUpperCase() === marketToString(m.currencyPair));
				return (
					<div className="d-flex flex-column align-items-stretch align-items-lg-start justify-content-center w-100">
						<TradeButton
							onClick={() => {
								dispatch(changeMarket(market?.currencyPair, account, window.ethereum || library));

								props.history.push(
									`/trade/spot?base=${market?.currencyPair?.base?.toLowerCase()}&quote=${market?.currencyPair?.quote?.toLowerCase()}`
								);
							}}
						>
							{t("trade")}
						</TradeButton>
					</div>
				);
			},
			isAction: true,
			formatExtraData: {
				markets: props.extraData,
			},
		},
	];

	const allMarkets = useMemo(() => {
		let data = Object.values(props.markets).filter((market) =>
			!query ? market : JSON.stringify(market).toLowerCase().includes(query)
		);
		return sortedData(data, sort);
	}, [props.markets, query, sort]);

	const btcMarkets = useMemo(() => {
		let data = Object.values(props.markets).filter(
			(market) =>
				/btc$/.test(market.pair.toLowerCase()) &&
				(!query || JSON.stringify({ b: market.base, q: market.quote }).toLowerCase().includes(query))
		);
		return sortedData(data, sort);
	}, [props.markets, query, sort]);

	const ethMarkets = useMemo(() => {
		let data = Object.values(props.markets).filter(
			(market) =>
				/eth$/.test(market.pair.toLowerCase()) &&
				(!query || JSON.stringify({ b: market.base, q: market.quote }).toLowerCase().includes(query))
		);
		return sortedData(data, sort);
	}, [props.markets, query, sort]);

	const usdcMarkets = useMemo(() => {
		let data = Object.values(props.markets).filter(
			(market) =>
				/usdc$/.test(market.pair.toLowerCase()) &&
				(!query || JSON.stringify({ b: market.base, q: market.quote }).toLowerCase().includes(query))
		);
		return sortedData(data, sort);
	}, [props.markets, query, sort]);

	const onTableChange = (type, context) => {
		if (type === "sort") {
			setSort({
				field: context.sortField,
				order: context.sortOrder,
			});
		}
	};

	return (
		<CustomResponsiveCard>
			<Tab.Container defaultActiveKey={"all"}>
				<Row>
					<HeaderCol
						xs={12}
						className={
							"d-flex flex-column-reverse flex-lg-row align-items-stretch align-items-lg-start justify-content-start justify-content-lg-between"
						}
					>
						<CustomNav fill variant="pills" className={"d-flex flex-row align-items-center flex-nowrap"}>
							<CustomNavItem>
								<CustomNavLink eventKey="all">{t("all")}</CustomNavLink>
							</CustomNavItem>
							<CustomNavItem>
								<CustomNavLink eventKey="btc">BTC {t("markets")}</CustomNavLink>
							</CustomNavItem>
							<CustomNavItem>
								<CustomNavLink eventKey="eth">ETH {t("markets")}</CustomNavLink>
							</CustomNavItem>
							<CustomNavItem>
								<CustomNavLink eventKey="usdc">USDC {t("markets")}</CustomNavLink>
							</CustomNavItem>
						</CustomNav>

						<CustomInputGroup className={"w-auto mb-lg-0"} bg={"darker"}>
							<InputGroupPrepend>
								<InputGroupText>
									<SVG src={SearchIcon} />
								</InputGroupText>
							</InputGroupPrepend>
							<FormControl
								id="PoolsSearch"
								placeholder={t("search")}
								onChange={(e) => setQuery(e.target.value.toLowerCase())}
							/>
						</CustomInputGroup>
					</HeaderCol>
					<Col xs={12}>
						<Tab.Content className={"bg-transparent"}>
							<Tab.Pane eventKey="all">
								<MarketTable columns={columns} entities={allMarkets} onTableChange={onTableChange} />
							</Tab.Pane>
							<Tab.Pane eventKey="btc">
								<MarketTable columns={columns} entities={btcMarkets} onTableChange={onTableChange} />
							</Tab.Pane>
							<Tab.Pane eventKey="eth">
								<MarketTable columns={columns} entities={ethMarkets} onTableChange={onTableChange} />
							</Tab.Pane>
							<Tab.Pane eventKey="usdc">
								<MarketTable columns={columns} entities={usdcMarkets} onTableChange={onTableChange} />
							</Tab.Pane>
						</Tab.Content>
					</Col>
				</Row>
			</Tab.Container>
		</CustomResponsiveCard>
	);
};

export default withRouter(MarketCard);
