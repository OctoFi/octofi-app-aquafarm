import { useCallback, useEffect, useMemo, useState } from "react";
import { CurrencyAmount, JSBI, Token, Trade } from "@uniswap/sdk";
import { Row, Col, Button } from "react-bootstrap";
import SVG from "react-inlinesvg";
import { ArrowDown, ArrowUpRight } from "react-feather";
import { useTranslation } from "react-i18next";

import ConfirmSwapModal from "./swap/ConfirmSwapModal";
import CurrencyInputPanel from "../CurrencyInputPanel";
import AdvancedSwapDetailsDropdown from "./swap/AdvancedSwapDetailsDropdown";
import confirmPriceImpactWithoutFee from "./swap/confirmPriceImpactWithoutFee";
import { Wrapper, ArrowWrapper } from "./swap/styleds";
import Loader from "../Loader";
import TokenWarningModal from "../TokenWarningModal";

import { useActiveWeb3React } from "../../hooks";
import { useCurrency } from "../../hooks/Tokens";
import { ApprovalState, useApproveCallbackFromTrade } from "../../hooks/useApproveCallback";
import useENSAddress from "../../hooks/useENSAddress";
import { useSwapCallback } from "../../hooks/useSwapCallback";
import useToggledVersion, { Version } from "../../hooks/useToggledVersion";
import useWrapCallback, { WrapType } from "../../hooks/useWrapCallback";
import { useWalletModalToggle } from "../../state/application/hooks";
import { Field } from "../../state/swap/actions";
import {
	useDefaultsFromURLSearch,
	useDerivedSwapInfo,
	useSwapActionHandlers,
	useSwapState,
} from "../../state/swap/hooks";
import { useExpertModeManager, useUserSlippageTolerance } from "../../state/user/hooks";
import { maxAmountSpend } from "../../utils/maxAmountSpend";
import { computeTradePriceBreakdown, warningSeverity } from "../../utils/prices";
import TradePrice from "./swap/TradePrice";
import SwapHeader from "../SwapHeader";
import useTheme from "../../hooks/useTheme";
import ArrowRightLongIcon from "../../assets/images/global/arrow-right-long.svg";
import ArrowDownLongIcon from "../../assets/images/global/arrow-down-long.svg";
import { CustomCard, ApproveArrow, StyledClickableText, SwitchCol } from "./styles";

