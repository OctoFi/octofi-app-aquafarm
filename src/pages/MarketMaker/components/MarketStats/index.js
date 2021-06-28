import { connect } from "react-redux";
import styled from "styled-components";
import React, { useMemo } from "react";
import { OrderStatus } from "@0x/types";
import { lighten } from "polished";

import { isWeth } from "../../../../utils/known_tokens";
import Loading from "../../../../components/Loading";
import { ResponsiveCard } from "../../../../components/Card";
import { getCurrencyPair, getMarketMakerStats } from "../../../../state/selectors";
import { marketToString } from "../../../../utils/spot/market";
import { useActiveWeb3React } from "../../../../hooks";

const Card = styled(ResponsiveCard)`
	display: flex;
	flex-direction: column;
	align-items: stretch;
	margin-bottom: 20px;

	@media (min-width: 1400px) {
		width: 700px;
		height: 447px;

		& .card-body {
			padding: 20px;
			display: flex;
			flex-direction: column;
		}
	}
`;

const CardTitle = styled.h4`
	margin-top: 0;
	padding: 0;
	margin-bottom: 20px;
	font-size: 1.25rem;
	font-weight: 700;
	color: ${({ theme }) => theme.text1};
`;

const Content = styled.div`
	background-color: ${({ theme }) => theme.bg1};
	border-radius: 18px;
	display: flex;
	flex-direction: column;
	flex: 1;
	max-height: 363px;
	overflow: hidden;

	@media (max-width: 1400px) {
		max-height: initial;
	}
`;

const InnerContainer = styled.div`
	width: 100%;
	height: 100%;
	max-height: 100%;
	overflow-x: hidden;
	overflow-y: auto;
	display: grid;
	flex: 1;
	padding: 20px;
	grid-template-columns: 1fr 1fr;
	gap: 32px 65px;

	@media (max-width: 1400px) {
		grid-template-columns: auto;
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

const Column = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;

	&:last-child {
		padding-bottom: 30px;
	}
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

const fieldsStatsMap = [
	{
		label: "Protocol Fees",
		field: "protocolFeesCollected",
	},
	{
		label: "Weth Fees",
		field: "totalWethFeesCollected",
	},
	{
		label: "Total Orders",
		field: "totalOrders",
	},
	{
		label: "Total Buy Orders",
		field: "totalBuyOrders",
	},
	{
		label: "Total Sell Orders",
		field: "totalSellOrders",
	},
	{
		label: "Median Buy Price",
		field: "medianBuyPrice",
	},
	{
		label: "Median Sell Price",
		field: "medianSellPrice",
	},
	{
		label: "Total Buy Base Volume",
		field: "totalBuyBaseVolume",
	},
	{
		label: "Total Sell Base Volume",
		field: "totalSellBaseVolume",
	},
	{
		label: "Total Buy Quote Volume",
		field: "totalBuyQuoteVolume",
	},
	{
		label: "Total Sell Quote Volume",
		field: "totalSellQuoteVolume",
	},
	{
		label: "Total Quote Volume",
		field: "totalQuoteVolume",
	},
	{
		label: "Total Base Volume",
		field: "totalBaseVolume",
	},
];

const MarketStats = (props) => {
	const { account } = useActiveWeb3React();
	const { marketMakerStats, currencyPair } = props;
	let content;

	const filteredMarketMakerStats = useMemo(() => {
		return marketMakerStats.find(
			(m) => m.account.toLowerCase() === account.toLowerCase() && m.market === marketToString(currencyPair)
		);
	}, [marketMakerStats]);

	content = fieldsStatsMap.map((f, index) => (
		<Column key={index}>
			<Label>{f.label}</Label>
			<Value>{filteredMarketMakerStats ? filteredMarketMakerStats[f.field].toString() : 0}</Value>
		</Column>
	));

	return (
		<Card>
			<CardTitle>Market Maker Stats</CardTitle>
			<Content>
				<InnerContainer>{content}</InnerContainer>
			</Content>
		</Card>
	);
};

const mapStateToProps = (state) => {
	return {
		marketMakerStats: getMarketMakerStats(state),
		currencyPair: getCurrencyPair(state),
	};
};

export default connect(mapStateToProps)(MarketStats);
