import React, { useCallback, useEffect, useState } from "react";
import { BigNumber } from "@ethersproject/bignumber";
import { useSelector, useDispatch } from "react-redux";
import SVG from "react-inlinesvg";
import { Button, Row, Col } from "react-bootstrap";
import CurrencyInputPanel from "../CurrencyInputPanel";
import { useActiveWeb3React } from "../../hooks";
import { maxAmountSpend } from "../../utils/maxAmountSpend";
import styled from "styled-components";
import { getGasPrice } from "../../state/currency/actions";
import GasPrice from "../GasPrice";

import { TransactionResponse } from "@ethersproject/providers";
import { Currency, ETHER, TokenAmount } from "@uniswap/sdk";
import { RouteComponentProps } from "react-router-dom";
import { Text } from "rebass";
import { LightCard } from "../StyledCards";
import { AutoColumn } from "../Column";
import {
	ConfirmationModalContent,
	ConfirmationPendingContent,
	TransactionSubmittedContent,
} from "../TransactionConfirmationModal";
import DoubleCurrencyLogo from "../../components/DoubleLogo";
import GradientButton from "../UI/Button";

import { Modal } from "../Modal/bootstrap";
import { ROUTER_ADDRESS } from "../../constants";
import { PairState } from "../../data/Reserves";
import { useCurrency } from "../../hooks/Tokens";
import { ApprovalState, useApproveCallback } from "../../hooks/useApproveCallback";
import useTransactionDeadline from "../../hooks/useTransactionDeadline";
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from "../../state/mint/hooks";

import { useTransactionAdder } from "../../state/transactions/hooks";
import { useUserSlippageTolerance } from "../../state/user/hooks";
import { TYPE } from "../../theme";
import { calculateGasMargin, calculateSlippageAmount, getRouterContract } from "../../utils";
import { wrappedCurrency } from "../../utils/wrappedCurrency";
import { ConfirmAddModalBottom } from "../ConfirmAddModalBottom";
import { currencyId } from "../../utils/currencyId";
import { PoolPriceBar } from "../PoolPriceBar";
import { Field } from "../../state/mint/actions";
import { useWalletModalToggle } from "../../state/application/hooks";
import { useTranslation } from "react-i18next";

export const Dots = styled.span`
	&::after {
		display: inline-block;
		animation: ellipsis 1.25s infinite;
		content: ".";
		width: 1em;
		text-align: left;
	}
	@keyframes ellipsis {
		0% {
			content: ".";
		}
		33% {
			content: "..";
		}
		66% {
			content: "...";
		}
	}
`;

export const AccountState = styled.div<{ type?: string }>`
	color: ${({ theme, type }) => (type === "success" ? theme.success : theme.danger)};
	display: flex;
	align-items: center;
	justify-content: ${({ type }) => (type === "success" ? "flex-start" : "center")};
	padding: ${({ type }) => (type === "success" ? "14px 20px" : "24px 20px")};
	border-radius: 18px;
	margin-bottom: 48px;
`;

export const PriceTopbar = styled.span`
	color: ${({ theme }) => theme.text3};
	font-weight: 500;
	font-size: 1.25rem;
	padding: 20px 20px 10px;
	display: block;

	@media (min-width: 1199px) {
		padding: 15px 15px 10px;
	}
`;

export const AccountStateContent = styled.div`
	margin-left: 20px;
`;

export const AccountStateTitle = styled.h3`
	color: currentColor;
	font-size: 1rem;
	font-weight: 500;
	margin-bottom: 0.5rem;
`;

export const AccountStateDesc = styled.span`
	color: rgba(74, 200, 170, 0.5);
	font-size: 0.875rem;
	font-weight: 500;

	& strong {
		color: ${({ theme }) => theme.success};
		font-weight: 500;
	}
`;

export const ResponsiveCol = styled(Col)<{ isFirst?: boolean }>`
	@media (max-width: 1199px) {
		margin-bottom: ${({ isFirst }) => (isFirst ? "8px" : "0")};
	}
`;

export const ConfirmationText = styled(Text)`
	font-size: 48px;
	line-height: 42px;
	font-weight: 500;

	@media (max-width: 1199px) {
		font-size: 24px;
		font-weight: 700;
	}
`;

