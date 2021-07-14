import { connect } from "react-redux";
import { Row, Col } from "react-bootstrap";

import Page from "../../components/Page";
import Card from "../../components/Card";
import MarketOverview from "../../components/MarketOverview";
import MarketCard from "./MarketCard";
import Provider from "./Provider";
import { ServerState } from "../../constants";
import { useMemo } from "react";

const Markets = (props) => {
	const { markets, marketsStats, marketsStatsState } = props;

	const convertedMarketsStats = useMemo(() => {
		return marketsStats
			? marketsStats.map((stats) => {
					return {
						pair: stats.pair,
						last_price: Number(stats.last_price),
						last_price_change: Number(stats.last_price_change),
						price_max_24: Number(stats.price_max_24),
						price_min_24: Number(stats.price_min_24),
						volume_24: Number(stats.volume_24),
					};
			  })
			: [];
	}, [marketsStats]);

	return (
		<Page networkSensitive={true}>
			<Provider>
				<Row className={"custom-row d-flex align-items-stretch"}>
					{[...Array(4)].map((item, index) => {
						const row = marketsStats[index] || {};

						const percent = Number(row.last_price_change);
						return (
							<Col xs={12} md={6} lg={3} className={"d-flex flex-column align-items-stretch"}>
								<Card className={"h-100"}>
									<MarketOverview
										row={row.hasOwnProperty("pair")}
										pair={row.pair}
										price={Number(row.last_price).toFixed(6)}
										variant={percent >= 0 ? "success" : "danger"}
										changePercent={`${percent >= 0 ? "+" : ""}${percent?.toFixed(2)}%`}
										volume={!!row && `${row.volume_24} ${row.base}`}
									/>
								</Card>
							</Col>
						);
					})}
				</Row>
				<Row>
					<Col>
						<MarketCard
							markets={convertedMarketsStats}
							extraData={markets}
							loading={marketsStatsState !== ServerState.Done}
						/>
					</Col>
				</Row>
			</Provider>
		</Page>
	);
};

const mapStateToProps = (state) => {
	return {
		markets: state.spot.markets,
		marketsStats: state.spot.marketsStats,
		marketsStatsState: state.relayer.marketsStatsState,
	};
};

export default connect(mapStateToProps)(Markets);
