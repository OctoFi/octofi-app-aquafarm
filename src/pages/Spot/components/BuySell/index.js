import { connect } from "react-redux";
import { BigNumber } from "@0x/utils";
import { Component } from "react";
import { Button } from "react-bootstrap";
import styled from "styled-components";

import { ZERO, IS_ORDER_LIMIT_MATCHING, OrderSide } from "../../../../constants";
import {
	startBuySellLimitMatchingSteps,
	startBuySellLimitSteps,
	startBuySellMarketSteps,
} from "../../../../state/spotUI/actions";
import { fetchTakerAndMakerFee } from "../../../../state/relayer/actions";
import { isWeth, getKnownTokens } from "../../../../utils/known_tokens";
import {
	formatTokenSymbol,
	tokenAmountInUnits,
	tokenAmountInUnitsToBigNumber,
	unitsInTokenAmount,
} from "../../../../utils/spot/tokens";
import {
	getCurrencyPair,
	getMakerAmountSelected,
	getOpenBuyOrders,
	getOpenSellOrders,
	getOrderPriceSelected,
} from "../../../../state/selectors";
import { ResponsiveCard } from "../../../../components/Card";
import SpotInputPanel from "../../../../components/SpotInputPanel";
import OrderDetailsContainer from "../../../../components/OrderDetailsContainer";
import withBalance from "../../../../components/hoc/withBalance";
import withWeb3Account from "../../../../components/hoc/withWeb3Account";
import { withTranslation } from "react-i18next";

const Card = styled(ResponsiveCard)`
	margin-bottom: 20px;

	& .card-body {
		padding: 30px;
	}

	@media (min-width: 1400px) {
		width: 580px;
		height: 385px;
		margin-bottom: 10px;

		& .card-body {
			padding: 20px;
			display: flex;
			flex-direction: column;
		}
	}
`;

const QuoteContainer = styled.div`
	display: flex;
	flex-direction: column;
	margin-bottom: -5px;

	@media (max-width: 1400px) {
		padding-top: 0;
		margin-bottom: -24px;
	}
`;

const TabsContainer = styled.div`
	margin-left: -20px;
	margin-right: -20px;
	margin-bottom: 10px;

	@media (max-width: 1400px) {
		flex-direction: column-reverse;
		align-items: stretch !important;
		margin-bottom: 45px;
	}
`;

const TabWrapper = styled.div`
	padding: 0 20px;
	flex: 1;

	@media (max-width: 1400px) {
		&:not(:first-child) {
			margin-bottom: 10px;
		}
	}
`;

const Tab = styled(Button)`
	height: 48px;
	font-size: 1rem;
	font-weight: 500;
	width: 100%;
`;

const Content = styled.div`
	flex: 1;
	position: relative;
`;

const DetailsContainer = styled.div`
	margin-bottom: auto;
`;

const MarketType = styled.div`
	position: absolute;
	top: -14px;
	right: 0;
	z-index: 2;
`;

const MarketButton = styled.button`
	:disabled {
		color: ${({ theme }) => theme.text1};
		opacity: 1;
	}
`;

const OrderType = {
	Limit: "Limit",
	Market: "Market",
};

const TIMEOUT_BTN_ERROR = 2000;
const TIMEOUT_CARD_ERROR = 4000;

class BuySell extends Component {
	state = {
		makerAmount: null,
		price: null,
		orderType: OrderType.Limit,
		tab: OrderSide.Buy,
		error: {
			btnMsg: null,
			cardMsg: null,
		},
	};

	componentDidUpdate = async (prevProps) => {
		const newProps = this.props;
		if (newProps.orderPriceSelected !== prevProps.orderPriceSelected && this.state.orderType === OrderType.Limit) {
			this.setState({
				price: newProps.orderPriceSelected,
			});
		}

		if (
			newProps.makerAmountSelected !== prevProps.makerAmountSelected &&
			this.state.orderType === OrderType.Market
		) {
			this.setState({
				makerAmount: newProps.makerAmountSelected,
			});
		}
	};

