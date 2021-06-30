import React, { useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { Route } from "react-router-dom";
import { connect, useDispatch, useSelector } from "react-redux";
import SVG from "react-inlinesvg";
import styled from "styled-components";

import { useActiveWeb3React } from "../../hooks";
import ValueCard from "../../components/ValueCard";
import OverviewCard from "../../components/OverviewCard";
import ChartCard from "../../components/ChartCard";
import AssetModal from "../../components/AssetModal";
import WalletModal from "../../components/AssetModal/wallet";
import Page from "../../components/Page";
import Loading from "../../components/Loading";
import AccountCard from "../../components/AccountCard";
import { emitter } from "../../lib/helper";
import { fetchBalances, fetchTransformedBalances } from "../../state/balances/actions";
import { useMemoTokenBalances } from "../../state/balances/hooks";
import { useTranslation } from "react-i18next";

const LoadingCol = styled.div`
	background-color: ${({ theme }) => theme.modalBG};
	border-radius: 20px;
	min-height: 550px;
`;

const Card = styled.div`
	background-color: ${({ theme }) => theme.modalBG};
	color: ${({ theme }) => theme.text1};
	display: flex;
	align-items: center;
	border-radius: 20px;
	justify-content: center;
	flex-direction: column;
	padding: 45px;
`;

const RowTitle = styled.h4`
	margin-top: 30px;
	margin-bottom: 20px;

	@media (min-width: 768px) {
		margin-top: 60px;
		margin-bottom: 30px;
	}
`;

const Dashboard = (props) => {
	const { account } = useActiveWeb3React();
	const balances = useSelector((state) => state.balances.data);
	const { ETH } = useSelector((state) => state.currency.currenciesRate);
	const dispatch = useDispatch();
	const walletBalances = useMemoTokenBalances();
	const { t } = useTranslation();

	useEffect(() => {
		if (account) {
			dispatch(fetchBalances(account));
		}
	}, [account, dispatch]);

	useEffect(() => {
		dispatch(fetchTransformedBalances(balances, walletBalances, ETH));
	}, [balances, walletBalances, ETH, dispatch]);

	const clickOnAsset = (asset) => {
		emitter.emit("open-modal", {
			action: () => {
				props.history.push(`/dashboard`);
				emitter.emit("close-modal");
			},
		});
		if (asset === "wallet") {
			props.history.push("/dashboard/wallet");
		} else {
			props.history.push(`/dashboard/asset/${asset}`);
		}
	};

	const showPlatform = (platform) => {
		props.history.push(`/platforms/${platform}`);
	};

	return (
		<Page title={t("dashboard")} notNetworkSensitive={true}>
			{props.loading ? (
				<Row>
					<Col xs={12}>
						<LoadingCol className={"d-flex align-items-center justify-content-center"}>
							<Loading width={55} height={55} active color={"primary"} id={"dashboard-loading"} />
						</LoadingCol>
					</Col>
				</Row>
			) : (
				<>
					<Row className={"custom-row"}>
						<Col xs={12} md={4}>
							<ValueCard
								color={"secondary"}
								title={t("totalAssets")}
								value={props.overview.deposits.total + props.overview.wallet.total}
								type={"assets"}
							/>
						</Col>
						<Col xs={12} md={4}>
							<ValueCard
								title={t("totalDebts")}
								value={props.overview.debts.total}
								type={"debts"}
							/>
						</Col>
						<Col xs={12} md={4}>
							<ValueCard
								color={"secondary"}
								title={t("netWorth")}
								value={
									props.overview.deposits.total +
									props.overview.wallet.total -
									props.overview.debts.total
								}
								type={"netWorth"}
							/>
						</Col>
					</Row>
					<Row>
						<Col>
							<ChartCard className="gutter-b card-stretch" chartColor={"success"} account={account} />
						</Col>
					</Row>
					<Row>
						<Col>
							<RowTitle className={"h4"}>{t("accountOverview")}</RowTitle>
						</Col>
					</Row>
					<Row className={"custom-row d-flex align-items-stretch"}>
						{props.overview &&
							Object.keys(props.overview).map((key) => {
								const account = props.overview[key];
								return (
									<Col key={key} span={12} md={4}>
										<AccountCard
											clickHandler={clickOnAsset.bind(this, account.slug)}
											className={"gutter-b"}
											balances={account}
											title={account.title}
											type={key}
											value={account.total}
										/>
									</Col>
								);
							})}
					</Row>

					<Row>
						<Col>
							<RowTitle className={"h4"}>{t("platforms")}</RowTitle>
						</Col>
					</Row>
					<Row className={"custom-row"}>
						{props.transformedBalance.length > 0 ? (
							props.transformedBalance.map((b, index) => {
								return (
									<Col key={index} span={12} md={4}>
										<OverviewCard
											clickHandler={showPlatform.bind(this, b.metadata.name)}
											className={"gutter-b"}
											title={b.metadata.name}
											value={b.total.toFixed(4)}
											image={b.metadata.logo.href}
										/>
									</Col>
								);
							})
						) : (
							<Col xs={12}>
								<Card className="d-flex flex-column align-items-center justify-content-center py-8 px-4">
									<SVG
										src={require("../../assets/images/global/layout-block.svg").default}
										width={64}
										height={64}
									/>
									<h5 className="text-primary font-weight-bolder mb-3 mt-3">
										{t("errors.noPlatform")}
									</h5>
									<span className="text-dark-50">{t("errors.noPlatformDesc")}</span>
								</Card>
							</Col>
						)}
					</Row>
					<Route path={"/dashboard/asset/:asset"} component={AssetModal} />
					<Route path={"/dashboard/wallet"} component={WalletModal} />
				</>
			)}
		</Page>
	);
};

const mapStateToProps = (state) => {
	return {
		account: state.account,
		overview: state.balances.overview,
		transformedBalance: state.balances.transformedBalance,
		loading: state.balances.loading,
	};
};

export default connect(mapStateToProps)(Dashboard);
