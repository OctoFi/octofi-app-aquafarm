import { useContext, useEffect, useMemo, useState } from "react";
import { Row, Col } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import dompurify from "dompurify";
import { ThemeContext } from "styled-components";

import { useActiveWeb3React } from "../../hooks";
import { useTokenContract } from "../../hooks/useContract";
import { useIsDarkMode } from "../../state/user/hooks";
import { fetchSelectedCoin, fetchHistoricalData } from "../../state/market/actions";
import Card from "../Card";
import Loading from "../Loading";
import CurrencyText from "../CurrencyText";
import HistoricalChart from "../HistoricalChart";
import ArrowUp from "../Icons/Coin/ArrowUp";
import ArrowDown from "../Icons/Coin/ArrowDown";
import GradientButton from "../UI/Button";
import * as Styled from "./styleds";

export type CoinDetailsProps = {
	id?: string;
};

const CoinDetails = ({ id }: CoinDetailsProps) => {
	const { account } = useActiveWeb3React();
	const theme = useContext(ThemeContext);
	const darkMode = useIsDarkMode();
	const dispatch = useDispatch();
	// @ts-ignore
	const marketData = useSelector((state) => state.market);
	const [walletBalance, setWalletBalance] = useState<number>(0);
	const selected = marketData.selected.data || false;
	const tokenContract = useTokenContract(selected.contract_address);

	useEffect(() => {
		if (tokenContract) {
			tokenContract.decimals().then((decimals: any) => {
				tokenContract.balanceOf(account).then((response: any) => {
					const balance = response.toString();
					setWalletBalance(balance / 10 ** decimals);
				});
			});
		}
	}, [tokenContract, account]);

	useEffect(() => {
		dispatch(fetchSelectedCoin(id));

		dispatch(fetchHistoricalData(id));
	}, [dispatch, id]);

	const coinAbout = useMemo(() => {
		if (selected) {
			return dompurify?.sanitize(selected?.description?.en);
		}

		return "";
	}, [selected]);

	if (marketData?.selected?.loading) {
		return (
			<Row>
				<Col xs={12}>
					<Card>
						<div className={"d-flex align-items-center justify-content-center"} style={{ height: 400 }}>
							<Loading height={40} width={40} active id={"coin-details-loading"} />
						</div>
					</Card>
				</Col>
			</Row>
		);
	}

	return (
		<>
			{selected && walletBalance > 0 && (
				<Styled.BalanceCard>
					<div className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center justify-content-between">
						<Styled.BalanceText>Your "{selected.name}" Balance</Styled.BalanceText>
						<Styled.BalanceValue>
							{selected.symbol.toUpperCase()} {walletBalance.toFixed(6)} (
							<CurrencyText>{walletBalance * selected.market_data.current_price.usd}</CurrencyText>)
						</Styled.BalanceValue>
					</div>
				</Styled.BalanceCard>
			)}

			<Styled.ChartResponsiveCard>
				{selected && selected.contract_address && (
					<div className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center justify-content-between mb-4">
						<Styled.BuyHelper className={"font-weight-normal font-size-base"}>
							Do you wanna Exchange {selected.name}?
						</Styled.BuyHelper>
						<div className="d-flex align-items-center justify-content">
							<Styled.BuyLink
								to={`/uniswap?outputCurrency=${selected.contract_address}`}
								className="mr-4"
							>
								<GradientButton className={""} style={{ minWidth: 125 }}>
									Buy
								</GradientButton>
							</Styled.BuyLink>
							<Styled.BuyLink to={`/uniswap?inputCurrency=${selected.contract_address}`}>
								<GradientButton className={""} style={{ minWidth: 125 }}>
									Sell
								</GradientButton>
							</Styled.BuyLink>
						</div>
					</div>
				)}

				<HistoricalChart
					isPrimary={true}
					theme={theme}
					darkMode={darkMode}
					field={"prices"}
					data={marketData.historical.data}
					loading={marketData.historical.loading}
					description={`${selected && selected.name} Historical Price`}
					days={marketData.historical.days}
					currentData={selected && selected.market_data.current_price.usd}
				/>
			</Styled.ChartResponsiveCard>

			<Row>
				<Col xs={12} md={6}>
					<Styled.ChartResponsiveCard>
						<HistoricalChart
							theme={theme}
							darkMode={darkMode}
							field={"market_caps"}
							data={marketData.historical.data}
							loading={marketData.historical.loading}
							days={marketData.historical.days}
							description={`${selected && selected.name} Historical Market Cap`}
							currentData={selected && selected.market_data.market_cap.usd}
							minHeight={250}
						/>
					</Styled.ChartResponsiveCard>
				</Col>
				<Col xs={12} md={6}>
					<Styled.ChartResponsiveCard>
						<HistoricalChart
							theme={theme}
							darkMode={darkMode}
							field={"total_volumes"}
							data={marketData.historical.data}
							loading={marketData.historical.loading}
							days={marketData.historical.days}
							minHeight={250}
							description={`${selected && selected.name} Historical Total Volume`}
							currentData={selected && selected.market_data.total_volume.usd}
						/>
					</Styled.ChartResponsiveCard>
				</Col>
			</Row>

			<Row className={"d-flex align-items-stretch"}>
				<Col lg={3} md={6} xs={12}>
					<Styled.ResponsiveCol>
						<Styled.ChangesCard
							className={
								"d-flex flex-column flex-lg-row align-items-center justify-content-center justify-content-lg-start"
							}
						>
							<div className="d-flex align-items-center">
								{selected && selected.market_data.price_change_percentage_24h >= 0 ? (
									// TODO: fix fills
									// @ts-ignore
									<ArrowUp fill={"#1BC5BD"} size={64} />
								) : (
									// @ts-ignore
									<ArrowDown fill={"#F64E60"} size={64} />
								)}
								<Styled.ChangesTitle
									className={
										selected && selected.market_data.price_change_percentage_24h >= 0
											? "text-success"
											: "text-danger"
									}
								>
									{selected && Number(selected.market_data.price_change_percentage_24h).toFixed(4)}%
								</Styled.ChangesTitle>
							</div>
							<Styled.ChangesSubtitle>Daily Changes Percentage</Styled.ChangesSubtitle>
						</Styled.ChangesCard>
					</Styled.ResponsiveCol>
				</Col>
				<Col lg={3} md={6} xs={12}>
					<Styled.ResponsiveCol>
						<Styled.ChangesCard
							className={
								"d-flex flex-column flex-lg-row align-items-center justify-content-center justify-content-lg-start"
							}
						>
							<div className="d-flex align-items-center">
								{selected && selected.market_data.price_change_percentage_7d >= 0 ? (
									<ArrowUp />
								) : (
									<ArrowDown />
								)}
								<Styled.ChangesTitle
									className={
										selected && selected.market_data.price_change_percentage_7d >= 0
											? "text-success"
											: "text-danger"
									}
								>
									{selected && Number(selected.market_data.price_change_percentage_7d).toFixed(4)}%
								</Styled.ChangesTitle>
							</div>
							<Styled.ChangesSubtitle>Weekly Changes Percentage</Styled.ChangesSubtitle>
						</Styled.ChangesCard>
					</Styled.ResponsiveCol>
				</Col>
				<Col lg={3} md={6} xs={12}>
					<Styled.ResponsiveCol>
						<Styled.ChangesCard
							className={
								"d-flex flex-column flex-lg-row align-items-center justify-content-center justify-content-lg-start"
							}
						>
							<div className="d-flex align-items-center">
								{selected && selected.market_data.price_change_percentage_30d >= 0 ? (
									<ArrowUp />
								) : (
									<ArrowDown />
								)}
								<Styled.ChangesTitle
									className={
										selected && selected.market_data.price_change_percentage_30d >= 0
											? "text-success"
											: "text-danger"
									}
								>
									{selected && Number(selected.market_data.price_change_percentage_30d).toFixed(4)}%
								</Styled.ChangesTitle>
							</div>
							<Styled.ChangesSubtitle>Monthly Changes Percentage</Styled.ChangesSubtitle>
						</Styled.ChangesCard>
					</Styled.ResponsiveCol>
				</Col>
				<Col lg={3} md={6} xs={12}>
					<Styled.ResponsiveCol>
						<Styled.ChangesCard
							className={
								"d-flex flex-column flex-lg-row align-items-center justify-content-center justify-content-lg-start"
							}
						>
							<div className="d-flex align-items-center">
								{selected && selected.market_data.price_change_percentage_1y >= 0 ? (
									<ArrowUp />
								) : (
									<ArrowDown />
								)}
								<Styled.ChangesTitle
									className={
										selected && selected.market_data.price_change_percentage_1y >= 0
											? "text-success"
											: "text-danger"
									}
								>
									{selected && Number(selected.market_data.price_change_percentage_1y).toFixed(4)}%
								</Styled.ChangesTitle>
							</div>
							<Styled.ChangesSubtitle>Yearly Changes Percentage</Styled.ChangesSubtitle>
						</Styled.ChangesCard>
					</Styled.ResponsiveCol>
				</Col>
			</Row>

			<Styled.ResponsiveCol>
				<Styled.StyledCard header={true} title={"Coin Stats"}>
					<div className="d-flex align-items-center justify-content-between row pb-0 pb-lg-2">
						<Col
							xs={12}
							md={4}
							className={
								"d-flex flex-row flex-lg-column align-items-center align-items-lg-start justify-content-between justify-content-lg-center "
							}
						>
							<Styled.StatsDesc>Market Cap</Styled.StatsDesc>
							<Styled.StatsValue>${selected && selected.market_data.market_cap.usd}</Styled.StatsValue>
						</Col>
						<Col
							xs={12}
							md={4}
							className={
								"d-flex flex-row flex-lg-column align-items-center align-items-lg-start justify-content-between justify-content-lg-center "
							}
						>
							<Styled.StatsDesc>All time High</Styled.StatsDesc>
							<Styled.StatsValue className="text-success">
								${selected && selected.market_data.ath.usd}
							</Styled.StatsValue>
						</Col>
						<Col
							xs={12}
							md={4}
							className={
								"d-flex flex-row flex-lg-column align-items-center align-items-lg-start justify-content-between justify-content-lg-center "
							}
						>
							<Styled.StatsDesc last>All Time Low</Styled.StatsDesc>
							<Styled.StatsValue last className="text-danger">
								${selected && selected.market_data.atl.usd}
							</Styled.StatsValue>
						</Col>
					</div>
				</Styled.StyledCard>
			</Styled.ResponsiveCol>

			<Styled.ResponsiveCol>
				<Styled.StyledCard header={true} title={"About"}>
					<Styled.About dangerouslySetInnerHTML={{ __html: coinAbout }} />
				</Styled.StyledCard>
			</Styled.ResponsiveCol>

			<Styled.ResponsiveCol>
				<Styled.StyledCard header={true} title={"Coin Information"}>
					<Row>
						<Styled.DetailsCol xs={12} md={6}>
							<Row className={"d-flex flex-row align-items-center justify-content-between"}>
								<Styled.DetailsInnerCol lg={4}>
									<Styled.DetailsDesc>Currency Name</Styled.DetailsDesc>
								</Styled.DetailsInnerCol>
								<Styled.DetailsInnerCol
									lg={8}
									className={"d-flex align-items-center justify-content-end justify-content-lg-start"}
								>
									<Styled.DetailsValue>{selected && selected.name}</Styled.DetailsValue>
								</Styled.DetailsInnerCol>
							</Row>
						</Styled.DetailsCol>
						<Styled.DetailsCol xs={12} md={6}>
							<Row className={"d-flex flex-row align-items-center justify-content-between"}>
								<Styled.DetailsInnerCol lg={4}>
									<Styled.DetailsDesc>Symbol</Styled.DetailsDesc>
								</Styled.DetailsInnerCol>
								<Styled.DetailsInnerCol
									lg={8}
									className={"d-flex align-items-center justify-content-end justify-content-lg-start"}
								>
									<Styled.DetailsValue>
										{selected && selected.symbol.toUpperCase()}
									</Styled.DetailsValue>
								</Styled.DetailsInnerCol>
							</Row>
						</Styled.DetailsCol>
						<Styled.DetailsCol xs={12} md={6}>
							<Row className={"d-flex flex-row align-items-center justify-content-between"}>
								<Styled.DetailsInnerCol lg={4}>
									<Styled.DetailsDesc>Website</Styled.DetailsDesc>
								</Styled.DetailsInnerCol>
								<Styled.DetailsInnerCol
									lg={8}
									className={"d-flex align-items-center justify-content-end justify-content-lg-start"}
								>
									<Styled.DetailsLink
										withUnderline={selected && selected.links.homepage[0]}
										href={selected && selected.links.homepage[0]}
										target={"_blank"}
										rel={"noopener noreferrer"}
									>
										{selected && selected.links.homepage[0]}
									</Styled.DetailsLink>
								</Styled.DetailsInnerCol>
							</Row>
						</Styled.DetailsCol>
						<Styled.DetailsCol xs={12} md={6}>
							<Row className={"d-flex flex-row align-items-center justify-content-between"}>
								<Styled.DetailsInnerCol lg={4}>
									<Styled.DetailsDesc>Whitepaper</Styled.DetailsDesc>
								</Styled.DetailsInnerCol>
								<Styled.DetailsInnerCol
									lg={8}
									className={"d-flex align-items-center justify-content-end justify-content-lg-start"}
								>
									<Styled.DetailsLink
										withUnderline={selected && selected.links.ico_data}
										href={selected && selected.ico_data ? selected.ico_data.links.whitepaper : "#"}
										target={"_blank"}
										rel={"noopener noreferrer"}
									>
										{selected && selected.ico_data ? selected.ico_data.links.whitepaper : "-"}
									</Styled.DetailsLink>
								</Styled.DetailsInnerCol>
							</Row>
						</Styled.DetailsCol>
						<Styled.DetailsCol xs={12} md={6}>
							<Row className={"d-flex flex-row align-items-center justify-content-between"}>
								<Styled.DetailsInnerCol lg={4}>
									<Styled.DetailsDesc>Block Explorer</Styled.DetailsDesc>
								</Styled.DetailsInnerCol>
								<Styled.DetailsInnerCol
									lg={8}
									className={"d-flex align-items-center justify-content-end justify-content-lg-start"}
								>
									<Styled.DetailsLink
										withUnderline={selected && selected.links.blockchain_site[0]}
										href={selected && (selected.links.blockchain_site[0] || "#")}
										target={"_blank"}
										rel={"noopener noreferrer"}
									>
										{selected && (selected.links.blockchain_site[0] || "-")}
									</Styled.DetailsLink>
								</Styled.DetailsInnerCol>
							</Row>
						</Styled.DetailsCol>
						<Styled.DetailsCol xs={12} md={6}>
							<Row className={"d-flex flex-row align-items-center justify-content-between"}>
								<Styled.DetailsInnerCol lg={4}>
									<Styled.DetailsDesc>Github</Styled.DetailsDesc>
								</Styled.DetailsInnerCol>
								<Styled.DetailsInnerCol
									lg={8}
									className={"d-flex align-items-center justify-content-end justify-content-lg-start"}
								>
									<Styled.DetailsLink
										withUnderline={selected && selected.links.repos_url.github[0]}
										href={selected && (selected.links.repos_url.github[0] || "#")}
										target={"_blank"}
										rel={"noopener noreferrer"}
									>
										{selected && (selected.links.repos_url.github[0] || "-")}
									</Styled.DetailsLink>
								</Styled.DetailsInnerCol>
							</Row>
						</Styled.DetailsCol>
						<Styled.DetailsCol xs={12} md={6}>
							<Row className={"d-flex flex-row align-items-center justify-content-between"}>
								<Styled.DetailsInnerCol lg={4}>
									<Styled.DetailsDesc>Twitter</Styled.DetailsDesc>
								</Styled.DetailsInnerCol>
								<Styled.DetailsInnerCol
									lg={8}
									className={"d-flex align-items-center justify-content-end justify-content-lg-start"}
								>
									<Styled.DetailsLink
										withUnderline={selected && selected.links.twitter_screen_name}
										href={
											selected &&
											(selected.links.twitter_screen_name
												? `https://twitter.com/${selected.links.twitter_screen_name}`
												: "#")
										}
										target={"_blank"}
										rel={"noopener noreferrer"}
									>
										{selected &&
											(selected.links.twitter_screen_name
												? `https://twitter.com/${selected.links.twitter_screen_name}`
												: "-")}
									</Styled.DetailsLink>
								</Styled.DetailsInnerCol>
							</Row>
						</Styled.DetailsCol>
						<Styled.DetailsCol xs={12} md={6}>
							<Row className={"d-flex flex-row align-items-center justify-content-between"}>
								<Styled.DetailsInnerCol lg={4}>
									<Styled.DetailsDesc>Facebook</Styled.DetailsDesc>
								</Styled.DetailsInnerCol>
								<Styled.DetailsInnerCol
									lg={8}
									className={"d-flex align-items-center justify-content-end justify-content-lg-start"}
								>
									<Styled.DetailsLink
										withUnderline={selected && selected.links.facebook_username}
										href={
											selected &&
											(selected.links.facebook_username
												? `https://facebook.com/${selected.links.facebook_username}`
												: "#")
										}
										target={"_blank"}
										rel={"noopener noreferrer"}
									>
										{selected &&
											(selected.links.facebook_username
												? `https://facebook.com/${selected.links.facebook_username}`
												: "-")}
									</Styled.DetailsLink>
								</Styled.DetailsInnerCol>
							</Row>
						</Styled.DetailsCol>
						<Styled.DetailsCol xs={12} md={6}>
							<Row className={"d-flex flex-row align-items-center justify-content-between"}>
								<Styled.DetailsInnerCol lg={4}>
									<Styled.DetailsDesc>Reddit</Styled.DetailsDesc>
								</Styled.DetailsInnerCol>
								<Styled.DetailsInnerCol
									lg={8}
									className={"d-flex align-items-center justify-content-end justify-content-lg-start"}
								>
									<Styled.DetailsLink
										withUnderline={selected && selected.links.subreddit_url}
										href={selected && (selected.links.subreddit_url || "#")}
										target={"_blank"}
										rel={"noopener noreferrer"}
									>
										{selected && (selected.links.subreddit_url || "-")}
									</Styled.DetailsLink>
								</Styled.DetailsInnerCol>
							</Row>
						</Styled.DetailsCol>
						<Styled.DetailsCol xs={12} md={6}>
							<Row className={"d-flex flex-row align-items-center justify-content-between"}>
								<Styled.DetailsInnerCol lg={4}>
									<Styled.DetailsDesc>Telegram</Styled.DetailsDesc>
								</Styled.DetailsInnerCol>
								<Styled.DetailsInnerCol
									lg={8}
									className={"d-flex align-items-center justify-content-end justify-content-lg-start"}
								>
									<Styled.DetailsLink
										withUnderline={selected && selected.links.telegram_channel_identifier}
										href={
											selected &&
											(selected.links.telegram_channel_identifier
												? `https://t.me/${selected.links.telegram_channel_identifier}`
												: "#")
										}
										target={"_blank"}
										rel={"noopener noreferrer"}
									>
										{selected &&
											(selected.links.telegram_channel_identifier
												? `https://t.me/${selected.links.telegram_channel_identifier}`
												: "-")}
									</Styled.DetailsLink>
								</Styled.DetailsInnerCol>
							</Row>
						</Styled.DetailsCol>
						<Styled.DetailsCol xs={12} md={6}>
							<Row className={"d-flex flex-row align-items-center justify-content-between"}>
								<Styled.DetailsInnerCol lg={4}>
									<Styled.DetailsDesc>Bitcoin Talk</Styled.DetailsDesc>
								</Styled.DetailsInnerCol>
								<Styled.DetailsInnerCol
									lg={8}
									className={"d-flex align-items-center justify-content-end justify-content-lg-start"}
								>
									<Styled.DetailsLink
										withUnderline={selected && selected.links.bitcointalk_thread_identifier}
										href={
											selected &&
											(selected.links.bitcointalk_thread_identifier
												? `https://bitcointalk.org/index.php?topic=${selected.links.bitcointalk_thread_identifier}`
												: "#")
										}
										target={"_blank"}
										rel={"noopener noreferrer"}
									>
										{selected &&
											(selected.links.bitcointalk_thread_identifier
												? `https://bitcointalk.org/index.php?topic=${selected.links.bitcointalk_thread_identifier}`
												: "-")}
									</Styled.DetailsLink>
								</Styled.DetailsInnerCol>
							</Row>
						</Styled.DetailsCol>
					</Row>
				</Styled.StyledCard>
			</Styled.ResponsiveCol>
		</>
	);
};

export default CoinDetails;
