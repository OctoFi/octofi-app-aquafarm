import { connect, useDispatch, useSelector } from "react-redux";
import { BigNumber } from "@0x/utils";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import styled from "styled-components";
import { Form, Button, Row, Col } from "react-bootstrap";

import withBalance from "../../../../components/hoc/withBalance";
import {
	getBaseToken,
	getCurrencyPair,
	getMinOrderExpireTimeOnBooks,
	getOrderBuyPriceSelected,
	getOrderPriceSelected,
	getOrderSellPriceSelected,
	getQuoteToken,
} from "../../../../state/selectors";
import {
	setOrderSecondsExpirationTime,
	startBuySellLimitSteps,
	startMultipleBuySellLimitSteps,
} from "../../../../state/spotUI/actions";
import { fetchTakerAndMakerFee, setMinOrderExpireTimeOnBooks } from "../../../../state/relayer/actions";
import { isWeth, getKnownTokens } from "../../../../utils/known_tokens";
import {
	computeOrderSizeFromInventoryBalance,
	computePriceFromQuote,
	computeSpreadPercentage,
	getPricesFromSpread,
} from "../../../../utils/spot/marketMaker";
import { getExpirationTimeFromSeconds } from "../../../../utils/spot/timeUtils";
import {
	formatTokenSymbol,
	tokenAmountInUnits,
	tokenAmountInUnitsToBigNumber,
	unitsInTokenAmount,
} from "../../../../utils/spot/tokens";
import { OrderSide, ServerState as SwapQuoteState, ZERO } from "../../../../constants";
import { useActiveWeb3React } from "../../../../hooks";
import { setMarketTokens } from "../../../../state/spot/actions";
import { getAssetSwapper } from "../../../../utils/spot/swap";
import { useDebounce } from "../../../../hooks/debounce";
import { ResponsiveCard } from "../../../../components/Card";
import MarketMakerInputPanel from "../../../../components/MarketMakerInputPanel";
import MarketMakerDetails from "./MarketMakerDetails";
import Web3 from "web3";

const Card = styled(ResponsiveCard)`
	& .card-body {
		padding: 0;
	}
`;

const Title = styled.h3`
	margin-top: 0;
	padding: 0;
	margin-bottom: 2.25rem;
	font-size: 1.25rem;
	font-weight: 700;
	color: ${({ theme }) => theme.text1};

	@media (max-width: 1400px) {
		margin-bottom: 2.125rem;
	}
`;

const Label = styled(Form.Label)`
	font-weight: 400;
	font-size: 0.875rem;
	color: ${({ theme }) => theme.text1};
	opacity: 1;
	margin-bottom: 1rem;
	padding-left: 1.25rem;

	@media (max-width: 1400px) {
		padding-left: 0;
	}
`;

const Control = styled(Form.Control)`
	font-weight: 500;
	font-size: 1rem;
	color: ${({ theme }) => theme.text1};
	height: 56px;
	padding: 1rem 1.25rem;
	background-color: ${({ theme }) => theme.bg1};

	&:focus,
	&:hover,
	&:active {
		background-color: ${({ theme }) => theme.bg1};
		color: ${({ theme }) => theme.text1};
	}

	::placeholder {
		color: ${({ theme }) => theme.text2};
		opacity: 0.5;
	}
`;

const FormGroup = styled.div`
	display: flex;
	flex-direction: column;
	margin-bottom: 40px;
`;

const Container = styled.div`
	display: flex;
	flex-direction: column;
`;

const TopContainer = styled(Container)`
	padding: 40px;
	border-bottom: 1px solid ${({ theme }) => theme.text3};

	@media (max-width: 1400px) {
		padding: 30px;
	}
`;

const BottomContainer = styled(Container)`
	padding: 30px 20px 20px;

	@media (max-width: 1400px) {
		padding: 30px;
	}
`;

const useQuery = () => {
	return new URLSearchParams(useLocation().search);
};

const TIMEOUT_BTN_ERROR = 2000;
const TIMEOUT_CARD_ERROR = 4000;

const web3 = new Web3(Web3.givenProvider || new Web3.providers.HttpProvider(process.env.REACT_APP_NETWORK_URL));

