import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Tab, Nav } from "react-bootstrap";
import Skeleton from "react-loading-skeleton";

import Page from "../../components/Page";
import { ResponsiveCard } from "../../components/Card";
import SearchIcon from "../../assets/images/search.svg";
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { WalletPageTable } from "./WalletPageTable";
import CurrencyLogo from "../../components/CurrencyLogo";
import CurrencyText from "../../components/CurrencyText";
import { Link } from "react-router-dom";
import { useActiveWeb3React } from "../../hooks";
import NftTab from "./NftTab";
import Loading from "../../components/Loading";
import Web3 from "web3";
import { Web3Wrapper } from "@0x/web3-wrapper";
import { getContractWrappers } from "../../utils/spot/contractWrapper";
import { ERC20TokenContract } from "@0x/contract-wrappers";
import { UNLIMITED_ALLOWANCE_IN_BASE_UNITS } from "../../constants";
import UnlockModal from "./UnlockModal";
import toast from "react-hot-toast";
import { useMemoTokenBalances } from "../../state/balances/hooks";
import { fetchBalances, fetchTransformedBalances } from "../../state/balances/actions";
import { useTranslation } from "react-i18next";
import SVG from "react-inlinesvg";
import {
	InputGroupText,
	InputGroup,
	InputGroupPrepend,
	InputGroupFormControl as FormControl,
} from "../../components/Form";

const CustomNav = styled(Nav)`
	margin-left: -30px !important;
	margin-right: -30px !important;
	overflow: auto;

	@media (min-width: 768px) {
		margin-left: -10px !important;
		margin-right: -10px !important;
	}
`;

const CustomNavItem = styled(Nav.Item)`
	flex-grow: initial !important;

	padding: 0 10px 10px;

	@media (max-width: 767px) {
		padding: 0 5px 10px;
	}

	&:first-child {
		@media (max-width: 767px) {
			padding-left: 30px;
		}
	}
	&:last-child {
		@media (max-width: 767px) {
			padding-right: 30px;
		}
	}
`;

const HeaderCol = styled(Col)`
	margin-bottom: 20px;

	@media (min-width: 768px) {
		margin-bottom: 25px;
	}
`;

const CustomInputGroup = styled(InputGroup)`
	margin-bottom: 30px;
`;

const CustomNavLink = styled(Nav.Link)`
	border-radius: 18px !important;
	color: ${({ theme }) => theme.primary};
	background-color: ${({ theme }) => theme.primaryLight};
	white-space: nowrap;
	padding: 14px 24px;
	min-height: 56px;
	font-weight: 500;
	display: flex;
	align-items: center;
	justify-content: center;

	@media (max-width: 767px) {
		padding: 6px 15px;
		font-size: 1rem;
		min-height: 32px;
		border-radius: 12px !important;
	}

	&:hover {
		color: ${({ theme }) => theme.primary};
	}

	&.active {
		color: ${({ theme }) => theme.text1};
		background-color: ${({ theme }) => theme.primary};
	}
`;

export const LogoContainer = styled.div`
	max-width: 32px;
	max-height: 32px;
	height: 32px;
	width: 32px;
	min-width: 32px;
	margin-right: 1.5rem;

	@media (max-width: 991px) {
		max-width: 24px;
		max-height: 24px;
		height: 24px;
		width: 24px;
		min-width: 24px;
		margin-right: 0;
		margin-left: 1rem;
	}
`;

export const Title = styled.span`
	font-weight: bold;
	font-size: 1rem;
	color: ${({ theme }) => theme.text1};

	@media (max-width: 991px) {
		font-size: 0.875rem;
	}
`;

export const CustomText = styled.span`
	color: ${({ theme }) => theme.text1};
	font-weight: 400;
	font-size: 0.875rem;

	@media (max-width: 991px) {
		font-size: 0.75rem;
	}
`;

export const PoolsButton = styled.button`
	border-radius: 12px;
	background-color: ${({ theme }) => theme.bg2};
	padding: 6px 20px;
	max-height: 40px;
	min-height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	white-space: nowrap;
	font-size: 1rem;
	font-family: inherit;
	font-weight: 500;
	border: none;
	outline: none;
	text-decoration: none;

	&:hover,
	&:focus,
	&:active {
		text-decoration: none;
		outline: none;
		box-shadow: none;
	}
`;

