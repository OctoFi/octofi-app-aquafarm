import Page from "../../components/Page";
import fiatOffList from "../../data/FiatOffList";
import OfframpList from "../../components/OfframpList";

const FiatOff = (props) => {
	return (
		<Page title={"Gift Cards & More"} networkSensitive={false}>
			<OfframpList items={fiatOffList} />
		</Page>
	);
};

export default FiatOff;
