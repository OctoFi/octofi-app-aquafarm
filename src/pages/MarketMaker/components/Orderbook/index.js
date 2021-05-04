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

const Container = styled.div`
	width: 330px;
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
	top: 20px;
	left: 20px;
	right: 20px;
	position: absolute;

	@media (max-width: 1400px) {
		position: relative;
		top: initial;
		left: auto;
		right: auto;
		margin-bottom: 34px;
	}
`;
const TitleRow = styled.div`
	top: 96px;
	left: 20px;
	right: 20px;
	position: absolute;

	@media (max-width: 1400px) {
		position: relative;
		top: initial;
		left: auto;
		right: auto;
		margin-bottom: 20px;
		line-height: 1;
	}
`;
const TableRow = styled.div`
	display: flex;
	flex: 1;
	max-height: 814px;
	flex-direction: column;
	margin-bottom: 20px;

	@media (max-width: 1400px) {
		max-height: initial;
		margin-bottom: 0;
	}
`;

const Title = styled.span`
	color: ${({ theme }) => theme.text1};
	font-weight: bold;
	font-size: 1rem;
`;

const Result = styled.span`
	color: ${({ theme }) => theme.text1};
	font-weight: 500;
	font-size: 1rem;

	@media (max-width: 768px) {
		font-size: 0.875rem;
	}
`;

const TR = styled.div`
	padding: 19px 20px;
	border-radius: 18px;
	margin-bottom: 15px;
	max-height: 56px;
	margin-right: 10px;
	height: 56px;
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;

	@media (max-width: 1400px) {
		margin-right: 0;
	}
`;
const CustomHead = styled(TR)`
	background-color: ${({ theme }) => theme.text1}10;
`;

const InnerTR = styled(TR)`
	background-color: transparent;
	cursor: pointer;
	transition: all ease 0.3s;

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
	max-height: 831px;
	min-height: 831px;
	overflow-x: hidden;
	overflow-y: auto;

	@media (max-width: 1400px) {
		min-height: initial;
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
			<InnerTR>
				<TD>{numSplitted.num}</TD>
				<TD variant={priceColor}>{parseFloat(price).toFixed(pricePrecision)}</TD>
				<TD>{isMySizeEmpty ? "-" : mySizeConverted}</TD>
			</InnerTR>
		);
	}
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
					<Loading width={40} height={40} id={"orderbooks"} active />
				</div>
			);
		} else if ((!buyOrders.length && !sellOrders.length) || !baseToken || !quoteToken) {
			content = (
				<div className="w-100 h-100 d-flex align-items-center justify-content-center">
					<EmptyText>There are no orders to show</EmptyText>
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
					<HeaderRow className="d-flex align-items-start justify-content-between">
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
						<Dropdown items={depthItems} placeholder={"Depth"} onChange={handleDepth} />
					</HeaderRow>
					<TitleRow className="d-flex align-items-center justify-content-between">
						<Title>Asks</Title>
						<Result>{`Total: ${totalBase} ${baseSymbol}`}</Result>
					</TitleRow>
					<TableRow>
						<CustomHead>
							<TH>Trade Size</TH>
							<TH>Price ({formatTokenSymbol(quoteToken.symbol)})</TH>
							<TH>My Size</TH>
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

							<CustomHead>
								<SpreadTitle>Spread</SpreadTitle>
								<SpreadTitle>{spreadAbsFixed}</SpreadTitle>
								<SpreadTitle>{spreadPercentFixed}%</SpreadTitle>
							</CustomHead>

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
							<SpreadTitle>Bids</SpreadTitle>
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

export default connect(mapStateToProps)(Orderbook);
