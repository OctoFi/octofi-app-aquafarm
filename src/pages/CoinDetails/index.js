import React, {useContext, useEffect, useMemo, useState} from "react";
import { Row, Col } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import Card, { ResponsiveCard } from "../../components/Card";
import HistoricalChart from "../../components/HistoricalChart";
import styled, { ThemeContext } from "styled-components";
import { useIsDarkMode } from "../../state/user/hooks";
import { fetchSelectedCoin, fetchHistoricalData } from "../../state/market/actions";
import ArrowUp from "../../components/Icons/Coin/ArrowUp";
import ArrowDown from "../../components/Icons/Coin/ArrowDown";
import { useActiveWeb3React } from "../../hooks";
import { useTokenContract } from "../../hooks/useContract";
import Page from "../../components/Page";
import Loading from "../../components/Loading";
import GradientButton from "../../components/UI/Button";
import CurrencyText from "../../components/CurrencyText";
import dompurify from "dompurify";

const ChartResponsiveCard = styled(ResponsiveCard)`
	@media (max-width: 991px) {
		margin-bottom: -1px !important;
		border: none;

		& .card-body {
			padding-top: 15px;
			padding-bottom: 15px;
		}
	}
`;

const ResponsiveCol = styled.div`
	@media (max-width: 991px) {
		margin: -1px -30px 0;
		padding: 15px 30px;
		background-color: ${({ theme }) => theme.modalBG};
	}
`;

const BalanceCard = styled(Card)`
	& .card-body {
		padding: 20px 30px;
	}

	@media (max-width: 991px) {
		margin-bottom: 40px;
		& .card-body {
			padding: 20px 15px;
		}
	}
`;

const StyledCard = styled(Card)`
	@media (max-width: 991px) {
		border: 1px solid ${({ theme }) => theme.text4};
		margin-bottom: 0 !important;

		& .card-header,
		& .card-body {
			padding: 20px 15px;
		}

		& .card-header {
			min-height: 57px;
		}

		h4 {
			font-size: 0.875rem;
		}
	}

	@media (min-width: 992px) {
		& .card-header {
			padding: 15px 30px;
			position: relative;
			border: none;

			&::before {
				content: "";
				position: absolute;
				left: 30px;
				right: 30px;
				bottom: 0;
				border-bottom: 1px solid ${({ theme }) => theme.text3};
			}
		}

		h4 {
			font-size: 1rem;
		}
	}
`;

const StyledChangesCard = styled(StyledCard)`
	@media (max-width: 991px) {
		.card-body {
			padding-top: 34px;
			padding-bottom: 34px;
		}
	}
`;

const About = styled.div`
	font-weight: 400;
	font-size: 1rem;
	line-height: 19px;

	@media (max-width: 991px) {
		font-size: 0.875rem;
		line-height: 17px;
		text-align: justify;
	}
`;

const DetailsCol = styled(Col)`
	&:not(:last-child) {
		margin-bottom: 20px;
	}
`;

const DetailsInnerCol = styled(Col)`
	width: initial !important;
	flex: 1;
	max-width: 100%;
`;

const DetailsDesc = styled.span`
	font-weight: 400;
	font-size: 1rem;

	@media (max-width: 991px) {
		font-size: 0.75rem;
	}
`;

const DetailsValue = styled.span`
	font-weight: 700;
	font-size: 1rem;
	text-align: right;
	width: 100%;

	@media (max-width: 991px) {
		font-size: 0.875rem;
	}
`;

const DetailsLink = styled(DetailsValue)`
	color: ${({ theme }) => theme.primary};
	text-decoration: ${({ withUnderline }) => (withUnderline ? "underline" : "none")};

	@media (max-width: 991px) {
		font-weight: 400;
		max-width: 180px;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}
`;

const StatsDesc = styled.span`
	color: ${({ theme }) => theme.text3};
	font-size: 0.875rem;
	display: block;
	margin-bottom: 1.25rem;

	@media (max-width: 991px) {
		font-size: 0.75rem;
		color: ${({ theme }) => theme.text1};
		margin-bottom: ${({ last }) => (!last ? "0.875rem" : "0")};
	}
`;

