import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ETHER } from "@uniswap/sdk";
import { Button, Row, Col } from "react-bootstrap";
import { useActiveWeb3React } from "../../hooks";
import PlatformLogo from "../PlatformLogo";
import styled from "styled-components";
import { getGasPrice } from "../../state/currency/actions";
import GasPrice from "../GasPrice";
import { usePoolApproveCallback } from "../../state/pools/hooks";
import { ApprovalState } from "../../constants";
import GradientButton from "../UI/Button";

import { Modal } from "../Modal/bootstrap";
import { TransactionResponse } from "@ethersproject/providers";
import { RouteComponentProps } from "react-router-dom";
import { Text } from "rebass";
import { AutoColumn } from "../Column";
import {
	ConfirmationModalContent,
	ConfirmationPendingContent,
	TransactionSubmittedContent,
} from "../TransactionConfirmationModal";

import { RowBetween, RowFixed } from "../Row";
import { AppState } from "../../state";
import useTransactionDeadline from "../../hooks/useTransactionDeadline";
import TokenSelector from "../TokenSelector";

import { useTransactionAdder } from "../../state/transactions/hooks";
import { useUserSlippageTolerance } from "../../state/user/hooks";
import { TYPE } from "../../theme";
import { getContract, isAddress, calculateGasMargin } from "../../utils";
import CurrencyLogo from "../CurrencyLogo";
import { REMOVE_CONTRACTS as CONTRACTS } from "../../constants";
import curvePipeABI from "../../constants/abis/removeLiquidity/curve.json";
import balancerPipeABI from "../../constants/abis/removeLiquidity/balancer.json";
import yVaultPipeABI from "../../constants/abis/removeLiquidity/yVault.json";
import uniswapPipeABI from "../../constants/abis/removeLiquidity/uniswap.json";
import { clearSelectedPool } from "../../state/pools/actions";
import PoolInput from "../PoolInput";
import { usePoolBalance } from "../../state/pools/hooks";
import ERC20_ABI from "../../constants/abis/erc20.json";
import { BigNumber } from "@ethersproject/bignumber";
import { PriceTopbar } from "../AddLiquidityModal/uniswap";
import { useWalletModalToggle } from "../../state/application/hooks";
import { LightCard } from "../StyledCards";
import { PlatformTitle } from "../AddLiquidityModal";
import { useTranslation } from "react-i18next";
import { Form } from "react-bootstrap";

const Check = Form.Check;

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

export const ResponsivePlatformTitle = styled(PlatformTitle)`
	padding-left: 10px;
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

export const PlatformLabel = styled.span`
	display: block;
	color: ${({ theme }) => theme.text1};
	font-weight: 400;
	font-size: 0.875rem;
	padding: 0;
	margin: 1rem 0;

	@media (min-width: 768px) {
		padding: 0 1.5rem;
	}
`;

export const PlatformControl = styled.div`
	border-radius: 18px;
	padding: 0 10px 15px;
	min-height: 56px;
	display: flex;
	flex-direction: column;

	@media (max-width: 768px) {
		padding: 0 0 15px;
	}
