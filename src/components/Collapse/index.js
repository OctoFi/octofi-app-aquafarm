import React, { useContext, useRef, useState, useCallback, useMemo } from "react";
import { ETHER, Token } from "@uniswap/sdk";
import moment from "moment";

import CurrencyLogo from "../CurrencyLogo";
import FileIcon from "../Icons/History/File";
import ArrowRightIcon from "../Icons/ArrowRight";
import ExchangeIcon from "../Icons/History/Exchange";
import ArrowDownIcon from "../Icons/History/ArrowDown";
import ArrowUpIcon from "../Icons/History/ArrowUp";
import styled, { ThemeContext } from "styled-components";
import { useActiveWeb3React } from "../../hooks";
import { useTranslation } from "react-i18next";

const Wrapper = styled.div`
	border: 1px solid ${({ theme }) => theme.text4};
	background-color: ${({ theme }) => theme.bg3};
	border-radius: 18px;
	margin-bottom: 15px;
	overflow: hidden;
	transition: all 0.6s ease;
	will-change: transform, height, border-color, box-shadow;

	@media (min-width: 768px) {
		margin-bottom: 1.25rem;
	}
`;

const Header = styled.div`
	padding: 20px;
	cursor: pointer;
	transition: 0.3s ease background-color;
	position: relative;
	background-color: ${({ theme }) => theme.modalBG};

	@media (min-width: 992px) {
		padding: 15px 40px 15px 20px;
	}
`;

const HeaderSection = styled.div`
	flex: 1;

	padding-bottom: ${({ type }) => (type === "application" ? "0" : "30px")};

	@media (min-width: 992px) {
		min-width: ${({ type }) => (type === "title" ? "300px" : type === "tokens" ? "400px" : "initial")};
		padding: 0;
	}
`;

const HeaderShowMore = styled.div`
	width: 40px;
	height: 40px;
	background-color: ${({ theme }) => theme.bg2};
	display: flex;
	align-items: center;
	justify-content: center;
	transform: ${({ show }) => (show ? "rotate(90deg)" : "rotate(0deg)")};
	border-radius: 40px;
	transition: 0.4s ease all;
	will-change: background-color, transform;
	margin-left: 35px;

	@media (max-width: 991px) {
		position: absolute;
		top: 13px;
		right: 15px;
		transform: ${({ show }) => (show ? "rotate(-90deg)" : "rotate(90deg)")};
	}

	&:hover {
		background-color: ${({ theme }) => theme.bg1};
	}
`;

const Body = styled.div`
	padding: 0;
	position: relative;
`;

const BodyInside = styled.div`
	padding: 20px 20px 30px;
	min-width: 320px;
	align-self: stretch;
`;

const Footer = styled.div`
	padding: 20px 40px 20px 20px;
	align-self: stretch;
`;

const BodyToken = styled.div`
	display: flex;
	align-items: center;

	&:not(:last-child) {
		margin-bottom: 30px;
	}
`;

const TypeIcon = styled.div`
	width: 50px;
	height: 50px;
	border-radius: 50px;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: rgba(135, 220, 225, 0.15);
`;

const HeaderTitle = styled.span`
	font-weight: 400;
	font-size: 0.875rem;
	margin-bottom: 0.75rem;

	@media (min-width: 992px) {
		font-size: 1rem;
		margin-bottom: 0.5rem;
	}
`;

const Date = styled.span`
	font-weight: 400;
	font-size: 0.875rem;

	@media (min-width: 992px) {
		font-size: 1rem;
	}
`;

const LogoContainer = styled.div`
	margin-right: 10px;

	img,
	div {
		width: 30px;
		height: 30px;

		@media (min-width: 768px) {
			width: 34px;
			height: 34px;
		}
	}
`;

const Value = styled.span`
	font-weight: 500;
	color: ${({ color, theme }) => (color ? theme[color] : theme.text1)};
	font-size: 0.875rem;

	@media (min-width: 992px) {
		font-size: 1rem;
	}
`;

const Desc = styled.span`
	font-weight: 500;
	color: ${({ theme }) => theme.text3};
	font-size: 0.875rem;

	@media (min-width: 992px) {
		font-size: 1rem;
	}
`;

const Application = styled.span`
	border-radius: 18px !important;
	height: 48px !important;
	padding: 0.5rem 1rem !important;
`;

const Arrow = styled.div`
	padding: 0 26px;

	@media (max-width: 991px) {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 14px 0;

		svg {
			transform: rotate(90deg);
		}
	}
`;

