import { connect } from "react-redux";
import styled from "styled-components";
import { lighten } from "polished";

import { ServerState } from "../../../../constants";
import { formatTokenSymbol } from "../../../../utils/spot/tokens";
import {
	setMakerAmountSelected,
	setOrderBuyPriceSelected,
	setOrderPriceSelected,
	setOrderSellPriceSelected,
} from "../../../../state/margin/actions";
import React, { Component } from "react";
import Loading from "../../../../components/Loading";
import BookOption from "../../../../components/BookOption";
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
	max-height: 524px;
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

class OrderToRow extends Component {
	render() {
		const { order, priceColor, mySizeOrders } = this.props;

		const size = order?.amount;
		const price = order?.price;
		const mySize = mySizeOrders
			? mySizeOrders?.reduce((sumSize, mySizeItem) => {
					if (mySizeItem?.id === order?.orderId) {
						const mySizeAmount = mySizeItem?.amount;
						return (sumSize += mySizeAmount);
					}
					return sumSize;
			  }, 0)
			: 0;

		const isMySizeEmpty = mySize === 0;

		return (
			<InnerTR onClick={() => this._setOrderPriceSelected(price)}>
				<TD>{size}</TD>
				<TD variant={priceColor}>{price}</TD>
				<TD>{isMySizeEmpty ? "-" : mySize}</TD>
			</InnerTR>
		);
	}

	getPrice = (price, decimals) => {
		return (Number(price) * 10 ** decimals).toFixed(4);
	};

	_setOrderPriceSelected = async (size) => {
		const { order } = this.props;

		if (order.side === "BUY") {
			await this.props.onSetOrderBuyPriceSelected(size.price);
		} else {
			await this.props.onSetOrderSellPriceSelected(size.price);
		}

		await this.props.onSetOrderPriceSelected(size.price);
		await this.props.onSetMakerAmountSelected(size.amount);
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
		bookOption: BookOptionType.BuySellBook,
	};

	constructor(props) {
		super(props);

		this._spreadRowScrollable = React.createRef();
		this._spreadRowFixed = React.createRef();
		this._itemsScroll = React.createRef();
	}

	getSpread = () => {
		const { orderbook, selectedMarket } = this.props;
		const { asks, bids } = orderbook;

		if (!selectedMarket) {
			return 0;
		}

		const lowestSellPrice = Number(asks?.[0]?.price);
		const highestBuyPrice = Number(bids?.[0]?.price);

		return Math.abs(lowestSellPrice - highestBuyPrice).toFixed(4);
	};

	getSpreadPercent = (spread = undefined) => {
		let s;
		if (!spread || typeof spread !== "number") {
			s = this.getSpread();
		} else {
			s = spread;
		}

		const { orderbook, selectedMarket } = this.props;
		const { asks } = orderbook;

		const lowestSellPrice =
			Number(asks?.[0]?.price) *
			10 ** Math.abs(selectedMarket?.baseAssetDecimals - selectedMarket?.quoteAssetDecimals);

		return ((s / lowestSellPrice) * 100).toFixed(2);
	};

	handleBookOption = (option) => {
		this.setState({ bookOption: option });
	};

	render() {
		const { orderbook = {}, orderbookState, selectedMarket, myOrders = {}, t } = this.props;

		const { asks, bids } = orderbook;

		let content;

		if (!selectedMarket || orderbookState === ServerState.NotLoaded) {
			content = (
				<div className="w-100 h-100 d-flex align-items-center justify-content-center">
					<Loading
						width={40}
						height={40}
						id={`margin-orderbooks-${this.props.isMobile ? "mobile" : "desktop"}`}
						active
					/>
				</div>
			);
		} else if ((!asks?.length && !bids?.length) || !selectedMarket) {
			content = (
				<div className="w-100 h-100 d-flex align-items-center justify-content-center">
					<EmptyText>{t("errors.noTrade")}</EmptyText>
				</div>
			);
		} else {
			let mySizeSellArray = [];
			let mySizeBuyArray = [];

			if (Array.isArray(myOrders)) {
				mySizeSellArray = myOrders
					? myOrders?.filter((order) => {
							return order?.side === "sell" && order?.status === "pending";
					  })
					: [];
				mySizeBuyArray = myOrders
					? myOrders?.filter((order) => {
							return order?.side === "buy" && order?.status === "pending";
					  })
					: [];
			}

			const spreadAbsFixed = this.getSpread();
			const spreadPercentFixed = this.getSpreadPercent(spreadAbsFixed);

			const bookOptionState = this.state.bookOption;

			content = (
				<>
					<HeaderRow className="d-flex align-items-center justify-content-between">
						<div className={"d-flex align-items-center"}>
							<StyledBookOption
								active={bookOptionState === BookOptionType.BuySellBook}
								onChange={() => this.handleBookOption(BookOptionType.BuySellBook)}
								isSell={true}
								isBuy
							/>
							<StyledBookOption
								active={bookOptionState === BookOptionType.BuyBook}
								onChange={() => this.handleBookOption(BookOptionType.BuyBook)}
								isBuy
							/>
							<StyledBookOption
								active={bookOptionState === BookOptionType.SellBook}
								onChange={() => this.handleBookOption(BookOptionType.SellBook)}
								isSell
							/>
						</div>
					</HeaderRow>
					<TableRow>
						<CustomHead>
							<TH>{t("size")}</TH>
							<TH>
								{t("price")} ({formatTokenSymbol(selectedMarket?.quoteAsset)})
							</TH>
							<TH>{t("mySize")}</TH>
						</CustomHead>
						<TBody>
							{(bookOptionState === BookOptionType.BuySellBook ||
								bookOptionState === BookOptionType.SellBook) &&
								asks.map((order, index) => (
									<OrderToRowContainer
										key={index}
										order={order}
										index={index}
										count={asks.length}
										orders={asks}
										baseToken={selectedMarket?.baseAsset}
										priceColor={"danger"}
										mySizeOrders={mySizeSellArray}
										currencyPair={selectedMarket}
									/>
								))}

							<SpreadTR>
								<SpreadTitle>{t("spread")}</SpreadTitle>
								<SpreadTitle>{spreadAbsFixed}</SpreadTitle>
								<SpreadTitle>{spreadPercentFixed}%</SpreadTitle>
							</SpreadTR>

							{(bookOptionState === BookOptionType.BuyBook ||
								bookOptionState === BookOptionType.BuySellBook) &&
								bids.map((order, index) => (
									<OrderToRowContainer
										key={index}
										order={order}
										index={index}
										count={bids.length}
										orders={bids}
										baseToken={selectedMarket?.baseAsset}
										priceColor={"success"}
										mySizeOrders={mySizeBuyArray}
										currencyPair={selectedMarket}
									/>
								))}
						</TBody>
					</TableRow>
				</>
			);
		}

		return <Container>{content}</Container>;
	}
}

const mapStateToProps = (state) => {
	return {
		orderbook: state.margin.orderbook.data,
		orderbookState: state.margin.orderbook.state,
		selectedMarket: state.margin.selectedMarketStats,
		myOrders: state.margin.orders.data,
		myOrdersState: state.margin.orders.state,
	};
};

export default connect(mapStateToProps)(withTranslation()(Orderbook));
