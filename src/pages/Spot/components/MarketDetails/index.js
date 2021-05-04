import { connect } from "react-redux";
import { BigNumber } from "@0x/utils";
import styled from "styled-components";

import { USE_RELAYER_MARKET_UPDATES } from "../../../../constants";
import { changeMarket } from "../../../../state/spot/actions";
import {
	formatTokenName,
	formatTokenSymbol,
	getEtherscanLinkForToken,
	tokenAmountInUnits,
} from "../../../../utils/spot/tokens";
import {
	getCurrentMarketLastPrice,
	getCurrentMarketTodayClosedOrders,
	getCurrentMarketTodayHighPrice,
	getCurrentMarketTodayLowerPrice,
	getCurrentMarketTodayQuoteVolume,
} from "../../../../state/selectors";
import StyledCard from "../../../../components/Card";
import { useActiveWeb3React } from "../../../../hooks";
import Loading from "../../../../components/Loading";
import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import Img from "../../../../components/UI/Img";
import { toAbsoluteUrl } from "../../../../lib/helper";
import "./styles.scss";
import ResponsiveTable from "../../../../components/ResponsiveTable";
import { useTranslation } from "react-i18next";

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

const Logo = styled(Img)`
	width: 24px;
	min-width: 24px;
	height: 24px;
	border-radius: 24px;
	border: 1px solid ${({ theme }) => theme.text1};
	display: block;
	margin-right: 5px;

	@media (max-width: 1400px) {
		margin-right: 10px;
	}
`;

const Text = styled.span`
	color: ${({ theme, variant }) => (variant ? theme[variant] : theme.text1)};
	font-size: 0.875rem;
	font-weight: 500;
`;

const MarketDetails = (props) => {
	const { t } = useTranslation();
	const { baseToken, quoteToken, currencyPair } = props;

	const { highPrice, lowerPrice, volume, closedOrders, lastPrice } = props;

	const marketStats = {
		highPrice,
		lowerPrice,
		volume,
		closedOrders,
		lastPrice,
	};

	const columns = [
		{
			dataField: "project",
			text: t("project"),
			formatter: (cellContent, row, rowIndex) => {
				return (
					<div className="d-flex align-items-center">
						<Logo src={toAbsoluteUrl(`/${row.baseToken.icon}`)} />
					</div>
				);
			},
		},
		{
			dataField: "last_price",
			text: t("table.price"),
			formatter: (cellContent, row, rowIndex) => {
				const lastPrice = row.marketStats.lastPrice
					? new BigNumber(row.marketStats.lastPrice).toFixed(row.currencyPair.config.pricePrecision)
					: "-";
				return <Text>{lastPrice}</Text>;
			},
		},
		{
			dataField: "max_price",
			text: t("table.24_high"),
			formatter: (cellContent, row, rowIndex) => {
				return (
					<Text>
						{(row.marketStats.highPrice &&
							row.marketStats.highPrice.toFixed(row.currencyPair.config.pricePrecision)) ||
							"-"}
					</Text>
				);
			},
		},
		{
			dataField: "min_price",
			text: t("table.24_low"),
			formatter: (cellContent, row, rowIndex) => {
				return <Text>{(row.marketStats.lowerPrice && row.marketStats.lowerPrice.toFixed(4)) || "-"}</Text>;
			},
		},
		{
			dataField: "volume",
			text: t("table.24_volume"),
			formatter: (cellContent, row, rowIndex) => {
				let volume;
				if (USE_RELAYER_MARKET_UPDATES) {
					volume =
						(row.marketStats.volume &&
							`${row.marketStats.volume.toFixed(row.quoteToken.displayDecimals)} ${formatTokenSymbol(
								row.quoteToken.symbol
							)}`) ||
						"- ";
				} else {
					volume =
						(row.marketStats.volume &&
							`${tokenAmountInUnits(
								row.marketStats.volume,
								row.quoteToken.decimals,
								row.quoteToken.displayDecimals
							).toString()} ${formatTokenSymbol(row.quoteToken.symbol)}`) ||
						"- ";
				}
				return <Text>{volume}</Text>;
			},
		},
		{
			dataField: "closed_orders",
			text: "Orders Closed",
			formatter: (cellContent, row, rowIndex) => {
				return <Text>{row.marketStats.closedOrders || "-"}</Text>;
			},
		},
	];

	if (!baseToken || !quoteToken) {
		return (
			<Card>
				<div className="w-100 h-100 d-flex align-items-center justify-content-center">
					<Loading
						width={40}
						height={40}
						id={`spots-markets-details-${props.isMobile ? "mobile" : "desktop"}`}
						active
					/>
				</div>
			</Card>
		);
	}

	return (
		<Card>
			<BootstrapTable
				wrapperClasses="d-none d-lg-block"
				bordered={false}
				classes="table table-head-custom table-borderless table-vertical-center overflow-hidden market-details__table"
				bootstrap4
				keyField={"id"}
				remote
				data={[{ marketStats, baseToken, quoteToken, currencyPair }]}
				columns={columns}
			/>
			<ResponsiveTable
				breakpoint={"lg"}
				columns={columns}
				data={[{ marketStats, baseToken, quoteToken, currencyPair }]}
				direction={"rtl"}
				withoutBorder
			/>
		</Card>
	);
};

const mapStateToProps = (state) => {
	return {
		baseToken: state.spot.baseToken,
		currencyPair: state.spot.currencyPair,
		quoteToken: state.spot.quoteToken,
		highPrice: getCurrentMarketTodayHighPrice(state),
		lowerPrice: getCurrentMarketTodayLowerPrice(state),
		volume: getCurrentMarketTodayQuoteVolume(state),
		closedOrders: getCurrentMarketTodayClosedOrders(state),
		lastPrice: getCurrentMarketLastPrice(state),
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		changeMarket: (currencyPair) => dispatch(changeMarket(currencyPair)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(MarketDetails);
