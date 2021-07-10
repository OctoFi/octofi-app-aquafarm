import styled from "styled-components";

import Page from "../../components/Page";
import { DEFAULT_MARGIN_MARKET } from "../../constants";
import StyledCard, { ResponsiveCard } from "../../components/Card";
import Orderbook from "./components/Orderbook";
import TradeHistory from "./components/TradeHistory";
import MarketDetails from "./components/MarketDetails";
import TradingViewWidget, { Themes } from "react-tradingview-widget";
import OrderHistory from "./components/OrderHistory";
import Providers from "./Provider";
import { useSelector } from "react-redux";
import MarketStats from "./components/MarketStats";
import BuyOrSell from "./components/BuyOrSell";

const Row = styled.div`
	display: ${({ justMobile }) => (justMobile ? "none" : "flex")};
	margin-left: -5px;
	margin-right: -5px;

	@media (max-width: 1400px) {
		flex-direction: column;
		display: ${({ justDesktop }) => (justDesktop ? "none" : "flex")};
	}
`;
const Col = styled.div`
	padding: 0 5px;
	display: flex;
	flex-direction: column;
`;

const ContainerCard = styled(ResponsiveCard)`
	display: flex;
	margin-bottom: 20px;

	& .card-body {
		padding: 30px;
	}

	@media (min-width: 1400px) {
		width: 582px;
		height: 487px;
		margin-bottom: 10px;

		& .card-body {
			padding: 12px 20px 20px;
			display: flex;
		}
	}
`;

const Card = styled(StyledCard)`
	display: flex;
	flex-direction: column;
	align-items: stretch;
	margin-bottom: 20px;
	overflow: hidden;

	& .card-body {
		padding: 0;
	}
	@media (min-width: 1400px) {
		margin-bottom: 10px;
		width: 570px;
		height: 373px;
	}
`;

const Margin = (props) => {
	const selectedMarket = useSelector((state) => state.margin.selectedMarket);

	return (
		<Page title={false} size={"xl"} networkSensitive={true}>
			<Providers>
				<Row>
					<Col>
						<MarketStats />
					</Col>
					<Col>
						<MarketDetails isTradingGraphic={true} />
						<Card>
							<TradingViewWidget
								symbol={(selectedMarket || DEFAULT_MARGIN_MARKET).split("-").join("")}
								theme={Themes.DARK}
								allow_symbol_change={false}
								width={"100%"}
								height={373}
							/>
						</Card>
						<OrderHistory />
					</Col>
					<Col>
						<ContainerCard>
							<Orderbook />
							<TradeHistory />
						</ContainerCard>
						<BuyOrSell />
					</Col>
				</Row>
			</Providers>
		</Page>
	);
};

export default Margin;
