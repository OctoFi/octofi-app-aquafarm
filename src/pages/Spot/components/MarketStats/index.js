import React, { useCallback, useState } from "react";
import { connect } from "react-redux";
import { BigNumber } from "@0x/utils";
import styled from "styled-components";
import { lighten } from "polished";
import { withRouter } from "react-router-dom";
import queryString from "query-string";

import { ServerState } from "../../../../constants";
import { getMarketFilters } from "../../../../common/markets";
import { changeMarket } from "../../../../state/spot/actions";
import { formatTokenSymbol } from "../../../../utils/spot/tokens";
import { filterMarketsByString, filterMarketsByTokenSymbol, marketToString } from "../../../../utils/spot/market";

import { ResponsiveCard } from "../../../../components/Card";
import { useActiveWeb3React } from "../../../../hooks";
import Loading from "../../../../components/Loading";
import SearchIcon from "../../../../assets/images/search.svg";
import "./styles.scss";
import BootstrapTable from "react-bootstrap-table-next";
import { useTranslation } from "react-i18next";
import SVG from "react-inlinesvg";
import {
	InputGroupFormControl as FormControl,
	InputGroupPrepend,
	InputGroupText,
	InputGroup,
} from "../../../../components/Form";

const Card = styled(ResponsiveCard)`
	display: flex;
	flex-direction: column;
	align-items: stretch;
	margin-bottom: 20px;

	& .card-body {
		padding: 30px;
	}

	@media (min-width: 1400px) {
		width: 228px;
		height: 486px;
		margin-bottom: 10px;

		& .card-body {
			padding: 10px;
		}
	}
`;

const EmptyText = styled.span`
	font-size: 0.875rem;
	font-weight: 400;
	color: ${({ theme }) => theme.text1};
`;

const CustomInputGroup = styled(InputGroup)`
	font-size: 0.75rem;

	.input-group-text {
		padding-left: 1.25rem;
		padding-right: 0.625rem;
	}

	& input {
		font-size: 0.75rem !important;
		padding-left: 0;
	}

	& img {
		width: 1rem;
		height: 1rem;
	}
`;

const PriceChange = styled.span`
	color: ${(props) =>
		props.value > 0 ? props.theme.success : props.value < 0 ? props.theme.danger : props.theme.text3};
	display: block;
`;

const TokenFiltersTabs = styled.div`
	width: 100%;
	flex-wrap: nowrap;
	padding: 15px 0;
`;

const TokenFiltersTab = styled.button`
	background-color: transparent;
	border: none;
	color: ${({ active, theme }) => (active ? theme.primary : theme.text1)};
	font-size: 12px;
	font-weight: 400;

	&:active,
	&:focus {
		outline: none;
		box-shadow: none;
		text-decoration: none;
	}
`;

const Text = styled.span`
	color: ${({ theme, variant }) => (variant ? theme[variant] : theme.text1)};
	font-size: 0.75rem;
	font-weight: 400;
	cursor: pointer;
`;

const AutoHeight = styled.div`
	display: flex;
	flex-direction: column;
	flex: 1;
	overflow-y: auto;
	overflow-x: hidden;
	max-height: 360px;

	@media (max-width: 1400px) {
		max-height: initial;
	}

	/* width */
	::-webkit-scrollbar {
		width: 3px;
	}

	/* Track */
	::-webkit-scrollbar-track {
		box-shadow: none;
		background-color: transparent;
		border-radius: 10px;
		padding: 0 6px;
		margin: 0 6px;
		border-right: 1px solid ${({ theme }) => theme.text1};
	}

	/* Handle */
	::-webkit-scrollbar-thumb {
		background: ${({ theme }) => theme.text1};
		border-radius: 10px;
		width: 4px !important;
	}

	/* Handle on hover */
	::-webkit-scrollbar-thumb:hover {
		background: ${({ theme }) => lighten(0.08, theme.text1)};
	}
`;

