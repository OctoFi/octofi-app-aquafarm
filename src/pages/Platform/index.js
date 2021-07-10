import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Col, Row } from "react-bootstrap";

import defiSdk from "../../utils/getDefiSdk";
import ValueCard from "../../components/ValueCard";
import AssetTable from "../../components/AssetTable";
import Page from "../../components/Page";
import Card from "../../components/Card";

function Platforms(props) {
	const [platform, setPlatform] = useState(null);
	const [totalAssets, setTotalAssets] = useState(0);
	const [totalDebts, setTotalDebts] = useState(0);

	useEffect(() => {
		defiSdk.getProtocolNames().then((protocols) => {
			if (!protocols.includes(props.match.params.platform)) {
				props.history.push("/dashboard");
			}
		});
	}, [props.match.params.platform]);

	useEffect(() => {
		const p = props.balances.find((item) => {
			return item.metadata.name === props.match.params.platform;
		});
		if (p) {
			setPlatform(p);
			const account = {
				assets: 0,
				debts: 0,
			};
			p.balances.forEach((balance) => {
				if (balance.metadata.type === "Debt") {
					account.debts += balance.total;
				} else {
					account.assets += balance.total;
				}
			});
			setTotalAssets(account.assets);
			setTotalDebts(account.debts);
		}
	}, [props.balances, props.match.params.platform]);

	return (
		<Page title={props.match.params.platform} networkSensitive={true}>
			<Row className={"custom-row"}>
				<Col xs={12} md={4}>
					<ValueCard title={"Supplied Total"} value={totalAssets} type={"assets"} />
				</Col>
				<Col xs={12} md={4}>
					<ValueCard title={"Borrowed Total"} value={totalDebts} type={"debts"} />
				</Col>
				<Col xs={12} md={4}>
					<ValueCard title={"Net"} value={platform ? platform.total : 0} type={"netWorth"} />
				</Col>
			</Row>
			<Row>
				{platform &&
					platform.balances.map((asset) => {
						let data = asset.balances || [];
						return (
							<Col xs={12}>
								<Card
									header={true}
									title={asset.metadata.type}
									table={true}
									marginTop={20}
									style={{ marginBottom: 10 }}
								>
									<AssetTable balances={data} />
								</Card>
							</Col>
						);
					})}
			</Row>
		</Page>
	);
}

const mapStateToProps = (state) => {
	return {
		account: state.account,
		balances: state.balances.transformedBalance,
	};
};

export default connect(mapStateToProps)(Platforms);
