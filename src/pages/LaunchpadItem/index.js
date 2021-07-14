import { Row, Col, Tab, Nav, Button, ListGroup } from "react-bootstrap";
import styled from "styled-components";
import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Lock, Users, Info } from "react-feather";
import SVG from "react-inlinesvg";

import Page from "../../components/Page";
import Card from "../../components/Card";
import { useTranslation } from "react-i18next";
import SafetyAlert from "./SafetyAlert";
import useTheme from "../../hooks/useTheme";
import { CurrencyAmount, ETHER, Token, TokenAmount } from "@uniswap/sdk";
import CircleBar from "../../components/CircleBar";
import CurrencyInputPanel from "../../components/CurrencyInputPanel";
import { Link, useParams } from "react-router-dom";
import { useAccountBuy, usePresale } from "../../hooks/usePresale";
import { calculateGasMargin, getContract, getEtherscanLink, shortenAddress } from "../../utils";
import { ERC20_ABI } from "../../constants/abis/erc20";
import { useActiveWeb3React } from "../../hooks";
import BigNumber from "bignumber.js";
import {
	BalanceToken,
	LAUNCHPAD_WETH_ADDRESS,
	LAUNCHPAD_WETH_TOKEN,
	UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
	ZERO,
} from "../../constants";
import copy from "copy-to-clipboard";
import toast from "react-hot-toast";
import { useWalletModalToggle } from "../../state/application/hooks";
import PresaleABI from "../../constants/abis/Presale/Presale.json";
import GradientButton from "../../components/UI/Button";
import { useTokenBalance } from "../../state/wallet/hooks";
import { useApproveCallback } from "../../hooks/useApproveCallback";
import Loading from "../../components/Loading";
import { serializeError } from "eth-rpc-errors";
import Img from "../../components/UI/Img";
import Presales from "../../constants/presales.json";
// import { useContract } from "../../hooks/useContract";
import CurrencyLogo from "../../components/CurrencyLogo";

const Item = ListGroup.Item;

const ListItem = styled(Item)`
	border: 1px solid ${({ theme }) => theme.text4} !important;
	background-color: transparent;
	color: ${({ theme }) => theme.text1};
	display: flex;
	align-items: center;
	border-radius: 18px !important;
	margin-bottom: 6px;
`;

const CustomNav = styled(Nav)`
	margin-bottom: 12px;
	min-width: 100%;
	overflow: auto;
	margin-left: -30px !important;
	margin-right: -30px !important;

	@media (min-width: 768px) {
		margin-left: 0 !important;
		margin-right: 0 !important;
	}
`;

const CustomNavItem = styled(Nav.Item)`
	padding: 0 5px 10px;

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

const CustomNavTitle = styled.span`
	font-size: 0.875rem;
	color: currentColor;
	font-weight: 400;
	margin-top: 1rem;
	display: block;

	@media (max-width: 767px) {
		font-size: 0.75rem;
	}
`;

const CustomNavLink = styled(Nav.Link)`
	color: ${({ theme }) => theme.text1};
	background-color: transparent;
	padding: 12px 12px;
	min-height: 56px;
	font-size: 0.875rem;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	transition: 0.3s ease all;

	@media (max-width: 767px) {
		padding: 6px 8px;
		font-size: 0.75rem;
	}

	&:hover {
		color: ${({ theme }) => theme.success};

		& ${SVG} {
			opacity: 1;
		}
	}

	& ${SVG} {
		opacity: 0.5;
	}

	&.active {
		color: ${({ theme }) => theme.success} !important;
		background-color: transparent !important;

		& ${SVG} {
			opacity: 1;
		}
	}
`;

const Description = styled.p`
	margin-top: 0;
	margin-bottom: 57px;
	font-weight: 400;
	font-size: 0.875rem;
	line-height: 1.6;
	color: ${({ theme }) => theme.text1};
`;

const IconButton = styled(Link)`
	width: 40px;
	height: 40px;
	border-radius: 12px;
	border: none;
	background-color: transparent;
	transition: 0.3s ease all;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;

	&:hover {
		background-color: ${({ theme }) => theme.primaryLight};
	}
`;

// const InnerCard = styled(Card)`
//     transition: 0.3s ease border-color;
//     background-color: ${({ theme }) => theme.bg1};

//     & .card-body {
//       padding: 12px 16px;
//       display: flex;
//       align-items: center;
//     }

//   &:hover {
//     border-color: ${({ theme }) => theme.primary};
//   }
// `

