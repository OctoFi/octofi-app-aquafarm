import { useEffect } from "react";
import { useMarginUpdater, useMarketChanger } from "../../state/margin/hooks";
import { useHistory, useParams } from "react-router-dom";
import { DEFAULT_MARGIN_MARKET, UPDATE_MARGIN_INTERVAL } from "../../constants";

let interval = null;

const Providers = (props) => {
	const updater = useMarginUpdater();
	const marketChanger = useMarketChanger();
	const { marketId } = useParams();
	const history = useHistory();

	useEffect(() => {
		clearInterval(interval);
		interval = null;
		marketChanger(marketId || DEFAULT_MARGIN_MARKET).then((res) => {
			if (res) {
				interval = setInterval(() => {
					updater();
				}, UPDATE_MARGIN_INTERVAL);
			} else {
				clearInterval(interval);
				history.push(`/trade/margin/${DEFAULT_MARGIN_MARKET}`);
			}
		});
	}, [marketId]);

	return props.children;
};

export default Providers;
