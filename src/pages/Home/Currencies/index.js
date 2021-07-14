import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, withRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";
import SVG from "react-inlinesvg";
import Skeleton from "react-loading-skeleton";
import Table from "react-bootstrap-table-next";
import { Button } from "react-bootstrap";

import { CustomCard } from "../../../components/Card";
import SearchIcon from "../../../assets/images/search.svg";
import MarketApi from "../../../http/market";
import CurrencyText from "../../../components/CurrencyText";
import ResponsiveTable from "../../../components/ResponsiveTable";
import SparklineChart from "../../../components/SparklineChart";
import {
	InputGroupFormControl as FormControl,
	InputGroup,
	InputGroupPrepend,
	InputGroupText,
} from "../../../components/Form";
import * as Styled from "./styleds";

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
							<Styled.CoinIcon>
								<img src={row?.image} alt={row?.name} />
							</Styled.CoinIcon>
						) : (
							<Skeleton
								width={isMobile ? 24 : 55}
								height={isMobile ? 24 : 55}
								className={isMobile ? "mr-2" : "mr-4"}
							/>
						)}

						<Styled.CoinSymbol>
							{row.hasOwnProperty("symbol") ? (
								row?.symbol?.toUpperCase()
							) : (
								<Skeleton width={isMobile ? 30 : 80} />
							)}
						</Styled.CoinSymbol>
						<Styled.CoinName>
							{row.hasOwnProperty("name") ? row?.name : <Skeleton width={isMobile ? 40 : 120} />}
						</Styled.CoinName>
					</div>
				);
			},
		},
		{
			dataField: "price",
			text: t("table.price"),
			formatter: (cell, row) => {
				return (
					<Styled.CoinPrice>
						{row.hasOwnProperty("current_price") ? (
							<CurrencyText>{row?.current_price}</CurrencyText>
						) : (
							<Skeleton width={isMobile ? 50 : 80} height={32} />
						)}
					</Styled.CoinPrice>
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
					<SparklineChart
						data={data}
						theme={row.price_change_percentage_7d_in_currency >= 0 ? "primary" : "secondary"}
					/>
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
						<Styled.StyledLink to={`/market/${row?.id}`}>
							<Styled.TradeButton>View More</Styled.TradeButton>
						</Styled.StyledLink>
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
		<Styled.CurrencySection>
			<div className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center justify-content-between section__title">
				<div className="d-flex align-items-start justify-content-between">
					<h2 className="h2 mr-auto">{t("tokens.assets")}</h2>
					<Link to={"/invest/tokens"} className={"d-flex d-lg-none"}>
						<Button variant="link">{t("tokens.allAssets")}</Button>
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
			</div>

			<CustomCard>
				{coins.length > 0 ? (
					<>
						<Styled.CurrenciesTable className="d-none d-lg-block">
							<Table
								wrapperClasses="table-responsive"
								bordered={false}
								classes={`table table-vertical-center overflow-hidden table-dark-border table-hover`}
								bootstrap4
								remote
								keyField="id"
								rowEvents={rowEvents}
								columns={columns}
								data={coins}
							/>
						</Styled.CurrenciesTable>

						<ResponsiveTable breakpoint={"lg"} columns={mobileColumns} data={coins} />

						<Styled.GotoMarketContainer>
							<Link to={"/invest/tokens"}>
								<Button variant={"link"}>
									{t("tokens.allAssets")}
								</Button>
							</Link>
						</Styled.GotoMarketContainer>
					</>
				) : (
					<div className="py-4 font-size-base font-weight-medium d-flex align-items-center justify-content-center">
						{t("tokens.noToken")}
					</div>
				)}
			</CustomCard>
		</Styled.CurrencySection>
	);
};

export default withRouter(Currencies);
