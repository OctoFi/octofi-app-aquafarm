import React, { useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { Route } from "react-router-dom";
import { connect, useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { useActiveWeb3React } from "../../hooks";
import { emitter } from "../../lib/helper";
import { fetchBalances, fetchTransformedBalances } from "../../state/balances/actions";
import { useMemoTokenBalances } from "../../state/balances/hooks";
import Page from "../../components/Page";
import AccountCard from "../../components/AccountCard";
import AssetModal from "../../components/AssetModal";
import WalletModal from "../../components/AssetModal/WalletModal";
import AssetTable from "../../components/AssetTable";
// import WalletTable from "../../components/AssetTable/WalletTable";
import WalletCard from "../../components/WalletCard";
import ChartCard from "../../components/ChartCard";
import Platforms from "../../components/Platforms";
import * as Styled from "./styleds";

const Dashboard = (props) => {
	const { t } = useTranslation();
	const { account } = useActiveWeb3React();
	const balances = useSelector((state) => state.balances.data);
	const { ETH } = useSelector((state) => state.currency.currenciesRate);
	const dispatch = useDispatch();
	const walletBalances = useMemoTokenBalances();

	useEffect(() => {
		if (account) {
			dispatch(fetchBalances(account));
		}
	}, [account, dispatch]);

	useEffect(() => {
		dispatch(fetchTransformedBalances(balances, walletBalances, ETH));
	}, [balances, walletBalances, ETH, dispatch]);

	const onClickToken = (token) => {
		if (token.metadata.symbol === "ETH") {
			props.history.push("/coins/ethereum");
		} else {
			props.history.push(`/coins/${token.metadata.address}`);
			// props.history.push(`/coins/contract/${token.metadata.address}`);
		}
	};

	const onSelectCard = (asset) => {
		emitter.emit("open-modal", {
			action: () => {
				props.history.push("/dashboard");
				emitter.emit("close-modal");
			},
		});
		if (asset === "wallet") {
			props.history.push("/dashboard/assets");
		} else {
			props.history.push(`/dashboard/account/${asset}`);
		}
	};

	const onSelectPlatform = (platform) => {
		props.history.push(`/platforms/${platform}`);
	};

	return (
		<Page title={undefined} networkSensitive={false}>
			<Row className="mb-3">
				<Col xs={12} lg={8} className="mb-3 mb-lg-0">
					{/* TODO: replace with a Portfolio Balance Chart */}
					<ChartCard account={account} className="mb-3" />
					<WalletCard />
					{/* <WalletTable
						balances={props.overview.wallet.balances}
						size={"sm"}
						onClickToken={onClickToken}
						loading={!props.overview}
						show={props.overview}
					/> */}
				</Col>
				<Col xs={12} lg={4}>
					<AccountCard
						color={"primary"}
						title={t("netWorth")}
						value={props.overview.deposits.total + props.overview.wallet.total - props.overview.debts.total}
						type={"netWorth"}
						show={true}
						loading={props.loading}
					/>

					<AccountCard
						color={"secondary"}
						title={t("totalAssets")}
						value={props.overview.deposits.total + props.overview.wallet.total}
						type={"wallet"}
						show={true}
						loading={props.loading}
					/>

					{/*
					<AccountCard
						color={"primary"}
						title={props.overview.wallet.title}
						value={props.overview.wallet.total}
						type={props.overview.wallet.slug}
						show={true}
						loading={props.loading}
						onShowMore={() => onSelectCard(props.overview.wallet.slug)}
						assets={props.overview.wallet}
					>
						<WalletTable
							balances={props.overview.wallet.balances.slice(0, 5)}
							size={"sm"}
							onClickToken={onClickToken}
						/>
					</AccountCard>
					*/}

					<AccountCard
						color={"primary"}
						title={props.overview.deposits.title}
						value={props.overview.deposits.total}
						type={props.overview.deposits.slug}
						show={true}
						loading={props.loading}
						onShowMore={() => onSelectCard(props.overview.deposits.slug)}
						assets={props.overview.deposits}
					>
						<AssetTable size={"sm"} balances={props.overview.deposits.balances.slice(0, 5)} />
					</AccountCard>

					<AccountCard
						color={"secondary"}
						title={props.overview.debts.title}
						value={props.overview.debts.total}
						type={props.overview.debts.slug}
						show={true}
						loading={props.loading}
						onShowMore={() => onSelectCard(props.overview.debts.slug)}
						assets={props.overview.debts}
					>
						<AssetTable size={"sm"} balances={props.overview.debts.balances.slice(0, 5)} />
					</AccountCard>
				</Col>
			</Row>

			<Styled.RowTitle className={"h4"}>{t("platforms")}</Styled.RowTitle>
			<Platforms balance={props.transformedBalance} onSelectPlatform={onSelectPlatform} loading={props.loading} />

			<Route path={"/dashboard/assets"} component={WalletModal} />
			<Route path={"/dashboard/account/:asset"} component={AssetModal} />
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
