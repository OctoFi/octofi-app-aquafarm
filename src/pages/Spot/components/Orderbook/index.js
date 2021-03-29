import { connect } from "react-redux";
import styled from "styled-components";
import { lighten } from "polished";
import { BigNumber } from "@0x/utils";

import {
	getOrderBook,
	getOrderbookState,
	getSpread,
	getSpreadInPercentage,
	getTotalBaseSellOrders,
	getTotalQuoteBuyOrders,
} from "../../../../state/selectors";
import { ZERO, UI_DECIMALS_DISPLAYED_SPREAD_PERCENT, OrderSide, ServerState } from "../../../../constants";
import { formatTokenSymbol, tokenAmountInUnits } from "../../../../utils/spot/tokens";
import {
	setMakerAmountSelected,
	setOrderBuyPriceSelected,
	setOrderPriceSelected,
	setOrderSellPriceSelected,
} from "../../../../state/spotUI/actions";
import React, { Component } from "react";
import Loading from "../../../../components/Loading";
import BookOption from "../../../../components/BookOption";
import Dropdown from "../../../../components/UI/Dropdown";
import { padRightSplitted } from "../../../../utils/spot/numberUtils";
import { withTranslation } from "react-i18next";

const Container = styled.div`
	width: 260px;
	display: flex;
	flex-direction: column;

	@media (max-width: 1400px) {
		width: 100%;
	}
`;

const EmptyText = styled.span`
	font-size: 0.875rem;
	font-weight: 400;
	color: ${({ theme }) => theme.text1};
`;
const BookOptionType = {
	BuySellBook: 0,
	SellBook: 1,
	BuyBook: 2,
};

const StyledBookOption = styled(BookOption)`
	&:not(:last-child) {
		margin-right: 10px;
	}
`;

const HeaderRow = styled.div`
	margin-bottom: 12px;

	@media (max-width: 1400px) {
		margin-bottom: 34px;
	}
`;
const TitleRow = styled.div`
	margin-bottom: 15px;

	@media (max-width: 1400px) {
		margin-bottom: 10px;
		align-items: flex-end;
	}
`;
const TableRow = styled.div`
	display: flex;
	flex: 1;
	max-height: 382px;
	flex-direction: column;

	@media (max-width: 1400px) {
		margin-bottom: 0;
		max-height: initial;
	}
`;

const Title = styled.span`
	color: ${({ theme }) => theme.text1};
	font-weight: bold;
	font-size: 1rem;
	line-height: 1;

	@media (max-width: 1400px) {
		margin-bottom: 10px;
	}
`;

const Result = styled.span`
	color: ${({ theme }) => theme.text1};
	font-weight: 500;
	font-size: 0.75rem;
`;

const TR = styled.div`
	padding: 6px 16px;
	border-radius: 12px;
	margin-bottom: 12px;
	max-height: 32px;
	height: 32px;
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
`;

const InnerTR = styled(TR)`
	background-color: transparent;
	cursor: pointer;
	transition: all ease 0.3s;
	margin-bottom: 2px;
	max-height: 24px;
	padding: 4px 16px;

	@media (max-width: 1400px) {
		max-height: 56px;
		padding: 18px 20px;
		border-radius: 18px;
		height: 56px;
	}

	&:hover {
		background-color: ${({ theme }) => theme.text1}06;
	}
`;

const TH = styled.span`
	color: ${({ theme }) => theme.text1};
	font-size: 0.75rem;
	font-weight: 400;
	white-space: nowrap;
`;

const SpreadTitle = styled.span`
	color: ${({ theme }) => theme.text1};
	font-size: 0.75rem;
	font-weight: 500;
	white-space: nowrap;
`;

