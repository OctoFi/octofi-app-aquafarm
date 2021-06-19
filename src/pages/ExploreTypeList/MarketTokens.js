import { Tab, Row, Col, Nav } from "react-bootstrap";
import styled from "styled-components";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import BootstrapTable from "react-bootstrap-table-next";
import { withRouter } from "react-router-dom";

import {
	InputGroupFormControl as FormControl,
	InputGroupPrepend,
	InputGroup,
	InputGroupText,
} from "../../components/Form";
import SearchIcon from "../../assets/images/search.svg";
import Loading from "../../components/Loading";
import CurrencyText from "../../components/CurrencyText";
import { fetchAllCoins, fetchCoinMarketPrices, fetchMarketCoins } from "../../state/market/actions";
import CurrencyLogo from "../../components/CurrencyLogo";
import ArrowDown from "../../components/Icons/ArrowDown";
import ResponsiveTable from "../../components/ResponsiveTable";
import { sortedData } from "../../lib/helper";
import MarketApi from "../../http/market";
import SVG from "react-inlinesvg";
import { useTranslation } from "react-i18next";
import {useIsDarkMode} from "../../state/user/hooks";

const LogoContainer = styled.div`
	width: 32px;
	height: 32px;
	border-radius: 32px;

	@media (max-width: 991px) {
		width: 24px;
		height: 24px;
		border-radius: 24px;
	}
`;

const Logo = styled.img`
	width: 32px;
	height: 32px;
	border-radius: 32px;
	background-color: ${({ theme }) => theme.text1};
	border: 2px solid ${({ theme }) => theme.text1};

	@media (max-width: 991px) {
		width: 24px;
		height: 24px;
		border-radius: 24px;
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

const HeaderCol = styled(Col)`
	margin: -10px 0 20px;

	@media (min-width: 768px) {
		margin-bottom: 25px;
	}
`;

const CustomInputGroup = styled(InputGroup)`
	margin-bottom: 30px;
`;

const MarketLink = styled.a`
	color: ${({ theme }) => theme.text1};
	@media (max-width: 991px) {
		flex-basis: 100px;
	}
`;

const CustomTitle = styled.h4`
	color: ${({ theme }) => theme.text1};
	font-size: 1rem;

	@media (max-width: 991px) {
		font-size: 0.875rem;
	}
`;

const SymbolText = styled.span`
	font-weight: 500;
	font-size: 0.75rem;
	color: ${({ theme }) => theme.text1};

	@media (max-width: 991px) {
		font-size: 0.875rem;
		font-weight: 400;
	}
`;

const CellText = styled.span`
	font-weight: 500;
	font-size: 0.875rem;
	color: ${({ theme }) => theme.text1};

	&.font-size-base {
		font-size: 1rem;
	}

	@media (max-width: 991px) {
		font-weight: 700;

		&.label {
			font-weight: 500;
		}
	}