	changeTab = (tab) => () => this.setState({ tab });

	updateMakerAmount = (newValue) => {
		this.setState({
			makerAmount: newValue,
		});
	};

	getAmountAvailableLabel = () => {
		const { baseTokenBalance, quoteTokenBalance, totalEthBalance } = this.props;
		const { tab } = this.state;
		if (tab === OrderSide.Sell) {
			if (baseTokenBalance) {
				const tokenBalanceAmount = isWeth(baseTokenBalance.token.symbol)
					? totalEthBalance
					: baseTokenBalance.balance;
				const baseBalanceString = tokenAmountInUnits(
					tokenBalanceAmount,
					baseTokenBalance.token.decimals,
					baseTokenBalance.token.displayDecimals
				);
				const symbol = formatTokenSymbol(baseTokenBalance.token?.symbol);
				return `Available: ${baseBalanceString}  ${symbol}`;
			} else {
				return null;
			}
		} else {
			if (quoteTokenBalance) {
				const tokenBalanceAmount = isWeth(quoteTokenBalance.token?.symbol)
					? totalEthBalance
					: quoteTokenBalance.balance;
				const quoteBalanceString = tokenAmountInUnits(
					tokenBalanceAmount,
					quoteTokenBalance.token?.decimals,
					quoteTokenBalance.token?.displayDecimals
				);
				const symbol = formatTokenSymbol(quoteTokenBalance.token?.symbol);
				return `Available: ${quoteBalanceString}  ${symbol}`;
			} else {
				return null;
			}
		}
	};

	updatePrice = (price) => {
		this.setState({ price });
	};

	submit = async () => {
		if (!this.props.web3.account) {
			this.props.toggleWalletModal();
			return false;
		}
		const { currencyPair, tokensBalance, wethBalance, ethBalance, web3 } = this.props;
		const minAmount = currencyPair.config.minAmount;
		const decimals = getKnownTokens().getTokenBySymbol(currencyPair.base).decimals;
		const minAmountUnits = unitsInTokenAmount(String(minAmount), decimals);

		const orderSide = this.state.tab;
		const makerAmount = this.state.makerAmount || minAmountUnits;
		const price = this.state.price || new BigNumber(0);

		const orderFeeData = await this.props.onFetchTakerAndMakerFee(
			makerAmount,
			price,
			this.state.tab,
			web3.account,
			window.ethereum || web3.library
		);

		if (this.state.orderType === OrderType.Limit) {
			if (IS_ORDER_LIMIT_MATCHING) {
				const result = await this.props.onSubmitLimitOrderMatching(
					makerAmount,
					price,
					orderSide,
					orderFeeData,
					tokensBalance,
					wethBalance,
					ethBalance
				);
				if (result === 0) {
					await this.props.onSubmitLimitOrder(
						makerAmount,
						price,
						orderSide,
						orderFeeData,
						tokensBalance,
						wethBalance
					);
				}
			} else {
				await this.props.onSubmitLimitOrder(
					makerAmount,
					price,
					orderSide,
					orderFeeData,
					tokensBalance,
					wethBalance
				);
			}
		} else {
			try {
				await this.props.onSubmitMarketOrder(
					makerAmount,
					orderSide,
					tokensBalance,
					wethBalance,
					ethBalance.balance
				);
			} catch (error) {
				this.setState(
					{
						error: {
							btnMsg: "Error",
							cardMsg: error.message,
						},
					},
					() => {
						// After a timeout both error message and button gets cleared
						setTimeout(() => {
							this.setState({
								error: {
									...this.state.error,
									btnMsg: null,
								},
							});
						}, TIMEOUT_BTN_ERROR);
						setTimeout(() => {
							this.setState({
								error: {
									...this.state.error,
									cardMsg: null,
								},
							});
						}, TIMEOUT_CARD_ERROR);
					}
				);
			}
		}
		this._reset();
	};

