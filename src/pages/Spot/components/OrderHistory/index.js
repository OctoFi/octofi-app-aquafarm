import { connect } from "react-redux";
import styled from "styled-components";
import React from "react";
import { OrderStatus } from "@0x/types";
import { lighten } from "polished";

import { isWeth } from "../../../../utils/known_tokens";
import { tokenAmountInUnits } from "../../../../utils/spot/tokens";
import { OrderSide } from "../../../../constants";
import { getCurrencyPairFromTokens } from "../../../../utils/spot/knownCurrencyPair";
import Loading from "../../../../components/Loading";
import { ResponsiveCard } from "../../../../components/Card";
import { cancelOrder } from "../../../../state/relayer/actions";
import { CloseIcon } from "../../../../theme";
import { RowBetween } from "../../../../components/Row";
import { useActiveWeb3React } from "../../../../hooks";
import { useTranslation } from "react-i18next";

const Card = styled(ResponsiveCard)`
	display: flex;
	flex-direction: column;
	align-items: stretch;
	margin-bottom: 10px;
	min-height: 385px;

	& .card-body {
		padding: 20px 30px 30px;
		display: flex;
		flex-direction: column;
	}

	@media (min-width: 1400px) {
		width: 570px;
		height: 385px;

		& .card-body {
			padding: 15px;
			display: flex;
			flex-direction: column;
		}
	}
`;

const CardTitle = styled.h4`
	margin-top: 5px;
	padding: 0;
	margin-bottom: 10px;
	font-size: 0.875rem;
	font-weight: 700;
	color: ${({ theme }) => theme.text1};
`;

const Content = styled.div`
	background-color: ${({ theme }) => theme.bg1};
	border-radius: 18px;
	display: flex;
	flex-direction: column;
	flex: 1;
	max-height: 323px;
	overflow: hidden;
`;

const InnerContent = styled.div`
	width: 100%;
	height: 100%;
	max-height: 100%;
	overflow-x: hidden;
	overflow-y: auto;
	flex: 1;
	padding: 12px;

	@media (max-width: 1400px) {
		padding: 20px;
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

const EmptyText = styled.span`
	font-size: 0.875rem;
	font-weight: 400;
	color: ${({ theme }) => theme.text1};
`;

const TR = styled.div`
	padding: 4px 16px;
	border-radius: 12px;
	margin-bottom: 10px;
	max-height: 24px;
	height: 24px;
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
`;
const CustomHead = styled(TR)`
	background-color: ${({ theme }) => theme.text1}10;
	max-height: 40px;
	height: 40px;
	padding: 12px 16px;
	margin-bottom: 12px;
`;

const TH = styled.span`
	color: ${({ theme }) => theme.text1};
	font-size: 0.75rem;
	font-weight: 400;
`;

const TD = styled.span`
	color: ${({ theme, variant }) => (variant ? theme[variant] : theme.text1)};
	font-size: 0.875rem;
	font-weight: 400;
	padding-right: 5px;
`;

const TBody = styled.div`
	display: flex;
	flex-direction: column;
	flex: 1;

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

const Close = styled(CloseIcon)`
	width: 16px;
	height: 16px;
`;

const orderToRow = (order, index, baseToken, quoteToken, cancelOrder) => {
	const sideLabel = order.side === OrderSide.Sell ? "Sell" : "Buy";
	const size = tokenAmountInUnits(order.size, baseToken.decimals, baseToken.displayDecimals);
	let status = "--";
	let isOrderFillable = false;

	const filled = order.filled
		? tokenAmountInUnits(order.filled, baseToken.decimals, baseToken.displayDecimals)
		: null;
	if (order.status) {
		isOrderFillable = order.status === OrderStatus.Fillable;
		status = isOrderFillable ? "Open" : "Filled";
	}
	const currencyPair = getCurrencyPairFromTokens(baseToken, quoteToken);
	const price = parseFloat(order.price.toString()).toFixed(currencyPair.config.pricePrecision);

	return (
		<TR key={index}>
			<TD variant={order.side === OrderSide.Buy ? "success" : "danger"}>{sideLabel}</TD>
			<TD>{size}</TD>
			<TD>{filled}</TD>
			<TD>{price}</TD>
			<TD>
				<div className="d-flex align-items-center justify-content-between">
					<span>{status}</span>

					<Close onClick={cancelOrder.bind(this, order)} />
				</div>
			</TD>
		</TR>
	);
};

const OrderHistory = (props) => {
	const { account } = useActiveWeb3React();
	const { t } = useTranslation();
	const { orders, baseToken, quoteToken } = props;
	const ordersToShow = orders.filter((order) => order.status === OrderStatus.Fillable);

	let content;

	if (!baseToken || !quoteToken) {
		content = (
			<div className="w-100 h-100 d-flex align-items-center justify-content-center">
				<Loading width={40} height={40} id={`order-history-${props.isMobile ? "mobile" : "desktop"}`} active />
			</div>
		);
	} else if (!ordersToShow.length || !baseToken || !quoteToken || !account) {
		content = (
			<div className="w-100 h-100 d-flex align-items-center justify-content-xl-center">
				<EmptyText>{t("errors.noTrade")}</EmptyText>
			</div>
		);
	} else {
		const tokenQuoteSymbol = isWeth(quoteToken.symbol) ? "ETH" : quoteToken.symbol.toUpperCase();
		const tokenBaseSymbol = isWeth(baseToken.symbol) ? "ETH" : baseToken.symbol.toUpperCase();

		content = (
			<div className="d-flex flex-column">
				<CustomHead>
					<TH>{t("side")}</TH>
					<TH>
						{t("size")} ({tokenBaseSymbol})
					</TH>
					<TH>
						{t("filled")} ({tokenBaseSymbol})
					</TH>
					<TH>
						{t("price")} ({tokenQuoteSymbol})
					</TH>
					<TH>{t("status")}</TH>
				</CustomHead>
				<TBody>
					{ordersToShow.map((order, index) =>
						orderToRow(order, index, baseToken, quoteToken, props.onCancelOrder)
					)}
				</TBody>
			</div>
		);
	}

	return (
		<Card>
			<CardTitle>{t("openOrders")}</CardTitle>
			<Content>
				<InnerContent>{content}</InnerContent>
			</Content>
		</Card>
	);
};

const mapStateToProps = (state) => {
	return {
		baseToken: state.spot.baseToken,
		orders: state.relayer.userOrders,
		quoteToken: state.spot.quoteToken,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		onCancelOrder: (order) => dispatch(cancelOrder(order)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(OrderHistory);
