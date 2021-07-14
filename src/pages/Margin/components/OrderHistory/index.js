import { connect } from "react-redux";
import styled from "styled-components";
import React from "react";
import { lighten } from "polished";
import { Button } from "react-bootstrap";

import { isWeth } from "../../../../utils/known_tokens";
import { tokenAmountInUnits } from "../../../../utils/spot/tokens";
import { ServerState } from "../../../../constants";
import Loading from "../../../../components/Loading";
import { ResponsiveCard } from "../../../../components/Card";
import { CloseIcon } from "../../../../theme";
import BigNumber from "bignumber.js";
import { useActiveWeb3React } from "../../../../hooks";
import { useTranslation } from "react-i18next";
import { useAuthSigner, useOrderCanceler } from "../../../../state/margin/hooks";

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

const orderToRow = (order, index, cancelOrder, market) => {
	const sideLabel = order.side === "sell" ? "Sell" : "Buy";
	const baseDecimals = market.baseAssetDecimals;

	const orderSize = new BigNumber(order.amount).times(10 ** baseDecimals);

	const size = tokenAmountInUnits(orderSize, baseDecimals, 3);
	let status = `&mdash;`;

	const filled = order.confirmedAmount
		? tokenAmountInUnits(new BigNumber(order.confirmedAmount), baseDecimals, 3)
		: null;
	if (order.status) {
		status = order.status || "canceled";
	}
	const price = order.price;

	return (
		<TR key={index}>
			<TD variant={order.side === "buy" ? "success" : "danger"}>{sideLabel}</TD>
			<TD>{size}</TD>
			<TD>{filled}</TD>
			<TD>{price}</TD>
			<TD>
				<div className="d-flex align-items-center justify-content-between">
					<span>{status}</span>

					<Close onClick={cancelOrder.bind(this, order.id)} />
				</div>
			</TD>
		</TR>
	);
};

const OrderHistory = (props) => {
	const signer = useAuthSigner();
	const cancelOrder = useOrderCanceler();
	const { account } = useActiveWeb3React();
	const { t } = useTranslation();
	const { selectedMarket, orders, ordersStats, accessToPrivate } = props;

	let content;

	if (!accessToPrivate) {
		content = (
			<div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column">
				<EmptyText className={"mb-3 text-center"}>{t("errors.signAccount")}</EmptyText>
				<Button variant={"secondary"} onClick={signer}>
					{t("confirm")}
				</Button>
			</div>
		);
	} else if (!selectedMarket || ordersStats === ServerState.NotLoaded) {
		content = (
			<div className="w-100 h-100 d-flex align-items-center justify-content-center">
				<Loading width={40} height={40} id={`order-history-${props.isMobile ? "mobile" : "desktop"}`} active />
			</div>
		);
	} else if (ordersStats === ServerState.Error || !orders) {
		content = (
			<div className="w-100 h-100 d-flex align-items-center justify-content-center">
				<EmptyText>{t("errors.noTrade")}</EmptyText>
			</div>
		);
	} else {
		const baseToken = selectedMarket.baseAsset;
		const quoteToken = selectedMarket.quoteAsset;
		const tokenQuoteSymbol = isWeth(quoteToken.toLowerCase()) ? "ETH" : quoteToken.toUpperCase();
		const tokenBaseSymbol = isWeth(baseToken.toLowerCase()) ? "ETH" : baseToken.toUpperCase();

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
					{orders.map((order, index) => orderToRow(order, index, cancelOrder, selectedMarket, account))}
				</TBody>
			</div>
		);
	}

	return (
		<Card>
			<CardTitle>Open Orders</CardTitle>
			<Content>
				<InnerContent>{content}</InnerContent>
			</Content>
		</Card>
	);
};

const mapStateToProps = (state) => {
	return {
		selectedMarket: state.margin.selectedMarketStats,
		orders: state.margin.orders.data,
		ordersStats: state.margin.orders.state,
		accessToPrivate: state.margin.accessToPrivate,
	};
};

export default connect(mapStateToProps)(OrderHistory);