export const TradeButton = styled(PoolsButton)`
	color: ${({ theme, variant }) => (variant ? theme[variant] : theme.primary)};

	@media (max-width: 991px) {
		width: 100%;
	}

	&:not(:disabled):hover {
		color: ${({ theme }) => theme.bg2};
		background-color: ${({ theme, variant }) => (variant ? theme[variant] : theme.primary)};
	}

	&:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
`;

export const StyledLink = styled(Link)`
	text-decoration: none;
	display: inline-flex;
	margin-right: 30px;

	@media (max-width: 991px) {
		margin-right: 0;
		&:not(:last-child) {
			margin-bottom: 14px;
		}
	}

	&:hover,
	&:focus,
	&:active {
		text-decoration: none;
		outline: none;
		box-shadow: none;
	}
`;

let web3;
let web3Wrapper;

const Wallet = (props) => {
	const { account } = useActiveWeb3React();
	const [query, setQuery] = useState("");
	const [page, setPage] = useState(1);
	const [unlocking, setUnlocking] = useState(false);
	const [showUnlockModal, setShowUnlockModal] = useState(false);
	const [done, setDone] = useState(false);
	const overview = useSelector((state) => state.balances.overview);
	const loading = useSelector((state) => state.balances.loading);
	const { selected, currenciesRate } = useSelector((state) => state.currency);
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

	useEffect(() => {
		web3 = new Web3(Web3.givenProvider || new Web3.providers.HttpProvider(process.env.REACT_APP_NETWORK_URL));
		if (web3.currentProvider) {
			web3Wrapper = new Web3Wrapper(web3.currentProvider);
		}
	}, []);

	const unlockHandler = async (token) => {
		setShowUnlockModal(true);
		try {
			if (token.address) {
				const contractWrappers = await getContractWrappers(web3.currentProvider || window.ethereum);
				const approveAddress = token.address ? token.address : contractWrappers.contractAddresses.erc20Proxy;

				const erc20Token = new ERC20TokenContract(token.address, contractWrappers.getProvider());
				const amount = UNLIMITED_ALLOWANCE_IN_BASE_UNITS;

				const tx = await erc20Token.approve(approveAddress, amount).sendTransactionAsync({
					from: account,
				});
				setUnlocking(true);
				await web3Wrapper.awaitTransactionSuccessAsync(tx);

				if (tx) {
					setUnlocking(false);
					setDone(true);
				}
			} else if (token.symbol === "ETH") {
				throw new Error("Unnecessary Approve for ethereum");
			} else {
				throw new Error("Token is invalid");
			}
		} catch (e) {
			toast.error("Unnecessary Approve for ethereum or token is invalid");
			setUnlocking(false);
			setShowUnlockModal(false);
			setDone(false);
		}
	};

	let tokensData = overview.wallet.balances || [];

	let filteredTokensData = useMemo(() => {
		if (query === "") {
			return tokensData;
		} else {
			const lowerQuery = query.toLowerCase();
			return tokensData.filter((token) => JSON.stringify(token.metadata).toLowerCase().includes(lowerQuery));
		}
	}, [tokensData, query]);

	const TokensColumns = [
		{
			dataField: "token",
			text: t("token"),
			formatter: (cellContent, row) => {
				const isLoading = row.loading || false;
				return (
					<div className="d-flex align-items-center flex-row-reverse flex-lg-row">
						<LogoContainer>
							{isLoading ? (
								<Skeleton width={"100%"} height={"100%"} circle />
							) : (
								<CurrencyLogo currency={row.metadata} />
							)}
						</LogoContainer>
						<Title>{isLoading ? <Skeleton width={48} height={24} /> : row.metadata.symbol}</Title>
					</div>
				);
			},
		},
		{
			dataField: "balance",
			text: t("balanceTitle"),
			formatter: (cellContent, row) => {
				const isLoading = row.loading || false;
				return (
					<div>
						{isLoading ? (
							<Skeleton width={80} height={24} />
						) : (
							<CustomText size={props.size || "md"}>
								{row.balance ? row.balance.toSignificant(6) : 0}
							</CustomText>
						)}
					</div>
				);
			},
		},
		{
			dataField: "value",
			text: t("totalValue"),
			formatter: (cellContent, row) => {
				const isLoading = row.loading || false;
				return (
					<div>
						{isLoading ? (
							<div className={"d-flex align-items-center"}>
								<Skeleton width={24} height={24} className={"mr-2"} />
								<Skeleton width={80} height={24} />
							</div>
						) : (
							<CustomText size={props.size || "md"}>
								<CurrencyText>{row.balanceUSD}</CurrencyText>
							</CustomText>
						)}
					</div>
				);
			},
		},
		{
			dataField: "action",
			text: t("table.actions"),
			formatter: (cellContent, row, rowIndex, { unlockHandler }) => {
				const isLoading = row.loading || false;
				const value = row.balanceUSD * (currenciesRate["BTC"] || 1);
				return (
					<div
						className={
							"d-flex align-items-stretch justify-content-center flex-column flex-lg-row align-items-lg-center justify-content-lg-start w-100"
						}
					>
						{isLoading ? (
							<div className={"d-flex align-items-center"}>
								<Skeleton width={70} height={40} count={3} className={"mr-lg-4 mb-2 mb-lg-0"} />
							</div>
						) : (
							<>
								<StyledLink
									to={`/swap/uni?outputCurrency=${
										row.metadata.symbol === "ETH" ? "ETH" : row.metadata.address
									}`}
								>
									<TradeButton>{t("buttons.buy")}</TradeButton>
								</StyledLink>

								<StyledLink>
									<TradeButton
										variant={"warning"}
										onClick={unlockHandler.bind(this, row.metadata)}
										disabled={row.metadata.symbol === "ETH"}
									>
										{t("buttons.unlock")}
									</TradeButton>
								</StyledLink>

								<StyledLink
									to={`/swap/uni?inputCurrency=${
										row.metadata.symbol === "ETH" ? "ETH" : row.metadata.address
									}`}
								>
									<TradeButton variant={"secondary"}>{t("buttons.sell")}</TradeButton>
								</StyledLink>
								{value <= 0.001 ? (
									<StyledLink
										to={`/swap/uni?inputCurrency=${
											row.metadata.symbol === "ETH" ? "ETH" : row.metadata.address
										}&outputCurrency=0x7240aC91f01233BaAf8b064248E80feaA5912BA3`}
										disabled
									>
										<TradeButton variant={"tertiary"}>
											{t("buttons.convertTo", { symbol: "OCTO" })}
										</TradeButton>
									</StyledLink>
								) : (
									<TradeButton variant={"tertiary"} disabled={true}>
										{t("buttons.convertTo", { symbol: "OCTO" })}
									</TradeButton>
								)}
							</>
						)}
					</div>
				);
			},
			isAction: true,
			formatExtraData: {
				unlockHandler,
			},
		},
	];

	return (
		<Page title={t("wallet.title")} morePadding>
			<UnlockModal
				done={done}
				show={showUnlockModal}
				unlocking={unlocking}
				onDismiss={() => {
					setDone(false);
					setUnlocking(false);
					setShowUnlockModal(false);
				}}
			/>

			<ResponsiveCard style={{ marginTop: -30 }}>
				<Tab.Container defaultActiveKey={"tokens"}>
					<Row>
						<HeaderCol
							xs={12}
							className={
								"d-flex flex-column-reverse flex-lg-row align-items-stretch align-items-lg-center justify-content-between"
							}
						>
							<CustomNav
								fill
								variant="pills"
								className={"d-flex flex-row align-items-center flex-nowrap"}
							>
								<CustomNavItem>
									<CustomNavLink eventKey="tokens">{t("importList.tokens")}</CustomNavLink>
								</CustomNavItem>
								<CustomNavItem>
									<CustomNavLink eventKey="nft">{t("NFT")}</CustomNavLink>
								</CustomNavItem>
							</CustomNav>

							<CustomInputGroup className={"w-auto mb-lg-0"} bg={"darker"}>
								<InputGroupPrepend>
									<InputGroupText>
										<SVG src={SearchIcon} />
									</InputGroupText>
								</InputGroupPrepend>
								<FormControl
									id="walletSearch"
									placeholder={t("search")}
									onChange={(e) => setQuery(e.target.value)}
								/>
							</CustomInputGroup>
						</HeaderCol>
						<Col xs={12}>
							<Tab.Content className={"bg-transparent"}>
								<Tab.Pane eventKey="tokens">
									{loading ? (
										<div className="py-5 w-100 d-flex align-items-center justify-content-center">
											<Loading width={40} height={40} active id={`tokens-wallet`} />
										</div>
									) : (
										<WalletPageTable columns={TokensColumns} entities={filteredTokensData} />
									)}
								</Tab.Pane>
								<Tab.Pane eventKey="nft">
									<NftTab query={query} />
								</Tab.Pane>
							</Tab.Content>
						</Col>
					</Row>
				</Tab.Container>
			</ResponsiveCard>
		</Page>
	);
};

export default Wallet;
