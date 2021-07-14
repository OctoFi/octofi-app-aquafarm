import styled from "styled-components";
import { Row, Col, Button as BS, ListGroup } from "react-bootstrap";
import SVG from "react-inlinesvg";
import { ETHER } from "@uniswap/sdk";
import { useCallback, useEffect, useReducer, useState } from "react";

import EXCHANGE_ABI from "../../constants/abis/exchange.json";
import Page from "../../components/Page";
import DefaultCard from "../../components/Card";
import BridgeInputPanel from "../../components/BridgeInputPanel";
import SwapIcon from "../../assets/images/cross/swap.svg";
import AddressInputPanel from "../../components/AddressInputPanel";
import BigNumber from "bignumber.js";
import { brokenTokens, ZERO } from "../../constants";
import getNetConfig from "../../config";
import { useTranslation } from "react-i18next";
import { useActiveWeb3React } from "../../hooks";
import { useBetaMessageManager } from "../../contexts/LocalStorage";
import { amountFormatter, getAllQueryParams, useExchangeContract } from "../../utils/cross";
import { useTransactionAdder } from "../../state/transactions/hooks";
import { INITIAL_TOKENS_CONTEXT, useTokenDetails } from "../../contexts/Tokens";
import { useAddressAllowance } from "../../contexts/Allowances";
import { useAddressBalance, useExchangeReserves } from "../../contexts/Balances";
import { ethers } from "ethers";
import { getWeb3BaseInfo, getWeb3ConTract } from "../../utils/web3/txns";
import { recordTxns } from "../../utils/record";
import { isAddress } from "../../utils";
import { useWalletModalToggle } from "../../state/application/hooks";
import HardwareTip from "../../components/HardwareTips";
import { Modal as BSModal } from "../../components/Modal/bootstrap";
import WarningTip from "../../components/WarningTip";
import { toast } from "react-hot-toast";

const config = getNetConfig();

// const BridgeType = {
// 	"SWAP": "SWAP",
// 	"SEND": "SEND"
// }

const Modal = styled(BSModal)`
	& .modal-dialog {
		max-width: 800px;
	}

	& .modal-body {
		padding: 20px 30px 30px;
	}
	& .modal-header {
		padding: 30px;
	}
`;

const TabButton = styled(BS)`
	min-height: 48px;
	height: 48px;
	border-radius: 18px;
	font-weight: 500;
	font-size: 1rem;
	min-width: 127px;

	@media (max-width: 991px) {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 1;
		font-size: 0.875rem;
		min-height: 40px;
		height: 40px;
		padding: 0;
		border-radius: 12px;
		min-width: 105px;
	}
`;

const Button = styled(BS)`
	min-height: 48px;
	height: 48px;
	min-width: 205px;
`;

// const AlertButton = styled(BS)`
//   min-height: 48px;
//   height: 48px;
//   border-radius: 18px;
//   font-weight: 500;
//   min-width: 105px;
// `

const Title = styled.h1`
	margin: 0;
	font-size: 2.5rem;
	font-weight: 700;
	color: ${({ theme }) => theme.text1};
	line-height: 3rem;

	@media (max-width: 1199px) {
		font-size: 2.25rem;
	}
	@media (max-width: 991px) {
		font-size: 2rem;
		margin-bottom: 0.5rem;
	}
	@media (max-width: 767px) {
		font-size: 1.5rem;
	}
`;

const Header = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20px;
	margin-top: 24px;

	@media (max-width: 991px) {
		margin-top: 10px;
		flex-direction: column;
		align-items: stretch;
	}
`;

const Card = styled(DefaultCard)`
	margin-bottom: 1rem;

	& > .card-body {
		padding: 36px 64px 24px;

		@media (max-width: 991px) {
			padding: 24px;
		}

		@media (max-width: 576px) {
			padding: 16px;
		}
	}
`;

// const SlippageCard = styled(DefaultCard)`
//   margin-bottom: 1rem;

//   & > .card-body {
//     padding: 0 64px;
//     min-height: 56px;

//     @media (max-width: 991px) {
//       padding: 0 24px;
//     }

//     @media (max-width: 576px) {
//       padding: 0 16px;
//     }
//   }
// `

const TabHeader = styled.div`
	display: grid;
	grid-column-gap: 25px;
	grid-template-columns: 127px 127px;
	border-radius: 20px;

	@media (max-width: 991px) {
		padding: 8px;
		background-color: ${({ theme }) => theme.modalBG};
		grid-template-columns: 1fr 1fr;
		grid-column-gap: 16px;
		border: 1px solid ${({ theme }) => theme.borderColor};
	}

	@media (max-width: 576px) {
		grid-template-columns: 1fr;
		grid-row-gap: 12px;
		grid-column-gap: 0;
	}
`;

const SwapCurrencies = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 12px;
	cursor: pointer;

	@media (max-width: 576px) {
		padding: 8px;
	}
`;

const SubmitButtonContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	margin-top: 32px;

	@media (max-width: 1199px) {
		margin-top: 28px;
	}

	@media (max-width: 991px) {
		margin-top: 24px;
	}

	@media (max-width: 767px) {
		margin-top: 16px;
		align-items: stretch;
	}
`;

// const AlertContainer = styled.div`
//   border-radius: 18px;
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
//   padding: 4px 4px 4px 64px;
//   background-color: ${({ theme }) => theme.primaryLight};

//   @media (max-width: 1199px) {
//     padding-left: 48px;
//   }

//   @media (max-width: 991px) {
//     padding-left: 36px;
//   }

//   @media (max-width: 767px) {
//     padding-left: 16px;
//   }
// `

// const AlertText = styled.span`
//   font-weight: 500;
//   font-size: 1rem;
//   color: ${({ theme }) => theme.primary};
//   line-height: 21px;
//   padding-right: 1rem;
// `

const TransactionInfo = styled.div`
	padding: 0 0 1.5625rem;
	border-bottom: 0.0625rem solid ${({ theme }) => theme.text3};
	@media screen and (max-width: 960px) {
		padding: 0 0.625rem 0.625rem;
		height: auto;
	}
`;