const MarketStats = (props) => {
	const { account, library } = useActiveWeb3React();
	const { t } = useTranslation();
	const [query, setQuery] = useState("");
	const [selectedFilter, setSelectedFilter] = useState(getMarketFilters()[0]);
	const { baseToken, quoteToken, markets, marketsStats, marketsStatsState } = props;

	const _getLastPrice = (market, marketStat) => {
		if (marketStat && marketStat.last_price) {
			return new BigNumber(marketStat.last_price).toFixed(market.currencyPair.config.pricePrecision);
		}

		return "-";
	};

	const _getLastPriceChange = (marketStat) => {
		if (marketStat && marketStat.last_price_change_24) {
			return (
				<PriceChange value={marketStat.last_price_change_24}>{`${new BigNumber(marketStat.last_price_change_24)
					.times(100)
					.toFixed(2)} %`}</PriceChange>
			);
		}

		return <PriceChange value={0}>{`${new BigNumber(0).toFixed(2)} %`}</PriceChange>;
	};

	const _setTokensFilterTab = (filter) => {
		setSelectedFilter(filter);
	};

	const _setSelectedMarket = (currencyPair, account, library) => {
		const callback = (currencyPair) => {
			const newSearch = queryString.stringify({
				base: currencyPair.base,
				quote: currencyPair.quote,
			});
			props.history.push(`${props.match.path}?${newSearch}`);
		};
		callback(currencyPair);
		props.changeMarket(currencyPair, account, library);
	};

	const changeQueryHandler = useCallback((e) => {
		setQuery(e.target.value);
	}, []);

	const columns = [
		{
			dataField: "market",
			text: t("market"),
			formatter: (cellContent, row, rowIndex) => {
				const baseSymbol = formatTokenSymbol(row.currencyPair.base).toUpperCase();
				const quoteSymbol = formatTokenSymbol(row.currencyPair.quote).toUpperCase();
				return (
					<Text>
						{baseSymbol} / {quoteSymbol}
					</Text>
				);
			},
		},
		{
			dataField: "price",
			text: t("table.price"),
			formatter: (cellContent, row, rowIndex, { _getLastPrice, marketsStats }) => {
				const marketStats =
					marketsStats && marketsStats.find((m) => m.pair.toUpperCase() === marketToString(row.currencyPair));
				return <Text>{_getLastPrice(row, marketStats)}</Text>;
			},
			formatExtraData: {
				_getLastPrice,
				marketsStats,
			},
		},
	];

	const rowEvents = {
		onClick: (e, row) => {
			_setSelectedMarket(row.currencyPair, account, library);
		},
	};

	const _getMarkets = () => {
		const { baseToken, markets } = props;

		if (!baseToken || !markets) {
			return null;
		}

		const filteredMarkets =
			selectedFilter == null || selectedFilter.value === null
				? markets
				: filterMarketsByTokenSymbol(markets, selectedFilter.value);
		const searchedMarkets = filterMarketsByString(filteredMarkets, query);

		return (
			<AutoHeight>
				<BootstrapTable
					bordered={false}
					classes="table table-head-custom table-borderless table-vertical-center overflow-hidden market-stats__table"
					bootstrap4
					keyField={"id"}
					remote
					rowEvents={rowEvents}
					data={searchedMarkets === null ? [] : searchedMarkets}
					columns={columns}
				/>
			</AutoHeight>
		);
	};

	if (!baseToken || !quoteToken || marketsStatsState === ServerState.NotLoaded) {
		return (
			<Card>
				<div className="w-100 h-100 d-flex align-items-center justify-content-center">
					<Loading width={40} height={40} id={`spots-${props.isMobile ? "mobile" : "desktop"}`} active />
				</div>
			</Card>
		);
	} else if (!baseToken || !quoteToken) {
		return (
			<Card>
				<div className="w-100 h-100 d-flex align-items-center justify-content-center">
					<EmptyText>{t("errors.noMarket")}</EmptyText>
				</div>
			</Card>
		);
	} else if (!markets && !marketsStats) {
		return (
			<Card>
				<div className="w-100 h-100 d-flex align-items-center justify-content-center">
					<Loading
						width={40}
						height={40}
						id={`spots-markets-loading-${props.isMobile ? "mobile" : "desktop"}`}
						active
					/>
				</div>
			</Card>
		);
	}

	return (
		<Card>
			<CustomInputGroup className={"w-auto"}>
				<InputGroupPrepend>
					<InputGroupText>
						<SVG src={SearchIcon} />
					</InputGroupText>
				</InputGroupPrepend>
				<FormControl id="PoolsSearch" placeholder={t("search")} onChange={changeQueryHandler} />
			</CustomInputGroup>

			<TokenFiltersTabs className={"d-flex align-items-center justify-content-between"}>
				{getMarketFilters().map((filter, index) => {
					return (
						<TokenFiltersTab
							active={filter === selectedFilter}
							key={index}
							onClick={_setTokensFilterTab.bind(this, filter)}
						>
							{filter.text}
						</TokenFiltersTab>
					);
				})}
			</TokenFiltersTabs>
			{_getMarkets()}
		</Card>
	);
};

const mapStateToProps = (state) => {
	return {
		baseToken: state.spot.baseToken,
		currencyPair: state.spot.currencyPair,
		markets: state.spot.markets,
		quoteToken: state.spot.quoteToken,
		marketsStats: state.spot.marketsStats,
		marketsStatsState: state.relayer.marketsStatsState,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		changeMarket: (currencyPair) => dispatch(changeMarket(currencyPair)),
	};
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MarketStats));
