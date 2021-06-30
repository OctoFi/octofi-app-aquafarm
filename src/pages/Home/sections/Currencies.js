import { Col } from "react-bootstrap";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Table from "react-bootstrap-table-next";
import Skeleton from "react-loading-skeleton";
import styled from "styled-components";
import { isMobile } from "react-device-detect";

import "./currencies.scss";
import SearchIcon from "../../../assets/images/search.svg";
import CustomCard from "../../../components/CustomCard";
import MarketApi from "../../../http/market";
import SparklineChart from "../../../components/SparklineChart";
import ResponsiveTable from "../../../components/ResponsiveTable";
import { Link, withRouter } from "react-router-dom";
import CurrencyText from "../../../components/CurrencyText";
import { useTranslation } from "react-i18next";
import {
	InputGroupFormControl as FormControl,
	InputGroup,
	InputGroupPrepend,
	InputGroupText,
} from "../../../components/Form";
import SVG from "react-inlinesvg";

const GotoMarketContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 12px 24px;
	margin-top: 1rem;

	@media (min-width: 992px) {
		margin-top: 0;
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

const marketApi = new MarketApi();

let typingInterval;

const Currencies = (props) => {
	const [coins, setCoins] = useState([{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]);
	const [query, setQuery] = useState("");
	const { t } = useTranslation();

	const defaultCoins = useMemo(() => {
		return process.env.REACT_APP_HOME_TOP10?.split(",") || [];
	}, []);

	const getSearchedCoins = useCallback(async (query) => {
		try {
			const coins = await marketApi.get("search", {
				locale: "en",
				query: query,
			});
			if (coins.length > 0) {
				const res = await marketApi.get("searchedCoins", {
					ids: coins.slice(0, 10).map((coin) => coin.id),
					pageSize: 10,
				});

				if (res.hasOwnProperty("data")) {
					setCoins(res.data.slice(0, 10));
				}
			} else {
				setCoins([]);
			}
		} catch (e) {
			setCoins([{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]);
		}
	}, []);

	useEffect(() => {
		if (query === "") {
			marketApi
				.get("searchedCoins", {
					page: 1,
					pageSize: 10,
					ids: defaultCoins,
				})
				.then((response) => {
					if (response.hasOwnProperty("data")) {
						setCoins(response.data);
					}
				})
				.catch((e) => {
					setCoins([]);
				});
		} else {
			clearTimeout(typingInterval);
			typingInterval = setTimeout(() => getSearchedCoins(query), 300);
		}
	}, [query]);

	const columns = [
		{
			dataField: "name",
			text: t("name"),
			formatter: (cell, row) => {
				return (
					<div className="d-flex coin align-items-center">
						{row.hasOwnProperty("image") ? (
							<div className="coin__icon">
								<img src={row?.image} alt={row?.name} />
							</div>
						) : (
							<Skeleton
								width={isMobile ? 24 : 55}
								height={isMobile ? 24 : 55}
								className={isMobile ? "mr-2" : "mr-4"}
							/>
						)}

						<span className={"coin__symbol"}>
							{row.hasOwnProperty("symbol") ? (
								row?.symbol?.toUpperCase()
							) : (
								<Skeleton width={isMobile ? 30 : 80} />
							)}
						</span>
						<span className={"coin__name"}>
							{row.hasOwnProperty("name") ? row?.name : <Skeleton width={isMobile ? 40 : 120} />}
						</span>
					</div>
				);
			},
		},
		{
			dataField: "price",
			text: t("table.price"),
			formatter: (cell, row) => {
				return (
					<span className={"coin__price"}>
						{row.hasOwnProperty("current_price") ? (
							<CurrencyText>{row?.current_price}</CurrencyText>
						) : (
							<Skeleton width={isMobile ? 50 : 80} height={32} />
						)}
					</span>
				);
			},
		},
		{
			dataField: "price_change",
			text: t("table.24_price"),
			formatter: (cell, row) => {
				const data = row?.price_change_percentage_24h?.toFixed(4);
				return row.hasOwnProperty("current_price") ? (
					<span
						className={`label label-inline ${isMobile ? "label-sm" : "label-lg"} label-light-${
							data > 0 ? "success" : "danger"
						}`}
					>
						{data > 0 ? "+" : ""}
						{data ? `${data}%` : ""}
					</span>
				) : (
					<Skeleton width={80} height={32} />
				);
			},
		},
		{
			dataField: "sparkline",
			text: t("last7Days"),
			formatter: (cell, row, index) => {
				const data = row?.sparkline_in_7d?.price;
			
				return row.hasOwnProperty("sparkline_in_7d") ? (
					<SparklineChart data={data} theme={row.price_change_percentage_7d_in_currency >= 0 ? "primary" : "secondary"} />
				) : (
					<Skeleton width={120} height={40} />
				);
			},
			style: {
				width: 180,
			},
		},
	];

	const mobileColumns = [
		...columns,
		{
			dataField: "actions",
			text: t("table.actions"),
			formatter(cellContent, row) {
				return (
					<div className="d-flex flex-column align-items-stretch align-items-lg-center justify-content-center w-100">
						<StyledLink to={`/market/${row?.id}`}>
							<TradeButton>View More</TradeButton>
						</StyledLink>
					</div>
				);
			},
			isAction: true,
		},
	];

	const rowEvents = {
		onClick: (e, row) => {
			props.history.push(`/market/${row?.id}`);
		},
	};

	return (
		<section className="row currency section d-flex align-items-stretch">
			<Col
				xs={12}
				className={
					"d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center justify-content-between section__title"
				}
			>
				<div className="d-flex align-items-start justify-content-between">
					<h2 className="h2 mr-auto">{t("tokens.assets")}</h2>
					<Link to={"/invest/tokens"} className={"d-flex d-lg-none"}>
						<button className="btn btn-link p-0" style={{ fontWeight: 500 }}>
							{t("tokens.allAssets")}
						</button>
					</Link>
				</div>
				<InputGroup className={"w-auto"}>
					<InputGroupPrepend>
						<InputGroupText>
							<SVG src={SearchIcon} />
						</InputGroupText>
					</InputGroupPrepend>
					<FormControl
						id="inlineFormInputGroup"
						placeholder="Search"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className={"form-control--currency"}
					/>
				</InputGroup>
			</Col>
			<Col xs={12}>
				<CustomCard>
					{coins.length > 0 ? (
						<>
							<Table
								wrapperClasses="table-responsive d-none d-lg-block"
								bordered={false}
								classes={`table currencies table-vertical-center overflow-hidden table-dark-border table-hover`}
								bootstrap4
								remote
								keyField="id"
								rowEvents={rowEvents}
								columns={columns}
								data={coins}
							/>
							<ResponsiveTable breakpoint={"lg"} columns={mobileColumns} data={coins} />
							<GotoMarketContainer>
								<Link to={"/invest/tokens"}>
									<button className="btn btn-link p-0" style={{ fontWeight: 500 }}>
										{t("tokens.allAssets")}
									</button>
								</Link>
							</GotoMarketContainer>
						</>
					) : (
						<span className="py-5 font-size-sm font-weight-medium d-flex align-items-center justify-content-center">
							{t("tokens.noToken")}
						</span>
					)}
				</CustomCard>
			</Col>
		</section>
	);
};

export default withRouter(Currencies);