`;

const api = new MarketApi();

const PAGE_SIZE = 100;
let typingInterval;

const MarketTokens = (props) => {
	const darkMode = useIsDarkMode();
	const [query, setQuery] = useState("");
	const [expanded, setExpanded] = useState([]);
	const [allTokens, setAllTokens] = useState([]);
	const { t } = useTranslation();
	const [sort, setSort] = useState({
		field: "market_cap",
		order: "desc",
	});
	const [page, setPage] = useState({
		page: 1,
		query: "",
		seeMore: false,
		hasMore: true,
	});

	const loader = useRef(null);
	const dispatch = useDispatch();
	const marketCoins = useSelector((state) => state.market.marketCoins);
	// const theme = useContext(ThemeContext);

	const allTokensData = useMemo(() => {
		return sortedData(allTokens, sort);
	}, [allTokens, query, sort]);

	const marketCoinsData = useMemo(() => {
		const filterText = query.trim().toLowerCase();
		let data;
		if (filterText.length > 0) {
			data = marketCoins.data.filter(
				(token) =>
					token.name.toLowerCase().indexOf(filterText) > -1 ||
					token.symbol.toLowerCase().indexOf(filterText) > -1
			);
		} else {
			data = marketCoins.data;
		}
		return sortedData(data, sort);
	}, [marketCoins, query, sort]);

	const observeAction = () => {
		setPage((p) => {
			const newPage = {
				...p,
			};
			if (p.page > 0 && p.page % 2 === 0) {
				newPage.seeMore = true;
			} else {
				newPage.page++;
			}
			return newPage;
		});
	};

	const handleObserver = (entities) => {
		const target = entities[0];
		if (target.isIntersecting) {
			observeAction();
		}
	};

	useEffect(() => {
		const options = {
			root: null,
			rootMargin: "20px",
			threshold: 0,
		};

		const observer = new IntersectionObserver(handleObserver, options);
		if (loader.current) {
			observer.observe(loader.current);
		}
	}, []);

	useEffect(() => {
		dispatch(fetchMarketCoins());
	}, [dispatch]);

	useEffect(() => {
		if (page.hasMore && !page.seeMore) {
			if (page.query === "") {
				api.get("all", {
					page: page.page,
					pageSize: PAGE_SIZE,
				})
					.then((response) => {
						if (response.hasOwnProperty("data")) {
							if (response.data.length < PAGE_SIZE) {
								setPage((p) => {
									return {
										...p,
										hasMore: false,
									};
								});
							}
							setAllTokens((tokens) => {
								if (page.page > 1) {
									return tokens.concat(response.data);
								}
								return response.data;
							});
						}
					})
					.catch((e) => {
						setAllTokens((tokens) => {
							if (page.page > 1) {
								return tokens;
							}
							return [];
						});
					});
			} else {
				clearTimeout(typingInterval);
				typingInterval = setTimeout(() => getSearchedCoins(page), 400);
			}
		}
	}, [page, dispatch]);

	const columns = (hasPagination, hasCoinFetch = false) => [
		{
			dataField: "id",
			text: "ID",
			formatter: (cellContent, row, rowIndex) => rowIndex + 1,
			sort: false,
		},
		{
			dataField: "name",
			text: t("tokens.assets"),
			formatter: (cellContent, row, rowIndex) => {
				return (
					<div key={rowIndex} className="d-flex align-items-center flex-row py-3">
						{row.image ? (
							<Logo src={row.image} alt={row.name} />
						) : (
							<LogoContainer>
								<CurrencyLogo currency={row.currency} />
							</LogoContainer>
						)}
						<div className="d-flex flex-column justify-content-center ml-3 mr-auto">
							<CustomTitle className={"font-weight-bolder mb-1"}>{row.name}</CustomTitle>
							<SymbolText>{row.symbol.toUpperCase()}</SymbolText>
						</div>
						{hasCoinFetch && (
							<button className={`btn ${darkMode ? 'btn-light-primary' : 'btn-primary'} btn-sm ml-2 d-none d-lg-block`}>
								Aggregations <ArrowDown size={18} fill={"currentColor"} />
							</button>
						)}
					</div>
				);
			},
			sort: true,
		},
		{
			dataField: "current_price",
			text: t("table.price"),
			formatter: (cellContent, row) => (
				<CellText>
					<CurrencyText>{row.current_price}</CurrencyText>
				</CellText>
			),
			sort: true,
		},
		{
			dataField: "price_change_percentage_24h",
			text: t("table.24_price"),
			formatter: (cellContent, row) => (
				<span
					className={`label px-3 px-lg-2 label-inline label-lg ${
						row.price_change_percentage_24h >= 0 ? "label-light-success" : "label-light-danger"
					} `}
				>
					{row.price_change_percentage_24h ? `${row.price_change_percentage_24h.toFixed(2)}%` : "-"}
				</span>
			),
			sort: true,
		},
		{
			dataField: "price_change_percentage_7d_in_currency",
			text: t("tokensets.week"),
			formatter: (cellContent, row) => (
				<span
					className={`label px-3 px-lg-2 label-inline label-lg ${
						row.price_change_percentage_7d_in_currency >= 0 ? "label-light-success" : "label-light-danger"
					} `}
				>
					{row.price_change_percentage_7d_in_currency
						? `${row.price_change_percentage_7d_in_currency.toFixed(2)}%`
						: "-"}
				</span>
			),
			sort: true,
		},
		{
			dataField: "price_change_percentage_30d_in_currency",
			text: t("tokensets.month"),
			formatter: (cellContent, row) => (
				<span
					className={`label px-3 px-lg-2 label-inline label-lg ${
						row.price_change_percentage_30d_in_currency >= 0 ? "label-light-success" : "label-light-danger"
					} `}
				>
					{row.price_change_percentage_30d_in_currency
						? `${row.price_change_percentage_30d_in_currency.toFixed(2)}%`
						: "-"}
				</span>
			),
			sort: true,
		},
		{
			dataField: "price_change_percentage_1y_in_currency",
			text: t("tokensets.year"),
			formatter: (cellContent, row) => (
				<span
					className={`label px-3 px-lg-2 label-inline label-lg ${
						row.price_change_percentage_1y_in_currency >= 0 ? "label-light-success" : "label-light-danger"
					} `}
				>
					{row.price_change_percentage_1y_in_currency
						? `${row.price_change_percentage_1y_in_currency.toFixed(2)}%`
						: "-"}
				</span>
			),
			sort: true,
		},
		{
			dataField: "market_cap",
			text: t("table.marketCap"),
			formatter: (cellContent, row) => (
				<CellText>
					<CurrencyText>{row.market_cap || "-"}</CurrencyText>
				</CellText>
			),
			sort: true,
		},
	];

	const rowEvents = {
		onClick: (e, row) => {
			if (e.target.tagName === "BUTTON") {
				if (expanded.includes(row.id)) {
					setExpanded(expanded.filter((exRow) => exRow !== row.id));
				} else {
					dispatch(
						fetchCoinMarketPrices({
							id: row.id,
							symbol: row.symbol,
						})
					);
					setExpanded(expanded.concat(row.id));
				}
			} else {
				props.history.push(`/tools/market/${row.id}`);
			}
		},
	};

	const expandRow = {
		renderer: (row) => {
			const loading = marketCoins.prices.loading[row.id];
			const coinPrices = marketCoins.prices.data[row.id];
			return loading ? (
				<div className="d-flex flex-column flex-lg-row align-items-center justify-content-center py-5">
					<Loading width={40} height={40} active id={"load-markets"} />
				</div>
			) : (
				<div className="d-flex flex-column flex-lg-row align-items-lg-center py-4 px-6">
					{coinPrices && coinPrices.hasOwnProperty("links") ? (
						Object.keys(coinPrices.links).map((market) => {
							return (
								<div
									className="d-flex flex-row justify-content-lg-center justify-content-start flex-grow-1 mb-3 mb-lg-0 flex-lg-column"
									key={market}
								>
									<MarketLink
										className="mb-lg-1 mr-2 mr-lg-0 font-size-base"
										href={coinPrices.links[market]}
										target={"_blank"}
										rel={"noopener noreferrer"}
									>
										{market} ↗
									</MarketLink>
									<span
										className={`${
											coinPrices.result[market] >= row.current_price
												? "text-success"
												: "text-danger"
										} font-weight-bold font-size-h4`}
										style={{ flex: "1" }}
									>
										<CurrencyText>{coinPrices.result[market]}</CurrencyText>
									</span>
								</div>
							);
						})
					) : (
						<div className="d-flex flex-column flex-lg-row align-items-center justify-content-center py-5">
							<CellText>{t("errors.default")}</CellText>
						</div>
					)}
				</div>
			);
		},
		expanded: expanded,
	};

	const onChangeTable = (type, context) => {
		if (type === "sort") {
			setSort({
				field: context.sortField,
				order: context.sortOrder,
			});
		}
	};

	const getSearchedCoins = useCallback(async (settings) => {
		try {
			const coins = await api.get("search", {
				locale: "en",
				query: settings.query,
			});
			if (coins.length > 0) {
				const res = await api.get("searchedCoins", {
					ids: coins.map((coin) => coin.id),
					pageSize: PAGE_SIZE,
					page: settings.page,
				});

				if (res.hasOwnProperty("data")) {
					if (res.data.length < PAGE_SIZE) {
						setPage((p) => {
							return {
								...p,
								hasMore: false,
							};
						});
					}
					setAllTokens((tokens) => {
						if (settings.page > 1) {
							return tokens.concat(res.data);
						}
						return res.data;
					});
				}
			} else {
				setAllTokens((tokens) => {
					if (settings.page > 1) {
						return tokens;
					}
					return [];
				});
			}
		} catch (e) {
			setAllTokens((tokens) => {
				if (settings.page > 1) {
					return tokens;
				}
				return [];
			});
		}
	}, []);

	const searchHandler = useCallback((e) => {
		const value = e.target.value.toLowerCase();
		setQuery(value);
		setPage((p) => {
			return {
				...p,
				page: 1,
				query: value,
				hasMore: true,
				seeMore: false,
			};
		});
	}, []);

	const showMoreTokens = () => {
		setPage((p) => {
			return {
				...p,
				page: p.page + 1,
				seeMore: false,
			};
		});
	};

	return (
		<Tab.Container defaultActiveKey="featured">
			<Row>
				<HeaderCol
					xs={12}
					className={
						"d-flex flex-column-reverse flex-lg-row align-items-stretch align-items-lg-start justify-content-start justify-content-lg-between"
					}
				>
					<CustomNav fill variant="pills" className={"d-flex flex-row align-items-center flex-nowrap"}>
						<CustomNavItem>
							<CustomNavLink eventKey="featured">{t("featuredCoins")}</CustomNavLink>
						</CustomNavItem>
						<CustomNavItem>
							<CustomNavLink eventKey="all">{t("allCoins")}</CustomNavLink>
						</CustomNavItem>
					</CustomNav>

					<CustomInputGroup className={"w-auto mb-lg-0"} bg={"darker"}>
						<InputGroupPrepend>
							<InputGroupText>
								<SVG src={SearchIcon} />
							</InputGroupText>
						</InputGroupPrepend>
						<FormControl id="PoolsSearch" placeholder={t("search")} onChange={searchHandler} />
					</CustomInputGroup>
				</HeaderCol>

				<Col xs={12}>
					<Tab.Content className={"bg-transparent"}>
						<Tab.Pane eventKey="featured">
							<BootstrapTable
								wrapperClasses="table-responsive d-none d-lg-block"
								bordered={false}
								classes={`table table-head-custom table-borderless table-vertical-center overflow-hidden table-hover explore__table`}
								bootstrap4
								remote
								keyField="id"
								onTableChange={onChangeTable}
								columns={columns(false, true)}
								data={marketCoinsData}
								rowEvents={rowEvents}
								expandRow={expandRow}
							/>
							<ResponsiveTable
								centered
								size={"lg"}
								breakpoint={"lg"}
								columns={columns(false, true)}
								data={marketCoinsData}
								direction={"rtl"}
							/>
						</Tab.Pane>
						<Tab.Pane eventKey="all">
							<BootstrapTable
								wrapperClasses="table-responsive d-none d-lg-block"
								bordered={false}
								classes={`table table-head-custom table-borderless table-vertical-center overflow-hidden table-hover explore__table`}
								bootstrap4
								remote
								keyField="id"
								columns={columns(true)}
								data={allTokensData}
								rowEvents={rowEvents}
								onTableChange={onChangeTable}
							/>
							<ResponsiveTable
								centered
								size={"lg"}
								breakpoint={"lg"}
								columns={columns(true)}
								data={allTokensData}
								direction={"rtl"}
							/>

							<div className="d-flex align-items-center justify-content-center" ref={loader}>
								{page.hasMore || (allTokensData.length === 0 && page > 1) ? (
									page.seeMore ? (
										<div className="py-4">
											<button className="btn btn-light-primary py-3" onClick={showMoreTokens}>
												See More
											</button>
										</div>
									) : (
										<div className="py-5">
											<Loading width={40} height={40} active id={`tokens-list`} />
										</div>
									)
								) : null}
							</div>
						</Tab.Pane>
					</Tab.Content>
				</Col>
			</Row>
		</Tab.Container>
	);
};

export default withRouter(MarketTokens);
