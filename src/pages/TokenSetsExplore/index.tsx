import Page from "../../components/Page";
import { ResponsiveCard } from "../../components/Card";
import TokenSetsExploreTable from "../../components/TokenSetsTable";

const TokenSetsExplore = () => {
	return (
		<Page title={"Token Sets"} notNetworkSensitive={true}>
			<ResponsiveCard>
				<TokenSetsExploreTable />
			</ResponsiveCard>
		</Page>
	);
};

export default TokenSetsExplore;