const HeaderAutoColumn = styled(AutoColumn)`
	grid-row-gap: 20px;

	@media (max-width: 1199px) {
		grid-row-gap: 10px;
	}
`;

const HeaderCurrencyText = styled(Text)`
	font-size: 1.5rem;

	@media (max-width: 1199px) {
		font-size: 1rem;
	}
`;

export default function UniswapLiquidityModal({
	match: {
		params: { currencyIdA, currencyIdB },
	},
	history,
}: RouteComponentProps<{ currencyIdA?: string; currencyIdB?: string }>) {
	const { account, chainId, library } = useActiveWeb3React();
	const toggleWalletModal = useWalletModalToggle();
	const { t } = useTranslation();

	const currencyA = useCurrency(currencyIdA || "ETH");
	const currencyB = useCurrency(currencyIdB);

	// mint state
	const { independentField, typedValue, otherTypedValue } = useMintState();
	const {
		dependentField,
		currencies,
		pairState,
		currencyBalances,
		parsedAmounts,
		price,
		noLiquidity,
		liquidityMinted,
		poolTokenPercentage,
		error,
	} = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined);
	const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity);

	const isValid = !error;

	// modal and loading
	const [showConfirm, setShowConfirm] = useState<boolean>(false);
	const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false); // clicked confirm

	// txn values
	const deadline = useTransactionDeadline(); // custom from users settings
	const [allowedSlippage] = useUserSlippageTolerance(); // custom from users
	const [txHash, setTxHash] = useState<string>("");

	// get formatted amounts
	const formattedAmounts = {
		[independentField]: typedValue,
		[dependentField]: noLiquidity ? otherTypedValue : parsedAmounts[dependentField]?.toSignificant(6) ?? "",
	};

	// get the max amounts user can add
	const maxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
		(accumulator, field) => {
			return {
				...accumulator,
				[field]: maxAmountSpend(currencyBalances[field]),
			};
		},
		{}
	);

	const atMaxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
		(accumulator, field) => {
			return {
				...accumulator,
				[field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? "0"),
			};
		},
		{}
	);

	// check whether the user has approved the router on the tokens
	const [approvalA, approveACallback] = useApproveCallback(parsedAmounts[Field.CURRENCY_A], ROUTER_ADDRESS);
	const [approvalB, approveBCallback] = useApproveCallback(parsedAmounts[Field.CURRENCY_B], ROUTER_ADDRESS);

	const addTransaction = useTransactionAdder();

	async function onAdd() {
		if (!chainId || !library || !account) return;
		const router = getRouterContract(chainId, library, account);

		const { [Field.CURRENCY_A]: parsedAmountA, [Field.CURRENCY_B]: parsedAmountB } = parsedAmounts;
		if (!parsedAmountA || !parsedAmountB || !currencyA || !currencyB || !deadline) {
			return;
		}

		const amountsMin = {
			[Field.CURRENCY_A]: calculateSlippageAmount(parsedAmountA, noLiquidity ? 0 : allowedSlippage)[0],
			[Field.CURRENCY_B]: calculateSlippageAmount(parsedAmountB, noLiquidity ? 0 : allowedSlippage)[0],
		};

		let estimate,
			method: (...args: any) => Promise<TransactionResponse>,
			args: Array<string | string[] | number>,
			value: BigNumber | null;
		if (currencyA === ETHER || currencyB === ETHER) {
			const tokenBIsETH = currencyB === ETHER;
			estimate = router.estimateGas.addLiquidityETH;
			method = router.addLiquidityETH;
			args = [
				wrappedCurrency(tokenBIsETH ? currencyA : currencyB, chainId)?.address ?? "", // token
				(tokenBIsETH ? parsedAmountA : parsedAmountB).raw.toString(), // token desired
				amountsMin[tokenBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(), // token min
				amountsMin[tokenBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(), // eth min
				account,
				deadline.toHexString(),
			];
			value = BigNumber.from((tokenBIsETH ? parsedAmountB : parsedAmountA).raw.toString());
		} else {
			estimate = router.estimateGas.addLiquidity;
			method = router.addLiquidity;
			args = [
				wrappedCurrency(currencyA, chainId)?.address ?? "",
				wrappedCurrency(currencyB, chainId)?.address ?? "",
				parsedAmountA.raw.toString(),
				parsedAmountB.raw.toString(),
				amountsMin[Field.CURRENCY_A].toString(),
				amountsMin[Field.CURRENCY_B].toString(),
				account,
				deadline.toHexString(),
			];
			value = null;
		}

		setAttemptingTxn(true);
		await estimate(...args, value ? { value } : {})
			.then((estimatedGasLimit) =>
				method(...args, {
					...(value ? { value } : {}),
					gasLimit: calculateGasMargin(estimatedGasLimit),
				}).then((response) => {
					setAttemptingTxn(false);

					addTransaction(response, {
						summary:
							"Add " +
							parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
							" " +
							currencies[Field.CURRENCY_A]?.symbol +
							" and " +
							parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
							" " +
							currencies[Field.CURRENCY_B]?.symbol,
					});

					setTxHash(response.hash);
				})
			)
			.catch((error) => {
				setAttemptingTxn(false);
				// we only care if the error is something _other_ than the user rejected the tx
				if (error?.code !== 4001) {
					console.error(error);
				}
			});
	}

	const dispatch = useDispatch();

	// @ts-ignore
	const { gasPrice, selectedGasPrice } = useSelector((state) => state.currency);

	useEffect(() => {
		dispatch(getGasPrice());
	}, [dispatch]);

	const modalHeader = () => {
		return noLiquidity ? (
			<HeaderAutoColumn gap="20px">
				<LightCard mt="20px" borderRadius="20px">
					<div className={"d-flex align-items-center align-items-xl-end"}>
						<ConfirmationText marginRight={10}>
							{currencies[Field.CURRENCY_A]?.symbol + "/" + currencies[Field.CURRENCY_B]?.symbol}
						</ConfirmationText>
						<DoubleCurrencyLogo
							currency0={currencies[Field.CURRENCY_A]}
							currency1={currencies[Field.CURRENCY_B]}
							size={30}
						/>
					</div>
				</LightCard>
			</HeaderAutoColumn>
		) : (
			<HeaderAutoColumn gap="20px">
				<div className={"d-flex align-items-center align-items-xl-end mt-2 mt-xl-4"}>
					<ConfirmationText marginRight={10}>{liquidityMinted?.toSignificant(6)}</ConfirmationText>
					<DoubleCurrencyLogo
						currency0={currencies[Field.CURRENCY_A]}
						currency1={currencies[Field.CURRENCY_B]}
						size={30}
					/>
				</div>
				<HeaderCurrencyText>
					{currencies[Field.CURRENCY_A]?.symbol + "/" + currencies[Field.CURRENCY_B]?.symbol + " Pool Tokens"}
				</HeaderCurrencyText>
				<TYPE.Italic fontSize={12} textAlign="left" padding={"8px 0 0 0 "}>
					{`Output is estimated. If the price changes by more than ${
						allowedSlippage / 100
					}% your transaction will revert.`}
				</TYPE.Italic>
			</HeaderAutoColumn>
		);
	};

	const modalBottom = () => {
		return (
			<ConfirmAddModalBottom
				price={price}
				currencies={currencies}
				parsedAmounts={parsedAmounts}
				noLiquidity={noLiquidity}
				onAdd={onAdd}
				poolTokenPercentage={poolTokenPercentage}
			/>
		);
	};

	const pendingText = `Supplying ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${
		currencies[Field.CURRENCY_A]?.symbol
	} and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${currencies[Field.CURRENCY_B]?.symbol}`;

	const handleCurrencyASelect = useCallback(
		(currencyA: Currency) => {
			const newCurrencyIdA = currencyId(currencyA);
			if (newCurrencyIdA === currencyIdB) {
				history.push(`/invest/pools/${currencyIdB}/${currencyIdA}`);
			} else {
				history.push(`/invest/pools/${newCurrencyIdA}/${currencyIdB}`);
			}
		},
		[currencyIdB, history, currencyIdA]
	);
	const handleCurrencyBSelect = useCallback(
		(currencyB: Currency) => {
			const newCurrencyIdB = currencyId(currencyB);
			if (currencyIdA === newCurrencyIdB) {
				if (currencyIdB) {
					history.push(`/invest/pools/${currencyIdB}/${newCurrencyIdB}`);
				} else {
					history.push(`/invest/pools/${newCurrencyIdB}`);
				}
			} else {
				history.push(`/invest/pools/${currencyIdA ? currencyIdA : "ETH"}/${newCurrencyIdB}`);
			}
		},
		[currencyIdA, history, currencyIdB]
	);

	const handleDismissConfirmation = useCallback(() => {
		setShowConfirm(false);
		// if there was a tx hash, we want to clear the input
		if (txHash) {
			onFieldAInput("");
		}
		setTxHash("");
	}, [onFieldAInput, txHash]);

	return (
		<>
			<Modal
				show={true}
				onHide={() => history.push("/invest/pools")}
				dialogClassName={"custom-modal"}
				backdropClassName={"backdrop"}
				size={"lg"}
				centered={true}
			>
				<Modal.Body style={{ padding: !showConfirm ? "30px" : "0" }}>
					{!account ? (
						<Row>
							<Col xs={12}>
								<AccountState type={"danger"} className={"bg-light-danger"}>
									<SVG
										src={require("../../assets/images/account/wallet.svg").default}
										width={36}
										height={36}
									/>
									<AccountStateContent>
										<AccountStateTitle className={"mb-0"}>
											{t("wallet.notConnected")}
										</AccountStateTitle>
									</AccountStateContent>
								</AccountState>
							</Col>
							<Col
								xs={12}
								className={"d-flex align-items-center justify-content-center"}
								style={{ padding: "80px 0 88px" }}
							>
								<GradientButton className={"btn-lg"} onClick={toggleWalletModal}>
									{t("wallet.connect")}
								</GradientButton>
							</Col>
						</Row>
					) : !showConfirm ? (
						<Row>
							<Col xs={12}>
								<AccountState type={"success"} className={"bg-light-success d-none d-xl-flex"}>
									<SVG
										src={require("../../assets/images/account/wallet.svg").default}
										width={36}
										height={36}
									/>
									<AccountStateContent>
										<AccountStateTitle>{t("wallet.connected")}</AccountStateTitle>
										<AccountStateDesc>
											{t("wallet.connectedTo")} <strong>{account}</strong>
										</AccountStateDesc>
									</AccountStateContent>
								</AccountState>
							</Col>
							<ResponsiveCol xs={12} isFirst={true}>
								<CurrencyInputPanel
									value={formattedAmounts[Field.CURRENCY_A]}
									onUserInput={onFieldAInput}
									onMax={() => {
										onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? "");
									}}
									label={t("token")}
									onCurrencySelect={handleCurrencyASelect}
									showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
									currency={currencies[Field.CURRENCY_A]}
									id="add-liquidity-input-tokena"
									showCommonBases
								/>
							</ResponsiveCol>

							<Col xs={12}>
								<CurrencyInputPanel
									value={formattedAmounts[Field.CURRENCY_B]}
									onUserInput={onFieldBInput}
									onCurrencySelect={handleCurrencyBSelect}
									onMax={() => {
										onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? "");
									}}
									label={t("token")}
									showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
									currency={currencies[Field.CURRENCY_B]}
									id="add-liquidity-input-tokenb"
									showCommonBases
								/>
							</Col>
							{currencies[Field.CURRENCY_A] &&
								currencies[Field.CURRENCY_B] &&
								pairState !== PairState.INVALID && (
									<Col xs={12} className={"gutter-b"}>
										<LightCard padding="0" borderRadius={"18px"} style={{ marginBottom: 20 }}>
											<PriceTopbar>
												{noLiquidity ? t("initialPricePoolShare") : t("pricePoolShare")}
											</PriceTopbar>
											<div>
												<PoolPriceBar
													currencies={currencies}
													poolTokenPercentage={poolTokenPercentage}
													noLiquidity={noLiquidity}
													price={price}
												/>
											</div>
										</LightCard>
									</Col>
								)}
							<Col xs={12} className={"gutter-b"}>
								<LightCard padding={"0"} borderRadius={"18px"} style={{ marginBottom: 20 }}>
									<PriceTopbar>{t("pools.selectGasSetting")}</PriceTopbar>
									<GasPrice gasList={gasPrice} selected={selectedGasPrice} />
								</LightCard>
							</Col>
							<Col
								xs={12}
								style={{ paddingTop: 30 }}
								className={
									"d-flex flex-column flex-xl-row align-items-stretch align-items-xl-center justify-content-center"
								}
							>
								{!account && (
									<Button
										style={{ minWidth: 250 }}
										variant={"dark"}
										disabled
										className={"py-3 font-size-lg font-weight-bolder"}
									>
										{t("wallet.connect")}
									</Button>
								)}
								{(approvalA === ApprovalState.NOT_APPROVED ||
									approvalA === ApprovalState.PENDING ||
									approvalB === ApprovalState.NOT_APPROVED ||
									approvalB === ApprovalState.PENDING) &&
									isValid &&
									account && (
										<Row className={"custom-row"}>
											{approvalA !== ApprovalState.APPROVED && (
												<Col xs={12} md={approvalB !== ApprovalState.APPROVED ? 6 : 12}>
													<Button
														style={{ minWidth: 250 }}
														className={"w-100 py-3 mb-3"}
														variant={"secondary-light"}
														onClick={approveACallback}
														disabled={approvalA === ApprovalState.PENDING}
													>
														{approvalA === ApprovalState.PENDING ? (
															<Dots>
																{t("approving")} {currencies[Field.CURRENCY_A]?.symbol}
															</Dots>
														) : (
															t("approve") + " " + currencies[Field.CURRENCY_A]?.symbol
														)}
													</Button>
												</Col>
											)}
											{approvalB !== ApprovalState.APPROVED && (
												<Col xs={12} md={approvalA !== ApprovalState.APPROVED ? 6 : 12}>
													<Button
														style={{ minWidth: 250 }}
														className={"w-100 py-3 mb-3"}
														variant={"secondary-light"}
														onClick={approveBCallback}
														disabled={approvalB === ApprovalState.PENDING}
													>
														{approvalB === ApprovalState.PENDING ? (
															<Dots>
																{t("approving")} {currencies[Field.CURRENCY_B]?.symbol}
															</Dots>
														) : (
															t("approve") + " " + currencies[Field.CURRENCY_B]?.symbol
														)}
													</Button>
												</Col>
											)}
										</Row>
									)}
								<Button
									onClick={() => {
										setAttemptingTxn(false);
										setShowConfirm(true);
									}}
									style={{ minWidth: 250 }}
									disabled={
										!isValid ||
										approvalA !== ApprovalState.APPROVED ||
										approvalB !== ApprovalState.APPROVED
									}
									variant={
										!isValid &&
										!!parsedAmounts[Field.CURRENCY_A] &&
										!!parsedAmounts[Field.CURRENCY_B]
											? "outline-primary"
											: "primary"
									}
									className={`${
										!isValid &&
										!!parsedAmounts[Field.CURRENCY_A] &&
										!!parsedAmounts[Field.CURRENCY_B]
											? "outline-primary"
											: ""
									} py-3`}
								>
									<span className="font-weight-bold font-size-lg">{error ?? t("pools.supply")}</span>
								</Button>
							</Col>
						</Row>
					) : attemptingTxn ? (
						<ConfirmationPendingContent onDismiss={handleDismissConfirmation} pendingText={pendingText} />
					) : txHash ? (
						<TransactionSubmittedContent
							chainId={chainId}
							hash={txHash}
							onDismiss={handleDismissConfirmation}
						/>
					) : (
						<ConfirmationModalContent
							title={noLiquidity ? t("pools.creatingPool") : t("pools.willReceive")}
							onDismiss={handleDismissConfirmation}
							topContent={modalHeader}
							bottomContent={modalBottom}
						/>
					)}
				</Modal.Body>
			</Modal>
		</>
	);
}
