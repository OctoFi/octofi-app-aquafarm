import { connect } from "react-redux";
import { Component } from "react";
import styled from "styled-components";
import { BigNumber } from "@0x/utils";
import { Button } from "react-bootstrap";

import { getQuoteInUsd, getTokensPrice } from "../../../../state/selectors";
import { fetchTakerAndMakerFee } from "../../../../state/relayer/actions";
import withWeb3Account from "../../../../components/hoc/withWeb3Account";
import { ServerState as SwapQuoteState, ZERO } from "../../../../constants";
import { computeOrderSizeFromInventoryBalance, computePriceFromQuote } from "../../../../utils/spot/marketMaker";
import Skeleton from "react-loading-skeleton";
import { formatTokenSymbol, tokenAmountInUnits } from "../../../../utils/spot/tokens";

const Title = styled.h3`
	margin-top: 0;
	padding: 0;
	margin-bottom: 2.25rem;
	font-size: 1.25rem;
	font-weight: 700;
	color: ${({ theme }) => theme.text1};
`;

const Header = styled.div`
	margin-bottom: 20px;
`;

const HeaderTitle = styled(Title)`
	margin-bottom: 0;
`;
const Price = styled(Title)`
	margin-bottom: 0;
	opacity: 0.5;
	cursor: pointer;
`;

const Content = styled.div`
	border-radius: 18px;
	background-color: ${({ theme }) => theme.bg1};
	padding: 20px;
	display: flex;
	flex-direction: column;
	flex: 1;
`;

const InnerContent = styled.div`
	display: grid;
	grid-gap: 30px 40px;
	grid-template-columns: 1fr 1fr;
	margin-bottom: 50px;

	@media (max-width: 1400px) {
		grid-template-columns: 1fr;
		grid-template-rows: 1fr 1fr;
		margin-bottom: 30px;
	}
`;

const InnerRow = styled.div`
	display: grid;
	grid-gap: 30px;
	grid-template-rows: 1fr 1fr 1fr;
`;

const Cell = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

const Label = styled.span`
	font-weight: 400;
	font-size: 16px;
	color: ${({ theme }) => theme.text1};
`;

const Value = styled.span`
	font-weight: 500;
	font-size: 16px;
	color: ${({ theme }) => theme.text1};
	opacity: 0.5;
`;

const Btn = styled(Button)`
	height: 56px;
	padding: 10px 20px;

	@media (max-width: 1400px) {
		&:first-child {
			margin-bottom: 20px;
		}
	}
`;

class MarketMakerDetails extends Component {
	state = {
		quoteBuyTokenAmount: ZERO,
		quoteSellTokenAmount: ZERO,
		baseBuyTokenAmount: ZERO,
		baseSellTokenAmount: ZERO,
		canOrderBeFilled: true,
		maxAmount: ZERO,
		priceBuy: ZERO,
		priceSell: ZERO,
		geckoPrice: ZERO,
	};

	render() {
		const costBuy = this._getCostStringForRender(false);
		const costSell = this._getCostStringForRender(true);
		const costBuyText = this._getCostLabelStringForRender(false);
		const costSellText = this._getCostLabelStringForRender(true);
		const costBaseBuy = this._getBaseCostStringForRender(false);
		const costBaseSell = this._getBaseCostStringForRender(true);
		const costBaseBuyText = this._getBaseCostLabelStringForRender(false);
		const costBaseSellText = this._getBaseCostLabelStringForRender(true);
		const priceBuyMedianText = this._getMedianPriceStringForRender(false);
		const priceSellMedianText = this._getMedianPriceStringForRender(true);
		const priceMarketTrackerText = this._getPriceMarketRender();

		return (
			<div className="d-flex flex-column">
				<Header className="d-flex align-items-center justify-content-between">
					<HeaderTitle>Price by Coingecko:</HeaderTitle>
					<Price onClick={this._onTrackerPriceClick}>{priceMarketTrackerText}</Price>
				</Header>
				<Content>
					<InnerContent>
						<InnerRow>
							<Cell>
								<Label>Best Bid:</Label>
								<Value>{priceSellMedianText}</Value>
							</Cell>
							<Cell>
								<Label>{costBuyText}</Label>
								<Value>{costSell}</Value>
							</Cell>
							<Cell>
								<Label>{costBaseBuyText}</Label>
								<Value>{costBaseSell}</Value>
							</Cell>
						</InnerRow>
						<InnerRow>
							<Cell>
								<Label>Best Ask:</Label>
								<Value>{priceBuyMedianText}</Value>
							</Cell>
							<Cell>
								<Label>{costSellText}</Label>
								<Value>{costBuy}</Value>
							</Cell>
							<Cell>
								<Label>{costBaseSellText}</Label>
								<Value>{costBaseBuy}</Value>
							</Cell>
						</InnerRow>
					</InnerContent>

					<div className="d-flex flex-column flex-xl-row align-items-xl-center align-items-stretch justify-content-between">
						<Btn variant={"primary"} disabled={this.props.buyDisabled} onClick={this.props.onBuy}>
							Place Buy Limit Order
						</Btn>
						<Btn disabled={this.props.sellDisabled} variant={"secondary-light"} onClick={this.props.onSell}>
							Place Sell Limit Order
						</Btn>
					</div>
				</Content>
			</div>
		);
	}

