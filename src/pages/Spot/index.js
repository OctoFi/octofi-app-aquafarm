import TradingViewWidget, { Themes } from "react-tradingview-widget";
import { useEffect, useState } from "react";
import styled from "styled-components";

import Page from "../../components/Page";
import StyledCard, { ResponsiveCard } from "../../components/Card";
import MarketStats from "./components/MarketStats";
import MarketDetails from "./components/MarketDetails";
import Orderbook from "./components/Orderbook";
import Provider from "./components/Provider";
import { useDispatch, useSelector } from "react-redux";
import MarketFills from "./components/MarketFills";
import OrderHistory from "./components/OrderHistory";
import BuySell from "./components/BuySell";
import ModalProvider from "./components/BuySell/ModalProvider";
import { updateGasInfo } from "../../state/currency/actions";

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

const ContainerCard = styled(ResponsiveCard)`
	display: flex;
	margin-bottom: 20px;

	& .card-body {
		padding: 30px;
	}

	@media (min-width: 1400px) {
		width: 582px;
		height: 486px;
		margin-bottom: 10px;

		& .card-body {
			padding: 12px 20px 20px;
			display: flex;
		}
	}
`;

const Spot = (props) => {
	const [pair, setPair] = useState("BINANCE:ETHDAI");
	const { baseToken, quoteToken } = useSelector((state) => state.spot);
	const dispatch = useDispatch();

	useEffect(() => {
		if (!baseToken || !quoteToken) {
			setPair("BINANCE:ETHDAI");
		} else {
			const quote =
				quoteToken && quoteToken.symbol.toLowerCase() === "weth" ? "ETH" : quoteToken.symbol.toUpperCase();
			const base =
				baseToken && baseToken.symbol.toLowerCase() === "weth" ? "ETH" : baseToken.symbol.toUpperCase();
			setPair(`BINANCE:${base}${quote}`);
		}
	}, [baseToken, quoteToken]);

	useEffect(() => {
		dispatch(updateGasInfo());
	}, [dispatch]);

	return (
		<Page title={false} size={"xl"} networkSensitive={true}>
			<Provider>
				<ModalProvider>
					<Row justDesktop>
						<Col>
							<MarketStats />
						</Col>
						<Col>
							<MarketDetails isTradingGraphic={true} />
							<Card>
								<TradingViewWidget
									symbol={pair}
									theme={Themes.DARK}
									allow_symbol_change={false}
									width={"100%"}
									height={373}
								/>
							</Card>
						</Col>
						<Col>
							<ContainerCard>
								<Orderbook />
								<MarketFills />
							</ContainerCard>
						</Col>
					</Row>
					<Row className={"justify-content-end"} justDesktop>
						<Col>
							<OrderHistory />
						</Col>
						<Col>
							<BuySell />
						</Col>
					</Row>
					<Row justMobile>
						<Col>
							<MarketDetails isMobile={true} isTradingGraphic={true} />
							<Card>
								<TradingViewWidget
									symbol={pair}
									theme={Themes.DARK}
									allow_symbol_change={false}
									width={"100%"}
									height={528}
								/>
							</Card>
						</Col>

						<Col>
							<BuySell />
						</Col>

						<Col>
							<ContainerCard>
								<Orderbook isMobile={true} />
							</ContainerCard>
						</Col>
						<Col>
							<ContainerCard>
								<MarketFills isMobile={true} />
							</ContainerCard>
						</Col>
						<Col>
							<MarketStats isMobile={true} />
						</Col>

						<Col>
							<OrderHistory isMobile={true} />
						</Col>
					</Row>
				</ModalProvider>
			</Provider>
		</Page>
	);
};

export default Spot;