const LastSummaryText = styled.div`
	display: flex;
	justify-content: flex-start;
	align-items: center;
	font-size: 0.75rem;
	font-weight: normal;
	font-stretch: normal;
	font-style: normal;
	line-height: 1.17;
	letter-spacing: normal;
	color: ${({ theme }) => theme.text1};
	height: 32px;
	margin-bottom: 0.625rem;

	.icon {
		width: 32px;
		height: 32px;
		padding: 8px;
		object-fit: contain;
		border: solid 0.5px ${({ theme }) => theme.text2};
		background-color: ${({ theme }) => theme.text2};
		border-radius: 100%;
		margin-right: 0.625rem;

		img {
			height: 100%;
			display: block;
		}
	}
`;

const ValueWrapper = styled.span`
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 0.375rem 0.3rem 0.375rem 0.3rem;
	background-color: ${({ theme }) => theme.bg1};
	border-radius: 1rem;
	font-variant: tabular-nums;
`;

const INPUT = 0;
const OUTPUT = 1;
const ETH_TO_TOKEN = 0;
const TOKEN_TO_ETH = 1;
const TOKEN_TO_TOKEN = 2;

// denominated in bips
const ALLOWED_SLIPPAGE_DEFAULT = 50;
const TOKEN_ALLOWED_SLIPPAGE_DEFAULT = 50;

// 15 minutes, denominated in seconds
const DEFAULT_DEADLINE_FROM_NOW = 60 * 15;

// % above the calculated gas cost that we actually send, denominated in bips
const GAS_MARGIN = new BigNumber(1000);

function calculateSlippageBounds(value, token = false, tokenAllowedSlippage, allowedSlippage) {
	if (value) {
		const offset = value.times(token ? tokenAllowedSlippage : allowedSlippage).dividedBy(new BigNumber(10000));
		const minimum = value.minus(offset);
		const maximum = value.plus(offset);
		return {
			minimum: minimum.lt(ZERO) ? ZERO : new BigNumber(minimum.toFixed(0)),
			maximum: maximum.gt(new BigNumber(2).pow(256))
				? new BigNumber(2).pow(256)
				: new BigNumber(maximum.toFixed(0)),
		};
	} else {
		return {};
	}
}

function getSwapType(inputCurrency, outputCurrency) {
	if (!inputCurrency || !outputCurrency) {
		return null;
	} else if (inputCurrency === config.symbol) {
		return ETH_TO_TOKEN;
	} else if (outputCurrency === config.symbol) {
		return TOKEN_TO_ETH;
	} else {
		return TOKEN_TO_TOKEN;
	}
}

// this mocks the getInputPrice function, and calculates the required output
function calculateEtherTokenOutputFromInput(inputAmount, inputReserve, outputReserve) {
	const inputAmountWithFee = inputAmount.times(new BigNumber(997));
	const numerator = inputAmountWithFee.times(outputReserve);
	const denominator = inputReserve.times(new BigNumber(1000)).plus(inputAmountWithFee);
	return numerator.dividedBy(denominator);
}

// this mocks the getOutputPrice function, and calculates the required input
function calculateEtherTokenInputFromOutput(outputAmount, inputReserve, outputReserve) {
	const numerator = inputReserve.times(outputAmount).times(new BigNumber(1000));
	const denominator = outputReserve.minus(outputAmount).times(new BigNumber(997));
	return numerator.dividedBy(denominator).plus(new BigNumber(1));
}

function getInitialSwapState(state) {
	return {
		independentValue: state.exactFieldURL && state.exactAmountURL ? state.exactAmountURL : "", // this is a user input
		dependentValue: "", // this is a calculated number
		independentField: state.exactFieldURL === "output" ? OUTPUT : INPUT,
		inputCurrency: state.inputCurrencyURL
			? state.inputCurrencyURL
			: state.outputCurrencyURL === config.symbol
			? ""
			: config.symbol,
		outputCurrency: state.outputCurrencyURL
			? state.outputCurrencyURL === config.symbol
				? !state.inputCurrencyURL || (state.inputCurrencyURL && state.inputCurrencyURL !== config.symbol)
					? config.symbol
					: ""
				: state.outputCurrencyURL
			: state.initialCurrency
			? state.initialCurrency
			: config.initToken,
	};
}

function swapStateReducer(state, action) {
	switch (action.type) {
		case "FLIP_INDEPENDENT": {
			const { independentField, inputCurrency, outputCurrency } = state;
			return {
				...state,
				dependentValue: "",
				independentField: independentField === INPUT ? OUTPUT : INPUT,
				inputCurrency: outputCurrency,
				outputCurrency: inputCurrency,
			};
		}
		case "SELECT_CURRENCY": {
			const { inputCurrency, outputCurrency } = state;
			const { field, currency } = action.payload;

			const newInputCurrency = field === INPUT ? currency : inputCurrency;
			const newOutputCurrency = field === OUTPUT ? currency : outputCurrency;

			if (newInputCurrency === newOutputCurrency) {
				return {
					...state,
					inputCurrency: field === INPUT ? currency : "",
					outputCurrency: field === OUTPUT ? currency : "",
				};
			} else {
				return {
					...state,
					inputCurrency: newInputCurrency,
					outputCurrency: newOutputCurrency,
				};
			}
		}
		case "UPDATE_INDEPENDENT": {
			const { field, value } = action.payload;
			const { dependentValue, independentValue } = state;
			return {
				...state,
				independentValue: value,
				dependentValue: value === independentValue ? dependentValue : "",
				independentField: field,
			};
		}
		case "UPDATE_DEPENDENT": {
			return {
				...state,
				dependentValue: action.payload,
			};
		}
		default: {
			return getInitialSwapState();
		}
	}
}