// const InnerBody = styled.span`
//   font-size: 0.75rem;
//   font-weight: 400;
//   color: ${({ theme }) => theme.text3};
//   line-height: 1.6;
// `

// const CheckContainer = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   margin-right: .875rem;
//   color: ${({ theme }) => theme.success};
// `

// const NoticeCard = styled(Card)`
//   background-image: linear-gradient(-345.39deg, #a890fe -17.91%, #0891B2 68.92%);
//   border: none;

//   & .card-body {
//     padding: 18px 16px;
//   }
// `

// const InvertText = styled.span`
//   font-size: ${({ size }) => size === 'lg' ? '1.125rem' : "0.875rem"};
//   font-weight: 400;
//   color: ${({ theme }) => theme.bg1};
//   line-height: 1.6;
// `

const TokenName = styled.span`
	font-size: 1.25rem;
	font-weight: 700;
	margin-top: 10px;
	color: ${({ theme }) => theme.text1};
`;

const ExternalLink = styled.a.attrs(() => {
	return {
		target: "_blank",
		rel: "noreferrer noopener",
	};
})`
	cursor: pointer;
	margin-bottom: 6px;
	height: 32px;
	padding: 0 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 12px;
	background-color: ${({ theme }) => theme.bg1};
	text-decoration: none;
	color: ${({ theme }) => theme.text1};
	transition: 0.3s ease all;

	&:hover {
		background-color: ${({ theme }) => theme.text1};
		color: ${({ theme }) => theme.modalBG};
	}

	&:hover,
	&:focus,
	&:active {
		text-decoration: none;
		outline: none;
		box-shadow: none;
	}
`;

const LinkText = styled.span`
	font-size: 0.75rem;
	color: currentColor;
	font-weight: 500;
	margin-right: 6px;
`;

const DetailsContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	width: 40px;
	height: 40px;
	margin-bottom: 10px;
`;

const DetailsWrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`;

const DetailsTitle = styled.span`
	color: ${({ theme }) => theme.primary};
	font-size: 1.25rem;
	font-weight: 500;
	margin-bottom: 6px;
`;

const DetailsTitleSimple = styled(DetailsTitle)`
	color: ${({ theme }) => theme.text1};
`;

const DetailsLabel = styled.span`
	color: ${({ theme }) => theme.text3};
	font-size: 0.75rem;
	font-weight: 400;
`;

const RowCard = styled(Card)`
	transition: 0.3s ease border-color;
	background-color: ${({ theme }) => theme.modalBG};

	& .card-body {
		padding: 12px 16px;
		display: flex;
		flex-direction: column;
		align-items: stretch;
	}

	&:hover {
		border-color: ${({ theme }) => theme.primary};
	}
`;

const RowTitle = styled.h3`
	margin-top: 0.75rem;
	margin-bottom: 1rem;
	font-weight: 700;
	color: ${({ theme }) => theme.text1};
	font-size: 1.25rem;
`;

const RowDesc = styled.p`
	margin: 0 1rem 2rem;
	font-weight: 400;
	font-size: 0.875rem;
	line-height: 1.6;
	color: ${({ theme }) => theme.text3};
`;

const TokenWrapper = styled.div`
	background-color: ${({ theme }) => theme.bg1};
	padding: 0 1.125rem;
	height: 56px;
	border-radius: 18px;
	display: flex;
	align-items: center;
`;

const StyledTokenName = styled.span`
	font-weight: 700;
	margin-right: auto;
	font-size: 1rem;
	color: ${({ theme }) => theme.text1};
`;

const LogoContainer = styled.div`
	width: 48px;
	height: 48px;
	min-width: 48px;
	border-radius: 48px;
	margin-right: 16px;
	position: relative;
	overflow: hidden;
`;

const Logo = styled(Img)`
	width: 100%;
	height: 100%;
	border: 1px solid ${({ theme }) => theme.text1};
	border-radius: 320px;
`;

const CircleBarPosition = styled.div`
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
`

export const lockDurationMap = {
	2678400: "1 Month",
	2592000: "1 Month",
	5356800: "2 Months",
	8035200: "3 Months",
	15552000: "6 Months",
	15897600: "6 Months",
	31536000: "1 Year",
	9999999999: "Max: 266 Years",
};

