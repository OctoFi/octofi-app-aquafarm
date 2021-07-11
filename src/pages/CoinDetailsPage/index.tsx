import Page from "../../components/Page";
import CoinDetails from "../../components/CoinDetails";

const CoinDetailsPage = (props: any) => {
	return (
		<Page title={"Coin Details"} networkSensitive={true}>
			<CoinDetails id={props.match.params.id} />
		</Page>
	);
};

export default CoinDetailsPage;