function getExchangeRate(inputValue, inputDecimals, outputValue, outputDecimals, invert = false) {
	try {
		if (
			inputValue &&
			(inputDecimals || inputDecimals === 0) &&
			outputValue &&
			(outputDecimals || outputDecimals === 0)
		) {
			const factor = new BigNumber(10).pow(new BigNumber(18));
			if (invert) {
				return inputValue
					.times(factor)
					.times(new BigNumber(10).pow(new BigNumber(outputDecimals)))
					.dividedBy(new BigNumber(10).pow(new BigNumber(inputDecimals)))
					.dividedBy(outputValue);
			} else {
				return outputValue
					.times(factor)
					.times(new BigNumber(10).pow(new BigNumber(inputDecimals)))
					.dividedBy(new BigNumber(10).pow(new BigNumber(outputDecimals)))
					.dividedBy(inputValue);
			}
		}
	} catch {}
}

function calculateGasMargin(value, margin) {
	const offset = value.times(margin).dividedBy(new BigNumber(10000));
	return value.plus(offset);
}

function getMarketRate(
	swapType,
	inputReserveETH,
	inputReserveToken,
	inputDecimals,
	outputReserveETH,
	outputReserveToken,
	outputDecimals,
	invert = false
) {
	if (swapType === ETH_TO_TOKEN) {
		return getExchangeRate(outputReserveETH, 18, outputReserveToken, outputDecimals, invert);
	} else if (swapType === TOKEN_TO_ETH) {
		return getExchangeRate(inputReserveToken, inputDecimals, inputReserveETH, 18, invert);
	} else if (swapType === TOKEN_TO_TOKEN) {
		const factor = new BigNumber(10).pow(new BigNumber(18));
		const firstRate = getExchangeRate(inputReserveToken, inputDecimals, inputReserveETH, 18);
		const secondRate = getExchangeRate(outputReserveETH, 18, outputReserveToken, outputDecimals);
		try {
			return !!(firstRate && secondRate) ? firstRate.times(secondRate).dividedBy(factor) : undefined;
		} catch {}
	}
}