const SpreadTR = styled(CustomHead)`
	margin-bottom: 8px;
	margin-top: 4px;
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
	max-height: 306px;
	min-height: 306px;
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

const depthItems = [
	{
		value: 5,
		title: "5",
	},
	{
		value: 10,
		title: "10",
	},
	{
		value: 20,
		title: "20",
	},
	{
		value: 50,
		title: "50",
	},
];

class OrderToRow extends Component {
	render() {
		const { order, index, baseToken, priceColor, mySizeOrders = [], currencyPair } = this.props;
		const basePrecision = currencyPair.config.basePrecision;
		const pricePrecision = currencyPair.config.pricePrecision;

		const size = tokenAmountInUnits(order.size, baseToken.decimals, basePrecision);
		const price = order.price.toString();

		const mySize = mySizeOrders.reduce((sumSize, mySizeItem) => {
			if (mySizeItem.price.eq(order.price)) {
				return sumSize.plus(mySizeItem.size);
			}
			return sumSize;
		}, ZERO);

		const mySizeConverted = tokenAmountInUnits(mySize, baseToken.decimals, basePrecision);
		const isMySizeEmpty = mySize.eq(new BigNumber(0));
		const numSplitted = padRightSplitted(new BigNumber(size), basePrecision);

		return (
			<InnerTR onClick={() => this._setOrderPriceSelected(order.price)}>
				<TD>{numSplitted.num}</TD>
				<TD variant={priceColor}>{parseFloat(price).toFixed(pricePrecision)}</TD>
				<TD>{isMySizeEmpty ? "-" : mySizeConverted}</TD>
			</InnerTR>
		);
	}

	_setOrderPriceSelected = async (size) => {
		const { order, orders } = this.props;
		let totalSize = ZERO;
		if (order.side === OrderSide.Buy) {
			totalSize = orders.reduce((sumSize, sizeItem) => {
				if (order.price.lte(sizeItem.price)) {
					return sumSize.plus(sizeItem.size);
				}
				return sumSize;
			}, ZERO);
		} else {
			totalSize = orders.reduce((sumSize, sizeItem) => {
				if (order.price.gte(sizeItem.price)) {
					return sumSize.plus(sizeItem.size);
				}
				return sumSize;
			}, ZERO);
		}
		if (order.side === OrderSide.Buy) {
			await this.props.onSetOrderBuyPriceSelected(size);
		} else {
			await this.props.onSetOrderSellPriceSelected(size);
		}

		await this.props.onSetOrderPriceSelected(size);
		await this.props.onSetMakerAmountSelected(totalSize);
	};
}

const mapOrderToRowDispatchToProps = (dispatch) => {
	return {
		onSetOrderPriceSelected: (orderPriceSelected) => dispatch(setOrderPriceSelected(orderPriceSelected)),
		onSetOrderBuyPriceSelected: (orderPriceSelected) => dispatch(setOrderBuyPriceSelected(orderPriceSelected)),
		onSetOrderSellPriceSelected: (orderPriceSelected) => dispatch(setOrderSellPriceSelected(orderPriceSelected)),
		onSetMakerAmountSelected: (makerAmountSelected) => dispatch(setMakerAmountSelected(makerAmountSelected)),
	};
};

const OrderToRowContainer = connect(null, mapOrderToRowDispatchToProps)(OrderToRow);

class Orderbook extends Component {
	state = {
		depth: { value: this.props.defaultDepth || 5 },
		bookOption: BookOptionType.BuySellBook,
	};

	constructor(props) {
		super(props);

		this._spreadRowScrollable = React.createRef();
		this._spreadRowFixed = React.createRef();
		this._itemsScroll = React.createRef();
	}

	render() {
		const {
			orderBook,
			baseToken,
			quoteToken,
			absoluteSpread,
			percentageSpread,
			currencyPair,
			totalQuoteBuyOrders,
			totalBaseSellOrders,
			serverState,
			t,
		} = this.props;
		const { sellOrders, buyOrders, mySizeOrders } = orderBook;

		const mySizeSellArray = mySizeOrders.filter((order) => {
			return order.side === OrderSide.Sell;
		});
		const mySizeBuyArray = mySizeOrders.filter((order) => {
			return order.side === OrderSide.Buy;
		});
		const getColor = (order) => {
			return order.side === OrderSide.Buy ? "success" : "danger";
		};
		let content;

		if (!baseToken || !quoteToken || serverState === ServerState.NotLoaded) {
			content = (
				<div className="w-100 h-100 d-flex align-items-center justify-content-center">
					<Loading
						width={40}
						height={40}
						id={`orderbooks-${this.props.isMobile ? "mobile" : "desktop"}`}
						active
					/>
				</div>
			);
		} else if ((!buyOrders.length && !sellOrders.length) || !baseToken || !quoteToken) {
			content = (
				<div className="w-100 h-100 d-flex align-items-center justify-content-center">
					<EmptyText>{t("errors.noTrade")}</EmptyText>
				</div>
			);
		} else {
			const spreadAbsFixed = absoluteSpread.toFixed(currencyPair.config.pricePrecision);
			const spreadPercentFixed = percentageSpread.toFixed(UI_DECIMALS_DISPLAYED_SPREAD_PERCENT);
			const basePrecision = currencyPair.config.basePrecision;

			const totalBase = tokenAmountInUnits(totalBaseSellOrders, baseToken.decimals, basePrecision);

			const totalQuote = tokenAmountInUnits(totalQuoteBuyOrders, quoteToken.decimals, 2);

			const baseSymbol = formatTokenSymbol(baseToken.symbol);
			const quoteSymbol = formatTokenSymbol(quoteToken.symbol);

			const handleDepth = (value) => {
				this.setState({ depth: { value: Number(value) } });
			};

			const bookOptionState = this.state.bookOption;
			const handleBookOption = (option) => {
				this.setState({ bookOption: option });
			};

			content = (
				<>
					<HeaderRow className="d-flex align-items-center justify-content-between">
						<div className={"d-flex align-items-center"}>
							<StyledBookOption
								active={bookOptionState === BookOptionType.BuySellBook}
								onChange={() => handleBookOption(BookOptionType.BuySellBook)}
								isSell={true}
								isBuy
							/>
							<StyledBookOption
								active={bookOptionState === BookOptionType.BuyBook}
								onChange={() => handleBookOption(BookOptionType.BuyBook)}
								isBuy
							/>
							<StyledBookOption
								active={bookOptionState === BookOptionType.SellBook}
								onChange={() => handleBookOption(BookOptionType.SellBook)}
								isSell
							/>
						</div>
						<div className="d-flex align-items-center">
							<Dropdown size={"sm"} items={depthItems} placeholder={t("depth")} onChange={handleDepth} />
						</div>
					</HeaderRow>
					<TitleRow className="d-flex align-items-xl-center justify-content-between">
						<Title>{t("asks")}</Title>
						<Result>{`${t("total")}: ${totalBase} ${baseSymbol}`}</Result>
					</TitleRow>
					<TableRow>
						<CustomHead>
							<TH>{t("tradeSize")}</TH>
							<TH>
								{t("price")} ({formatTokenSymbol(quoteToken.symbol)})
							</TH>
							<TH>{t("mySize")}</TH>
						</CustomHead>
						<TBody>
							{(bookOptionState === BookOptionType.BuySellBook ||
								bookOptionState === BookOptionType.SellBook) &&
								sellOrders
									.slice(sellOrders.length - this.state.depth.value, sellOrders.length)
									.map((order, index) => (
										<OrderToRowContainer
											key={index}
											order={order}
											index={index}
											count={sellOrders.length}
											orders={sellOrders}
											baseToken={baseToken}
											priceColor={getColor(order)}
											mySizeOrders={mySizeSellArray}
											currencyPair={currencyPair}
										/>
									))}

							<SpreadTR>
								<SpreadTitle>{t("spread")}</SpreadTitle>
								<SpreadTitle>{spreadAbsFixed}</SpreadTitle>
								<SpreadTitle>{spreadPercentFixed}%</SpreadTitle>
							</SpreadTR>

							{(bookOptionState === BookOptionType.BuyBook ||
								bookOptionState === BookOptionType.BuySellBook) &&
								buyOrders
									.slice(0, this.state.depth.value)
									.map((order, index) => (
										<OrderToRowContainer
											key={index}
											order={order}
											index={index}
											count={buyOrders.length}
											orders={buyOrders}
											baseToken={baseToken}
											priceColor={getColor(order)}
											mySizeOrders={mySizeBuyArray}
											currencyPair={currencyPair}
										/>
									))}
						</TBody>

						<CustomHead>
							<SpreadTitle>{t("bids")}</SpreadTitle>
							<SpreadTitle>{`${totalQuote} ${quoteSymbol}`}</SpreadTitle>
							<SpreadTitle> </SpreadTitle>
						</CustomHead>
					</TableRow>
				</>
			);
		}

		return <Container>{content}</Container>;
	}
}

const mapStateToProps = (state) => {
	return {
		baseToken: state.spot.baseToken,
		currencyPair: state.spot.currencyPair,
		quoteToken: state.spot.quoteToken,
		userOrders: state.relayer.userOrders,
		orderBookState: state.relayer.orderBookState,
		orderBook: getOrderBook(state),
		absoluteSpread: getSpread(state),
		percentageSpread: getSpreadInPercentage(state),
		totalQuoteBuyOrders: getTotalQuoteBuyOrders(state),
		totalBaseSellOrders: getTotalBaseSellOrders(state),
		serverState: getOrderbookState(state),
	};
};

export default connect(mapStateToProps)(withTranslation()(Orderbook));