	componentDidUpdate = async (prevProps) => {
		const newProps = this.props;
		if (
			newProps.tokenAmount !== prevProps.tokenAmount ||
			newProps.sellQuote !== prevProps.sellQuote ||
			newProps.buyQuote !== prevProps.buyQuote ||
			newProps.quoteState !== prevProps.quoteState ||
			newProps.inventoryBalance !== prevProps.inventoryBalance
		) {
			if (newProps.quoteState === SwapQuoteState.Done) {
				await this._updateOrderDetailsState();
			}
		}
	};

	componentDidMount = async () => {
		await this._updateOrderDetailsState();
	};

	_updateOrderDetailsState = async () => {
		const { sellQuote, buyQuote, baseToken, quoteToken, tokenPrices, inventoryBalance } = this.props;
		const inventoryBalanceBN = new BigNumber(inventoryBalance).dividedBy(100);

		if (!buyQuote || !sellQuote) {
			this.setState({ canOrderBeFilled: false });
			return;
		}
		const bestBuyQuote = buyQuote.bestCaseQuoteInfo;
		const priceBuy = computePriceFromQuote(false, buyQuote, baseToken, quoteToken);
		const quoteBuyTokenAmount = computeOrderSizeFromInventoryBalance(
			bestBuyQuote.takerAssetAmount,
			inventoryBalanceBN,
			true
		);
		const baseBuyTokenAmount = computeOrderSizeFromInventoryBalance(
			bestBuyQuote.makerAssetAmount,
			inventoryBalanceBN,
			true
		);

		const priceSell = computePriceFromQuote(true, sellQuote, baseToken, quoteToken);
		const bestSellQuote = sellQuote.bestCaseQuoteInfo;
		const quoteSellTokenAmount = computeOrderSizeFromInventoryBalance(
			bestSellQuote.makerAssetAmount,
			inventoryBalanceBN,
			false
		);
		const baseSellTokenAmount = computeOrderSizeFromInventoryBalance(
			bestSellQuote.takerAssetAmount,
			inventoryBalanceBN,
			false
		);

		let geckoPrice;
		if (tokenPrices) {
			const tokenPriceQuote = tokenPrices.find((t) => t.c_id === quoteToken.c_id);
			const tokenPriceBase = tokenPrices.find((t) => t.c_id === baseToken.c_id);
			if (tokenPriceQuote && tokenPriceBase) {
				geckoPrice = tokenPriceBase.price_usd.div(tokenPriceQuote.price_usd);
			}
		}

		this.setState({
			quoteBuyTokenAmount,
			quoteSellTokenAmount,
			baseBuyTokenAmount,
			baseSellTokenAmount,
			canOrderBeFilled: true,
			priceBuy,
			priceSell,
			geckoPrice,
		});
	};

	_getCostStringForRender = (isSell) => {
		const { canOrderBeFilled } = this.state;
		const { quoteToken, quoteState, tokenPrices } = this.props;
		if (quoteState === SwapQuoteState.Loading) {
			return <Skeleton width={120} />;
		}

		if (!canOrderBeFilled || quoteState === SwapQuoteState.Error) {
			return `---`;
		}
		let quoteInUSD;
		if (tokenPrices) {
			const tokenPrice = tokenPrices.find((t) => t.c_id === quoteToken.c_id);
			if (tokenPrice) {
				quoteInUSD = tokenPrice.price_usd;
			}
		}

		const { quoteBuyTokenAmount, quoteSellTokenAmount } = this.state;
		if (isSell) {
			const quoteSellTokenAmountUnits = tokenAmountInUnits(quoteSellTokenAmount, quoteToken.decimals);
			const costSellAmount = tokenAmountInUnits(
				quoteSellTokenAmount,
				quoteToken.decimals,
				quoteToken.displayDecimals
			);
			if (quoteInUSD) {
				const quotePriceAmountUSD = new BigNumber(quoteSellTokenAmountUnits).multipliedBy(quoteInUSD);
				return `${costSellAmount} ${formatTokenSymbol(quoteToken.symbol)} (${quotePriceAmountUSD.toFixed(
					2
				)} $)`;
			} else {
				return `${costSellAmount} ${formatTokenSymbol(quoteToken.symbol)}`;
			}
		} else {
			const quoteBuyTokenAmountUnits = tokenAmountInUnits(quoteBuyTokenAmount, quoteToken.decimals);
			const costBuyAmount = tokenAmountInUnits(
				quoteBuyTokenAmount,
				quoteToken.decimals,
				quoteToken.displayDecimals
			);
			if (quoteInUSD) {
				const quotePriceAmountUSD = new BigNumber(quoteBuyTokenAmountUnits).multipliedBy(quoteInUSD);
				return `${costBuyAmount} ${formatTokenSymbol(quoteToken.symbol)} (${quotePriceAmountUSD.toFixed(2)} $)`;
			} else {
				return `${costBuyAmount} ${formatTokenSymbol(quoteToken.symbol)}`;
			}
		}
	};