const Separator = styled.div`
	height: 0;
	width: 100%;
	border-bottom: 1px solid ${({ theme }) => theme.text4};
`;

const VerticalSeparator = styled.div`
	width: 0;
	margin: 0 ${({ margin }) => `${margin}rem`};
	align-self: stretch;
	border-right: 1px solid ${({ theme }) => theme.text4};
	position: relative;

	@media (max-width: 991px) {
		width: 100%;
		height: 0;
		border-right: none;
		border-bottom: 1px solid ${({ theme }) => theme.text4};
		margin: ${({ margin }) => `${margin}rem`} 0;
	}
`;

const PrimaryCircle = styled.div`
	width: 32px;
	height: 32px;
	border: 1px solid ${({ theme }) => theme.primary};
	background-color: ${({ theme }) => theme.bg1};
	border-radius: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
`;

const Details = styled.div`
	display: flex;
	justify-content: center;
	flex-direction: column;

	&:not(:last-child) {
		margin-bottom: 30px;

		@media (min-width: 992px) {
			margin-bottom: ${({ vertical }) => (vertical ? "30px" : 0)};
		}
	}
`;

const DescTitle = styled.span`
	font-weight: 400;
	font-size: 1rem;
	margin-bottom: 0.375rem;
	color: ${({ theme }) => theme.text1};
`;

const DescValue = styled.span`
	font-weight: 700;
	font-size: 1rem;
	color: ${({ theme }) => theme.text1};
`;
const DescAnchor = styled.a`
	font-weight: 700;
	font-size: 1rem;
	text-decoration: underline;
	color: ${({ theme }) => theme.primary};
`;

const TradeSide = styled.div`
	min-width: 172px;
`;

const ReceivedCoins = styled.div`
	padding: 20px 50px;

	@media (max-width: 991px) {
		padding: 30px 20px;
	}
`;

const CollapseView = styled.div`
	overflow: hidden;
	max-height: ${({ height }) => `${height}px` || 0};
	display: flex;
	flex-direction: column;

	transition: 0.4s ease all;
`;

const hashText = (hash) => {
	return hash.slice(0, 6) + "..." + hash.slice(-4);
};

