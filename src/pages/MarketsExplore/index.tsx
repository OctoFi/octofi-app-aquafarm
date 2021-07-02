import Page from "../../components/Page";
import { ResponsiveCard } from "../../components/Card";
import MarketTokens from "../../components/MarketTokens";

const MarketsExplore = () => {
	return (
		<Page title={"Top Tokens"} notNetworkSensitive={true}>
			<ResponsiveCard>
				<MarketTokens />
			</ResponsiveCard>
		</Page>
	);
};

export default MarketsExplore;
