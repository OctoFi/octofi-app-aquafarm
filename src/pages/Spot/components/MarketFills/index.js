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
	max-height: 338px;
	min-height: 338px;
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
	padding-top: 77px;
	padding-left: 8px;

	@media (max-width: 1400px) {
		padding: 0;
	}
`;

const fillToRow = (fill, index) => {
	let amountBase;
	USE_RELAYER_MARKET_UPDATES
		? (amountBase = fill.amountBase.toFixed(fill.tokenBase.displayDecimals))
		: (amountBase = tokenAmountInUnits(fill.amountBase, fill.tokenBase.decimals, fill.tokenBase.displayDecimals));

	const displayAmountBase = `${amountBase}`;
	let currencyPair;
	try {
		currencyPair = getCurrencyPairByTokensSymbol(fill.tokenBase.symbol, fill.tokenQuote.symbol);
	} catch {
		return null;
	}
	const price = parseFloat(fill.price.toString()).toFixed(currencyPair.config.pricePrecision);

	return (
		<TR key={index}>
			<TD variant={fill.side === OrderSide.Buy ? "success" : "danger"}>{price}</TD>
			<TD>{displayAmountBase}</TD>
			<TD>{fill.timestamp.toISOString().slice(-13, -5)}</TD>
		</TR>
	);
};
const MarketFills = (props) => {
	let content;
	const { t } = useTranslation();
	const { marketFills, baseToken, quoteToken, marketFillsState } = props;

	if (!baseToken || !quoteToken || marketFillsState === ServerState.NotLoaded) {
		content = (
			<div className="w-100 h-100 d-flex align-items-center justify-content-center">
				<Loading width={40} height={40} id={`market-fills-${props.isMobile ? "mobile" : "desktop"}`} active />
			</div>
		);
	} else if (
		!Object.keys(marketFills).length ||
		!baseToken ||
		!quoteToken ||
		!marketFills[marketToStringFromTokens(baseToken, quoteToken)]
	) {
		content = (
			<div className={"d-flex flex-column"}>
				<div className="w-100 h-100 d-flex align-items-center justify-content-center">
					<EmptyText>{t("errors.noTrade")}</EmptyText>
				</div>
			</div>
		);
	} else {
		const market = marketToStringFromTokens(baseToken, quoteToken);
		const tokenQuoteSymbol = isWeth(quoteToken.symbol) ? "ETH" : quoteToken.symbol.toUpperCase();
		const tokenBaseSymbol = isWeth(baseToken.symbol) ? "ETH" : baseToken.symbol.toUpperCase();

		content = (
			<TableContainer className="d-flex flex-column">
				<CustomHead>
					<TH>
						{t("price")} ({tokenQuoteSymbol})
					</TH>
					<TH>{t("amount")}</TH>
					<TH>{t("time")}</TH>
				</CustomHead>
				<TBody>{marketFills[market].map((marketFill, index) => fillToRow(marketFill, index))}</TBody>
			</TableContainer>
		);
	}
	return <Container>{content}</Container>;
};

const mapStateToProps = (state) => {
	return {
		baseToken: state.spot.baseToken,
		marketFills: state.spotUI.marketFills,
		quoteToken: state.spot.quoteToken,
		marketFillsState: state.relayer.marketFillsState,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		changeMarket: (currencyPair) => dispatch(changeMarket(currencyPair)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(MarketFills);