const Collapse = (props) => {
	const { chainId, account } = useActiveWeb3React();
	const [show, setShow] = useState(false);
	const [height, setHeight] = useState(0);
	const { t } = useTranslation();

	const theme = useContext(ThemeContext);

	const header = useRef(null);
	const content = useRef(null);

	const showCollapse = useCallback(() => {
		const contentRect = content.current.getBoundingClientRect();

		if (show) {
			setHeight(0);
		} else {
			setHeight(contentRect.height);
		}

		setShow((show) => !show);
	}, [show]);

	let tokens = useMemo(() => {
		let from = [],
			to = [],
			ref = null;
		props.txn.forEach((txnPart) => {
			if (txnPart.from === account.toLowerCase()) {
				from.push(txnPart);
			} else if (txnPart.to === account.toLowerCase()) {
				to.push(txnPart);
			}
			ref = txnPart;
		});
		return {
			from,
			to,
			ref,
		};
	}, [props.txn, account]);

	return (
		<Wrapper show={show}>
			<Header
				className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center justify-content-between"
				ref={header}
				onClick={showCollapse}
				show={show}
			>
				<HeaderSection className="d-flex align-items-center" type={"title"}>
					<TypeIcon>
						{tokens.ref.value === "0" && props.txn.length === 1 ? (
							<FileIcon size={24} fill={theme.primary1} />
						) : tokens.from.length === 1 && tokens.to.length === 1 ? (
							<ExchangeIcon size={24} fill={theme.primary1} />
						) : (tokens.from.length > 1 && tokens.to.length === 1) ||
						  (tokens.from.length === 1 && tokens.to.length > 1) ? (
							<ArrowUpIcon size={24} fill={theme.primary1} />
						) : (
							<ArrowDownIcon size={24} fill={theme.primary1} />
						)}
					</TypeIcon>
					<div className=" d-flex justify-content-center flex-column ml-3">
						<HeaderTitle>
							{tokens.ref.value === "0" && props.txn.length === 1
								? "Contracts / Approval"
								: tokens.from.length === 1 && tokens.to.length === 1
								? "Trade"
								: (tokens.from.length > 1 && tokens.to.length === 1) ||
								  (tokens.from.length === 1 && tokens.to.length > 1)
								? "Add Liquidity"
								: tokens.from.length > 1 || tokens.to.length > 1
								? "Swap"
								: "Receive"}
						</HeaderTitle>
						<Date className={"opacity-50"}>{moment(tokens.ref.timeStamp, "X").format("hh:MM A")}</Date>
					</div>
				</HeaderSection>
				<HeaderSection
					className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center justify-content-start "
					type={"tokens"}
				>
					{tokens.from.length > 0 && (
						<TradeSide className="d-flex align-items-center">
							{tokens.from.map((token) => {
								if (token.contractAddress && token.tokenDecimal) {
									const currency = new Token(
										chainId,
										token.contractAddress,
										Number(token.tokenDecimal) || 18,
										token.tokenSymbol,
										token.tokenName
									);
									return (
										<LogoContainer>
											<CurrencyLogo currency={currency} />
										</LogoContainer>
									);
								} else {
									return (
										<LogoContainer>
											<CurrencyLogo currency={ETHER} />
										</LogoContainer>
									);
								}
							})}
							<div className="d-flex justify-content-center flex-column" style={{ marginLeft: 5 }}>
								<Value>
									{tokens.from.length !== 1 ? (
										<Desc>
											<Value>{tokens.from.length}</Value> {t("tokens.assets")}
										</Desc>
									) : (
										`-${
											tokens.from[0].tokenDecimal
												? (
														Number(tokens.from[0].value) /
														10 ** Number(tokens.from[0].tokenDecimal || 18)
												  ).toFixed(4)
												: (Number(tokens.from[0].value) / 10 ** 18).toFixed(4)
										} ${tokens.from[0].tokenSymbol || "ETH"}`
									)}
								</Value>
								{tokens.from.length === 1 && (
									<Desc>
										{tokens.from[0].contractAddress
											? hashText(tokens.from[0].contractAddress)
											: "Ethereum"}
									</Desc>
								)}
							</div>
						</TradeSide>
					)}

					{tokens.from.length > 0 && tokens.to.length > 0 && (
						<Arrow>
							<ArrowRightIcon size={24} fill={theme.text1} />
						</Arrow>
					)}

					{tokens.to.length > 0 && (
						<TradeSide className="d-flex align-items-center">
							{tokens.to.map((token) => {
								if (token.contractAddress && token.tokenDecimal) {
									const currency = new Token(
										chainId,
										token.contractAddress,
										Number(token.tokenDecimal) || 18,
										token.tokenSymbol,
										token.tokenName
									);

									return (
										<LogoContainer>
											<CurrencyLogo currency={currency} />
										</LogoContainer>
									);
								} else {
									return (
										<LogoContainer>
											<CurrencyLogo currency={ETHER} />
										</LogoContainer>
									);
								}
							})}
							<div className="d-flex justify-content-center flex-column" style={{ marginLeft: 5 }}>
								<Value color={"primary"}>
									{tokens.to.length !== 1 ? (
										<Desc>
											<Value>{tokens.to.length}</Value> {t("tokens.assets")}
										</Desc>
									) : (
										`+${
											tokens.to[0].tokenDecimal
												? (
														Number(tokens.to[0].value) /
														10 ** Number(tokens.to[0].tokenDecimal || 18)
												  ).toFixed(4)
												: (Number(tokens.to[0].value) / 10 ** 18).toFixed(4)
										} ${tokens.to[0].tokenSymbol || "ETH"}`
									)}
								</Value>
								{tokens.to.length === 1 && (
									<Desc>
										{tokens.to[0].contractAddress
											? hashText(tokens.to[0].contractAddress)
											: "Ethereum"}
									</Desc>
								)}
							</div>
						</TradeSide>
					)}
				</HeaderSection>
				<HeaderSection
					className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center justify-content-center justify-content-lg-end"
					type={"application"}
				>
					<div className="d-flex flex-column justify-content-center align-items-stretch align-items-lg-start">
						<Desc style={{ marginBottom: 6 }}>{tokens.from.length > 0 ? "Application" : "From"}</Desc>
						<Application className="label label-inline label-light-primary label-lg">
							{tokens.from.length > 0
								? hashText(tokens.from[0].to || tokens.from[0].contractAddress)
								: tokens.to.length > 0
								? hashText(tokens.to[0].from || tokens.to[0].contractAddress)
								: ""}
						</Application>
					</div>
				</HeaderSection>
				<HeaderShowMore show={show}>
					<ArrowRightIcon size={16} fill={theme.primary1} />
				</HeaderShowMore>
			</Header>
			<CollapseView height={height}>
				<div ref={content}>
					{tokens.from.length > 0 && tokens.to.length > 0 ? (
						<>
							<Separator />
							<Body className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center">
								<BodyInside className="d-flex flex-column justify-content-center">
									{tokens.from.map((token, index) => {
										const currency =
											token.contractAddress && token.tokenDecimal
												? new Token(
														chainId,
														token.contractAddress,
														Number(token.tokenDecimal) || 18,
														token.tokenSymbol,
														token.tokenName
												  )
												: ETHER;
										return (
											<BodyToken key={index}>
												<CurrencyLogo currency={currency} size={"34px"} />
												<div
													className="d-flex justify-content-center flex-column"
													style={{ marginLeft: 30 }}
												>
													<Value>{`-${
														token.contractAddress
															? (
																	Number(token.value) /
																	10 ** Number(token.tokenDecimal || 18)
															  ).toFixed(4)
															: (Number(token.value) / 10 ** 18).toFixed(4)
													} ${token.tokenSymbol || "ETH"}`}</Value>
													<Desc>
														{token.contractAddress
															? hashText(token.contractAddress)
															: "Ethereum"}
													</Desc>
												</div>
											</BodyToken>
										);
									})}
								</BodyInside>
								<VerticalSeparator>
									<PrimaryCircle className={"d-none d-lg-flex"}>
										<ArrowRightIcon size={16} fill={theme.primary} />
									</PrimaryCircle>
								</VerticalSeparator>
								<ReceivedCoins>
									{tokens.to.map((token, index) => {
										const currency =
											token.contractAddress && token.tokenDecimal
												? new Token(
														chainId,
														token.contractAddress,
														Number(token.tokenDecimal) || 18,
														token.tokenSymbol,
														token.tokenName
												  )
												: ETHER;
										return (
											<BodyToken key={index}>
												<CurrencyLogo currency={currency} size={"34px"} />
												<div
													className="d-flex justify-content-center flex-column"
													style={{ marginLeft: 30 }}
												>
													<Value>{`+${
														token.contractAddress
															? (
																	Number(token.value) /
																	10 ** Number(token.tokenDecimal || 18)
															  ).toFixed(4)
															: (Number(token.value) / 10 ** 18).toFixed(4)
													} ${token.tokenSymbol || "ETH"}`}</Value>
													<Desc>
														{token.contractAddress
															? hashText(token.contractAddress)
															: "Ethereum"}
													</Desc>
												</div>
											</BodyToken>
										);
									})}
								</ReceivedCoins>
								<VerticalSeparator />
								<BodyInside className="d-flex flex-column justify-content-between">
									<Details vertical={true}>
										<DescTitle>{t("pools.fee")}</DescTitle>
										<DescValue>
											{((tokens.ref.gasUsed * tokens.ref.gasPrice) / 10 ** 18).toFixed(6)} ETH
										</DescValue>
									</Details>
									<Details vertical={true}>
										<DescTitle>{t("blockNumber")}</DescTitle>
										<DescValue>{tokens.ref.blockNumber}</DescValue>
									</Details>
									<Details vertical={true}>
										<DescTitle>{t("transactionHash")}</DescTitle>
										<DescAnchor
											href={`https://etherscan.io/tx/${tokens.ref.hash}`}
											target={"_blank"}
											rel={"noopener noreferrer"}
										>
											{tokens.ref.hash.slice(0, 10)}...{tokens.ref.hash.slice(-8)} ↗
										</DescAnchor>
									</Details>
								</BodyInside>
							</Body>
						</>
					) : (
						<>
							<Separator />
							<Footer className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center justify-content-between">
								<Details>
									<DescTitle>{t("pools.fee")}</DescTitle>
									<DescValue>
										{((tokens.ref.gasUsed * tokens.ref.gasPrice) / 10 ** 18).toFixed(6)} ETH
									</DescValue>
								</Details>
								<Details>
									<DescTitle>{t("blockNumber")}</DescTitle>
									<DescValue>{tokens.ref.blockNumber}</DescValue>
								</Details>
								<Details>
									<DescTitle>{t("blockNumber")}</DescTitle>
									<DescAnchor
										href={`https://etherscan.io/tx/${tokens.ref.hash}`}
										target={"_blank"}
										rel={"noopener noreferrer"}
									>
										{tokens.ref.hash.slice(0, 10)}...{tokens.ref.hash.slice(-8)} ↗
									</DescAnchor>
								</Details>
							</Footer>
						</>
					)}
				</div>
			</CollapseView>
		</Wrapper>
	);
};

export default Collapse;