const MakerContainer = (props) => {
	const { account } = useActiveWeb3React();
	const [marketQuoteState, setMarketQuoteState] = useState(SwapQuoteState.NotLoaded);
	const [buyQuote, setBuyQuote] = useState();
	const [sellQuote, setSellQuote] = useState();
	const [buyPrice, setBuyPrice] = useState();
	const [sellPrice, setSellPrice] = useState();
	const [selectedSpread, setSelectedSpread] = useState(0);
	const [orderExpireTime, setOrderExpireTime] = useState(300);
	const [selectedInventoryBalance, setSelectedInventoryBalance] = useState(50);
	const [errorState, setErrorState] = useState({
		btnMsg: null,
		cardMsg: null,
	});
	const [makerAmountState, setMakerAmountState] = useState(new BigNumber(0));
	const { web3State, quoteTokenBalance, baseTokenBalance, totalEthBalance } = props;

	const known_tokens = getKnownTokens();

	const selectedBuyPrice = useSelector(getOrderBuyPriceSelected);
	const selectedSellPrice = useSelector(getOrderSellPriceSelected);
	const quoteToken = useSelector(getQuoteToken);
	const baseToken = useSelector(getBaseToken);
	const minOrderExpirationTimeOnOrderBook = useSelector(getMinOrderExpireTimeOnBooks);

	const [minOrderExpireTime, setMinOrderExpireTime] = useState(minOrderExpirationTimeOnOrderBook);

	const dispatch = useDispatch();
	const query = useQuery();
	const queryToken = query.get("baseToken");
	const decimals = baseToken.decimals;

	useEffect(() => {
		const fetchToken = async () => {
			if (!queryToken) {
				return;
			}
			if (
				queryToken.toLowerCase() === baseToken.symbol.toLowerCase() ||
				queryToken.toLowerCase() === baseToken.address.toLowerCase()
			) {
				return;
			}
			const t = await known_tokens.findTokenOrFetchIt(queryToken);
			if (t) {
				if (t === baseToken) {
					return;
				} else {
					dispatch(setMarketTokens({ baseToken: t, quoteToken }));
				}
			}
		};
		// tslint:disable-next-line:no-floating-promises
		fetchToken();
	}, [queryToken, baseToken]);

	const isWethQuote = quoteTokenBalance && isWeth(quoteTokenBalance.token.symbol);
	const isWethBase = baseTokenBalance && isWeth(baseTokenBalance.token.symbol);

	const quoteUnits = isWethQuote
		? tokenAmountInUnitsToBigNumber(totalEthBalance || ZERO, 18)
		: tokenAmountInUnitsToBigNumber(
				(quoteTokenBalance && quoteTokenBalance.balance) || ZERO,
				(quoteToken && quoteToken.decimals) || 18
		  );

	const baseBalance = isWethBase ? totalEthBalance : (baseTokenBalance && baseTokenBalance.balance) || ZERO;
	const stepAmount = new BigNumber(1).div(new BigNumber(10).pow(8));
	const stepAmountUnits = unitsInTokenAmount(String(stepAmount), decimals);
	const amount = makerAmountState;
	const isMakerAmountEmpty = amount === null || amount.isZero();
	const isMaxAmount = false;

	const isBuyOrderTypeLimitOverflow = computeOrderSizeFromInventoryBalance(
		tokenAmountInUnitsToBigNumber(makerAmountState, (baseToken && baseToken.decimals) || 18).multipliedBy(
			buyPrice || ZERO
		),
		new BigNumber(selectedInventoryBalance).dividedBy(100),
		false
	).gt(quoteUnits);
	const isSellOrderTypeLimitOverflow = computeOrderSizeFromInventoryBalance(
		makerAmountState,
		new BigNumber(selectedInventoryBalance).dividedBy(100),
		true
	).gt(baseBalance);

	const isOrderTypeMarketIsEmpty = isMakerAmountEmpty || isMaxAmount;

	const _reset = () => {
		// setMakerAmountState(new BigNumber(0));
		// setPriceState(new BigNumber(0));
		props.onSetOrderSecondsExpirationTime(null);
	};

	// When clicked on orderbook update prices
	useEffect(() => {
		if (selectedBuyPrice && selectedBuyPrice.gt(0)) {
			setBuyPrice(selectedBuyPrice);
			if (sellPrice) {
				setSelectedSpread(computeSpreadPercentage(selectedBuyPrice, sellPrice).toNumber());
			}
		}
	}, [selectedBuyPrice]);

	useEffect(() => {
		if (selectedSellPrice && selectedSellPrice.gt(0)) {
			setSellPrice(selectedSellPrice);
			if (buyPrice) {
				setSelectedSpread(computeSpreadPercentage(selectedSellPrice, buyPrice).toNumber());
			}
		}
	}, [selectedSellPrice]);

	const onCalculateSwapQuote = async (amt) => {
		// We are fetching the price here
		const buyParams = {
			buyTokenAddress: baseToken.address,
			sellTokenAddress: quoteToken.address,
			buyAmount: amt,
			sellAmount: undefined,
			from: undefined,
			isETHSell: isWeth(quoteToken.symbol),
		};
		const sellParams = {
			buyTokenAddress: quoteToken.address,
			sellTokenAddress: baseToken.address,
			buyAmount: undefined,
			sellAmount: amt,
			from: undefined,
			isETHSell: isWeth(baseToken.symbol),
		};

		try {
			setMarketQuoteState(SwapQuoteState.Loading);
			const assetSwapper = await getAssetSwapper(web3.currentProvider, web3);
			const bQuote = await assetSwapper.getSwapQuoteAsync(buyParams);
			setBuyQuote(bQuote);
			const sQuote = await assetSwapper.getSwapQuoteAsync(sellParams);
			setSellQuote(sQuote);
			// Add default price
			const sPrice = computePriceFromQuote(false, bQuote, baseToken, quoteToken);
			const bPrice = computePriceFromQuote(true, sQuote, baseToken, quoteToken);
			setBuyPrice(bPrice);
			setSellPrice(sPrice);
			setSelectedSpread(computeSpreadPercentage(bPrice, sPrice).toNumber());
			setMarketQuoteState(SwapQuoteState.Done);
		} catch (e) {
			setMarketQuoteState(SwapQuoteState.Error);
		}
	};

	const debouncedAmount = useDebounce(makerAmountState, 0);
	useEffect(() => {
		if (marketQuoteState === SwapQuoteState.Error) {
			setErrorState({
				cardMsg: "Error fetching quote",
				btnMsg: "Try again",
			});
			setTimeout(() => {
				setErrorState({
					...errorState,
					btnMsg: null,
				});
			}, TIMEOUT_BTN_ERROR);

			setTimeout(() => {
				setErrorState({
					...errorState,
					cardMsg: null,
				});
			}, TIMEOUT_CARD_ERROR);
		} else {
			if (errorState.cardMsg !== null) {
				setErrorState({
					cardMsg: null,
					btnMsg: null,
				});
			}
		}
	}, [marketQuoteState]);

	useEffect(() => {
		if (debouncedAmount) {
			onCalculateSwapQuote(amount);
		}
	}, [debouncedAmount]);

	useEffect(() => {
		if (makerAmountState.isGreaterThan(0)) {
			onCalculateSwapQuote(amount);
		}
	}, [baseToken]);

	const handleSubmitError = (error) => {
		setErrorState({
			btnMsg: "Error",
			cardMsg: error.message,
		});
		setTimeout(() => {
			setErrorState({
				...errorState,
				btnMsg: null,
			});
		}, TIMEOUT_BTN_ERROR);

		setTimeout(() => {
			setErrorState({
				...errorState,
				cardMsg: null,
			});
		}, TIMEOUT_CARD_ERROR);
	};

	const onSubmitBuyOrder = async () => {
		const { tokensBalance, wethBalance } = props;
		const makerAmount = makerAmountState;
		const orderSide = OrderSide.Buy;
		if (!buyPrice) {
			return;
		}
		props.onSetOrderSecondsExpirationTime(new BigNumber(orderExpireTime));
		const orderFeeData = await props.onFetchTakerAndMakerFee(makerAmount, buyPrice, orderSide);
		try {
			const amt = computeOrderSizeFromInventoryBalance(
				makerAmount,
				new BigNumber(selectedInventoryBalance).dividedBy(100),
				false
			);
			await props.onSubmitLimitOrder(amt, buyPrice, orderSide, orderFeeData, tokensBalance, wethBalance);
		} catch (error) {
			handleSubmitError(error);
		}
		_reset();
	};

	const onSubmitSellOrder = async () => {
		const { tokensBalance, wethBalance } = props;
		const makerAmount = makerAmountState;
		const orderSide = OrderSide.Sell;
		if (!sellPrice) {
			return;
		}
		await props.onSetOrderSecondsExpirationTime(new BigNumber(orderExpireTime));
		const orderFeeData = await props.onFetchTakerAndMakerFee(makerAmount, sellPrice, orderSide);
		try {
			const amt = computeOrderSizeFromInventoryBalance(
				makerAmount,
				new BigNumber(selectedInventoryBalance).dividedBy(100),
				true
			);
			await props.onSubmitLimitOrder(amt, sellPrice, orderSide, orderFeeData, tokensBalance, wethBalance);
		} catch (error) {
			handleSubmitError(error);
		}
		_reset();
	};

	const onUpdateMakerAmount = (newValue) => {
		setMakerAmountState(newValue);
	};
	const updateQuote = () => {
		onCalculateSwapQuote(makerAmountState);
	};

	const getAmountAvailableLabel = (isBase) => {
		if (isBase) {
			if (baseTokenBalance) {
				const tokenBalanceAmount = isWeth(baseTokenBalance.token.symbol)
					? totalEthBalance
					: baseTokenBalance.balance;
				const baseBalanceString = tokenAmountInUnits(
					tokenBalanceAmount,
					baseTokenBalance.token.decimals,
					baseTokenBalance.token.displayDecimals
				);
				const symbol = formatTokenSymbol(baseTokenBalance.token.symbol);
				return `Balance: ${baseBalanceString}  ${symbol}`;
			} else {
				return null;
			}
		} else {
			if (quoteTokenBalance) {
				const tokenBalanceAmount = isWeth(quoteTokenBalance.token.symbol)
					? totalEthBalance
					: quoteTokenBalance.balance;
				const quoteBalanceString = tokenAmountInUnits(
					tokenBalanceAmount,
					quoteTokenBalance.token.decimals,
					quoteTokenBalance.token.displayDecimals
				);
				const symbol = formatTokenSymbol(quoteTokenBalance.token.symbol);
				return `Balance: ${quoteBalanceString}  ${symbol}`;
			} else {
				return null;
			}
		}
	};

	const updateBuyPrice = (price) => {
		setBuyPrice(price);
		if (sellPrice) {
			setSelectedSpread(computeSpreadPercentage(price, sellPrice).toNumber());
		}
	};
	const updateSellPrice = (price) => {
		setSellPrice(price);
		if (buyPrice) {
			setSelectedSpread(computeSpreadPercentage(buyPrice, price).toNumber());
		}
	};
	const updateSpread = (e) => {
		const newSpread = new BigNumber(e.currentTarget.value);
		if (buyPrice && sellPrice) {
			const prices = getPricesFromSpread(buyPrice, sellPrice, newSpread);
			setBuyPrice(prices[0]);
			setSellPrice(prices[1]);
		}

		setSelectedSpread(newSpread.toNumber());
	};
	const updateInventoryBalance = (e) => {
		setSelectedInventoryBalance(Number(e.currentTarget.value));
	};
	const onOrderExpireTimeChange = (e) => {
		setOrderExpireTime(Number(e.currentTarget.value));
	};
	const onMinOrderExpireTimeChange = (e) => {
		const time = Number(e.currentTarget.value);
		setMinOrderExpireTime(time);
		dispatch(setMinOrderExpireTimeOnBooks(time));
	};

	const onTrackerPriceClick = (price) => {
		setBuyPrice(price);
		setSellPrice(price);
		setSelectedSpread(0);
	};

	const isListed = baseToken ? baseToken.listed : true;
	const msg = "Token inserted by User. Please proceed with caution and do your own research!";

	return (
		<Card>
			<TopContainer>
				<Row className={"custom-row"}>
					<Col xs={12}>
						<Title>Your Order</Title>
					</Col>
					<Col xs={12}>
						<MarketMakerInputPanel
							decimals={decimals}
							min={ZERO}
							value={amount}
							onUserInput={onUpdateMakerAmount}
							selected={baseToken}
							valueFixedDecimals={8}
							label={`Insert Reference Base Amount`}
							showBalance={false}
						/>
					</Col>
					<Col xs={12}>
						<MarketMakerInputPanel
							decimals={0}
							min={ZERO}
							value={buyPrice}
							onUserInput={updateBuyPrice}
							selected={quoteToken}
							valueFixedDecimals={10}
							label={`Buy price per Token`}
							showBalance={false}
						/>
					</Col>
					<Col xs={12}>
						<MarketMakerInputPanel
							decimals={0}
							min={ZERO}
							value={sellPrice}
							onUserInput={updateSellPrice}
							selected={quoteToken}
							valueFixedDecimals={10}
							label={`Sell price per Token`}
							showBalance={false}
						/>
					</Col>
					<Col xs={12} lg={4}>
						<FormGroup>
							<Label>Spread (%)</Label>
							<Control
								type={"number"}
								value={selectedSpread}
								min={-100}
								step={0.0001}
								max={100}
								onChange={updateSpread}
							/>
						</FormGroup>
					</Col>
					<Col xs={12} lg={8}>
						<FormGroup>
							<Label>Order Ratio between Bid and Ask (%)</Label>
							<Control
								type={"number"}
								value={selectedInventoryBalance}
								min={0}
								step={1}
								max={100}
								onChange={updateInventoryBalance}
							/>
						</FormGroup>
					</Col>
					<Col xs={12}>
						<FormGroup style={{ marginBottom: 0 }}>
							<Label>Order Expire Time (Seconds): </Label>
							<Control
								type={"number"}
								value={orderExpireTime}
								min={20}
								step={1}
								onChange={onOrderExpireTimeChange}
							/>
						</FormGroup>
					</Col>
				</Row>
			</TopContainer>
			<BottomContainer>
				<MarketMakerDetails
					tokenAmount={amount}
					baseToken={baseToken}
					quoteToken={quoteToken}
					buyQuote={buyQuote}
					sellQuote={sellQuote}
					quoteState={marketQuoteState}
					inventoryBalance={selectedInventoryBalance}
					onTrackerPriceClick={onTrackerPriceClick}
					onBuy={onSubmitBuyOrder}
					buyDisabled={isOrderTypeMarketIsEmpty || isBuyOrderTypeLimitOverflow}
					onSell={onSubmitSellOrder}
					sellDisabled={isOrderTypeMarketIsEmpty || isSellOrderTypeLimitOverflow}
				/>
			</BottomContainer>
		</Card>
	);
};

const mapStateToProps = (state) => {
	return {
		currencyPair: getCurrencyPair(state),
		orderPriceSelected: getOrderPriceSelected(state),
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		onSubmitLimitOrder: (amount, price, side, orderFeeData, tokensBalance, wethBalance) =>
			dispatch(startBuySellLimitSteps(amount, price, side, orderFeeData, tokensBalance, wethBalance)),
		onSubmitMultipleLimitOrders: (
			amountBuy,
			priceBuy,
			orderBuyFeeData,
			amountSell,
			priceSell,
			orderSellFeeData,
			tokensBalance,
			wethBalance
		) =>
			dispatch(
				startMultipleBuySellLimitSteps(
					amountBuy,
					priceBuy,
					orderBuyFeeData,
					amountSell,
					priceSell,
					orderSellFeeData,
					tokensBalance,
					wethBalance
				)
			),
		onFetchTakerAndMakerFee: (amount, price, side) => dispatch(fetchTakerAndMakerFee(amount, price, side)),
		onSetOrderSecondsExpirationTime: (seconds) => dispatch(setOrderSecondsExpirationTime(seconds)),
	};
};

export default withBalance(connect(mapStateToProps, mapDispatchToProps)(MakerContainer));
