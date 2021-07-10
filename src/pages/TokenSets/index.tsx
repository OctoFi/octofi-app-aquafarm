import Page from "../../components/Page";
import { ResponsiveCard } from "../../components/Card";
import TokenSetsTabs from "../../components/TokenSetsTabs";

const TokenSets = () => {
	return (
		<Page title={"Token Sets"} networkSensitive={true}>
			<ResponsiveCard>
				<TokenSetsTabs />
			</ResponsiveCard>
		</Page>
	);
};

export default TokenSets;
