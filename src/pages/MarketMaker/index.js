import styled from "styled-components";

import Page from "../../components/Page";
import { ResponsiveCard } from "../../components/Card";
import Orderbook from "./components/Orderbook";
import Provider from "./components/Provider";
import MarketFills from "./components/MarketFills";
import OrderHistory from "./components/OrderHistory";
import MarketStats from "./components/MarketStats";
import MakerContainer from "./components/MakerContainer";

const Row = styled.div`
	display: flex;
	margin-left: -10px;
	margin-right: -10px;

	@media (max-width: 1400px) {
		flex-direction: column;
		display: ${({ justDesktop }) => (justDesktop ? "none" : "flex")};
	}
`;
const Col = styled.div`
	padding: 0 10px;
	flex-direction: column;
	display: ${({ justMobile }) => (justMobile ? "none" : "flex")};

	@media (max-width: 1400px) {
		display: ${({ justDesktop }) => (justDesktop ? "none" : "flex")};
	}
`;

const ContainerCard = styled(ResponsiveCard)`
	display: flex;
	margin-bottom: 20px;
	& .card-body {
		padding: 30px;
	}

	@media (min-width: 1400px) {
		width: 700px;
		height: 1113px;

		& .card-body {
			padding: 135px 20px 20px;
			display: flex;
			position: relative;
		}
	}
`;

const MarketMaker = (props) => {
	return (
		<Page title={"Market Maker"} size={"lg"} networkSensitive={true}>
			<Provider>
				<Row style={{ marginTop: -30 }}>
					<Col>
						<MakerContainer />
					</Col>
					<Col justDesktop>
						<ContainerCard>
							<Orderbook />
							<MarketFills />
						</ContainerCard>
					</Col>
					<Col justMobile>
						<ContainerCard>
							<Orderbook />
						</ContainerCard>
						<ContainerCard>
							<MarketFills />
						</ContainerCard>
					</Col>
				</Row>
				<Row className={"justify-content-end"}>
					<Col>
						<OrderHistory />
					</Col>
					<Col>
						<MarketStats />
					</Col>
				</Row>
			</Provider>
		</Page>
	);
};

export default MarketMaker;