const Uniswap = (props: any) => {
	const loadedUrlParams = useDefaultsFromURLSearch();
	const { t } = useTranslation();
	const theme = useTheme();

	// token warning stuff
	const [loadedInputCurrency, loadedOutputCurrency] = [
		useCurrency(loadedUrlParams?.inputCurrencyId),
		useCurrency(loadedUrlParams?.outputCurrencyId),
	];
	const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false);
	const urlLoadedTokens: Token[] = useMemo(
		() => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c instanceof Token) ?? [],
		[loadedInputCurrency, loadedOutputCurrency]
	);
	const handleConfirmTokenWarning = useCallback(() => {
		setDismissTokenWarning(true);
	}, []);

	const { account } = useActiveWeb3React();

	const [showInverted, setShowInverted] = useState<boolean>(false);

	// toggle wallet when disconnected
	const toggleWalletModal = useWalletModalToggle();

	// for expert mode
	const [isExpertMode] = useExpertModeManager();

	// get custom setting values for user
	const [allowedSlippage] = useUserSlippageTolerance();

	// swap state
	const { independentField, typedValue, recipient } = useSwapState();
	const {
		v1Trade,
		v2Trade,
		currencyBalances,
		parsedAmount,
		currencies,
		inputError: swapInputError,
	} = useDerivedSwapInfo();
	const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
		currencies[Field.INPUT],
		currencies[Field.OUTPUT],
		typedValue
	);
	const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;
	const { address: recipientAddress } = useENSAddress(recipient);
	const toggledVersion = useToggledVersion();
	const tradesByVersion = {
		[Version.v1]: v1Trade,
		[Version.v2]: v2Trade,
	};
	const trade = showWrap ? undefined : tradesByVersion[toggledVersion];

	const parsedAmounts = showWrap
		? {
				[Field.INPUT]: parsedAmount,
				[Field.OUTPUT]: parsedAmount,
		  }
		: {
				[Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
				[Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
		  };

	const { onCurrencySelection, onUserInput, onSwitchTokens } = useSwapActionHandlers();
	const isValid = !swapInputError;
	const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT;

	const handleTypeInput = useCallback(
		(value: string) => {
			onUserInput(Field.INPUT, value);
		},
		[onUserInput]
	);
	const handleTypeOutput = useCallback(
		(value: string) => {
			onUserInput(Field.OUTPUT, value);
		},
		[onUserInput]
	);

	// modal and loading
	const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
		showConfirm: boolean;
		tradeToConfirm: Trade | undefined;
		attemptingTxn: boolean;
		swapErrorMessage: string | undefined;
		txHash: string | undefined;
	}>({
		showConfirm: false,
		tradeToConfirm: undefined,
		attemptingTxn: false,
		swapErrorMessage: undefined,
		txHash: undefined,
	});

	const formattedAmounts = {
		[independentField]: typedValue,
		[dependentField]: showWrap
			? parsedAmounts[independentField]?.toExact() ?? ""
			: parsedAmounts[dependentField]?.toSignificant(6) ?? "",
	};

	const route = trade?.route;
	const userHasSpecifiedInputOutput = Boolean(
		currencies[Field.INPUT] &&
			currencies[Field.OUTPUT] &&
			parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
	);
	const noRoute = !route;

	// check whether the user has approved the router on the input token
	const [approval, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage);

	// check if user has gone through approval process, used to show two step buttons, reset on token change
	const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false);

	// mark when a user has submitted an approval, reset onTokenSelection for input field
	useEffect(() => {
		if (approval === ApprovalState.PENDING) {
			setApprovalSubmitted(true);
		}
	}, [approval, approvalSubmitted]);

	const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT]);
	const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput));

	// the callback to execute the swap
	const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(trade, allowedSlippage, recipient);

	const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade);

	const handleSwap = useCallback(() => {
		if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
			return;
		}
		if (!swapCallback) {
			return;
		}
		setSwapState({
			attemptingTxn: true,
			tradeToConfirm,
			showConfirm,
			swapErrorMessage: undefined,
			txHash: undefined,
		});
		swapCallback()
			.then((hash) => {
				setSwapState({
					attemptingTxn: false,
					tradeToConfirm,
					showConfirm,
					swapErrorMessage: undefined,
					txHash: hash,
				});
			})
			.catch((error) => {
				setSwapState({
					attemptingTxn: false,
					tradeToConfirm,
					showConfirm,
					swapErrorMessage: error.message,
					txHash: undefined,
				});
			});
	}, [tradeToConfirm, account, priceImpactWithoutFee, recipient, recipientAddress, showConfirm, swapCallback, trade]);

	// warnings on slippage
	const priceImpactSeverity = warningSeverity(priceImpactWithoutFee);

	// show approve flow when: no error on inputs, not approved or pending, or approved in current session
	// never show if price impact is above threshold in non expert mode
	const showApproveFlow =
		!swapInputError &&
		(approval === ApprovalState.NOT_APPROVED ||
			approval === ApprovalState.PENDING ||
			(approvalSubmitted && approval === ApprovalState.APPROVED)) &&
		!(priceImpactSeverity > 3 && !isExpertMode);

	const handleConfirmDismiss = useCallback(() => {
		setSwapState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash });
		// if there was a tx hash, we want to clear the input
		if (txHash) {
			onUserInput(Field.INPUT, "");
		}
	}, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash]);

	const handleAcceptChanges = useCallback(() => {
		setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn, showConfirm });
	}, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash]);

	const handleInputSelect = useCallback(
		(inputCurrency) => {
			setApprovalSubmitted(false); // reset 2 step UI for approvals
			onCurrencySelection(Field.INPUT, inputCurrency);
		},
		[onCurrencySelection]
	);

	const handleMaxInput = useCallback(() => {
		maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact());
	}, [maxAmountInput, onUserInput]);

	const handleOutputSelect = useCallback((outputCurrency) => onCurrencySelection(Field.OUTPUT, outputCurrency), [
		onCurrencySelection,
	]);

	return (
		<div>
			<TokenWarningModal
				isOpen={urlLoadedTokens.length > 0 && !dismissTokenWarning}
				tokens={urlLoadedTokens}
				onConfirm={handleConfirmTokenWarning}
			/>

			<CustomCard>
				<Wrapper>
					<div>
						<SwapHeader />

						<CurrencyInputPanel
							label={
								independentField === Field.OUTPUT && !showWrap && trade
									? `${t("from")} (${t("estimated")})`
									: t("from")
							}
							value={formattedAmounts[Field.INPUT]}
							showMaxButton={!atMaxAmountInput}
							currency={currencies[Field.INPUT]}
							onUserInput={handleTypeInput}
							onMax={handleMaxInput}
							onCurrencySelect={handleInputSelect}
							otherCurrency={currencies[Field.OUTPUT]}
							id="swap-currency-input"
							withoutMargin={true}
						/>

						<SwitchCol>
							<ArrowWrapper clickable>
								<ArrowDown
									size="16"
									onClick={() => {
										setApprovalSubmitted(false); // reset 2 step UI for approvals
										onSwitchTokens();
									}}
									color={theme.text2}
								/>
							</ArrowWrapper>
						</SwitchCol>

						<CurrencyInputPanel
							value={formattedAmounts[Field.OUTPUT]}
							onUserInput={handleTypeOutput}
							label={
								independentField === Field.INPUT && !showWrap && trade
									? `${t("to")} (${t("estimated")})`
									: t("to")
							}
							showMaxButton={false}
							currency={currencies[Field.OUTPUT]}
							onCurrencySelect={handleOutputSelect}
							otherCurrency={currencies[Field.INPUT]}
							id="swap-currency-output"
							withoutMargin={true}
						/>

						{showWrap ? null : (
							<>
								{Boolean(trade) && (
									<div className="d-flex justify-content-between align-items-center p-3">
										<StyledClickableText fontWeight={500} fontSize={14}>
											{t("price")}
										</StyledClickableText>
										<TradePrice
											price={trade?.executionPrice}
											showInverted={showInverted}
											setShowInverted={setShowInverted}
										/>
									</div>
								)}
							</>
						)}

						{trade && <AdvancedSwapDetailsDropdown trade={trade} />}

						<div
							className="d-flex flex-column align-items-stretch align-items-lg-center justify-content-center mb-lg-0 mt-4"
							style={{ marginBottom: !trade ? "50px" : "0" }}
						>
							{!account ? (
								<Button variant={"outline-primary"} onClick={toggleWalletModal}>
									{t("wallet.connect")}
								</Button>
							) : showWrap ? (
								<Button
									variant={Boolean(wrapInputError) ? "outline-primary" : "primary"}
									disabled={Boolean(wrapInputError)}
									onClick={onWrap}
								>
									{wrapInputError ??
										(wrapType === WrapType.WRAP
											? "Wrap"
											: wrapType === WrapType.UNWRAP
											? "Unwrap"
											: null)}
								</Button>
							) : noRoute && userHasSpecifiedInputOutput ? (
								<Button variant={"outline-primary"} disabled={true} className={"mb-2 font-weight-bold"}>
									{t("insufficientLiquidity")}
								</Button>
							) : showApproveFlow ? (
								<Row className={"flex-grow-1"}>
									<Col
										xs={12}
										className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center justify-content-between"
									>
										<Button
											onClick={approveCallback}
											disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
											className={`flex-grow-1 btn ${
												approval === ApprovalState.PENDING
													? "btn-light-secondary"
													: "btn-secondary-light"
											}`}
										>
											{approval === ApprovalState.PENDING ? (
												<div className={"d-flex justify-content-center align-items-center"}>
													{t("approving")} <Loader stroke="white" />
												</div>
											) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
												t("approved")
											) : (
												t("approve") + currencies[Field.INPUT]?.symbol
											)}
										</Button>
										<ApproveArrow className={"d-none d-lg-block"}>
											<SVG src={ArrowRightLongIcon} />
										</ApproveArrow>
										<ApproveArrow className={"d-block d-lg-none"}>
											<SVG src={ArrowDownLongIcon} />
										</ApproveArrow>
										<Button
											onClick={() => {
												if (isExpertMode) {
													handleSwap();
												} else {
													setSwapState({
														tradeToConfirm: trade,
														attemptingTxn: false,
														swapErrorMessage: undefined,
														showConfirm: true,
														txHash: undefined,
													});
												}
											}}
											id="swap-button"
											disabled={
												!isValid ||
												approval !== ApprovalState.APPROVED ||
												(priceImpactSeverity > 3 && !isExpertMode)
											}
											variant={"outline-secondary-light"}
											className={"flex-grow-1"}
										>
											<span className={"font-weight-medium"}>
												{priceImpactSeverity > 3 && !isExpertMode
													? t("impactHigh")
													: priceImpactSeverity > 2
													? t("swapAnyway")
													: t("swap")}
											</span>
										</Button>
									</Col>
								</Row>
							) : (
								<Button
									block={
										!(!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError)
									}
									onClick={() => {
										if (isExpertMode) {
											handleSwap();
										} else {
											setSwapState({
												tradeToConfirm: trade,
												attemptingTxn: false,
												swapErrorMessage: undefined,
												showConfirm: true,
												txHash: undefined,
											});
										}
									}}
									id="swap-button"
									disabled={
										!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError
									}
									variant={"primary"}
								>
									<span className={"font-weight-medium"}>
										{swapInputError
											? swapInputError
											: priceImpactSeverity > 3 && !isExpertMode
											? t("impactHigh")
											: priceImpactSeverity > 2
											? t("swapAnyway")
											: t("swap")}
									</span>
								</Button>
							)}
						</div>
					</div>

					{trade && (
						<div className="d-flex flex-column align-items-stretch align-items-lg-center justify-content-center mt-3">
							<Button
								href={"https://uniswap.info/pair/" + trade.route.pairs[0].liquidityToken.address}
								target="_blank"
								variant="outline-primary"
								size="lg"
							>
								{t("viewPairAnalytics")} <ArrowUpRight size={18} />
							</Button>
						</div>
					)}

					<ConfirmSwapModal
						isOpen={showConfirm}
						trade={trade}
						originalTrade={tradeToConfirm}
						onAcceptChanges={handleAcceptChanges}
						attemptingTxn={attemptingTxn}
						txHash={txHash}
						recipient={recipient}
						allowedSlippage={allowedSlippage}
						onConfirm={handleSwap}
						swapErrorMessage={swapErrorMessage}
						onDismiss={handleConfirmDismiss}
					/>
				</Wrapper>
			</CustomCard>
		</div>
	);
};

export default Uniswap;