	_getBaseCostStringForRender = (isSell) => {
		const { canOrderBeFilled } = this.state;
		const { baseToken, quoteState, tokenPrices } = this.props;
		if (quoteState === SwapQuoteState.Loading) {
			return <Skeleton width={120} />;
		}

		if (!canOrderBeFilled || quoteState === SwapQuoteState.Error) {
			return `---`;
		}
		let quoteInUSD;
		if (tokenPrices) {
			const tokenPrice = tokenPrices.find((t) => t.c_id === baseToken.c_id);
			if (tokenPrice) {
				quoteInUSD = tokenPrice.price_usd;
			}
		}

		const { baseBuyTokenAmount, baseSellTokenAmount } = this.state;
		if (isSell) {
			const quoteSellTokenAmountUnits = tokenAmountInUnits(baseSellTokenAmount, baseToken.decimals);
			const costSellAmount = tokenAmountInUnits(
				baseSellTokenAmount,
				baseToken.decimals,
				baseToken.displayDecimals
			);
			if (quoteInUSD) {
				const quotePriceAmountUSD = new BigNumber(quoteSellTokenAmountUnits).multipliedBy(quoteInUSD);
				return `${costSellAmount} ${formatTokenSymbol(baseToken.symbol)} (${quotePriceAmountUSD.toFixed(2)} $)`;
			} else {
				return `${costSellAmount} ${formatTokenSymbol(baseToken.symbol)}`;
			}
		} else {
			const quoteBuyTokenAmountUnits = tokenAmountInUnits(baseBuyTokenAmount, baseToken.decimals);
			const costBuyAmount = tokenAmountInUnits(baseBuyTokenAmount, baseToken.decimals, baseToken.displayDecimals);
			if (quoteInUSD) {
				const quotePriceAmountUSD = new BigNumber(quoteBuyTokenAmountUnits).multipliedBy(quoteInUSD);
				return `${costBuyAmount} ${formatTokenSymbol(baseToken.symbol)} (${quotePriceAmountUSD.toFixed(2)} $)`;
			} else {
				return `${costBuyAmount} ${formatTokenSymbol(baseToken.symbol)}`;
			}
		}
	};

	_getMedianPriceStringForRender = (isSell) => {
		const { canOrderBeFilled, priceBuy, priceSell } = this.state;
		const price = isSell ? priceSell : priceBuy;
		const { tokenAmount, quoteToken, quoteState } = this.props;

		if (quoteState === SwapQuoteState.Loading) {
			return <Skeleton width={120} />;
		}
		if (!canOrderBeFilled || quoteState === SwapQuoteState.Error) {
			return `---`;
		}
		if (tokenAmount.eq(0)) {
			return `---`;
		}
		const priceDisplay = price.toFormat(8);
		return `${priceDisplay} ${formatTokenSymbol(quoteToken.symbol)}`;
	};

	_getCostLabelStringForRender = (isSell) => {
		const { qouteInUSD } = this.props;
		if (qouteInUSD) {
			return isSell ? "Quote Sell (USD)" : "Quote Buy (USD)";
		} else {
			return isSell ? "Quote Sell" : "Quote Buy";
		}
	};

	_getBaseCostLabelStringForRender = (isSell) => {
		const { qouteInUSD } = this.props;
		if (qouteInUSD) {
			return isSell ? "Base Sell (USD)" : "Base Buy (USD)";
		} else {
			return isSell ? "Base Sell" : "Base Buy";
		}
	};

	_getPriceMarketRender = () => {
		const { quoteToken, quoteState } = this.props;
		const { geckoPrice } = this.state;
		if (quoteState === SwapQuoteState.Error) {
			return "---";
		}
		if (quoteState === SwapQuoteState.Loading) {
			return <Skeleton width={120} />;
		}
		if (geckoPrice && geckoPrice.gt(0)) {
			return `${geckoPrice.toFormat(8)} ${formatTokenSymbol(quoteToken.symbol)}`;
		}
		return "---";
	};

	_onTrackerPriceClick = (e) => {
		const { onTrackerPriceClick } = this.props;
		const { geckoPrice } = this.state;
		onTrackerPriceClick(geckoPrice);
	};
}

const mapStateToProps = (state) => {
	return {
		qouteInUSD: getQuoteInUsd(state),
		tokenPrices: getTokensPrice(state),
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		onFetchTakerAndMakerFee: (amount, price, side, account, library) =>
			dispatch(fetchTakerAndMakerFee(amount, price, side, side, account, library)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(withWeb3Account(MarketMakerDetails));
