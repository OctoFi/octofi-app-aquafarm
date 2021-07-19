import React, { useState, useEffect, useCallback } from "react";
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
import SparklineChart from "../../../components/SparklineChart";
import {
	InputGroupFormControl as FormControl,
	InputGroup,
	InputGroupPrepend,
	InputGroupText,
} from "../../../components/Form";
import CoinDisplay from "../../../components/CoinDisplay";
import * as Styled from "./styleds";
// import NumberDisplay from "../../../components/NumberDisplay";

const marketApi = new MarketApi();

let typingInterval;

const Currencies = (props) => {
	const defaultCoins = process.env.REACT_APP_FEATURED_COINS?.split(",") || [];
	const [coins, setCoins] = useState([{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]);
	const [query, setQuery] = useState("");
	const { t } = useTranslation();

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

	const columnRank = {
		dataField: "id",
		text: "#",
		formatter: (cellContent, row, rowIndex) => {
			return row?.market_cap_rank;
		},
		sort: false,
	};

	const columnName = {
		dataField: "name",
		text: t("name"),
		formatter: (cell, row) => {
			return <CoinDisplay name={row?.name} symbol={row?.symbol} image={row?.image} />;
		},
	};

	const columnPrice = {
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
	};

	const column24hChange = {
		dataField: "price_change",
		text: t("table.24_price"),
		formatter: (cell, row) => {
			const data = row?.price_change_percentage_24h?.toFixed(2);
			return row.hasOwnProperty("current_price") ? (
				<span className={`${data > 0 ? "text-success" : "text-danger"}`}>
					{data > 0 ? "+" : ""}
					{data ? `${data}%` : ""}
				</span>
			) : (
				<Skeleton width={80} height={32} />
			);
		},
	};

	// const columnMktCap = {
	// 	dataField: "mkt_cap",
	// 	text: t("table.marketCap"),
	// 	formatter: (cell, row) => {
	// 		const data = row?.market_cap;
	// 		return row.hasOwnProperty("current_price") ? (
	// 			<NumberDisplay value={data} currency={true} />
	// 		) : (
	// 			<Skeleton width={80} height={32} />
	// 		);
	// 	},
	// };

	const columnSparkline = {
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
	};

	const columns = [columnRank, columnName, columnPrice, column24hChange, columnSparkline];
	const mobileColumns = [columnName, columnPrice, column24hChange];

	const rowEvents = {
		onClick: (e, row) => {
			props.history.push(`/market/${row?.id}`);
		},
	};

	return (
		<Styled.Wrapper>
			<div className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center justify-content-between mb-4">
				<div className="d-flex align-items-start justify-content-between">
					<h2 className="h2 mr-auto">{t("tokens.assets")}</h2>
					<Link to={"/invest/tokens"} className={"d-flex d-lg-none"}>
						<Button variant="link">{t("tokens.allAssets")}</Button>
					</Link>
				</div>
				<InputGroup className="w-auto">
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
						<Styled.CurrenciesTable>
							<Table
								wrapperClasses="table-responsive"
								bordered={false}
								classes="table table-vertical-center overflow-hidden table-dark-border table-hover"
								bootstrap4
								remote
								keyField="id"
								rowEvents={rowEvents}
								columns={isMobile ? mobileColumns : columns}
								data={coins}
							/>
						</Styled.CurrenciesTable>

						<Styled.GotoMarketContainer>
							<Link to={"/invest/tokens"}>
								<Button variant={"link"}>{t("tokens.allAssets")}</Button>
							</Link>
						</Styled.GotoMarketContainer>
					</>
				) : (
					<div className="py-4 font-size-base font-weight-medium d-flex align-items-center justify-content-center">
						{t("tokens.noToken")}
					</div>
				)}
			</CustomCard>
		</Styled.Wrapper>
	);
};

export default withRouter(Currencies);