`;

export default function RemoveLiquidityModal({ history }: RouteComponentProps) {
	const { account, chainId, library } = useActiveWeb3React();
	const [token, setToken] = useState(ETHER);
	const [selectedOption, setSelectedOption] = useState("custom");
	const toggleWalletModal = useWalletModalToggle();
	const { t } = useTranslation();

	const BUTTON_STATES = useMemo(() => {
		return {
			not_started: t("instantSwap.not_started"),
			initializing: t("instantSwap.initializing"),
			allowance: t("instantSwap.allowance"),
			approving: t("instantSwap.approving"),
			validation: t("instantSwap.validation"),
			create_tx: t("instantSwap.create_tx"),
			send_tx: t("instantSwap.send_tx"),
			submitted: t("instantSwap.submitted"),
			pending: t("instantSwap.pending"),
			failed: t("instantSwap.failed"),
		};
	}, [t]);

	const dispatch = useDispatch();
	const [amount, setAmount] = useState("");
	const [buttonState, setButtonState] = useState(BUTTON_STATES.not_started);
	const { gasPrice, selectedGasPrice } = useSelector((state: AppState) => state.currency);
	const selectedPool = useSelector((state: AppState) => state.pools.selected);
	const pool = selectedPool.data;
	const type = selectedPool.type;
	const selectedCurrencyBalance = usePoolBalance(account ?? undefined, pool.address ?? undefined);
	const getSpender = useMemo(() => {
		let spender, abi;
		if (type && type.toLowerCase() === "curve") {
			spender = CONTRACTS.curve;
			abi = curvePipeABI;
		} else if (type && type.toLowerCase() === "balancer") {
			spender = CONTRACTS.balancer;
			abi = balancerPipeABI;
		} else if (type && type.toLowerCase() === "yearn") {
			spender = CONTRACTS.yVault;
			abi = yVaultPipeABI;
		} else if (type && type.toLowerCase() === "uniswap") {
			spender = CONTRACTS.uniswap;
			abi = uniswapPipeABI;
		} else {
			return ["", undefined];
		}
		return [spender, abi];
	}, [type]);

	const [spender] = getSpender;
	const [approve, approveCallback] = usePoolApproveCallback(pool, amount, spender);

	useEffect(() => {
		if (!pool || !isAddress(pool.address)) {
			dispatch(clearSelectedPool());
			history.push("/invest/pools");
		}
	}, [pool, dispatch, history]);

	// modal and loading
	const [showConfirm, setShowConfirm] = useState<boolean>(false);
	const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false); // clicked confirm

	// txn values
	const deadline = useTransactionDeadline(); // custom from users settings
	const [allowedSlippage] = useUserSlippageTolerance(); // custom from users
	const [txHash, setTxHash] = useState<string>("");

	const addTransaction = useTransactionAdder();

	const setFailedTxn = () => {
		setButtonState(BUTTON_STATES.failed);

		setTimeout(() => {
			setButtonState(BUTTON_STATES.not_started);
		}, 3000);
	};

	const getApprove = () => {
		if (approveCallback) {
			// @ts-ignore
			approveCallback();
		}
	};

	async function onRemove() {
		if (!chainId || !library || !account) return;
		let router;
		let [spender, abi] = getSpender;
		if (!abi) {
			return;
		} else {
			// @ts-ignore
			router = getContract(spender, abi, library, account);
		}
		setButtonState(BUTTON_STATES.initializing);
		const erc20_contract = getContract(pool.address, ERC20_ABI, library, account);

		setButtonState(BUTTON_STATES.allowance);
		const allowance = await erc20_contract.functions.allowance(account, spender);

		// @ts-ignore
		const parsedAmountA: string = `${amount * 10 ** 18}`;
		if (!parsedAmountA || !pool || !deadline) {
			return;
		}
		let canTx = false;

		if (Number(allowance[0].toString()) < Number(parsedAmountA)) {
			setButtonState(BUTTON_STATES.approving);
			try {
				const tx = await erc20_contract.functions.approve(spender, parsedAmountA);
				if (tx) {
					canTx = true;
				}
			} catch (e) {
				setFailedTxn();
			}
		} else {
			canTx = true;
		}

		if (!canTx) {
			return;
		}
		const selectedTokenAddress =
			!token?.symbol || (token?.symbol && token?.symbol.toUpperCase() === "ETH")
				? "0x0000000000000000000000000000000000000000"
				// @ts-ignore
				: token?.address;

		setButtonState(BUTTON_STATES.create_tx);

		let method: (...args: any) => Promise<TransactionResponse>, args: Array<string | string[] | number>;
		let estimate =
			type === "Balancer"
				? router.estimateGas.EasyZapOut
				: selectedOption === "pair"
				? router.estimateGas.ZapOut2PairToken
				: router.estimateGas.ZapOut;
		method =
			type === "Balancer"
				? router.EasyZapOut
				: selectedOption === "pair"
				? router.ZapOut2PairToken
				: router.ZapOut;
		args = [];
		if (type && type.toLowerCase() === "curve") {
			args = [account, pool.address, parsedAmountA, selectedTokenAddress, 0];
		} else if (type && type.toLowerCase() === "balancer") {
			args = [selectedTokenAddress, pool.address, parsedAmountA, 0];
		} else if (type && type.toLowerCase() === "yearn") {
			args = [account, selectedTokenAddress, pool.address, 2, parsedAmountA, 0];
		} else {
			if (selectedOption === "pair") {
				args = [pool.address, parsedAmountA];
			} else {
				args = [selectedTokenAddress, pool.address, parsedAmountA, 0];
			}
		}

		setAttemptingTxn(true);

		setButtonState(BUTTON_STATES.send_tx);
		const selectedGas = gasPrice.find((item) => item[0] === selectedGasPrice);
		let gasEstimatedPrice = 0;
		if (selectedGas) {
			gasEstimatedPrice = selectedGas[1] * 10 ** 9;
		}

		const gas = await estimate(...args).catch((e) => {
			setFailedTxn();
			setAttemptingTxn(false);
		});
		await method(...args, {
			gasLimit: calculateGasMargin(gas || BigNumber.from(0)),
			gasPrice: gasEstimatedPrice,
		})
			.then((response) => {
				setButtonState(BUTTON_STATES.submitted);
				setAttemptingTxn(false);

				addTransaction(response, {
					summary: "Withdraw " + parsedAmountA + " " + pool?.poolName,
				});

				setTimeout(() => {
					setButtonState(BUTTON_STATES.not_started);
				}, 3000);
				setTxHash(response.hash);
			})
			.catch((error) => {
				setAttemptingTxn(false);
				setFailedTxn();
				// we only care if the error is something _other_ than the user rejected the tx
				if (error?.code !== 4001) {
					console.error(error);
				}
			});
	}

	useEffect(() => {
		dispatch(getGasPrice());
	}, [dispatch]);

	const selectCurrencyHandler = useCallback(
		(e) => {
			setToken(e);
		},
		[setToken]
	);

	const modalHeader = () => {
		return (
			<HeaderAutoColumn>
				<div className={"d-flex align-items-center align-items-xl-end"}>
					<ConfirmationText marginRight={10}>{amount}</ConfirmationText>
					<div className={"d-flex align-items-center"}>
						<PlatformLogo platform={type} name={pool?.poolName} size={36} />
					</div>
				</div>
				<HeaderCurrencyText>{pool?.poolName + " Pool Tokens"}</HeaderCurrencyText>
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
			<>
				<RowBetween>
					<TYPE.Body>{pool?.poolName} Pool Token</TYPE.Body>
					<RowFixed>
						<PlatformLogo platform={type} name={pool?.poolName} size={24} style={{ marginRight: "8px" }} />
					</RowFixed>
				</RowBetween>
				<RowBetween>
					<TYPE.Body>Ethereum Output</TYPE.Body>
					<RowFixed>
						<CurrencyLogo currency={ETHER} size={24} />
					</RowFixed>
				</RowBetween>
				<Button
					variant={"primary"}
					className={"py-3 font-weight-bolder font-size-lg"}
					style={{ margin: "20px 0 0 0", maxHeight: 56 }}
					onClick={onRemove}
				>
					{buttonState}
				</Button>
			</>
		);
	};

	const hideModal = () => {
		dispatch(clearSelectedPool());
		history.push("/invest/pools");
	};

	const pendingText = `Withdrawing ${amount} ${pool?.poolName}`;

	const handleDismissConfirmation = useCallback(() => {
		setShowConfirm(false);
		setTxHash("");
	}, []);

	const onFieldAInput = useCallback((value) => {
		setAmount(value);
	}, []);

	return (
		<>
			<Modal
				show={true}
				onHide={hideModal}
				dialogClassName={"custom-modal"}
				backdropClassName={"backdrop"}
				size={"lg"}
				centered={true}
			>
				<Modal.Body style={{ padding: !showConfirm ? "30px" : "0" }}>
					{!account ? (
						<Row>
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
							<Col xs={12} className={"gutter-b"}>
								<PoolInput
									value={amount}
									onUserInput={onFieldAInput}
									onMax={() => {
										onFieldAInput(selectedCurrencyBalance ?? "");
									}}
									type={type}
									disableCurrencySelect={true}
									showMaxButton={true}
									pool={pool}
									label={t("pools.selectedPool")}
									id="pool-input"
								/>
							</Col>
							<Col xs={12} className={"d-none d-xl-flex"}>
								<LightCard padding={"0"} borderRadius={"18px"} style={{ marginBottom: 20 }}>
									<PriceTopbar>
										{t("pools.willReceive")} ({t("only")} ETH {t("or")} ERC-20)
									</PriceTopbar>

									<PlatformControl>
										<Row>
											{type === "Uniswap" && (
												<Col xs={12}>
													<Check
														type={"radio"}
														id={`withdraw-pair`}
														className={"d-flex align-items-center py-2 ml-2"}
														custom
													>
														<Check.Input
															type={"radio"}
															name={"withdraw"}
															checked={selectedOption === "pair"}
															onChange={() => setSelectedOption("pair")}
														/>
														<Check.Label
															className={"d-flex flex-column pl-2 wallet-modal__label"}
														>
															<div
																className={"font-weight-bold"}
																style={{ marginTop: ".375rem" }}
															>
																{t("pools.inDepositedTokens")}
															</div>
														</Check.Label>
													</Check>
													<Check
														type={"radio"}
														id={`withdraw-token`}
														className={"d-flex align-items-center py-2 ml-2"}
														custom
													>
														<Check.Input
															type={"radio"}
															name={"withdraw"}
															checked={selectedOption === "custom"}
															onChange={() => setSelectedOption("custom")}
														/>
														<Check.Label
															className={"d-flex flex-column pl-2 wallet-modal__label"}
														>
															<div
																className={"font-weight-bold"}
																style={{ marginTop: ".375rem" }}
															>
																{t("pools.inCustomToken")}
															</div>
														</Check.Label>
													</Check>
												</Col>
											)}
											{(type !== "Uniswap" ||
												(type === "Uniswap" && selectedOption === "custom")) && (
												<Col xs={12} style={{ marginTop: 20 }}>
													<TokenSelector
														currency={token}
														onCurrencySelect={selectCurrencyHandler}
														showMaxButton={true}
														otherCurrency={null}
														showCommonBases={true}
														id={"withdraw-token"}
														label={t("output")}
													/>
												</Col>
											)}
										</Row>
									</PlatformControl>
								</LightCard>
							</Col>

							<Col xs={12} className={"d-flex d-xl-none flex-column"}>
								<div className={"d-flex flex-column"}>
									<PlatformLabel>{t("pools.willReceive")}</PlatformLabel>

									<PlatformControl>
										{type === "Uniswap" && (
											<div>
												<Check
													type={"radio"}
													id={`withdraw-pair-mobile`}
													className={"d-flex align-items-center py-2 ml-2"}
													custom
												>
													<Check.Input
														type={"radio"}
														name={"withdraw-mobile"}
														checked={selectedOption === "pair"}
														onChange={() => setSelectedOption("pair")}
													/>
													<Check.Label
														className={"d-flex flex-column pl-2 wallet-modal__label"}
													>
														<div
															className={"font-weight-bold"}
															style={{ marginTop: ".375rem" }}
														>
															{t("pools.inDepositedTokens")}
														</div>
													</Check.Label>
												</Check>
												<Check
													type={"radio"}
													id={`withdraw-token-mobile`}
													className={"d-flex align-items-center py-2 ml-2"}
													custom
												>
													<Check.Input
														type={"radio"}
														name={"withdraw-mobile"}
														checked={selectedOption === "custom"}
														onChange={() => setSelectedOption("custom")}
													/>
													<Check.Label
														className={"d-flex flex-column pl-2 wallet-modal__label"}
													>
														<div
															className={"font-weight-bold"}
															style={{ marginTop: ".375rem" }}
														>
															{t("pools.inCustomToken")}
														</div>
													</Check.Label>
												</Check>
											</div>
										)}
										{(type !== "Uniswap" ||
											(type === "Uniswap" && selectedOption === "custom")) && (
											<div style={{ marginTop: 20 }}>
												<TokenSelector
													currency={token}
													onCurrencySelect={selectCurrencyHandler}
													showMaxButton={true}
													otherCurrency={null}
													showCommonBases={true}
													id={"withdraw-token-mobile"}
													label={t("output")}
												/>
											</div>
										)}
									</PlatformControl>
								</div>
							</Col>

							<Col xs={12} className={"gutter-b"}>
								<LightCard padding={"0"} borderRadius={"18px"} style={{ marginBottom: 20 }}>
									<PriceTopbar>{t("pools.selectGasSetting")}</PriceTopbar>
									<GasPrice gasList={gasPrice} selected={selectedGasPrice} />
								</LightCard>
							</Col>
							<Col
								xs={12}
								className={
									"d-flex flex-column align-items-stretch align-items-xl-center justify-content-center"
								}
								style={{ paddingTop: 30 }}
							>
								{!account ? (
									<Button
										style={{ minWidth: 250 }}
										variant={"outline-primary"}
										disabled
										className={"py-3 font-size-lg font-weight-bolder"}
									>
										Connect to your wallet
									</Button>
								) : (
									<Button
										onClick={() => {
											if (
												approve === ApprovalState.NOT_APPROVED ||
												approve === ApprovalState.UNKNOWN
											) {
												getApprove();
											} else if (approve === ApprovalState.PENDING) {
												return;
											} else {
												setShowConfirm(true);
											}
										}}
										style={{ minWidth: 250 }}
										disabled={
											!amount ||
											Number(selectedCurrencyBalance) < Number(amount) ||
											approve === ApprovalState.PENDING ||
											Number(amount) === 0
										}
										variant={
											!amount || Number(selectedCurrencyBalance) < Number(amount)
												? "outline-primary"
												: "primary"
										}
										className={`${
											!!amount ||
											Number(selectedCurrencyBalance) >= Number(amount) ||
											Number(amount) === 0
												? "outline-primary"
												: ""
										} py-3`}
									>
										<span className="font-weight-bold font-size-lg">
											{!amount || Number(amount) === 0
												? t("exchange.enterAmount")
												: Number(selectedCurrencyBalance) < Number(amount)
												? t("insufficientBalance")
												: approve === ApprovalState.NOT_APPROVED ||
												  approve === ApprovalState.UNKNOWN
												? t("approve")
												: approve === ApprovalState.PENDING
												? t("pending")
												: t("pools.withdraw")}
										</span>
									</Button>
								)}
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
							title={t("pools.willPay")}
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