const CrossAnySwap = (props) => {
	// @todo: remove old data
	const [inputCurrencySwap, setInputCurrency] = useState(ETHER);
	const [outputCurrencySwap, setOutputCurrency] = useState(undefined);

	const { t } = useTranslation();
	const { account, chainId, error } = useActiveWeb3React();
	const [showBetaMessage] = useBetaMessageManager();
	let walletType = sessionStorage.getItem("walletType");

	let params = getAllQueryParams();
	params = params ? params : {};

	const urlAddedTokens = {};
	if (params && params.inputCurrency) {
		urlAddedTokens[params.inputCurrency] = true;
	}
	if (params && params.outputCurrency) {
		urlAddedTokens[params.outputCurrency] = true;
	}
	if (params && params.tokenAddress) {
		urlAddedTokens[params.tokenAddress] = true;
	}

	const addTransaction = useTransactionAdder();

	const initialSlippage = (token = false) => {
		let slippage = Number.parseInt(params.slippage);
		if (!isNaN(slippage) && (slippage === 0 || slippage >= 1)) {
			return slippage; // round to match custom input availability
		}
		// check for token <-> token slippage option
		return token ? TOKEN_ALLOWED_SLIPPAGE_DEFAULT : ALLOWED_SLIPPAGE_DEFAULT;
	};
	const initialRecipient = () => {
		if (sending && params.recipient) {
			return params.recipient;
		}
		return "";
	};

	const [sending, setSending] = useState(false);

	const [brokenTokenWarning, setBrokenTokenWarning] = useState();

	const [deadlineFromNow, setDeadlineFromNow] = useState(DEFAULT_DEADLINE_FROM_NOW);

	const [rawSlippage, setRawSlippage] = useState(() => initialSlippage());
	const [rawTokenSlippage, setRawTokenSlippage] = useState(() => initialSlippage(true));

	const [slippageView, setSlippageView] = useState(false);

	const allowedSlippageBig = new BigNumber(rawSlippage);
	const tokenAllowedSlippageBig = new BigNumber(rawTokenSlippage);

	const [swapState, dispatchSwapState] = useReducer(
		swapStateReducer,
		{
			initialCurrency: undefined,
			inputCurrencyURL: params.inputCurrency,
			outputCurrencyURL: params.outputCurrency || params.tokenAddress,
			exactFieldURL: params.exactField,
			exactAmountURL: params.exactAmount,
		},
		getInitialSwapState
	);

	const { independentValue, dependentValue, independentField, inputCurrency, outputCurrency } = swapState;

	useEffect(() => {
		setBrokenTokenWarning(false);
		for (let i = 0; i < brokenTokens.length; i++) {
			if (
				brokenTokens[i].toLowerCase() === outputCurrency.toLowerCase() ||
				brokenTokens[i].toLowerCase() === inputCurrency.toLowerCase()
			) {
				setBrokenTokenWarning(true);
			}
		}
	}, [outputCurrency, inputCurrency]);

	const [recipient, setRecipient] = useState({
		address: initialRecipient(),
		name: "",
	});
	const [recipientError, setRecipientError] = useState(null);

	// get swap type from the currency types
	const swapType = getSwapType(inputCurrency, outputCurrency);

	// get decimals and exchange address for each of the currency types
	const {
		symbol: inputSymbol,
		decimals: inputDecimals,
		exchangeAddress: inputExchangeAddress,
		isSwitch: inputIsSwitch,
	} = useTokenDetails(inputCurrency);
	const {
		symbol: outputSymbol,
		decimals: outputDecimals,
		exchangeAddress: outputExchangeAddress,
		isSwitch: outputIsSwitch,
	} = useTokenDetails(outputCurrency);

	const inputExchangeContract = useExchangeContract(inputExchangeAddress);
	const outputExchangeContract = useExchangeContract(outputExchangeAddress);
	const contract = swapType === ETH_TO_TOKEN ? outputExchangeContract : inputExchangeContract;

	// get input allowance
	const inputAllowance = useAddressAllowance(account, inputCurrency, inputExchangeAddress);

	// fetch reserves for each of the currency types
	const { reserveETH: inputReserveETH, reserveToken: inputReserveToken } = useExchangeReserves(inputCurrency);
	const { reserveETH: outputReserveETH, reserveToken: outputReserveToken } = useExchangeReserves(outputCurrency);

	// get balances for each of the currency types
	const inputBalance = useAddressBalance(account, inputCurrency);
	const outputBalance = useAddressBalance(account, outputCurrency);
	const inputBalanceFormatted = !!(inputBalance && Number.isInteger(inputDecimals))
		? amountFormatter(inputBalance, inputDecimals, Math.min(6, inputDecimals))
		: "";
	const outputBalanceFormatted = !!(outputBalance && Number.isInteger(outputDecimals))
		? amountFormatter(outputBalance, outputDecimals, Math.min(6, outputDecimals))
		: "";

	// compute useful transforms of the data above
	const independentDecimals = independentField === INPUT ? inputDecimals : outputDecimals;
	const dependentDecimals = independentField === OUTPUT ? inputDecimals : outputDecimals;

	// declare/get parsed and formatted versions of input/output values
	const [independentValueParsed, setIndependentValueParsed] = useState();
	const dependentValueFormatted = !!(dependentValue && (dependentDecimals || dependentDecimals === 0))
		? amountFormatter(dependentValue, dependentDecimals, dependentDecimals, false)
		: // ? amountFormatter(dependentValue, dependentDecimals, Math.min(6, dependentDecimals), false)
		  "";
	const inputValueParsed = independentField === INPUT ? independentValueParsed : dependentValue;
	const outputValueParsed = independentField === OUTPUT ? independentValueParsed : dependentValue;
	let inputValueFormatted = independentField === INPUT ? independentValue : dependentValueFormatted;
	let outputValueFormatted = independentField === OUTPUT ? independentValue : dependentValueFormatted;
	if (independentField) {
		inputValueFormatted *= 1 + 0.001;
		inputValueFormatted = Number(inputValueFormatted.toFixed(dependentDecimals))
			? Number(inputValueFormatted.toFixed(Math.min(8, dependentDecimals)))
			: "";
	} else {
		outputValueFormatted *= 1 - 0.001;
		outputValueFormatted = Number(outputValueFormatted.toFixed(dependentDecimals))
			? Number(outputValueFormatted.toFixed(Math.min(8, dependentDecimals)))
			: "";
	}
	// validate + parse independent value
	const [independentError, setIndependentError] = useState();
	useEffect(() => {
		if (independentValue && (independentDecimals || independentDecimals === 0)) {
			try {
				const parsedValue = new BigNumber(
					ethers.utils.parseUnits(independentValue, independentDecimals).toString()
				);

				if (
					parsedValue.lte(ethers.constants.Zero.toString()) ||
					parsedValue.gte(ethers.constants.MaxUint256.toString())
				) {
					throw Error();
				} else {
					setIndependentValueParsed(new BigNumber(parsedValue.toFixed(0)));
					setIndependentError(null);
				}
			} catch {
				setIndependentError(t("inputNotValid"));
			}

			return () => {
				setIndependentValueParsed();
				setIndependentError();
			};
		}
	}, [independentValue, independentDecimals, t]);

	// calculate slippage from target rate
	const { minimum: dependentValueMinumum, maximum: dependentValueMaximum } = calculateSlippageBounds(
		dependentValue,
		swapType === TOKEN_TO_TOKEN,
		tokenAllowedSlippageBig,
		allowedSlippageBig
	);

	// validate input allowance + balance
	const [inputError, setInputError] = useState();
	const [showUnlock, setShowUnlock] = useState(false);
	useEffect(() => {
		const inputValueCalculation = independentField === INPUT ? independentValueParsed : dependentValueMaximum;
		if (inputBalance && (inputAllowance || inputCurrency === config.symbol) && inputValueCalculation) {
			if (inputBalance.lt(inputValueCalculation)) {
				setInputError("Insufficient balance");
			} else if (inputCurrency !== config.symbol && inputAllowance.lt(inputValueCalculation.toFixed(0))) {
				setInputError("Approve");
				setShowUnlock(true);
			} else {
				setInputError(null);
				setShowUnlock(false);
			}
			return () => {
				setInputError();
				setShowUnlock(false);
			};
		}
	}, [
		independentField,
		independentValueParsed,
		dependentValueMaximum,
		inputBalance,
		inputCurrency,
		inputAllowance,
		t,
	]);

	// calculate dependent value
	useEffect(() => {
		const amount = independentValueParsed;

		if (swapType === ETH_TO_TOKEN) {
			const reserveETH = outputReserveETH;
			const reserveToken = outputReserveToken;

			if (amount && reserveETH && reserveToken) {
				try {
					const calculatedDependentValue =
						independentField === INPUT
							? calculateEtherTokenOutputFromInput(amount, reserveETH, reserveToken)
							: calculateEtherTokenInputFromOutput(amount, reserveETH, reserveToken);

					if (calculatedDependentValue.lte(ethers.constants.Zero.toString())) {
						throw Error();
					}

					dispatchSwapState({
						type: "UPDATE_DEPENDENT",
						payload: calculatedDependentValue,
					});
				} catch {
					setIndependentError(t("insufficientLiquidity"));
				}
				return () => {
					dispatchSwapState({ type: "UPDATE_DEPENDENT", payload: "" });
				};
			}
		} else if (swapType === TOKEN_TO_ETH) {
			const reserveETH = inputReserveETH;
			const reserveToken = inputReserveToken;

			if (amount && reserveETH && reserveToken) {
				try {
					const calculatedDependentValue =
						independentField === INPUT
							? calculateEtherTokenOutputFromInput(amount, reserveToken, reserveETH)
							: calculateEtherTokenInputFromOutput(amount, reserveToken, reserveETH);

					if (calculatedDependentValue.lte(ethers.constants.Zero.toString())) {
						throw Error();
					}

					dispatchSwapState({
						type: "UPDATE_DEPENDENT",
						payload: calculatedDependentValue,
					});
				} catch {
					setIndependentError(t("insufficientLiquidity"));
				}
				return () => {
					dispatchSwapState({ type: "UPDATE_DEPENDENT", payload: "" });
				};
			}
		} else if (swapType === TOKEN_TO_TOKEN) {
			const reserveETHFirst = inputReserveETH;
			const reserveTokenFirst = inputReserveToken;

			const reserveETHSecond = outputReserveETH;
			const reserveTokenSecond = outputReserveToken;

			if (amount && reserveETHFirst && reserveTokenFirst && reserveETHSecond && reserveTokenSecond) {
				try {
					if (independentField === INPUT) {
						const intermediateValue = calculateEtherTokenOutputFromInput(
							amount,
							reserveTokenFirst,
							reserveETHFirst
						);
						if (intermediateValue.lte(ethers.constants.Zero.toString())) {
							throw Error();
						}
						const calculatedDependentValue = calculateEtherTokenOutputFromInput(
							intermediateValue,
							reserveETHSecond,
							reserveTokenSecond
						);
						if (calculatedDependentValue.lte(ethers.constants.Zero.toString())) {
							throw Error();
						}
						dispatchSwapState({
							type: "UPDATE_DEPENDENT",
							payload: calculatedDependentValue,
						});
					} else {
						const intermediateValue = calculateEtherTokenInputFromOutput(
							amount,
							reserveETHSecond,
							reserveTokenSecond
						);
						if (intermediateValue.lte(ethers.constants.Zero.toString())) {
							throw Error();
						}
						const calculatedDependentValue = calculateEtherTokenInputFromOutput(
							intermediateValue,
							reserveTokenFirst,
							reserveETHFirst
						);
						if (calculatedDependentValue.lte(ethers.constants.Zero.toString())) {
							throw Error();
						}
						dispatchSwapState({
							type: "UPDATE_DEPENDENT",
							payload: calculatedDependentValue,
						});
					}
				} catch {
					setIndependentError("Insufficient liquidity");
				}
				return () => {
					dispatchSwapState({ type: "UPDATE_DEPENDENT", payload: "" });
				};
			}
		}
	}, [
		independentValueParsed,
		swapType,
		outputReserveETH,
		outputReserveToken,
		inputReserveETH,
		inputReserveToken,
		independentField,
		t,
	]);

	const [inverted, setInverted] = useState(false);
	const exchangeRate = getExchangeRate(inputValueParsed, inputDecimals, outputValueParsed, outputDecimals);
	const exchangeRateInverted = getExchangeRate(
		inputValueParsed,
		inputDecimals,
		outputValueParsed,
		outputDecimals,
		true
	);

	const marketRate = getMarketRate(
		swapType,
		inputReserveETH,
		inputReserveToken,
		inputDecimals,
		outputReserveETH,
		outputReserveToken,
		outputDecimals
	);

	const percentSlippage =
		exchangeRate && marketRate && !marketRate.isZero()
			? exchangeRate
					.minus(marketRate)
					.abs()
					.times(new BigNumber(10).pow(new BigNumber(18)))
					.dividedBy(marketRate)
					.minus(new BigNumber(3).times(new BigNumber(10).pow(new BigNumber(15))))
			: undefined;
	const percentSlippageFormatted = percentSlippage && amountFormatter(percentSlippage, 16, 2);
	const slippageWarning =
		percentSlippage &&
		percentSlippage.gte(ethers.utils.parseEther(".05").toString()) &&
		percentSlippage.lt(ethers.utils.parseEther(".2").toString()); // [5% - 20%)
	const highSlippageWarning = percentSlippage && percentSlippage.gte(ethers.utils.parseEther(".2").toString()); // [20+%

	const isValid = sending
		? exchangeRate && inputError === null && independentError === null && recipientError === null && deadlineFromNow
		: exchangeRate && inputError === null && independentError === null && deadlineFromNow;

	const estimatedText = `(${t("estimated")})`;
	function formatBalance(value) {
		return `Balance: ${value}`;
	}

	const [isDisabled, setIsDisableed] = useState(true);

	const onSwapValid = useCallback(() => {
		if (!isNaN(percentSlippageFormatted) && Number(percentSlippageFormatted) >= 5) {
			setSlippageView(true);
		} else {
			onSwap();
		}
	}, [percentSlippageFormatted, onSwap]);

	async function onSwap() {
		if (!isDisabled) return;
		setIsDisableed(false);
		setTimeout(() => {
			setIsDisableed(true);
		}, 3000);
		const deadline = Math.ceil(Date.now() / 1000) + deadlineFromNow;

		let estimate, method, args, value;
		let txnsType = sending ? "SEND" : "SWAP";

		// if (config.supportWallet.includes(walletType)) {
		if (config.supportWallet.includes(walletType)) {
			setIsHardwareError(false);
			setIsHardwareTip(true);
			setHardwareTxnsInfo(inputValueFormatted + inputSymbol);
			let contractAddress = swapType === ETH_TO_TOKEN ? outputExchangeAddress : inputExchangeAddress;
			let web3Contract = getWeb3ConTract(EXCHANGE_ABI, contractAddress);
			let data = "";
			if (independentField === INPUT) {
				if (swapType === ETH_TO_TOKEN) {
					value = new BigNumber(independentValueParsed).toFixed(0);
					data = sending
						? // web3Contract.ethToTokenTransferInput.getData(dependentValueMinumum.toString(), deadline, recipient.address)
						  web3Contract.methods
								.ethToTokenTransferInput(dependentValueMinumum.toString(), deadline, recipient.address)
								.encodeABI()
						: // web3Contract.ethToTokenSwapInput.getData(dependentValueMinumum.toString(), deadline)
						  web3Contract.methods
								.ethToTokenSwapInput(dependentValueMinumum.toString(), deadline)
								.encodeABI();
				} else if (swapType === TOKEN_TO_ETH) {
					value = new BigNumber(ethers.constants.Zero.toString());
					data = sending
						? // web3Contract.tokenToEthTransferInput.getData(independentValueParsed.toString(), dependentValueMinumum.toString(), deadline, recipient.address)
						  web3Contract.methods
								.tokenToEthTransferInput(
									independentValueParsed.toString(),
									dependentValueMinumum.toString(),
									deadline,
									recipient.address
								)
								.encodeABI()
						: // web3Contract.tokenToEthSwapInput.getData(independentValueParsed.toString(), dependentValueMinumum.toString(), deadline)
						  web3Contract.methods
								.tokenToEthSwapInput(
									independentValueParsed.toString(),
									dependentValueMinumum.toString(),
									deadline
								)
								.encodeABI();
				} else if (swapType === TOKEN_TO_TOKEN) {
					value = new BigNumber(ethers.constants.Zero.toString());
					data = sending
						? // web3Contract.tokenToTokenTransferInput.getData(
						  // independentValueParsed?.toString(),
						  // dependentValueMinumum.toString(),
						  // ethers.constants.One.toHexString(),
						  // deadline,
						  // recipient.address,
						  // outputCurrency)
						  web3Contract.methods
								.tokenToTokenTransferInput(
									independentValueParsed?.toString(),
									dependentValueMinumum.toString(),
									ethers.constants.One.toHexString(),
									deadline,
									recipient.address,
									outputCurrency
								)
								.encodeABI()
						: // web3Contract.tokenToTokenSwapInput.getData(independentValueParsed?.toString(), dependentValueMinumum.toString(), ethers.constants.One.toHexString(), deadline, outputCurrency)
						  web3Contract.methods
								.tokenToTokenSwapInput(
									independentValueParsed?.toString(),
									dependentValueMinumum.toString(),
									ethers.constants.One.toHexString(),
									deadline,
									outputCurrency
								)
								.encodeABI();
				}
			} else if (independentField === OUTPUT) {
				if (swapType === ETH_TO_TOKEN) {
					value = new BigNumber(dependentValueMaximum.toFixed(0));
					data = sending
						? // web3Contract.ethToTokenTransferOutput.getData(independentValueParsed?.toString(), deadline, recipient.address)
						  web3Contract.methods
								.ethToTokenTransferOutput(
									independentValueParsed?.toString(),
									deadline,
									recipient.address
								)
								.encodeABI()
						: web3Contract.methods
								.ethToTokenSwapOutput(independentValueParsed?.toString(), deadline)
								.encodeABI();
				} else if (swapType === TOKEN_TO_ETH) {
					value = new BigNumber(ethers.constants.Zero.toString());
					data = sending
						? // web3Contract.tokenToEthTransferOutput.getData(independentValueParsed?.toString(), dependentValueMaximum.toString(), deadline, recipient.address)
						  web3Contract.methods
								.tokenToEthTransferOutput(
									independentValueParsed?.toString(),
									dependentValueMaximum.toString(),
									deadline,
									recipient.address
								)
								.encodeABI()
						: // web3Contract.tokenToEthSwapOutput.getData(independentValueParsed?.toString(), dependentValueMaximum.toString(), deadline)
						  web3Contract.methods
								.tokenToEthSwapOutput(
									independentValueParsed?.toString(),
									dependentValueMaximum.toString(),
									deadline
								)
								.encodeABI();
				} else if (swapType === TOKEN_TO_TOKEN) {
					value = new BigNumber(ethers.constants.Zero.toString());
					data = sending
						? web3Contract.methods
								.tokenToTokenTransferOutput(
									independentValueParsed?.toString(),
									dependentValueMaximum.toString(),
									ethers.constants.MaxUint256.toHexString(),
									deadline,
									recipient.address,
									outputCurrency
								)
								.encodeABI()
						: // web3Contract.tokenToTokenSwapOutput.getData(independentValueParsed?.toString(), dependentValueMaximum.toString(), ethers.constants.MaxUint256.toHexString(), deadline, outputCurrency)
						  web3Contract.methods
								.tokenToTokenSwapOutput(
									independentValueParsed?.toString(),
									dependentValueMaximum.toString(),
									ethers.constants.MaxUint256.toHexString(),
									deadline,
									outputCurrency
								)
								.encodeABI();
				}
			}
			value = swapType === ETH_TO_TOKEN ? value.toString() : 0;
			getWeb3BaseInfo(contractAddress, data, account, value).then((res) => {
				if (res.msg === "Success") {
					addTransaction(res.info);
					recordTxns(res.info, txnsType, inputSymbol + "/" + outputSymbol, account, recipient.address);
					setIsHardwareTip(false);
					dispatchSwapState({
						type: "UPDATE_INDEPENDENT",
						payload: { value: "", field: INPUT },
					});
					dispatchSwapState({
						type: "UPDATE_INDEPENDENT",
						payload: { value: "", field: OUTPUT },
					});
					setIsViewTxnsDtil(false);
				} else {
					setIsHardwareError(true);
				}
			});
			return;
		}

		if (independentField === INPUT) {
			if (swapType === ETH_TO_TOKEN) {
				estimate = sending
					? contract.estimateGas.ethToTokenTransferInput
					: contract.estimateGas.ethToTokenSwapInput;
				method = sending ? contract.ethToTokenTransferInput : contract.ethToTokenSwapInput;
				args = sending
					? [dependentValueMinumum.toString(), deadline, recipient.address]
					: [dependentValueMinumum.toString(), deadline];
				value = new BigNumber(independentValueParsed.toFixed(0));
			} else if (swapType === TOKEN_TO_ETH) {
				estimate = sending
					? contract.estimateGas.tokenToEthTransferInput
					: contract.estimateGas.tokenToEthSwapInput;
				method = sending ? contract.tokenToEthTransferInput : contract.tokenToEthSwapInput;
				args = sending
					? [independentValueParsed.toString(), dependentValueMinumum.toString(), deadline, recipient.address]
					: [independentValueParsed.toString(), dependentValueMinumum.toString(), deadline];
				value = new BigNumber(ethers.constants.Zero.toString());
			} else if (swapType === TOKEN_TO_TOKEN) {
				estimate = sending
					? contract.estimateGas.tokenToTokenTransferInput
					: contract.estimateGas.tokenToTokenSwapInput;
				method = sending ? contract.tokenToTokenTransferInput : contract.tokenToTokenSwapInput;
				args = sending
					? [
							independentValueParsed.toString(),
							dependentValueMinumum.toString(),
							ethers.constants.One,
							deadline,
							recipient.address,
							outputCurrency,
					  ]
					: [
							independentValueParsed.toString(),
							dependentValueMinumum.toString(),
							ethers.constants.One,
							deadline,
							outputCurrency,
					  ];
				value = new BigNumber(ethers.constants.Zero.toString());
			}
		} else if (independentField === OUTPUT) {
			if (swapType === ETH_TO_TOKEN) {
				estimate = sending
					? contract.estimateGas.ethToTokenTransferOutput
					: contract.estimateGas.ethToTokenSwapOutput;
				method = sending ? contract.ethToTokenTransferOutput : contract.ethToTokenSwapOutput;
				args = sending
					? [independentValueParsed.toString(), deadline, recipient.address]
					: [independentValueParsed.toString(), deadline];
				value = new BigNumber(dependentValueMaximum.toFixed(0));
			} else if (swapType === TOKEN_TO_ETH) {
				estimate = sending
					? contract.estimateGas.tokenToEthTransferOutput
					: contract.estimateGas.tokenToEthSwapOutput;
				method = sending ? contract.tokenToEthTransferOutput : contract.tokenToEthSwapOutput;
				args = sending
					? [independentValueParsed.toString(), dependentValueMaximum.toString(), deadline, recipient.address]
					: [independentValueParsed.toString(), dependentValueMaximum.toString(), deadline];
				value = new BigNumber(ethers.constants.Zero.toString());
			} else if (swapType === TOKEN_TO_TOKEN) {
				estimate = sending
					? contract.estimateGas.tokenToTokenTransferOutput
					: contract.estimateGas.tokenToTokenSwapOutput;
				method = sending ? contract.tokenToTokenTransferOutput : contract.tokenToTokenSwapOutput;
				args = sending
					? [
							independentValueParsed.toString(),
							dependentValueMaximum.toString(),
							ethers.constants.MaxUint256,
							deadline,
							recipient.address,
							outputCurrency,
					  ]
					: [
							independentValueParsed.toString(),
							dependentValueMaximum.toString(),
							ethers.constants.MaxUint256,
							deadline,
							outputCurrency,
					  ];
				value = new BigNumber(ethers.constants.Zero.toString());
			}
		}

		let estimatedGasLimit;
		try {
			estimatedGasLimit = await estimate(...args, { value: value.toFixed(0) });
		} catch (e) {
			const errorCode = e?.code;
			if (errorCode === -32000) {
				toast.error("Insufficient funds for gas.");
				return false;
			}
			estimatedGasLimit = new BigNumber(40000);
		}

		method(...args, {
			value: value.toFixed(0),
			gasLimit: calculateGasMargin(estimatedGasLimit, GAS_MARGIN).toFixed(0),
		})
			.then((response) => {
				addTransaction(response);
				recordTxns(response, txnsType, inputSymbol + "/" + outputSymbol, account, recipient.address);
				dispatchSwapState({
					type: "UPDATE_INDEPENDENT",
					payload: { value: "", field: INPUT },
				});
				dispatchSwapState({
					type: "UPDATE_INDEPENDENT",
					payload: { value: "", field: OUTPUT },
				});
				setIsViewTxnsDtil(false);
			})
			.catch((err) => {
				console.log(err);
			});
	}

	const [customSlippageError, setcustomSlippageError] = useState("");

	const toggleWalletModal = useWalletModalToggle();

	const newInputDetected =
		inputCurrency !== config.symbol &&
		inputCurrency &&
		!INITIAL_TOKENS_CONTEXT[chainId].hasOwnProperty(inputCurrency);

	const newOutputDetected =
		outputCurrency !== config.symbol &&
		outputCurrency &&
		!INITIAL_TOKENS_CONTEXT[chainId].hasOwnProperty(outputCurrency);

	const [showInputWarning, setShowInputWarning] = useState(false);
	const [showOutputWarning, setShowOutputWarning] = useState(false);

	const [isHardwareTip, setIsHardwareTip] = useState(false);
	const [isHardwareError, setIsHardwareError] = useState(false);
	const [hardwareTxnsInfo, setHardwareTxnsInfo] = useState("");
	const [isViewTxnsDtil, setIsViewTxnsDtil] = useState(false);

	useEffect(() => {
		if (newInputDetected) {
			setShowInputWarning(true);
		} else {
			setShowInputWarning(false);
		}
	}, [newInputDetected, setShowInputWarning]);

	useEffect(() => {
		if (newOutputDetected) {
			setShowOutputWarning(true);
		} else {
			setShowOutputWarning(false);
		}
	}, [newOutputDetected, setShowOutputWarning]);

	console.log(recipientError);

	return (
		<Page networkSensitive={false}>
			<Row>
				<Col xs={12} lg={{ span: 8, offset: 2 }}>
					<ListGroup horizontal className="mb-5">
						<ListGroup.Item action href="/#/cross/anyswap" active>
							{t("menu.anySwap")}
						</ListGroup.Item>
						<ListGroup.Item action href="/#/cross/bridges">
							{t("menu.bridges")}
						</ListGroup.Item>
						<ListGroup.Item action href="/#/cross/balance">
							{t("menu.crossBalance")}
						</ListGroup.Item>
					</ListGroup>

					<Header>
						<Title>{!sending ? "Swap" : "Send"}</Title>

						<TabHeader>
							<TabButton
								onClick={setSending?.bind(this, false)}
								variant={!sending ? "primary" : "light-primary"}
							>
								Swap
							</TabButton>
							<TabButton
								onClick={setSending?.bind(this, true)}
								variant={sending ? "primary" : "light-primary"}
							>
								Send
							</TabButton>
						</TabHeader>
					</Header>
					<HardwareTip
						HardwareTipOpen={isHardwareTip}
						closeHardwareTip={() => {
							setIsHardwareTip(false);
						}}
						error={isHardwareError}
						txnsInfo={hardwareTxnsInfo}
						coinType={inputSymbol}
					/>

					<Modal show={slippageView} onHide={setSlippageView.bind(this, false)} centered>
						<Modal.Body>
							<TransactionInfo>
								<LastSummaryText>
									{t("youAreSelling")}{" "}
									<ValueWrapper>
										{`${amountFormatter(
											independentValueParsed,
											independentDecimals,
											Math.min(6, independentDecimals)
										)} ${inputSymbol}`}
									</ValueWrapper>{" "}
									{t("forAtLeast")}
									<ValueWrapper>
										{`${amountFormatter(
											dependentValueMinumum,
											dependentDecimals,
											Math.min(6, dependentDecimals)
										)} ${outputSymbol}`}
									</ValueWrapper>
								</LastSummaryText>
								<LastSummaryText>
									{t("priceChange")} <ValueWrapper>{`${percentSlippageFormatted}%`}</ValueWrapper>
								</LastSummaryText>
							</TransactionInfo>
						</Modal.Body>
					</Modal>

					<Card>
						<Row>
							<Col xs={12}>
								<BridgeInputPanel
									title={t("input")}
									urlAddedTokens={urlAddedTokens}
									description={
										inputValueFormatted && independentField === OUTPUT ? estimatedText : ""
									}
									extraText={inputBalanceFormatted && formatBalance(inputBalanceFormatted)}
									extraTextClickHander={() => {
										if (inputBalance && inputDecimals) {
											const valueToSet =
												inputCurrency === config.symbol
													? inputBalance.minus(ethers.utils.parseEther(".1").toString())
													: inputBalance;
											if (valueToSet.gt(ethers.constants.Zero.toString())) {
												dispatchSwapState({
													type: "UPDATE_INDEPENDENT",
													payload: {
														value: amountFormatter(
															valueToSet,
															inputDecimals,
															inputDecimals,
															false
														),
														field: INPUT,
													},
												});
											}
										}
									}}
									onCurrencySelect={(inputCurrency) => {
										dispatchSwapState({
											type: "SELECT_CURRENCY",
											payload: { currency: inputCurrency, field: INPUT },
										});
									}}
									onUserInput={(inputValue) => {
										dispatchSwapState({
											type: "UPDATE_INDEPENDENT",
											payload: { value: inputValue, field: INPUT },
										});
									}}
									showUnlock={showUnlock}
									selectedTokens={[inputCurrency, outputCurrency]}
									selectedTokenAddress={inputCurrency}
									value={inputValueFormatted}
									errorMessage={
										inputError ? inputError : independentField === INPUT ? independentError : ""
									}
									label={"Input"}
									withoutMargin={true}
								/>
							</Col>
							<Col xs={12} className={"d-flex align-items-center justify-content-center"}>
								<SwapCurrencies
									onClick={() => {
										dispatchSwapState({ type: "FLIP_INDEPENDENT" });
									}}
								>
									<SVG src={SwapIcon} width={24} height={24} />
								</SwapCurrencies>
							</Col>
							<Col xs={12}>
								<BridgeInputPanel
									label={"Output"}
									currency={outputCurrencySwap}
									otherCurrency={inputCurrencySwap}
									id={"bridge-output-currency"}
									showCommonBases={false}
									withoutMargin={true}
									description={
										outputValueFormatted && independentField === INPUT ? estimatedText : ""
									}
									extraText={outputBalanceFormatted && formatBalance(outputBalanceFormatted)}
									urlAddedTokens={urlAddedTokens}
									onCurrencySelect={(outputCurrency) => {
										dispatchSwapState({
											type: "SELECT_CURRENCY",
											payload: { currency: outputCurrency, field: OUTPUT },
										});
									}}
									onUserInput={(outputValue) => {
										dispatchSwapState({
											type: "UPDATE_INDEPENDENT",
											payload: { value: outputValue, field: OUTPUT },
										});
									}}
									selectedTokens={[inputCurrency, outputCurrency]}
									selectedTokenAddress={outputCurrency}
									value={outputValueFormatted}
									errorMessage={independentField === OUTPUT ? independentError : ""}
									disableUnlock
								/>
							</Col>
							{sending ? (
								<Col xs={12} className={"pt-4"}>
									<AddressInputPanel
										label={"Recipient Address"}
										value={recipient.address}
										onChange={(val) => {
											setRecipient((r) => {
												return {
													...r,
													address: val,
												};
											});
										}}
									/>
								</Col>
							) : null}
						</Row>
					</Card>

					<WarningTip />
					<SubmitButtonContainer>
						{config.dirSwitchFn(inputIsSwitch) && config.dirSwitchFn(outputIsSwitch) ? (
							<Button
								variant={"primary"}
								disabled={
									brokenTokenWarning || !isDisabled || showBetaMessage
										? true
										: !account && !error
										? false
										: !isValid ||
										  customSlippageError === "invalid" ||
										  (sending && (!recipient.address || !isAddress(recipient.address)))
								}
								onClick={account && !error ? onSwapValid : toggleWalletModal}
							>
								{brokenTokenWarning
									? "Swap"
									: !account
									? "Connect wallet"
									: inputError || independentError
									? inputError || independentError
									: !inputCurrency || !outputCurrency
									? "Select a token"
									: !independentValue
									? "Enter an amount"
									: sending
									? highSlippageWarning || customSlippageError === "warning"
										? "Send anyway"
										: !recipient.address
										? "Enter Recipient"
										: !isAddress(recipient.address)
										? "Invalid Recipient"
										: "Send"
									: highSlippageWarning || customSlippageError === "warning"
									? "Swap anyway"
									: "Swap"}
							</Button>
						) : (
							<Button variant={"primary"} disabled={true}>
								Coming soon
							</Button>
						)}
					</SubmitButtonContainer>
				</Col>
			</Row>
		</Page>
	);
};

export default CrossAnySwap;