const StatsValue = styled.span`
	color: ${({ theme }) => theme.text1};
	font-size: 1rem;
	font-weight: 700;

	@media (max-width: 991px) {
		font-size: 0.875rem;

		margin-bottom: ${({ last }) => (!last ? "0.875rem" : "0")};
	}
`;

const ChangesTitle = styled.span`
	font-weight: 700;
	font-size: 1.25rem;
	margin-left: 1rem;
`;

const ChangesSubtitle = styled.span`
	font-weight: 400;
	font-size: 0.875rem;
	display: block;
	margin-top: 18px;
`;

const BalanceText = styled.span`
	font-weight: 400;
	font-size: 0.875rem;
	margin-bottom: 20px;

	@media (min-width: 991px) {
		margin-bottom: 0;
		font-size: 1rem;
	}
`;

const BalanceValue = styled.span`
	font-weight: 700;
	font-size: 1rem;
`;

const BuyHelper = styled.span`
	font-weight: 400;
	font-size: 1rem;

	@media (max-width: 991px) {
		margin-bottom: 30px;
	}
`;

const BuyLink = styled(Link)`
	flex: 1;
	display: flex;
	flex-direction: column;
`;

const CoinDetails = (props) => {
	const { account } = useActiveWeb3React();
	const theme = useContext(ThemeContext);
	const darkMode = useIsDarkMode();
	const dispatch = useDispatch();
	const marketData = useSelector((state) => state.market);
	const [walletBalance, setWalletBalance] = useState(false);
	const selected = marketData.selected.data || false;
	const tokenContract = useTokenContract(selected.contract_address);

	useEffect(() => {
		if (tokenContract) {
			tokenContract.decimals().then((decimals) => {
				tokenContract.balanceOf(account).then((response) => {
					const balance = response.toString();
					setWalletBalance(balance / 10 ** decimals);
				});
			});
		}
	}, [tokenContract, account]);

	useEffect(() => {
		dispatch(fetchSelectedCoin(props.match.params.id));

		dispatch(fetchHistoricalData(props.match.params.id));
	}, [dispatch, props.match.params.id]);

	const coinAbout = useMemo(() => {
		if(selected) {
			return dompurify.sanitize(selected?.description?.en);
		}

		return ''
	}, [selected?.description?.en])

	return marketData.selected.loading ? (
		<Page title={"Coin Details"} morePadding>
			<Row>
				<Col xs={12}>
					<Card marginTop={-30}>
						<div className={"d-flex align-items-center justify-content-center"} style={{ height: 400 }}>
							<Loading height={40} width={40} active id={"coin-details-loading"} />
						</div>
					</Card>
				</Col>
			</Row>
		</Page>
	) : (
		<Page title={"Coin Details"} morePadding>
			<Row>
				{selected && typeof walletBalance !== "boolean" && (
					<Col xs={12} className={"gutter-b"}>
						<BalanceCard marginTop={-30}>
							<div className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center justify-content-between">
								<BalanceText>Your "{selected.name}" Balance</BalanceText>
								<BalanceValue>
									{selected.symbol.toUpperCase()} {walletBalance.toFixed(6)} (
									<CurrencyText>
										{walletBalance * selected.market_data.current_price.usd}
									</CurrencyText>
									)
								</BalanceValue>
							</div>
						</BalanceCard>
					</Col>
				)}
				<Col xs={12} className={"gutter-b"}>
					<ChartResponsiveCard marginTop={walletBalance !== "boolean" ? 0 : -30}>
						{selected && selected.contract_address && (
							<div className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center justify-content-between mb-4">
								<BuyHelper className={"font-weight-normal font-size-base"}>
									Do you wanna Exchange {selected.name}?
								</BuyHelper>
								<div className="d-flex align-items-center justify-content">
									<BuyLink
										to={`/swap/uni?outputCurrency=${selected.contract_address}`}
										className="mr-4"
									>
										<GradientButton style={{ minWidth: 125 }}>Buy</GradientButton>
									</BuyLink>
									<BuyLink to={`/swap/uni?inputCurrency=${selected.contract_address}`}>
										<GradientButton style={{ minWidth: 125 }}>Sell</GradientButton>
									</BuyLink>
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
					</ChartResponsiveCard>
				</Col>
			</Row>
			<Row className={"custom-row"}>
				<Col xs={12} md={6} className={"gutter-b"}>
					<ChartResponsiveCard>
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
					</ChartResponsiveCard>
				</Col>
				<Col xs={12} md={6} className={"gutter-b"}>
					<ChartResponsiveCard>
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
					</ChartResponsiveCard>
				</Col>
			</Row>
			<Row className={"custom-row d-flex align-items-stretch"}>
				<Col lg={3} md={6} xs={12} className={"gutter-b"}>
					<ResponsiveCol>
						<StyledChangesCard
							className={
								"d-flex flex-column flex-lg-row align-items-center justify-content-center justify-content-lg-start"
							}
						>
							<div className="d-flex align-items-center">
								{selected && selected.market_data.price_change_percentage_24h >= 0 ? (
									<ArrowUp fill={"#1BC5BD"} size={64} />
								) : (
									<ArrowDown fill={"#F64E60"} size={64} />
								)}
								<ChangesTitle
									className={
										selected && selected.market_data.price_change_percentage_24h >= 0
											? "text-success"
											: "text-danger"
									}
								>
									{selected && Number(selected.market_data.price_change_percentage_24h).toFixed(4)}%
								</ChangesTitle>
							</div>
							<ChangesSubtitle>Daily Changes Percentage</ChangesSubtitle>
						</StyledChangesCard>
					</ResponsiveCol>
				</Col>
				<Col lg={3} md={6} xs={12} className={"gutter-b"}>
					<ResponsiveCol>
						<StyledChangesCard
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
								<ChangesTitle
									className={
										selected && selected.market_data.price_change_percentage_7d >= 0
											? "text-success"
											: "text-danger"
									}
								>
									{selected && Number(selected.market_data.price_change_percentage_7d).toFixed(4)}%
								</ChangesTitle>
							</div>
							<ChangesSubtitle>Weekly Changes Percentage</ChangesSubtitle>
						</StyledChangesCard>
					</ResponsiveCol>
				</Col>
				<Col lg={3} md={6} xs={12} className={"gutter-b"}>
					<ResponsiveCol>
						<StyledChangesCard
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
								<ChangesTitle
									className={
										selected && selected.market_data.price_change_percentage_30d >= 0
											? "text-success"
											: "text-danger"
									}
								>
									{selected && Number(selected.market_data.price_change_percentage_30d).toFixed(4)}%
								</ChangesTitle>
							</div>
							<ChangesSubtitle>Monthly Changes Percentage</ChangesSubtitle>
						</StyledChangesCard>
					</ResponsiveCol>
				</Col>
				<Col lg={3} md={6} xs={12} className={"gutter-b"}>
					<ResponsiveCol>
						<StyledChangesCard
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
								<ChangesTitle
									className={
										selected && selected.market_data.price_change_percentage_1y >= 0
											? "text-success"
											: "text-danger"
									}
								>
									{selected && Number(selected.market_data.price_change_percentage_1y).toFixed(4)}%
								</ChangesTitle>
							</div>
							<ChangesSubtitle>Yearly Changes Percentage</ChangesSubtitle>
						</StyledChangesCard>
					</ResponsiveCol>
				</Col>
			</Row>
			<Row>
				<Col xs={12} className={"gutter-b"}>
					<ResponsiveCol>
						<StyledCard header={true} title={"Coin Stats"}>
							<div className="d-flex align-items-center justify-content-between row pb-0 pb-lg-2">
								<Col
									xs={12}
									md={4}
									className={
										"d-flex flex-row flex-lg-column align-items-center align-items-lg-start justify-content-between justify-content-lg-center "
									}
								>
									<StatsDesc>Market Cap</StatsDesc>
									<StatsValue>${selected && selected.market_data.market_cap.usd}</StatsValue>
								</Col>
								<Col
									xs={12}
									md={4}
									className={
										"d-flex flex-row flex-lg-column align-items-center align-items-lg-start justify-content-between justify-content-lg-center "
									}
								>
									<StatsDesc>All time High</StatsDesc>
									<StatsValue className="text-success">
										${selected && selected.market_data.ath.usd}
									</StatsValue>
								</Col>
								<Col
									xs={12}
									md={4}
									className={
										"d-flex flex-row flex-lg-column align-items-center align-items-lg-start justify-content-between justify-content-lg-center "
									}
								>
									<StatsDesc last>All Time Low</StatsDesc>
									<StatsValue last className="text-danger">
										${selected && selected.market_data.atl.usd}
									</StatsValue>
								</Col>
							</div>
						</StyledCard>
					</ResponsiveCol>
				</Col>
			</Row>
			<Row>
				<Col xs={12} className={"gutter-b"}>
					<ResponsiveCol>
						<StyledCard header={true} title={"About"}>
							<About dangerouslySetInnerHTML={{ __html: coinAbout }} />
						</StyledCard>
					</ResponsiveCol>
				</Col>
				<Col xs={12} className={"gutter-b"}>
					<ResponsiveCol>
						<StyledCard header={true} title={"Coin Information"}>
							<Row>
								<DetailsCol xs={12} md={6}>
									<Row className={"d-flex flex-row align-items-center justify-content-between"}>
										<DetailsInnerCol lg={4}>
											<DetailsDesc>Currency Name</DetailsDesc>
										</DetailsInnerCol>
										<DetailsInnerCol
											lg={8}
											className={
												"d-flex align-items-center justify-content-end justify-content-lg-start"
											}
										>
											<DetailsValue>{selected && selected.name}</DetailsValue>
										</DetailsInnerCol>
									</Row>
								</DetailsCol>
								<DetailsCol xs={12} md={6}>
									<Row className={"d-flex flex-row align-items-center justify-content-between"}>
										<DetailsInnerCol lg={4}>
											<DetailsDesc>Symbol</DetailsDesc>
										</DetailsInnerCol>
										<DetailsInnerCol
											lg={8}
											className={
												"d-flex align-items-center justify-content-end justify-content-lg-start"
											}
										>
											<DetailsValue>{selected && selected.symbol.toUpperCase()}</DetailsValue>
										</DetailsInnerCol>
									</Row>
								</DetailsCol>
								<DetailsCol xs={12} md={6}>
									<Row className={"d-flex flex-row align-items-center justify-content-between"}>
										<DetailsInnerCol lg={4}>
											<DetailsDesc>Website</DetailsDesc>
										</DetailsInnerCol>
										<DetailsInnerCol
											lg={8}
											className={
												"d-flex align-items-center justify-content-end justify-content-lg-start"
											}
										>
											<DetailsLink
												withUnderline={selected && selected.links.homepage[0]}
												href={selected && selected.links.homepage[0]}
												target={"_blank"}
												rel={"noopener noreferrer"}
											>
												{selected && selected.links.homepage[0]}
											</DetailsLink>
										</DetailsInnerCol>
									</Row>
								</DetailsCol>
								<DetailsCol xs={12} md={6}>
									<Row className={"d-flex flex-row align-items-center justify-content-between"}>
										<DetailsInnerCol lg={4}>
											<DetailsDesc>Whitepaper</DetailsDesc>
										</DetailsInnerCol>
										<DetailsInnerCol
											lg={8}
											className={
												"d-flex align-items-center justify-content-end justify-content-lg-start"
											}
										>
											<DetailsLink
												withUnderline={selected && selected.links.ico_data}
												href={
													selected && selected.ico_data
														? selected.ico_data.links.whitepaper
														: "#"
												}
												target={"_blank"}
												rel={"noopener noreferrer"}
											>
												{selected && selected.ico_data
													? selected.ico_data.links.whitepaper
													: "-"}
											</DetailsLink>
										</DetailsInnerCol>
									</Row>
								</DetailsCol>
								<DetailsCol xs={12} md={6}>
									<Row className={"d-flex flex-row align-items-center justify-content-between"}>
										<DetailsInnerCol lg={4}>
											<DetailsDesc>Block Explorer</DetailsDesc>
										</DetailsInnerCol>
										<DetailsInnerCol
											lg={8}
											className={
												"d-flex align-items-center justify-content-end justify-content-lg-start"
											}
										>
											<DetailsLink
												withUnderline={selected && selected.links.blockchain_site[0]}
												href={selected && (selected.links.blockchain_site[0] || "#")}
												target={"_blank"}
												rel={"noopener noreferrer"}
											>
												{selected && (selected.links.blockchain_site[0] || "-")}
											</DetailsLink>
										</DetailsInnerCol>
									</Row>
								</DetailsCol>
								<DetailsCol xs={12} md={6}>
									<Row className={"d-flex flex-row align-items-center justify-content-between"}>
										<DetailsInnerCol lg={4}>
											<DetailsDesc>Github</DetailsDesc>
										</DetailsInnerCol>
										<DetailsInnerCol
											lg={8}
											className={
												"d-flex align-items-center justify-content-end justify-content-lg-start"
											}
										>
											<DetailsLink
												withUnderline={selected && selected.links.repos_url.github[0]}
												href={selected && (selected.links.repos_url.github[0] || "#")}
												target={"_blank"}
												rel={"noopener noreferrer"}
											>
												{selected && (selected.links.repos_url.github[0] || "-")}
											</DetailsLink>
										</DetailsInnerCol>
									</Row>
								</DetailsCol>
								<DetailsCol xs={12} md={6}>
									<Row className={"d-flex flex-row align-items-center justify-content-between"}>
										<DetailsInnerCol lg={4}>
											<DetailsDesc>Twitter</DetailsDesc>
										</DetailsInnerCol>
										<DetailsInnerCol
											lg={8}
											className={
												"d-flex align-items-center justify-content-end justify-content-lg-start"
											}
										>
											<DetailsLink
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
											</DetailsLink>
										</DetailsInnerCol>
									</Row>
								</DetailsCol>
								<DetailsCol xs={12} md={6}>
									<Row className={"d-flex flex-row align-items-center justify-content-between"}>
										<DetailsInnerCol lg={4}>
											<DetailsDesc>Facebook</DetailsDesc>
										</DetailsInnerCol>
										<DetailsInnerCol
											lg={8}
											className={
												"d-flex align-items-center justify-content-end justify-content-lg-start"
											}
										>
											<DetailsLink
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
											</DetailsLink>
										</DetailsInnerCol>
									</Row>
								</DetailsCol>
								<DetailsCol xs={12} md={6}>
									<Row className={"d-flex flex-row align-items-center justify-content-between"}>
										<DetailsInnerCol lg={4}>
											<DetailsDesc>Reddit</DetailsDesc>
										</DetailsInnerCol>
										<DetailsInnerCol
											lg={8}
											className={
												"d-flex align-items-center justify-content-end justify-content-lg-start"
											}
										>
											<DetailsLink
												withUnderline={selected && selected.links.subreddit_url}
												href={selected && (selected.links.subreddit_url || "#")}
												target={"_blank"}
												rel={"noopener noreferrer"}
											>
												{selected && (selected.links.subreddit_url || "-")}
											</DetailsLink>
										</DetailsInnerCol>
									</Row>
								</DetailsCol>
								<DetailsCol xs={12} md={6}>
									<Row className={"d-flex flex-row align-items-center justify-content-between"}>
										<DetailsInnerCol lg={4}>
											<DetailsDesc>Telegram</DetailsDesc>
										</DetailsInnerCol>
										<DetailsInnerCol
											lg={8}
											className={
												"d-flex align-items-center justify-content-end justify-content-lg-start"
											}
										>
											<DetailsLink
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
											</DetailsLink>
										</DetailsInnerCol>
									</Row>
								</DetailsCol>
								<DetailsCol xs={12} md={6}>
									<Row className={"d-flex flex-row align-items-center justify-content-between"}>
										<DetailsInnerCol lg={4}>
											<DetailsDesc>Bitcoin Talk</DetailsDesc>
										</DetailsInnerCol>
										<DetailsInnerCol
											lg={8}
											className={
												"d-flex align-items-center justify-content-end justify-content-lg-start"
											}
										>
											<DetailsLink
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
											</DetailsLink>
										</DetailsInnerCol>
									</Row>
								</DetailsCol>
							</Row>
						</StyledCard>
					</ResponsiveCol>
				</Col>
			</Row>
		</Page>
	);
};

export default CoinDetails;
