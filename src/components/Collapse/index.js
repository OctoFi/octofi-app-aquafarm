import React, { useContext, useRef, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "styled-components";
import { ETHER, Token } from "@uniswap/sdk";
import moment from "moment";
import { ChevronRight, Download, Upload, FileText, Repeat } from "react-feather";

import { useActiveWeb3React } from "../../hooks";
import CurrencyLogo from "../CurrencyLogo";
import * as Styled from "./styleds";

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
		<Styled.Wrapper show={show}>
			<Styled.Header
				className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center justify-content-between"
				ref={header}
				onClick={showCollapse}
				show={show}
			>
				<Styled.HeaderSection className="d-flex align-items-center" type={"title"}>
					<Styled.TypeIcon>
						{tokens.ref.value === "0" && props.txn.length === 1 ? (
							<FileText size={20} color={theme.primary} />
						) : tokens.from.length === 1 && tokens.to.length === 1 ? (
							<Repeat size={20} color={theme.primary} />
						) : (tokens.from.length > 1 && tokens.to.length === 1) ||
						  (tokens.from.length === 1 && tokens.to.length > 1) ? (
							<Upload size={20} color={theme.primary} />
						) : (
							<Download size={20} color={theme.primary} />
						)}
					</Styled.TypeIcon>
					<div className=" d-flex justify-content-center flex-column ml-3">
						<Styled.HeaderTitle>
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
						</Styled.HeaderTitle>
						<Styled.Date className={"opacity-50"}>
							{moment(tokens.ref.timeStamp, "X").format("hh:MM A")}
						</Styled.Date>
					</div>
				</Styled.HeaderSection>

				<Styled.HeaderSection
					className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center justify-content-start "
					type={"tokens"}
				>
					{tokens.from.length > 0 && (
						<Styled.TradeSide className="d-flex align-items-center">
							{tokens.from.map((token, index) => {
								if (token.contractAddress && token.tokenDecimal) {
									const currency = new Token(
										chainId,
										token.contractAddress,
										Number(token.tokenDecimal) || 18,
										token.tokenSymbol,
										token.tokenName
									);
									return (
										<Styled.LogoContainer key={`${token}-${index}`}>
											<CurrencyLogo currency={currency} />
										</Styled.LogoContainer>
									);
								} else {
									return (
										<Styled.LogoContainer key={`${token}-${index}`}>
											<CurrencyLogo currency={ETHER} />
										</Styled.LogoContainer>
									);
								}
							})}
							<div className="d-flex justify-content-center flex-column" style={{ marginLeft: 5 }}>
								<Styled.Value>
									{tokens.from.length !== 1 ? (
										<Styled.Desc>
											<Styled.Value>{tokens.from.length}</Styled.Value> {t("tokens.assets")}
										</Styled.Desc>
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
								</Styled.Value>
								{tokens.from.length === 1 && (
									<Styled.Desc>
										{tokens.from[0].contractAddress
											? hashText(tokens.from[0].contractAddress)
											: "Ethereum"}
									</Styled.Desc>
								)}
							</div>
						</Styled.TradeSide>
					)}

					{tokens.from.length > 0 && tokens.to.length > 0 && (
						<Styled.Arrow>
							<ChevronRight size={24} color={theme.text1} />
						</Styled.Arrow>
					)}

					{tokens.to.length > 0 && (
						<Styled.TradeSide className="d-flex align-items-center">
							{tokens.to.map((token, index) => {
								if (token.contractAddress && token.tokenDecimal) {
									const currency = new Token(
										chainId,
										token.contractAddress,
										Number(token.tokenDecimal) || 18,
										token.tokenSymbol,
										token.tokenName
									);

									return (
										<Styled.LogoContainer key={`${token}-${index}`}>
											<CurrencyLogo currency={currency} />
										</Styled.LogoContainer>
									);
								} else {
									return (
										<Styled.LogoContainer key={`${token}-${index}`}>
											<CurrencyLogo currency={ETHER} />
										</Styled.LogoContainer>
									);
								}
							})}
							<div className="d-flex justify-content-center flex-column" style={{ marginLeft: 5 }}>
								<Styled.Value color={"primary"}>
									{tokens.to.length !== 1 ? (
										<Styled.Desc>
											<Styled.Value>{tokens.to.length}</Styled.Value> {t("tokens.assets")}
										</Styled.Desc>
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
								</Styled.Value>
								{tokens.to.length === 1 && (
									<Styled.Desc>
										{tokens.to[0].contractAddress
											? hashText(tokens.to[0].contractAddress)
											: "Ethereum"}
									</Styled.Desc>
								)}
							</div>
						</Styled.TradeSide>
					)}
				</Styled.HeaderSection>
				<Styled.HeaderSection
					className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center justify-content-center justify-content-lg-end"
					type={"application"}
				>
					<div className="d-flex flex-column justify-content-center align-items-stretch align-items-lg-start">
						<Styled.Desc>{tokens.from.length > 0 ? "Application" : "From"}</Styled.Desc>
						<Styled.Application>
							{tokens.from.length > 0
								? hashText(tokens.from[0].to || tokens.from[0].contractAddress)
								: tokens.to.length > 0
								? hashText(tokens.to[0].from || tokens.to[0].contractAddress)
								: ""}
						</Styled.Application>
					</div>
				</Styled.HeaderSection>
				<Styled.HeaderShowMore show={show}>
					<ChevronRight size={16} color={theme.primary} />
				</Styled.HeaderShowMore>
			</Styled.Header>
			<Styled.CollapseView height={height}>
				<div ref={content}>
					{tokens.from.length > 0 && tokens.to.length > 0 ? (
						<>
							<Styled.Separator />
							<Styled.Body className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center">
								<Styled.BodyInside className="d-flex flex-column justify-content-center">
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
											<Styled.BodyToken key={`${token}-${index}`}>
												<CurrencyLogo currency={currency} size={36} />
												<div
													className="d-flex justify-content-center flex-column"
													style={{ marginLeft: 30 }}
												>
													<Styled.Value>{`-${
														token.contractAddress
															? (
																	Number(token.value) /
																	10 ** Number(token.tokenDecimal || 18)
															  ).toFixed(4)
															: (Number(token.value) / 10 ** 18).toFixed(4)
													} ${token.tokenSymbol || "ETH"}`}</Styled.Value>
													<Styled.Desc>
														{token.contractAddress
															? hashText(token.contractAddress)
															: "Ethereum"}
													</Styled.Desc>
												</div>
											</Styled.BodyToken>
										);
									})}
								</Styled.BodyInside>
								<Styled.VerticalSeparator>
									<Styled.PrimaryCircle className={"d-none d-lg-flex"}>
										<ChevronRight size={16} color={theme.primary} />
									</Styled.PrimaryCircle>
								</Styled.VerticalSeparator>
								<Styled.ReceivedCoins>
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
											<Styled.BodyToken key={`${token}-${index}`}>
												<CurrencyLogo currency={currency} size={36} />
												<div
													className="d-flex justify-content-center flex-column"
													style={{ marginLeft: 30 }}
												>
													<Styled.Value>{`+${
														token.contractAddress
															? (
																	Number(token.value) /
																	10 ** Number(token.tokenDecimal || 18)
															  ).toFixed(4)
															: (Number(token.value) / 10 ** 18).toFixed(4)
													} ${token.tokenSymbol || "ETH"}`}</Styled.Value>
													<Styled.Desc>
														{token.contractAddress
															? hashText(token.contractAddress)
															: "Ethereum"}
													</Styled.Desc>
												</div>
											</Styled.BodyToken>
										);
									})}
								</Styled.ReceivedCoins>
								<Styled.VerticalSeparator />
								<Styled.BodyInside className="d-flex flex-column justify-content-between">
									<Styled.Details vertical={true}>
										<Styled.DescTitle>{t("pools.fee")}</Styled.DescTitle>
										<Styled.DescValue>
											{((tokens.ref.gasUsed * tokens.ref.gasPrice) / 10 ** 18).toFixed(6)} ETH
										</Styled.DescValue>
									</Styled.Details>
									<Styled.Details vertical={true}>
										<Styled.DescTitle>{t("blockNumber")}</Styled.DescTitle>
										<Styled.DescValue>{tokens.ref.blockNumber}</Styled.DescValue>
									</Styled.Details>
									<Styled.Details vertical={true}>
										<Styled.DescTitle>{t("transactionHash")}</Styled.DescTitle>
										<Styled.DescAnchor
											href={`https://etherscan.io/tx/${tokens.ref.hash}`}
											target={"_blank"}
											rel={"noopener noreferrer"}
										>
											{tokens.ref.hash.slice(0, 10)}...{tokens.ref.hash.slice(-8)} ↗
										</Styled.DescAnchor>
									</Styled.Details>
								</Styled.BodyInside>
							</Styled.Body>
						</>
					) : (
						<Styled.Footer className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center justify-content-between">
							<Styled.Details>
								<Styled.DescTitle>{t("pools.fee")}</Styled.DescTitle>
								<Styled.DescValue>
									{((tokens.ref.gasUsed * tokens.ref.gasPrice) / 10 ** 18).toFixed(6)} ETH
								</Styled.DescValue>
							</Styled.Details>
							<Styled.Details>
								<Styled.DescTitle>{t("blockNumber")}</Styled.DescTitle>
								<Styled.DescValue>{tokens.ref.blockNumber}</Styled.DescValue>
							</Styled.Details>
							<Styled.Details>
								<Styled.DescTitle>{t("blockNumber")}</Styled.DescTitle>
								<Styled.DescAnchor
									href={`https://etherscan.io/tx/${tokens.ref.hash}`}
									target={"_blank"}
									rel={"noopener noreferrer"}
								>
									{tokens.ref.hash.slice(0, 10)}...{tokens.ref.hash.slice(-8)} ↗
								</Styled.DescAnchor>
							</Styled.Details>
						</Styled.Footer>
					)}
				</div>
			</Styled.CollapseView>
		</Styled.Wrapper>
	);
};

export default Collapse;
