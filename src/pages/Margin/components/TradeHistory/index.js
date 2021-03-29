import { connect } from "react-redux";

import { OrderSide, ServerState, USE_RELAYER_MARKET_UPDATES } from "../../../../constants";
import { changeMarket } from "../../../../state/spot/actions";
import { isWeth } from "../../../../utils/known_tokens";
import { getCurrencyPairByTokensSymbol } from "../../../../utils/spot/knownCurrencyPair";
import { marketToStringFromTokens } from "../../../../utils/spot/market";
import { formatTokenSymbol, tokenAmountInUnits } from "../../../../utils/spot/tokens";
import Loading from "../../../../components/Loading";
import React from "react";
import styled from "styled-components";
import { lighten } from "polished";
import BigNumber from "bignumber.js";
import moment from "moment";
import { useTranslation } from "react-i18next";

const EmptyText = styled.span`
	font-size: 0.875rem;
	font-weight: 400;
	color: ${({ theme }) => theme.text1};
`;
const Container = styled.div`
	width: 280px;
	display: flex;
	flex-direction: column;

	@media (max-width: 1400px) {
		width: 100%;
	}
`;

const TR = styled.div`
	padding: 4px 16px;
	border-radius: 12px;
	margin-bottom: 4px;
	max-height: 24px;
	height: 24px;
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;

	@media (max-width: 1400px) {
		max-height: 56px;
		padding: 18px 20px;
		border-radius: 18px;
		height: 56px;
	}
`;
const CustomHead = styled(TR)`
	background-color: ${({ theme }) => theme.text1}10;
	max-height: 32px;
	height: 32px;
	margin-bottom: 12px;
	padding: 8px 16px;
`;

const TH = styled.span`
	color: ${({ theme }) => theme.text1};
	font-size: 0.75rem;
	font-weight: 400;
`;

const TD = styled.span`
	color: ${({ theme, variant }) => (variant ? theme[variant] : theme.text1)};
	font-size: 0.75rem;
	font-weight: 400;
	padding-right: 5px;
`;

const TBody = styled.div`
	display: flex;
	flex-direction: column;
	flex: 1;
	max-height: 366px;
	min-height: 366px;
	overflow-x: hidden;
	overflow-y: auto;

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

const TableContainer = styled.div`
	padding-top: 43px;
	padding-left: 8px;

	@media (max-width: 1400px) {
		padding: 0;
	}
`;

const fillToRow = (fill, index) => {
	const amount = fill.amount;

	const price = fill.price;

	return (
		<TR key={index}>
			<TD>{amount}</TD>
			<TD variant={"success"}>{price}</TD>
			<TD>{moment(fill.createdAt).format("HH:mm:ss")}</TD>
		</TR>
	);
};

const TradeHistory = (props) => {
	let content;
	const { t } = useTranslation();
	const { selectedMarket, trades, tradesStats } = props;

	if (!selectedMarket || tradesStats === ServerState.NotLoaded) {
		content = (
			<div className="w-100 h-100 d-flex align-items-center justify-content-center">
				<Loading
					width={40}
					height={40}
					id={`margin-trading-history-${props.isMobile ? "mobile" : "desktop"}`}
					active
				/>
			</div>
		);
	} else if (!trades || trades.length === 0) {
		content = (
			<div className={"d-flex flex-column"}>
				<div className="w-100 h-100 d-flex align-items-center justify-content-center">
					<EmptyText>{t("errors.noTrade")}</EmptyText>
				</div>
			</div>
		);
	} else {
		content = (
			<TableContainer className="d-flex flex-column">
				<CustomHead>
					<TH>{t("size")}</TH>
					<TH>
						{t("price")} ({selectedMarket.quoteAsset})
					</TH>
					<TH>{t("time")}</TH>
				</CustomHead>
				<TBody>{trades.map((t, i) => fillToRow(t, i, selectedMarket))}</TBody>
			</TableContainer>
		);
	}

	return <Container>{content}</Container>;
};

const mapStateToProps = (state) => {
	return {
		selectedMarket: state.margin.selectedMarketStats,
		trades: state.margin.trades.data,
		tradesStats: state.margin.trades.state,
	};
};

export default connect(mapStateToProps)(TradeHistory);