	_reset = () => {
		this.setState({
			makerAmount: null,
		});
	};

	_switchToMarket = () => {
		this.setState({
			orderType: OrderType.Market,
		});
	};

	_switchToLimit = () => {
		this.setState({
			orderType: OrderType.Limit,
		});
	};

	_getCostLabelStringForRender = () => {
		const { qouteInUSD, orderSide } = this.props;
		if (qouteInUSD) {
			return orderSide === OrderSide.Sell ? "Total" : "Cost";
		} else {
			return orderSide === OrderSide.Sell ? "Total" : "Cost";
		}
	};

	render() {
		const {
			currencyPair,
			quoteTokenBalance,
			baseTokenBalance,
			totalEthBalance,
			baseToken,
			quoteToken,
			t,
		} = this.props;
		const { makerAmount, price, tab, orderType, error } = this.state;

		const buySellInnerTabs = [
			{
				active: orderType === OrderType.Limit,
				onClick: this._switchToLimit,
				text: t("limit"),
			},
			{
				active: orderType === OrderType.Market,
				onClick: this._switchToMarket,
				text: t("market"),
			},
		];
		const decimals = getKnownTokens().getTokenBySymbol(currencyPair.base).decimals;
		const quoteDecimals = getKnownTokens().getTokenBySymbol(currencyPair.quote).decimals;
		// Configs
		const pricePrecision = currencyPair.config.pricePrecision;
		const minAmount = currencyPair.config.minAmount;
		const minAmountUnits = unitsInTokenAmount(String(currencyPair.config.minAmount), decimals);

		const basePrecision = currencyPair.config.basePrecision;
		const isWethQuote = quoteTokenBalance && isWeth(quoteTokenBalance.token?.symbol);
		const isWethBase = baseTokenBalance && isWeth(baseTokenBalance.token?.symbol);

		const quoteUnits = isWethQuote
			? tokenAmountInUnitsToBigNumber(totalEthBalance || ZERO, 18)
			: tokenAmountInUnitsToBigNumber((quoteTokenBalance && quoteTokenBalance.balance) || ZERO, quoteDecimals);

		const baseBalance = isWethBase ? totalEthBalance : (baseTokenBalance && baseTokenBalance.balance) || ZERO;

		const amount = makerAmount || minAmountUnits;
		const makerAmountUnits = tokenAmountInUnitsToBigNumber(amount, decimals);
		const isMakerAmountEmpty = amount === null || amount.isZero();
		const isMakerAmountMin = amount === null || amount.isLessThan(minAmountUnits);

		const isPriceEmpty = price === null || price.isZero();
		const isPriceMin =
			price === null || price.isLessThan(new BigNumber(1).div(new BigNumber(10).pow(pricePrecision)));
		const isOrderTypeLimitIsEmpty =
			orderType === OrderType.Limit && (isMakerAmountEmpty || isPriceEmpty || isPriceMin);
		const isBuy = tab === OrderSide.Buy;
		const isOrderTypeLimitOverflow =
			(orderType === OrderType.Limit && isBuy && makerAmountUnits.multipliedBy(price || ZERO).gt(quoteUnits)) ||
			(!isBuy && amount.gt(baseBalance));

		const isOrderTypeMarketIsEmpty = orderType === OrderType.Market && (isMakerAmountEmpty || isMakerAmountMin);
		const baseSymbol = formatTokenSymbol(currencyPair.base);
		const btnPrefix = tab === OrderSide.Buy ? `${t("orderSide.buy")} ` : `${t("orderSide.sell")} `;
		const btnText = error && error.btnMsg ? "Error" : btnPrefix + baseSymbol;

		return (
			<Card>
				<TabsContainer className="d-flex align-items-center justify-content-between">
					<TabWrapper>
						<Tab
							variant={tab === OrderSide.Buy ? "secondary-light" : "light-secondary-light"}
							onClick={this.changeTab(OrderSide.Buy)}
						>
							{t("orderSide.buy")}
						</Tab>
					</TabWrapper>
					<TabWrapper>
						<Tab
							variant={tab === OrderSide.Sell ? "secondary-light" : "light-secondary-light"}
							onClick={this.changeTab(OrderSide.Sell)}
						>
							{t("orderSide.sell")}
						</Tab>
					</TabWrapper>
				</TabsContainer>
				<Content>
					<MarketType>
						{buySellInnerTabs.map((tab, index) => {
							return (
								<>
									<MarketButton
										className="btn btn-link px-0"
										disabled={tab.active}
										onClick={tab.onClick}
									>
										{tab.text}
									</MarketButton>
									{index < buySellInnerTabs.length - 1 && <span className={"px-2"}>/</span>}
								</>
							);
						})}
					</MarketType>
					<SpotInputPanel
						token={baseToken}
						decimals={decimals}
						value={amount}
						onUserInput={this.updateMakerAmount}
						selected={currencyPair.base}
						valueFixedDecimals={basePrecision}
						label={`Amount (Min: ${minAmount})`}
						balanceText={this.getAmountAvailableLabel}
						showBalance={true}
						min={minAmountUnits}
					/>
					{orderType === OrderType.Limit && (
						<QuoteContainer>
							<SpotInputPanel
								token={quoteToken}
								decimals={0}
								min={ZERO}
								value={price}
								onUserInput={this.updatePrice}
								selected={currencyPair.quote}
								valueFixedDecimals={pricePrecision}
								label={t("pricePerToken")}
								showBalance={false}
							/>
						</QuoteContainer>
					)}
					<DetailsContainer className="d-flex flex-column">
						<OrderDetailsContainer
							orderType={orderType}
							orderSide={tab}
							tokenAmount={amount}
							tokenPrice={price || new BigNumber(1).div(new BigNumber(10).pow(pricePrecision))}
							currencyPair={currencyPair}
						/>
					</DetailsContainer>
					<div className="d-flex flex-column align-items-xl-center align-items-stretch justify-content-center mt-auto">
						<Button
							disabled={
								this.props.web3.account &&
								(isOrderTypeLimitIsEmpty || isOrderTypeMarketIsEmpty || isOrderTypeLimitOverflow)
							}
							onClick={this.submit}
							variant={"primary"}
							style={{
								minWidth: 250,
								height: 56,
								marginTop: 10,
								fontSize: 20,
								fontWeight: 700,
							}}
						>
							{!this.props.web3.account ? t("wallet.connect") : btnText}
						</Button>
					</div>
				</Content>
			</Card>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		baseToken: state.spot.baseToken,
		quoteToken: state.spot.quoteToken,
		currencyPair: getCurrencyPair(state),
		orderPriceSelected: getOrderPriceSelected(state),
		makerAmountSelected: getMakerAmountSelected(state),
		openSellOrders: getOpenSellOrders(state),
		openBuyOrders: getOpenBuyOrders(state),
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		onSubmitLimitOrder: (amount, price, side, orderFeeData, tokensBalance, wethBalance) =>
			dispatch(startBuySellLimitSteps(amount, price, side, orderFeeData, tokensBalance, wethBalance)),
		onSubmitLimitOrderMatching: (amount, price, side, orderFeeData, tokensBalance, wethBalance, ethBalance) =>
			dispatch(
				startBuySellLimitMatchingSteps(
					amount,
					price,
					side,
					orderFeeData,
					tokensBalance,
					wethBalance,
					ethBalance
				)
			),
		onSubmitMarketOrder: (amount, side, tokensBalance, wethBalance, ethBalance) =>
			dispatch(startBuySellMarketSteps(amount, side, tokensBalance, wethBalance, ethBalance)),
		onFetchTakerAndMakerFee: (amount, price, side, account, library) =>
			dispatch(fetchTakerAndMakerFee(amount, price, side, account, library)),
	};
};

export default withBalance(connect(mapStateToProps, mapDispatchToProps)(withTranslation()(withWeb3Account(BuySell))));