const LaunchpadItem = (props) => {
	const { t } = useTranslation();
	const { chainId, account, library } = useActiveWeb3React();
	const theme = useTheme();
	const params = useParams();
	const presale = usePresale(params?.address);
	const toggleWalletModal = useWalletModalToggle();
	const whitelistTokenBalance = useTokenBalance(account, BalanceToken);
	const buyState = useAccountBuy(params?.address);

	const [selectedToken, setSelectedToken] = useState(undefined);
	const [baseToken, setBaseToken] = useState(undefined);
	const [totalSupply, setTotalSupply] = useState("0");
	const [investAmount, setInvestAmount] = useState("");

	const approvalAmount = useMemo(() => {
		if (baseToken?.symbol === "WETH" || baseToken?.symbol === "ETH") {
			return new CurrencyAmount(ETHER, UNLIMITED_ALLOWANCE_IN_BASE_UNITS.toString());
		}
		if (baseToken instanceof Token) {
			return new TokenAmount(baseToken, UNLIMITED_ALLOWANCE_IN_BASE_UNITS.toString());
		}
		return undefined;
	}, [baseToken]);

	const [approval, approvalCallback] = useApproveCallback(approvalAmount, params?.address);

	const getTokenInfo = async (address, contract) => {
		try {
			const decimals = await contract.decimals();
			const name = await contract.name();
			const symbol = await contract.symbol();

			return new Token(chainId, address, decimals, symbol, name);
		} catch (e) {
			return Promise.reject(e);
		}
	};

	useEffect(() => {
		if (presale?.token) {
			const tokenContract = getContract(presale?.token, ERC20_ABI, library, account);
			getTokenInfo(presale?.token, tokenContract)
				.then((res) => {
					setSelectedToken(res);
				})
				.catch((e) => {
					console.log(e);
				});

			tokenContract.totalSupply().then((res) => {
				setTotalSupply(res.toString());
			});
		}
		if (presale?.baseToken) {
			if (presale?.baseToken === LAUNCHPAD_WETH_ADDRESS) {
				setBaseToken(LAUNCHPAD_WETH_TOKEN);
			} else {
				const tokenContract = getContract(presale?.baseToken, ERC20_ABI, library, account);
				getTokenInfo(presale?.baseToken, tokenContract)
					.then((res) => {
						setBaseToken(res);
					})
					.catch((e) => {
						console.log(e);
					});
			}
		}
	}, [presale]);

	useEffect(() => {
		if (presale?.hasOwnProperty("error")) {
			props.history.push("/launchpad");
		}
	}, [presale]);

	const maxSpend = useMemo(() => {
		if (presale?.spendLimit) {
			return new BigNumber(presale?.spendLimit?.toString() || 0).dividedBy(10 ** baseToken?.decimals).toString();
		}
		return 0;
	}, [presale, baseToken]);

	const softCap = useMemo(() => {
		if (presale?.softCap) {
			return new BigNumber(presale?.softCap?.toString() || 0).dividedBy(10 ** baseToken?.decimals).toString();
		}
		return 0;
	}, [presale, baseToken]);

	const hardCap = useMemo(() => {
		if (presale?.hardCap) {
			return new BigNumber(presale?.hardCap?.toString() || 0).dividedBy(10 ** baseToken?.decimals).toString();
		}
		return 0;
	}, [presale, baseToken]);

	const lockDuration = useMemo(() => {
		if (presale?.lockPeriod) {
			return presale?.lockPeriod?.toString() || 0;
		}
		return 0;
	}, [presale]);

	const presalePrice = useMemo(() => {
		if (presale?.tokenPrice) {
			return new BigNumber(presale?.tokenPrice?.toString() || 0).dividedBy(10 ** baseToken?.decimals).toString();
		}
		return 0;
	}, [presale, baseToken]);

	const listingPrice = useMemo(() => {
		if (presale?.listingPrice) {
			return new BigNumber(presale?.listingPrice?.toString() || 0)
				.dividedBy(10 ** baseToken?.decimals)
				.toString();
		}
		return 0;
	}, [presale, baseToken]);

	const filledPercent = useMemo(() => {
		if (presale?.hardCap && presale?.status?.totalBaseCollected) {
			const hardCap = new BigNumber(presale?.hardCap?.toString() || 0).dividedBy(10 ** baseToken?.decimals);
			const totalBaseCollected = new BigNumber(presale?.status?.totalBaseCollected?.toString() || 0).dividedBy(
				10 ** baseToken?.decimals
			);

			if (hardCap.isEqualTo(ZERO)) {
				return 0;
			}

			return totalBaseCollected.dividedBy(hardCap).times(100).toFixed(0);
		}
		return 0;
	}, [presale, baseToken]);

	const liquidityPercent = useMemo(() => {
		if (presale?.liquidityPercent) {
			return new BigNumber(presale?.liquidityPercent?.toString() || 0).dividedBy(10).toString();
		}
		return 0;
	}, [presale]);

	const transformedTotalSupply = useMemo(() => {
		return new BigNumber(totalSupply).dividedBy(10 ** (selectedToken?.decimals || 18)).toString();
	}, [totalSupply, selectedToken]);

	const enoughBalance = useMemo(() => {
		if (whitelistTokenBalance) {
			const validBalance = new BigNumber(1).times(10 ** BalanceToken.decimals);
			const balance = new BigNumber(whitelistTokenBalance.toFixed()).times(10 ** BalanceToken.decimals);
			if (balance.isGreaterThanOrEqualTo(validBalance)) {
				return true;
			}

			return false;
		}

		return false;
	}, [whitelistTokenBalance]);

	const depositedToken = useMemo(() => {
		if (buyState?.error) {
			return 0;
		}
		if (buyState?.baseDeposited && listingPrice) {
			const baseDeposited = new BigNumber(buyState?.baseDeposited?.toString() || 0).dividedBy(
				10 ** (baseToken?.decimals || 18)
			);
			const receiveEstimated = baseDeposited.times(presalePrice);

			return {
				baseDeposited,
				receiveEstimated,
			};
		}
	}, [buyState, baseToken, listingPrice]);

	const isOwner = useMemo(() => {
		return presale?.owner === account;
	}, [presale?.owner, account]);

	const copyToClipboard = (text) => {
		copy(text);
		toast.success("Copied!");
	};

	const purchaseHandler = () => {
		if (!investAmount || investAmount === "0") {
			toast.error("Please enter an amount");
			return false;
		}

		if (!account || !library || !baseToken) {
			return false;
		}

		if (approval !== 3) {
			toast.error("Please increase allowance to deposit");
			return false;
		}

		const contract = getContract(params?.address, PresaleABI, library, account);

		const args = [new BigNumber(investAmount).times(10 ** baseToken?.decimals).toString()];

		contract.estimateGas
			.userDeposit(...args, {
				value: presale?.presaleInEth
					? new BigNumber(investAmount).times(10 ** baseToken?.decimals).toString()
					: 0,
			})
			.then((res) => {
				contract
					.userDeposit(...args, {
						gasLimit: calculateGasMargin(res),
						value: presale?.presaleInEth
							? new BigNumber(investAmount).times(10 ** baseToken?.decimals).toString()
							: 0,
					})
					.then(() => {
						setInvestAmount("");
						toast.success("Deposited successfully!");
						return true;
					})
					.catch((err) => {
						const serializedError = serializeError(err);
						toast.error(serializedError?.data?.originalError?.error?.message);
						return false;
					});
			})
			.catch((err) => {
				const serializedError = serializeError(err);
				toast.error(serializedError?.data?.originalError?.error?.message);
				return false;
			});
	};

	const withdrawToken = () => {
		if (!account || !library || !baseToken) {
			return false;
		}

		const contract = getContract(params?.address, PresaleABI, library, account);

		contract
			.userWithdrawTokens()
			.then((res) => {
				toast.success("Withdrawn was successful");
				return true;
			})
			.catch((err) => {
				const serializedError = serializeError(err);
				toast.error(serializedError?.data?.originalError?.error?.message);
				return false;
			});
	};

	const withdrawBaseToken = () => {
		if (!account || !library || !baseToken) {
			return false;
		}

		const contract = getContract(params?.address, PresaleABI, library, account);

		contract
			.userWithdrawBaseTokens()
			.then((res) => {
				toast.success("Withdrawn was successful");
				return true;
			})
			.catch((err) => {
				const serializedError = serializeError(err);
				toast.error(serializedError?.data?.originalError?.error?.message);
				return false;
			});
	};

	const withdrawOwnerToken = () => {
		if (!account || !library) {
			return false;
		}

		if (!isOwner) {
			toast.error("Forbidden, You didn't have access to this functionality");
			return false;
		}

		const contract = getContract(params?.address, PresaleABI, library, account);

		contract
			.ownerWithdrawTokens()
			.then((res) => {
				toast.success("Withdrawn was successful");
				return true;
			})
			.catch((err) => {
				const serializedError = serializeError(err);
				toast.error(serializedError?.data?.originalError?.error?.message);
				return false;
			});
	};

	const addLiquidity = () => {
		if (!account || !library) {
			return false;
		}

		const contract = getContract(params?.address, PresaleABI, library, account);

		contract
			.addLiquidity()
			.then((res) => {
				toast.success("Adding liquidity was successful! Please wait until complete LP generation");
				return true;
			})
			.catch((err) => {
				const serializedError = serializeError(err);
				toast.error(serializedError?.data?.originalError?.error?.message);
				return false;
			});
	};

	return (
		<Page title={false} networkSensitive={true}>
			<Row>
				<Col xs={{ span: 12, offset: 0 }} md={{ span: 6, offset: 3 }}>
					<SafetyAlert />
				</Col>
				<Col xs={{ span: 12, offset: 0 }} md={{ span: 6, offset: 3 }}>
					<Card>
						<Row>
							<Col xs={12} className={"d-flex align-items-center justify-content-between mb-3"}>
								<IconButton to={"/launchpad"}>
									<ArrowLeft color={theme.text1} width={24} height={24} />
								</IconButton>
								<span
									className={`label label-inline label-sm label-light-${
										presale?.state === 1
											? "primary"
											: presale?.state === 3
											? "danger"
											: presale?.state === 2
											? "success"
											: "warning"
									}`}
								>
									{presale?.state === 1
										? "Live"
										: presale?.state === 3
										? "Failed"
										: presale?.state === 2
										? "Success"
										: "Upcoming"}
								</span>
							</Col>
							<Col xs={12} className="d-flex align-items-center">
								<LogoContainer>
									<Logo src={Presales?.[params?.address]?.iconURL} alt={selectedToken?.symbol} />
								</LogoContainer>
								<div className="d-flex align-items-stretch flex-column">
									<TokenName>{selectedToken?.name || "-"}</TokenName>
									<div className="d-flex align-items-center mt-2 flex-wrap">
										<ExternalLink
											className={"mr-2"}
											href={getEtherscanLink(chainId, selectedToken?.address, "token")}
										>
											<LinkText>Etherscan</LinkText>
											<SVG
												src={require("../../assets/images/account/external-link.svg").default}
												width={16}
												height={16}
											/>
										</ExternalLink>
										<ExternalLink
											className={"mr-2"}
											onClick={copyToClipboard.bind(this, selectedToken?.address)}
										>
											<LinkText>{shortenAddress(selectedToken?.address || "")}</LinkText>
											<SVG
												src={require("../../assets/images/account/copy.svg").default}
												width={16}
												height={16}
											/>
										</ExternalLink>
									</div>
								</div>
							</Col>
							<Col xs={12} className={"d-flex align-items-center justify-content-around mt-4 mb-3"}>
								<DetailsWrapper>
									<DetailsContainer>
										<CircleBarPosition>
											<CircleBar
												fill={theme.primary}
												width={40}
												height={40}
												percent={Number(liquidityPercent)}
											/>
										</CircleBarPosition>
									</DetailsContainer>
									<DetailsTitle>{liquidityPercent ? `${liquidityPercent}%` : "-"}</DetailsTitle>
									<DetailsLabel>Lock {lockDurationMap?.[lockDuration] || "-"}</DetailsLabel>
								</DetailsWrapper>
								<DetailsWrapper>
									<DetailsContainer>
									<CircleBarPosition>
										<CircleBar fill={theme.primary} width={40} height={40} percent={100} />
									</CircleBarPosition>
									</DetailsContainer>
									<DetailsTitle>{presale?.status?.buyersCount?.toString() || "-"}</DetailsTitle>
									<DetailsLabel>Participants</DetailsLabel>
								</DetailsWrapper>
								<DetailsWrapper>
									<DetailsContainer>
									<CircleBarPosition>
										<CircleBar
											fill={theme.primary}
											width={40}
											height={40}
											percent={filledPercent}
										/>
									</CircleBarPosition>
									</DetailsContainer>
									<DetailsTitle>
										{filledPercent && !isNaN(filledPercent) ? `${filledPercent}%` : "-"}
									</DetailsTitle>
									<DetailsLabel>Filled {baseToken?.symbol}</DetailsLabel>
								</DetailsWrapper>
							</Col>
							<Col xs={12}>
								<Tab.Container defaultActiveKey={"presale"}>
									<Row>
										<Col xs={12}>
											<CustomNav
												fill
												variant="pills"
												className={"d-flex flex-row align-items-center flex-nowrap"}
											>
												<CustomNavItem className={"flex-grow-1"}>
													<CustomNavLink eventKey="presale">
														<CustomNavTitle>Presale</CustomNavTitle>
													</CustomNavLink>
												</CustomNavItem>
												<CustomNavItem className={"flex-grow-1"}>
													<CustomNavLink eventKey="info">
														<CustomNavTitle>Info</CustomNavTitle>
													</CustomNavLink>
												</CustomNavItem>
											</CustomNav>
										</Col>
										<Col xs={12}>
											<Tab.Content className={"bg-transparent"}>
												<Tab.Pane eventKey="presale">
													{!account ? (
														<div className="d-flex align-items-center justify-content-center">
															<GradientButton
																className={"btn-lg"}
																onClick={toggleWalletModal}
															>
																{t("wallet.connect")}
															</GradientButton>
														</div>
													) : (
														<>
															{presale?.state < 2 && !enoughBalance && (
																<RowCard>
																	<RowTitle className={"text-center"}>
																		Presale Requirements
																	</RowTitle>
																	<RowDesc className={"text-center"}>
																		To participate in presale you need to hold at
																		least the specified amount of the following
																		token.
																	</RowDesc>
																	<div className="d-flex flex-column">
																		<TokenWrapper>
																			<CurrencyLogo
																				currency={BalanceToken}
																				size={24}
																				style={{ marginRight: 16 }}
																			/>
																			<StyledTokenName className={"mt-0"}>
																				8 {BalanceToken.symbol}
																			</StyledTokenName>
																		</TokenWrapper>
																	</div>
																</RowCard>
															)}
															{presale?.state === 2 &&
																depositedToken?.baseDeposited.isGreaterThan(0) &&
																!presale?.status?.lpGenerationComplete && (
																	<RowCard>
																		<Row>
																			<Col
																				xs={12}
																				className={
																					"d-flex align-items-center justify-content-center flex-column"
																				}
																			>
																				<RowTitle
																					className={"text-center mb-2"}
																				>
																					Add Liquidity and Lock in Liquidity
																					pool
																				</RowTitle>
																				<DetailsLabel
																					className={"text-center mb-4"}
																				>
																					By adding the liquidity, the
																					withdrawal option will be enabled.
																				</DetailsLabel>
																			</Col>
																			<Col
																				xs={12}
																				className={
																					"d-flex align-items-center justify-content-center"
																				}
																			>
																				<Button
																					className={
																						"flex-grow-1 ml-1 d-flex align-items-center justify-content-center"
																					}
																					variant={"primary"}
																					style={{ height: 56 }}
																					onClick={addLiquidity}
																				>
																					Generate liquidity pool
																				</Button>
																			</Col>
																		</Row>
																	</RowCard>
																)}
															{presale?.state === 2 &&
																depositedToken?.baseDeposited.isGreaterThan(0) &&
																presale?.status?.lpGenerationComplete && (
																	<RowCard>
																		<Row>
																			<Col
																				xs={12}
																				className={
																					"d-flex align-items-center justify-content-center flex-column"
																				}
																			>
																				<RowTitle
																					className={"text-center mb-2"}
																				>
																					Withdraw your{" "}
																					{selectedToken?.symbol}
																				</RowTitle>
																				<DetailsLabel
																					className={"text-center mb-4"}
																				>
																					You will receive:{" "}
																					{depositedToken?.receiveEstimated?.toString()}{" "}
																					{selectedToken?.symbol}{" "}
																					(approximately)
																				</DetailsLabel>
																			</Col>
																			<Col
																				xs={12}
																				className={
																					"d-flex align-items-center justify-content-center"
																				}
																			>
																				<Button
																					className={
																						"flex-grow-1 ml-1 d-flex align-items-center justify-content-center"
																					}
																					variant={"primary"}
																					style={{ height: 56 }}
																					onClick={withdrawToken}
																				>
																					Withdraw
																				</Button>
																			</Col>
																		</Row>
																	</RowCard>
																)}
															{presale?.state === 3 &&
																depositedToken?.baseDeposited.isGreaterThan(0) && (
																	<RowCard>
																		<Row>
																			<Col
																				xs={12}
																				className={
																					"d-flex align-items-center justify-content-center flex-column"
																				}
																			>
																				<RowTitle
																					className={"text-center mb-2"}
																				>
																					ILO failed, Withdraw your{" "}
																					{baseToken?.symbol}
																				</RowTitle>
																				<DetailsLabel
																					className={"text-center mb-4"}
																				>
																					You will receive:{" "}
																					{depositedToken?.baseDeposited?.toString()}{" "}
																					{baseToken?.symbol} (approximately)
																				</DetailsLabel>
																			</Col>
																			<Col
																				xs={12}
																				className={
																					"d-flex align-items-center justify-content-center"
																				}
																			>
																				<Button
																					className={
																						"flex-grow-1 ml-1 d-flex align-items-center justify-content-center"
																					}
																					variant={"danger"}
																					style={{ height: 56 }}
																					onClick={withdrawBaseToken}
																				>
																					Withdraw
																				</Button>
																			</Col>
																		</Row>
																	</RowCard>
																)}
															{presale?.state === 3 && isOwner && (
																<RowCard>
																	<Row>
																		<Col
																			xs={12}
																			className={
																				"d-flex align-items-center justify-content-center flex-column"
																			}
																		>
																			<RowTitle className={"text-center mb-2"}>
																				ILO failed, Withdraw your{" "}
																				{baseToken?.symbol} & initial Liquidity
																			</RowTitle>
																		</Col>
																		<Col
																			xs={12}
																			className={
																				"d-flex align-items-center justify-content-center"
																			}
																		>
																			<Button
																				className={
																					"flex-grow-1 ml-1 d-flex align-items-center justify-content-center"
																				}
																				variant={"danger"}
																				style={{ height: 56 }}
																				onClick={withdrawOwnerToken}
																			>
																				Withdraw
																			</Button>
																		</Col>
																	</Row>
																</RowCard>
															)}
															{presale?.state === 1 && enoughBalance && (
																<RowCard>
																	<Row>
																		<Col xs={12}>
																			<div className="d-flex align-items-center mb-3">
																				<DetailsContainer
																					className={"mb-0 mr-3"}
																				>
																					<CircleBar
																						fill={theme.primary}
																						width={40}
																						height={40}
																						percent={100}
																					/>
																				</DetailsContainer>
																				<div className="d-flex flex-column">
																					<DetailsLabel className={"mb-1"}>
																						Your spent allowance
																					</DetailsLabel>
																					<DetailsTitleSimple
																						className={"mb-0"}
																					>
																						{maxSpend || "-"}{" "}
																						{baseToken?.symbol || "-"}
																					</DetailsTitleSimple>
																				</div>
																			</div>
																		</Col>
																		<Col xs={12}>
																			<RowTitle className={"text-center"}>
																				Spend how much{" "}
																				{baseToken?.symbol || "-"}?
																			</RowTitle>
																		</Col>
																		<Col xs={12}>
																			<CurrencyInputPanel
																				label={`From (${t("estimated")})`}
																				value={investAmount}
																				showMaxButton={true}
																				currency={
																					baseToken?.symbol === "WETH" ||
																					baseToken?.symbol === "ETH"
																						? ETHER
																						: baseToken
																				}
																				onUserInput={setInvestAmount}
																				onMax={setInvestAmount}
																				disableCurrencySelect={true}
																				id="invest-presale"
																				withoutMargin={true}
																			/>
																		</Col>
																		<Col
																			xs={12}
																			className={
																				"d-flex align-items-center justify-content-between px-4"
																			}
																		>
																			<DetailsLabel>You will get</DetailsLabel>
																			<DetailsTitleSimple
																				style={{
																					fontSize: 14,
																					marginBottom: 0,
																				}}
																			>
																				{(investAmount * presalePrice).toFixed(
																					4
																				)}{" "}
																				{selectedToken?.symbol || "-"}
																			</DetailsTitleSimple>
																		</Col>
																		<Col xs={12}>
																			<Description className={"text-center mt-5"}>
																				Please be aware if the token you are
																				purchasing has deflationary mechanisms
																				such as burn on transfer you may receive
																				less than the amount stated. <br />
																				Your tokens will be locked in the
																				contract until the presale has
																				concluded.
																			</Description>
																		</Col>
																		<Col
																			xs={12}
																			className={"d-flex align-items-center"}
																		>
																			<Button
																				className={
																					"flex-grow-1 mr-1 d-flex align-items-center justify-content-center"
																				}
																				variant={"secondary"}
																				style={{ height: 56 }}
																				disabled={approval !== 1}
																				onClick={approvalCallback}
																			>
																				{approval === 2 ? (
																					<Loading
																						width={18}
																						height={18}
																						active={true}
																						color={"#fff"}
																						id={"approval-loading"}
																					/>
																				) : (
																					"Approve"
																				)}
																			</Button>
																			<Button
																				className={
																					"flex-grow-1 ml-1 d-flex align-items-center justify-content-center"
																				}
																				variant={"primary"}
																				style={{ height: 56 }}
																				onClick={purchaseHandler}
																			>
																				Purchase
																			</Button>
																		</Col>
																	</Row>
																</RowCard>
															)}
														</>
													)}
												</Tab.Pane>
												<Tab.Pane eventKey="info">
													<RowCard>
														<Row>
															<Col xs={12}>
																<RowTitle className={"text-center"}>
																	{selectedToken?.symbol || "-"} Tokenomics
																</RowTitle>
																<RowDesc className={"text-center"}>
																	Total supply: {transformedTotalSupply}{" "}
																	{selectedToken?.symbol || "-"}
																</RowDesc>
															</Col>
															<Col xs={12} className={"mt-4 mb-3"}>
																<RowTitle className={"text-center"}>
																	Presale info
																</RowTitle>
																<RowDesc className={"mb-1"}>
																	Start block:{" "}
																	{presale?.startBlock?.toString() || "-"}
																</RowDesc>
																<RowDesc className={"mb-1"}>
																	End block: {presale?.endBlock?.toString() || "-"}
																</RowDesc>
															</Col>
															<Col xs={12}>
																<ListGroup className={"bg-transparent"}>
																	<ListItem>
																		<Lock size={32} style={{ marginRight: 16 }} />
																		<div className="d-flex flex-column justify-content-between">
																			<DetailsTitleSimple
																				style={{ fontSize: 16 }}
																			>
																				{liquidityPercent
																					? `${liquidityPercent}%`
																					: "-"}{" "}
																				{baseToken?.symbol} raised liquidity
																				lock
																			</DetailsTitleSimple>
																			<DetailsLabel>
																				{lockDurationMap?.[lockDuration] || "-"}{" "}
																				lock duration
																			</DetailsLabel>
																		</div>
																	</ListItem>
																	<ListItem>
																		<Users size={32} style={{ marginRight: 16 }} />
																		<div className="d-flex flex-column justify-content-between">
																			<DetailsTitleSimple
																				style={{ fontSize: 16 }}
																			>
																				{presale?.status?.whitelistOnly
																					? "Private"
																					: "Public"}
																			</DetailsTitleSimple>
																			<DetailsLabel>
																				{presale?.status?.whitelistOnly
																					? "Whitelisted only"
																					: "Open to everyone"}
																			</DetailsLabel>
																		</div>
																	</ListItem>
																	<ListItem>
																		<Info size={32} style={{ marginRight: 16 }} />
																		<div className="d-flex flex-column justify-content-between">
																			<DetailsTitleSimple
																				style={{ fontSize: 16 }}
																			>
																				{softCap || "-"}{" "}
																				{baseToken?.symbol || "-"}
																			</DetailsTitleSimple>
																			<DetailsLabel>Softcap</DetailsLabel>
																		</div>
																	</ListItem>
																	<ListItem>
																		<Info size={32} style={{ marginRight: 16 }} />
																		<div className="d-flex flex-column justify-content-between">
																			<DetailsTitleSimple
																				style={{ fontSize: 16 }}
																			>
																				{hardCap || "-"}{" "}
																				{baseToken?.symbol || "-"}
																			</DetailsTitleSimple>
																			<DetailsLabel>Hardcap</DetailsLabel>
																		</div>
																	</ListItem>
																	<ListItem>
																		<Info size={32} style={{ marginRight: 16 }} />
																		<div className="d-flex flex-column justify-content-between">
																			<DetailsTitleSimple
																				style={{ fontSize: 16 }}
																			>
																				{maxSpend || "-"}{" "}
																				{baseToken?.symbol || "-"}
																			</DetailsTitleSimple>
																			<DetailsLabel>
																				Max spend per account
																			</DetailsLabel>
																		</div>
																	</ListItem>
																	<ListItem>
																		<Info size={32} style={{ marginRight: 16 }} />
																		<div className="d-flex flex-column justify-content-between">
																			<DetailsTitleSimple
																				style={{ fontSize: 16 }}
																			>
																				{presalePrice} per{" "}
																				{baseToken?.symbol || "-"}
																			</DetailsTitleSimple>
																			<DetailsLabel>Presale price</DetailsLabel>
																		</div>
																	</ListItem>
																	<ListItem>
																		<Info size={32} style={{ marginRight: 16 }} />
																		<div className="d-flex flex-column justify-content-between">
																			<DetailsTitleSimple
																				style={{ fontSize: 16 }}
																			>
																				{listingPrice} per{" "}
																				{baseToken?.symbol || "-"}
																			</DetailsTitleSimple>
																			<DetailsLabel>Listing price</DetailsLabel>
																		</div>
																	</ListItem>
																</ListGroup>
															</Col>
														</Row>
													</RowCard>
												</Tab.Pane>
											</Tab.Content>
										</Col>
									</Row>
								</Tab.Container>
							</Col>
						</Row>
					</Card>
				</Col>
			</Row>
		</Page>
	);
};

export default LaunchpadItem;
