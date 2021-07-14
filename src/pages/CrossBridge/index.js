import styled from "styled-components";
import { Row, Col, Button as BS, ListGroup } from "react-bootstrap";
import SVG from "react-inlinesvg";
import { ETHER } from "@uniswap/sdk";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { ethers } from "ethers";
import { transparentize } from "polished";

import ScheduleIcon from "../../assets/images/icon/schedule.svg";
import Page from "../../components/Page";
import DefaultCard from "../../components/Card";
import BridgeInputPanel from "../../components/BridgeInputPanel";
import SwapIcon from "../../assets/images/cross/swap.svg";
import AddressInputPanel from "../../components/AddressInputPanel";
import getConfig from "../../config";
import { formatCoin, thousandBit } from "../../utils/bridge/tools";
import { useActiveWeb3React } from "../../hooks";
import { isAddress } from "../../utils";
import { useBetaMessageManager } from "../../contexts/LocalStorage";
import { INITIAL_TOKENS_CONTEXT, useAllTokenDetails, useTokenDetails } from "../../contexts/Tokens";
import { amountFormatter, formatDecimal, getAllQueryParams } from "../../utils/cross";
import { getAllOutBalance, getLocalOutBalance, getTokenBalance } from "../../utils/bridge/getOutBalance";
import { getAllowanceInfo } from "../../utils/bridge/approve";
import { getRegisterInfo, getServerInfo, RegisterAddress, removeLocalConfig } from "../../utils/bridge/getServerInfo";
import BridgeTokens from "../../contexts/BridgeTokens";
import { createAddress, GetBTChashStatus, GetBTCtxnsAll, isBTCAddress } from "../../utils/bridge/BTC";
import { useAddressBalance } from "../../contexts/Balances";
import BigNumber from "bignumber.js";
import { useWalletModalToggle } from "../../state/application/hooks";
import { useTransactionAdder } from "../../state/transactions/hooks";
import { useSwapTokenContract } from "../../hooks/useSwapTokenContract";

import swapBTCABI from "../../constants/abis/swapBTCABI";
import swapETHABI from "../../constants/abis/swapETHABI";
import erc20 from "../../constants/abis/erc20.json";
import { recordTxns } from "../../utils/record";
import { getWeb3BaseInfo, getWeb3ConTract } from "../../utils/web3/txns";
import { getHashStatus, getWithdrawHashStatus, HDsendERC20Txns, MMsendERC20Txns } from "../../utils/web3/BridgeWeb3";
import { shortenAddress } from "../../utils";
import HardwareTip from "../../components/HardwareTips";
import WarningTip from "../../components/WarningTip";
import TokenLogo from "../../components/CrossTokenLogo";
import { useTranslation } from "react-i18next";
import Copy from "../../components/AccountDetails/Copy";
import { Modal as BSModal } from "../../components/Modal/bootstrap";
import WalletConnectData from "../../components/WalletConnectData";

const config = getConfig();

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
	& > .card-body {
		padding: 36px 64px;

		@media (max-width: 991px) {
			padding: 24px;
		}

		@media (max-width: 576px) {
			padding: 16px;
		}
	}
`;

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
	margin-top: 40px;

	@media (max-width: 1199px) {
		margin-top: 32px;
	}

	@media (max-width: 991px) {
		margin-top: 28px;
	}

	@media (max-width: 767px) {
		margin-top: 24px;
		align-items: stretch;
	}
`;

const AlertContainer = styled.div`
	border-radius: 18px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 4px 4px 4px 64px;
	background-color: ${({ theme }) => theme.primaryLight};

	@media (max-width: 1199px) {
		padding-left: 48px;
	}

	@media (max-width: 991px) {
		padding-left: 36px;
	}

	@media (max-width: 767px) {
		padding-left: 16px;
	}
`;

const AlertText = styled.span`
	font-weight: 500;
	font-size: 1rem;
	color: ${({ theme }) => theme.primary};
	line-height: 21px;
	padding-right: 1rem;
	padding-top: 9px;
	padding-bottom: 9px;
`;

const AlertButton = styled(BS)`
	min-height: 48px;
	height: 48px;
	border-radius: 18px;
	font-weight: 500;
	min-width: 105px;
`;

const MintListVal = styled.div`
	display: flex;
	justify-content: flex-start;
	align-items: center;
	width: 100%;
	cursor: pointer;
	color: ${({ theme }) => theme.text1};
	font-size: 12px;
	.green {
		color: ${({ theme }) => theme.success};
	}
	.red {
		color: ${({ theme }) => theme.danger};
	}
	.link {
		color: ${({ theme }) => theme.text1};
	}
`;

const MintTip = styled.div`
	border-radius: 0.25rem;
	z-index: 99;
	cursor: pointer;
	color: ${({ theme }) => theme.warning};
	.txt {
		width: 0;
		height: 100%;
		white-space: nowrap;
		overflow: hidden;
		transition: width 0.5s;
	}
	&:hover {
		.txt {
			width: 150px;
			padding: 0 1.25rem;
		}
	}
`;

const HashStatus = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	font-size: 12px;
	color: ${({ theme }) => theme.text1};
	font-weight: bold;
	padding: 12px 15px;
	border-radius: 9px;
	margin-top: 15px;
	&.yellow {
		border: 1px solid ${({ theme }) => theme.warning};
		background: ${({ theme }) => transparentize(0.15, theme.warning)};
	}
	&.green {
		border: 1px solid ${({ theme }) => theme.success};
		background: ${({ theme }) => transparentize(0.15, theme.success)};
	}
	&.red {
		border: 1px solid ${({ theme }) => theme.danger};
		background: ${({ theme }) => transparentize(0.15, theme.danger)};
	}
`;

const MintList = styled.div`
	padding: 8px 8px;
	font-size: 0.875rem;
	margin-bottom: 1rem;
`;

const MintDiv = styled.div`
	width: 100%;
	padding: 0;
`;

const MintListCenter = styled(MintList)`
	display: flex;
	justify-content: center;
	align-items: center;
	margin-bottom: 1.875rem;
`;

const DepositValue = styled.div`
	width: 100%;
	text-align: center;
	p {
		font-size: 12px;
		color: #96989e;
		margin: 8px 0 8px;
	}
	span {
		color: ${({ theme }) => theme.text1};
		font-size: 22px;
	}
`;

const MintListLabel = styled.div`
	width: 100%;
	font-size: 12px;
	color: ${({ theme }) => theme.text3};
`;

const TokenLogoBox1 = styled.div`
	${({ theme }) => theme.flexColumnNoWrap};
	height: 46px;
	background: ${({ theme }) => theme.white};
	box-sizing: border-box;
	border-radius: 100%;
	margin-top: 15px;
	border: 1px solid ${({ theme }) => theme.text1};
`;

const MintHahshList = styled.div`
	position: fixed;
	top: 100px;
	right: 20px;
	z-index: 99;
	cursor: pointer;
	margin: 0;
	ul {
		list-style: none;
		cursor: pointer;
		margin: 0;
		padding: 15px;
		max-height: 200px;
		overflow: auto;
		li {
			border-radius: 0.25rem;
			box-shadow: 0 0 5px 0 #e1902e;
			margin: 0 0 20px;
			padding: 5px;
			position: relative;
			img {
				display: block;
			}
			.txt {
				width: 0;
				height: 100%;
				white-space: nowrap;
				overflow: hidden;
				transition: width 0.5s;
			}
			.del {
				${({ theme }) => theme.flexColumnNoWrap};
				position: absolute;
				top: -9px;
				right: -9px;
				width: 18px;
				height: 18px;
				border: 1px solid #ddd;
				border-radius: 100%;
				background: rgba(0, 0, 0, 0.1);
				line-height: 1;
				font-size: 12px;
				color: #fff;
				opacity: 0;
			}
			&:hover {
				.txt {
					width: 150px;
					padding: 0 1.25rem;
				}
				.del {
					opacity: 1;
				}
			}
		}
	}
	.delete {
		${({ theme }) => theme.flexColumnNoWrap};
		width: 100%;
		background: rgba(0, 0, 0, 0.1);
	}
`;

const Flex = styled.div`
	display: flex;
	justify-content: center;
	padding: 2rem;

	button {
		max-width: 20rem;
	}
	&.pd0 {
		padding: 0;
	}
`;

const DEPOSIT_HISTORY = "DEPOSIT_HISTORY";
const WITHDRAW_HISTORY = "WITHDRAW_HISTORY";

const INPUT = 0;
const OUTPUT = 1;

function isArray(o) {
	return Object.prototype.toString.call(o) === "[object Array]";
}

function getInitialSwapState(state) {
	let wdInit =
		sessionStorage.getItem("WITHDRAW_HISTORY") && sessionStorage.getItem("WITHDRAW_HISTORY") !== "undefined"
			? JSON.parse(sessionStorage.getItem("WITHDRAW_HISTORY"))
			: {};
	let wdArr = [];
	if (isArray(wdInit)) {
		wdArr = wdInit;
	} else {
		wdArr = wdInit[config.chainID] ? wdInit[config.chainID] : [];
	}
	let dpInit =
		sessionStorage.getItem("DEPOSIT_HISTORY") && sessionStorage.getItem("DEPOSIT_HISTORY") !== "undefined"
			? JSON.parse(sessionStorage.getItem("DEPOSIT_HISTORY"))
			: {};
	let dpArr = [];
	if (isArray(dpInit)) {
		dpArr = dpInit;
	} else {
		dpArr = dpInit[config.chainID] ? dpInit[config.chainID] : [];
	}
	return {
		independentValue: state.exactFieldURL && state.exactAmountURL ? state.exactAmountURL : "", // this is a user input
		dependentValue: "", // this is a calculated number
		independentField: state.exactFieldURL === "output" ? OUTPUT : INPUT,
		inputCurrency: state.inputCurrencyURL ? state.inputCurrencyURL : config.initBridge,
		outputCurrency: state.outputCurrencyURL
			? state.outputCurrencyURL === config.symbol
				? !state.inputCurrencyURL || (state.inputCurrencyURL && state.inputCurrencyURL !== config.symbol)
					? config.symbol
					: ""
				: state.outputCurrencyURL
			: state.initialCurrency
			? state.initialCurrency
			: config.initBridge,
		// hashArr: sessionStorage.getItem('DEPOSIT_HISTORY') ? JSON.parse(sessionStorage.getItem('DEPOSIT_HISTORY')) : [],
		// withdrawArr: sessionStorage.getItem('WITHDRAW_HISTORY') && sessionStorage.getItem('WITHDRAW_HISTORY') !== 'undefined' ? JSON.parse(sessionStorage.getItem('WITHDRAW_HISTORY')) : [],
		hashArr: dpArr,
		withdrawArr: wdArr,
		bridgeType: "mint",
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
			const { field, value, realyValue } = action.payload;
			const { dependentValue, independentValue } = state;
			return {
				...state,
				independentValue: value,
				dependentValue: value === independentValue ? dependentValue : "",
				independentField: field,
				realyValue: realyValue,
			};
		}
		case "UPDATE_DEPENDENT": {
			return {
				...state,
				dependentValue: action.payload,
			};
		}
		case "UPDATE_BREDGETYPE": {
			return {
				...state,
				bridgeType: action.payload,
			};
		}
		case "UPDATE_SWAPREGISTER": {
			if (action.token && state.inputCurrency.toLowerCase() !== action.token.toLowerCase()) {
				return state;
			}
			return {
				...state,
				registerAddress: action.payload ? action.payload : "",
				PlusGasPricePercentage: action.PlusGasPricePercentage ? action.PlusGasPricePercentage : "",
				isDeposit: action.isDeposit,
				depositMaxNum: action.depositMaxNum ? action.depositMaxNum : "",
				depositMinNum: action.depositMinNum ? action.depositMinNum : "",
				isRedeem: action.isRedeem,
				redeemMaxNum: action.redeemMaxNum ? action.redeemMaxNum : "",
				redeemMinNum: action.redeemMinNum ? action.redeemMinNum : "",
				maxFee: action.maxFee ? action.maxFee : "",
				minFee: action.minFee ? action.minFee : "",
				fee: action.fee ? action.fee : "",
				dMaxFee: action.dMaxFee ? action.dMaxFee : 0,
				dMinFee: action.dMinFee ? action.dMinFee : 0,
				dFee: action.dFee ? action.dFee : 0,
				redeemBigValMoreTime: action.redeemBigValMoreTime ? action.redeemBigValMoreTime : "",
				depositBigValMoreTime: action.depositBigValMoreTime ? action.depositBigValMoreTime : "",
				pairid: action.pairid ? action.pairid : "",
			};
		}
		case "UPDATE_MINTTYPE": {
			return {
				...state,
				isViewMintModel: action.payload,
			};
		}
		case "UPDATE_MINTHISTORY": {
			return {
				...state,
				mintHistory: action.payload,
			};
		}
		case "UPDATE_MINTINFOTYPE": {
			return {
				...state,
				isViewMintInfo: action.payload,
			};
		}
		case "UPDATE_HASH_STATUS": {
			const { hashData, type, NewHashCount } = action.payload;
			const { hashArr, hashCount } = state;
			if (!type) {
				hashArr.push(hashData);
			}
			let arr = type ? hashData : hashArr;
			let initObj = sessionStorage.getItem(DEPOSIT_HISTORY)
				? JSON.parse(sessionStorage.getItem(DEPOSIT_HISTORY))
				: {};
			let obj = {};
			if (isArray(initObj)) {
				obj[config.chainID] = arr;
			} else {
				obj = initObj;
				obj[config.chainID] = arr;
			}
			sessionStorage.setItem(DEPOSIT_HISTORY, JSON.stringify(obj));
			let count = 0;
			if ((hashCount || hashCount === 0) && NewHashCount) {
				count = hashCount + NewHashCount;
			}
			return {
				...state,
				hashArr: arr,
				hashCount: count,
			};
		}
		case "UPDATE_WITHDRAW_STATUS": {
			const { withdrawData, type, NewHashCount } = action.payload;
			const { withdrawArr, withdrawCount } = state;
			if (!type) {
				withdrawArr.push(withdrawData);
			}
			let arr = type ? withdrawData : withdrawArr;
			let initObj = sessionStorage.getItem(WITHDRAW_HISTORY)
				? JSON.parse(sessionStorage.getItem(WITHDRAW_HISTORY))
				: {};
			let obj = {};
			if (isArray(initObj)) {
				obj[config.chainID] = arr;
			} else {
				obj = initObj;
				obj[config.chainID] = arr;
			}
			// console.log(obj)
			sessionStorage.setItem(WITHDRAW_HISTORY, JSON.stringify(obj));
			let count = 0;
			if ((withdrawCount || withdrawCount === 0) && NewHashCount) {
				count = withdrawCount + NewHashCount;
			}
			return {
				...state,
				withdrawArr: arr,
				withdrawCount: count,
			};
		}
		default: {
			//UPDATE_MINTINFOTYPE
			return getInitialSwapState();
		}
	}
}

function isSpecialCoin(coin) {
	if (formatCoin(coin) === "BTC") {
		return 1;
	} else if (formatCoin(coin) === "LTC") {
		return 2;
	} else if (formatCoin(coin) === "BLOCK") {
		return 3;
	} else {
		return 0;
	}
}

function formatName(name, extendObj) {
	// console.log(name)
	if (name) {
		if (config.symbol === "BNB" || config.symbol === "ETH" || config.symbol === "FTM") {
			if (name.indexOf("Anyswap") !== -1) {
				name = name.replace(config.suffix, "");
				return name + "(Fusion)";
			} else {
				return formatOutName(name, extendObj);
			}
		} else {
			if (name.indexOf("Anyswap") !== -1) {
				return name + "(Fusion)";
			} else {
				return formatOutName(name, extendObj);
			}
		}
	} else {
		return name;
	}
}

function formatOutName(name, extendObj) {
	let srcChainId = extendObj && extendObj.BRIDGE && extendObj.BRIDGE.length > 0 ? extendObj.BRIDGE[0].type : "";
	name = name.replace(config.namePrefix, "").replace(config.suffix, "");

	if (srcChainId) {
		if (Number(srcChainId) === 1 && name.indexOf("Ethereum") === -1) {
			if (name === "Frapped USDT") {
				name = "Tether-ERC20";
			} else {
				name = name + "-ERC20";
			}
		} else if (Number(srcChainId) === 56 && name.indexOf("Binance") === -1) {
			name = name + "-BEP20";
		} else if (Number(srcChainId) === 128 && name.indexOf("Huobi") === -1) {
			name = name + "-HECO";
		} else if (Number(srcChainId) === 250 && name.indexOf("Fantom") === -1) {
			name = name + "-FRC20";
		} else if (Number(srcChainId) === 32659 && name.indexOf("Fusion") === -1) {
			name = name + "(Fusion)";
		}
	}
	// console.log(name)
	return name;
}

const selfUseAllToken = config.noSupportBridge;
let hashInterval;

const CrossBridge = (props) => {
	let { account, chainId, error, library } = useActiveWeb3React();
	const [showBetaMessage] = useBetaMessageManager();
	const allTokens = useAllTokenDetails();
	let walletType = sessionStorage.getItem("walletType");
	const { t } = useTranslation();

	// @todo: delete this variables
	const [inputCurrencySwap, setInputCurrency] = useState(ETHER);
	const [outputCurrencySwap, setOutputCurrency] = useState(undefined);

	const [inputAmount, setInputAmount] = useState("");
	const [outputAmount, setOutputAmount] = useState("");

	let params = getAllQueryParams();
	params = params ? params : {};

	const urlAddedTokens = {};
	if (params.inputCurrency) {
		urlAddedTokens[params.inputCurrency] = true;
	}
	if (params.outputCurrency) {
		urlAddedTokens[params.outputCurrency] = true;
	}

	const getAllOutBalanceFn = useCallback(() => {
		let tokenClass = {};
		for (let tk in allTokens) {
			if (allTokens[tk].extendObj && allTokens[tk].extendObj.BRIDGE) {
				for (let cd of allTokens[tk].extendObj.BRIDGE) {
					if (cd.isSwitch) {
						if (!tokenClass[cd.type]) {
							tokenClass[cd.type] = {};
						}
						tokenClass[cd.type][tk] = allTokens[tk];
					}
				}
			}
		}
		getAllOutBalance(tokenClass, account);
	}, [allTokens, account]);

	useEffect(() => {
		if (account) {
			getAllOutBalanceFn();
		}
	}, [account, getAllOutBalanceFn]);

	const [swapState, dispatchSwapState] = useReducer(
		swapStateReducer,
		{
			initialCurrency: undefined,
			inputCurrencyURL: params.inputCurrency,
			outputCurrencyURL: params.outputCurrency,
			exactFieldURL: params.exactField,
			exactAmountURL: params.exactAmount,
		},
		getInitialSwapState
	);

	const {
		independentValue,
		dependentValue,
		independentField,
		inputCurrency,
		outputCurrency,
		bridgeType,
		registerAddress,
		PlusGasPricePercentage,
		isDeposit,
		depositMaxNum,
		depositMinNum,
		isRedeem,
		redeemMaxNum,
		redeemMinNum,
		maxFee,
		minFee,
		fee,
		dMaxFee,
		dMinFee,
		dFee,
		isViewMintModel,
		mintHistory,
		isViewMintInfo,
		realyValue,
		hashArr,
		hashCount,
		withdrawArr,
		withdrawCount,
		redeemBigValMoreTime,
		depositBigValMoreTime,
		pairid,
	} = swapState;

	const [recipient, setRecipient] = useState({
		address: "",
		name: "",
	});

	const recipientCount = useMemo(() => {
		return Date.now() + inputCurrency + bridgeType;
	}, [inputCurrency, bridgeType]);

	const [recipientError, setRecipientError] = useState();

	// get decimals and exchange address for each of the currency types
	const {
		symbol: inputSymbol,
		decimals: inputDecimals,
		name: inputName,
		depositAddress: initDepositAddress,
		isDeposit: initIsDeposit,
		depositMaxNum: initDepositMaxNum,
		depositMinNum: initDepositMinNum,
		isRedeem: initIsRedeem,
		redeemMaxNum: initRedeemMaxNum,
		redeemMinNum: initRedeemMinNum,
		maxFee: initMaxFee,
		minFee: initMinFee,
		fee: initFee,
		extendObj,
	} = useTokenDetails(inputCurrency);

	const [isRegister, setIsRegister] = useState(false);

	const [isHardwareTip, setIsHardwareTip] = useState(false);
	const [isHardwareError, setIsHardwareError] = useState(false);
	const [hardwareTxnsInfo, setHardwareTxnsInfo] = useState("");
	const [isDisabled, setIsDisableed] = useState(true);
	const [isMintBtn, setIsMintBtn] = useState(false);
	const [isRedeemBtn, setIsRedeem] = useState(false);
	const [mintDtil, setMintDtil] = useState({
		coin: "",
		value: "",
		hash: "",
		from: "",
		to: "",
		status: 0,
		timestamp: "",
	});
	const [mintDtilView, setMintDtilView] = useState(false);
	const [mintSureBtn, setMintSureBtn] = useState(false);
	const [mintModelTitle, setMintModelTitle] = useState();
	const [mintModelTip, setMintModelTip] = useState();
	const [balanceError, setBalanceError] = useState();
	const [bridgeNode, setBridgeNode] = useState();
	const [approveNum, setApproveNum] = useState();
	const [approveBtnView, setApproveNumBtnView] = useState(1);

	function setInit(disabled) {
		setIsRedeem(true);
		setIsMintBtn(true);
		dispatchSwapState({
			type: "UPDATE_SWAPREGISTER",
			payload: "",
			PlusGasPricePercentage: "",
			isDeposit: disabled,
			depositMaxNum: "",
			depositMinNum: "",
			depositBigValMoreTime: "",
			isRedeem: disabled,
			redeemMaxNum: "",
			redeemMinNum: "",
			maxFee: "",
			minFee: "",
			fee: "",
			dMaxFee: "",
			dMinFee: "",
			dFee: "",
			redeemBigValMoreTime: "",
			token: "",
			pairid: "",
		});
	}

	const fetchPoolTokens = useCallback(() => {
		// console.log(123)
		if (extendObj && extendObj.APPROVE && account) {
			// if (true) {
			// getAllowanceInfo(account, '', chainId, inputCurrency).then(res => {
			getAllowanceInfo(account, extendObj.APPROVE, chainId, inputCurrency).then((res) => {
				// console.log(res)
				if (res.msg === "Success") {
					setApproveNum(res.info.approve);
				} else {
					setApproveNum("");
				}
				setApproveNumBtnView(1);
			});
		} else {
			setApproveNum("");
			setApproveNumBtnView(1);
		}
	}, [inputCurrency, account, extendObj, chainId]);

	useEffect(() => {
		fetchPoolTokens();
		library.on("block", fetchPoolTokens);

		return () => {
			library.removeListener("block", fetchPoolTokens);
		};
	}, [inputCurrency, library, account, fetchPoolTokens]);

	useEffect(() => {
		let node = extendObj && extendObj.BRIDGE ? extendObj.BRIDGE[0].type : "";
		let version = extendObj && extendObj.VERSION ? extendObj.VERSION : "";
		let tokenOnlyOne = inputCurrency;

		setInit("");
		let coin = formatCoin(inputSymbol);
		if (account && initIsDeposit && initIsRedeem) {
			getServerInfo(account, tokenOnlyOne, inputSymbol, chainId, version).then((res) => {
				console.log(res);
				if (res.msg === "Success" && res.info) {
					let serverInfo = res.info;
					// setIsRegister(true)
					try {
						let DepositAddress = "";
						if (!isSpecialCoin(coin)) {
							let erc20Token =
								BridgeTokens[node] && BridgeTokens[node][coin] && BridgeTokens[node][coin].token
									? BridgeTokens[node][coin].token
									: "";
							if (
								initDepositAddress.toLowerCase() !== serverInfo.depositAddress.toLowerCase() ||
								tokenOnlyOne.toLowerCase() !== serverInfo.token.toLowerCase() ||
								(erc20Token && erc20Token.toLowerCase() !== serverInfo.outnetToken.toLowerCase())
							) {
								console.log(1);
								// removeRegisterInfo(account, tokenOnlyOne)
								removeLocalConfig(account, tokenOnlyOne, chainId);
								setInit(0);
								return;
							}
							DepositAddress = serverInfo.depositAddress;
						} else {
							if (
								serverInfo.dcrmAddress.toLowerCase() !==
								config[formatCoin(coin).toLowerCase()].initAddr.toLowerCase()
							) {
								console.log(2);
								// removeRegisterInfo(account, tokenOnlyOne)
								removeLocalConfig(account, tokenOnlyOne, chainId);
								setInit(0);
								return;
							}
							let p2pAddress = serverInfo.p2pAddress
								? serverInfo.p2pAddress
								: getRegisterInfo(account, tokenOnlyOne, chainId, version, coin).p2pAddress;
							if (p2pAddress) {
								DepositAddress = p2pAddress;
								let localBTCAddr = createAddress(
									account,
									coin,
									config[formatCoin(coin).toLowerCase()].initAddr
								);
								console.log("DepositAddress", DepositAddress);
								console.log("localBTCAddr", localBTCAddr);
								if (p2pAddress !== localBTCAddr) {
									console.log(3);
									// removeRegisterInfo(account, tokenOnlyOne)
									removeLocalConfig(account, tokenOnlyOne, chainId);
									setInit(0);
									return;
								}
							} else {
								console.log(4);
								// removeRegisterInfo(account, tokenOnlyOne)
								// removeLocalConfig(account, tokenOnlyOne, chainId)
								setInit("");
								return;
							}
						}
						let serverObj = {
							type: "UPDATE_SWAPREGISTER",
							payload: DepositAddress,
							PlusGasPricePercentage: serverInfo.PlusGasPricePercentage,
							isDeposit: serverInfo.isDeposit,
							depositMaxNum: serverInfo.depositMaxNum,
							depositMinNum: serverInfo.depositMinNum,
							depositBigValMoreTime: serverInfo.depositBigValMoreTime,
							isRedeem: serverInfo.isRedeem,
							redeemMaxNum: serverInfo.redeemMaxNum,
							redeemMinNum: serverInfo.redeemMinNum,
							maxFee: serverInfo.maxFee,
							minFee: serverInfo.minFee,
							fee: serverInfo.fee,
							dMaxFee: serverInfo.dMaxFee,
							dMinFee: serverInfo.dMinFee,
							dFee: serverInfo.dFee,
							redeemBigValMoreTime: serverInfo.redeemBigValMoreTime,
							token: serverInfo.token,
							pairid: serverInfo.pairid,
						};
						dispatchSwapState(serverObj);
					} catch (error) {
						console.log(error);
						setInit("");
						return;
					}
				} else {
					setInit("");
					// setIsRegister(false)
				}
			});
		} else {
			setInit("");
		}
	}, [
		inputCurrency,
		account,
		initDepositAddress,
		initIsDeposit,
		initDepositMaxNum,
		initDepositMinNum,
		initIsRedeem,
		initRedeemMaxNum,
		initRedeemMinNum,
		initMaxFee,
		initMinFee,
		initFee,
		inputSymbol,
		isRegister,
		chainId,
		extendObj,
	]);

	useEffect(() => {
		let version = extendObj && extendObj.VERSION ? extendObj.VERSION : "";
		let tokenOnlyOne = inputCurrency;

		setIsRegister(false);
		let coin = formatCoin(inputSymbol);
		if (account && initIsDeposit && initIsRedeem) {
			RegisterAddress(account, tokenOnlyOne, coin, chainId, version).then((res) => {
				if (res && res.msg === "Success") {
					setIsRegister(true);
				} else {
					setIsRegister(false);
				}
			});
		} else {
			setIsRegister(false);
		}
	}, [inputSymbol, initIsDeposit, initIsRedeem, account, extendObj, chainId, inputCurrency]);

	const [outNetBalance, setOutNetBalance] = useState();
	const [outNetETHBalance, setOutNetETHBalance] = useState();

	// get balances for each of the currency types
	const inputBalance = useAddressBalance(account, inputCurrency);
	const FSNBalance = useAddressBalance(account, config.symbol);
	const FSNBalanceNum = FSNBalance ? amountFormatter(FSNBalance) : 0;

	const setOutBalance = useCallback(() => {
		let node = extendObj && extendObj.BRIDGE ? extendObj.BRIDGE[0].type : "";
		if (node && account) {
			let lob = getLocalOutBalance(node, account, inputCurrency);
			if (lob && lob.info) {
				let bl = amountFormatter(new BigNumber(lob.info.balance), inputDecimals, Math.min(8, inputDecimals));
				setOutNetBalance(bl);
			} else {
				setOutNetBalance("");
			}
			let lobBase = getLocalOutBalance(node, account, "BASE");
			if (lobBase && lobBase.info) {
				let bl = amountFormatter(new BigNumber(lobBase.info.balance), 18, 8);
				setOutNetETHBalance(bl);
			} else {
				setOutNetETHBalance("");
			}
		}
	}, [inputCurrency, account, extendObj, inputDecimals]);

	useEffect(() => {
		// getOutBalance()
		setOutNetBalance("");
		setOutNetETHBalance("");
		setOutBalance();
	}, [inputCurrency, account, extendObj, inputBalance, hashCount, hashArr, FSNBalance, setOutBalance]);

	const inputBalanceFormatted = !!(inputBalance && Number.isInteger(inputDecimals))
		? amountFormatter(inputBalance, inputDecimals, inputDecimals)
		: "";

	const dependentValueFormatted = !!(dependentValue && (inputDecimals || inputDecimals === 0))
		? amountFormatter(dependentValue, inputDecimals, Math.min(8, inputDecimals), false)
		: "";

	let inputValueFormatted = independentField === INPUT ? independentValue : dependentValueFormatted;
	// console.log(inputValueFormatted)
	inputValueFormatted =
		inputValueFormatted || inputValueFormatted === 0
			? Number(formatDecimal(inputValueFormatted, inputDecimals))
			: "";

	const [isLimitAction, setIsLimitAction] = useState(true);
	const [limitAmount, setLimitAmount] = useState(0);

	useEffect(() => {
		if (extendObj && extendObj.APPROVE) {
			let node = extendObj && extendObj.BRIDGE ? extendObj.BRIDGE[0].type : "";
			if (bridgeType && bridgeType === "redeem") {
				let coin = formatCoin(inputSymbol);
				let erc20Token =
					BridgeTokens[node] && BridgeTokens[node][coin] && BridgeTokens[node][coin].token
						? BridgeTokens[node][coin].token
						: "";
				getTokenBalance(node, erc20Token, initDepositAddress, 0).then((res) => {
					// console.log(initDepositAddress)
					// console.log(res)
					let amount = amountFormatter(new BigNumber(res), inputDecimals);
					amount = Number(amount);
					let num = Number(inputValueFormatted);
					setLimitAmount(amount);
					if (amount - extendObj.APPROVELIMIT > num) {
						setIsLimitAction(true);
					} else {
						setIsLimitAction(false);
					}
				});
			} else {
				getTokenBalance(config.nodeRpc, inputCurrency, extendObj.APPROVE, 1).then((res) => {
					console.log(res);
					let amount = amountFormatter(new BigNumber(res), inputDecimals);
					amount = Number(amount);
					let num = Number(inputValueFormatted);
					// console.log(amount)
					setLimitAmount(amount);
					if (amount - extendObj.APPROVELIMIT > num) {
						setIsLimitAction(true);
					} else {
						setIsLimitAction(false);
					}
				});
			}
		} else {
			setIsLimitAction(true);
			setLimitAmount("");
		}
	}, [
		account,
		inputCurrency,
		inputValueFormatted,
		bridgeType,
		extendObj,
		initDepositAddress,
		inputDecimals,
		inputSymbol,
	]);

	function formatBalance(value) {
		return `Balance: ${formatDecimal(value, Math.min(config.keepDec, inputDecimals))}`;
	}
	const toggleWalletModal = useWalletModalToggle();

	const newInputDetected =
		inputCurrency !== config.symbol &&
		inputCurrency &&
		!INITIAL_TOKENS_CONTEXT[chainId].hasOwnProperty(inputCurrency);

	const [showInputWarning, setShowInputWarning] = useState(false);

	useEffect(() => {
		if (newInputDetected) {
			setShowInputWarning(true);
		} else {
			setShowInputWarning(false);
		}
	}, [newInputDetected, setShowInputWarning]);

	const addTransaction = useTransactionAdder();

	const tokenContract = useSwapTokenContract(
		extendObj && extendObj.APPROVE ? extendObj.APPROVE : inputCurrency,
		swapBTCABI
	);
	const tokenETHContract = useSwapTokenContract(
		extendObj && extendObj.APPROVE ? extendObj.APPROVE : inputCurrency,
		swapETHABI
	);
	const tokenERC20Contract = useSwapTokenContract(inputCurrency, erc20);

	useEffect(() => {
		if (bridgeType && bridgeType === "redeem") {
			if (
				!error &&
				isDisabled &&
				isRedeem &&
				!showBetaMessage &&
				inputValueFormatted &&
				recipient.address &&
				Number(inputBalanceFormatted) >= Number(inputValueFormatted) &&
				Number(inputValueFormatted) <= Number(redeemMaxNum) &&
				Number(inputValueFormatted) >= Number(redeemMinNum) &&
				isLimitAction
			) {
				if (isSpecialCoin(inputSymbol) && isBTCAddress(recipient.address, inputSymbol)) {
					if (extendObj && extendObj.APPROVE && (!approveNum || !Number(approveNum))) {
						setIsRedeem(true);
					} else {
						setIsRedeem(false);
					}
					setBalanceError("");
				} else if (!isSpecialCoin(inputSymbol) && isAddress(recipient.address)) {
					if (extendObj && extendObj.APPROVE && (!approveNum || !Number(approveNum))) {
						setIsRedeem(true);
					} else {
						setIsRedeem(false);
					}
					setBalanceError("");
				} else {
					setIsRedeem(true);
					if (
						inputValueFormatted === "" ||
						(Number(inputBalanceFormatted) >= Number(inputValueFormatted) &&
							Number(inputValueFormatted) <= Number(redeemMaxNum) &&
							Number(inputValueFormatted) >= Number(redeemMinNum))
					) {
						setBalanceError("");
					} else {
						setBalanceError("Error");
					}
				}
			} else {
				setIsRedeem(true);
				if (
					inputValueFormatted === "" ||
					(Number(inputBalanceFormatted) >= Number(inputValueFormatted) &&
						Number(inputValueFormatted) <= Number(redeemMaxNum) &&
						Number(inputValueFormatted) >= Number(redeemMinNum))
				) {
					setBalanceError("");
				} else {
					setBalanceError("Error");
				}
			}
		} else {
			if (
				isDisabled &&
				isDeposit &&
				!showBetaMessage &&
				inputValueFormatted &&
				registerAddress &&
				isRegister &&
				Number(inputValueFormatted) <= depositMaxNum &&
				Number(inputValueFormatted) >= depositMinNum &&
				isLimitAction
			) {
				if (isSpecialCoin(inputSymbol)) {
					setIsMintBtn(false);
					setBalanceError("");
				} else if (
					!isSpecialCoin(inputSymbol) &&
					Number(inputValueFormatted) <= Number(outNetBalance) &&
					Number(outNetETHBalance) >= 0.01
				) {
					setIsMintBtn(false);
					setBalanceError("");
				} else {
					setIsMintBtn(true);
					if (
						inputValueFormatted === "" ||
						(Number(inputValueFormatted) <= depositMaxNum && Number(inputValueFormatted) >= depositMinNum)
					) {
						setBalanceError("");
					} else {
						setBalanceError("Error");
					}
				}
			} else {
				setIsMintBtn(true);
				if (
					inputValueFormatted === "" ||
					(Number(inputValueFormatted) <= depositMaxNum && Number(inputValueFormatted) >= depositMinNum)
				) {
					setBalanceError("");
				} else {
					setBalanceError("Error");
				}
			}
		}
	}, [
		account,
		isDisabled,
		isRedeem,
		showBetaMessage,
		recipient.address,
		independentValue,
		inputSymbol,
		isDeposit,
		registerAddress,
		outNetBalance,
		bridgeType,
		depositMaxNum,
		depositMinNum,
		isLimitAction,
		approveNum,
		error,
		extendObj,
		inputBalanceFormatted,
		inputValueFormatted,
		isRegister,
		outNetETHBalance,
		redeemMaxNum,
		redeemMinNum,
	]);

	function cleanInput() {
		dispatchSwapState({
			type: "UPDATE_INDEPENDENT",
			payload: {
				value: "",
				field: INPUT,
				realyValue: "",
			},
		});
	}

	function sendTxnsEnd(data, value, address, node) {
		addTransaction(data);
		recordTxns(data, "WITHDRAW", inputSymbol, account, address, node);
		dispatchSwapState({
			type: "UPDATE_WITHDRAW_STATUS",
			payload: {
				type: 0,
				withdrawData: {
					account: account,
					coin: inputSymbol,
					value: amountFormatter(value, inputDecimals, inputDecimals),
					hash: data.hash,
					from: account,
					to: address,
					status: 0,
					timestamp: Date.now(),
					swapHash: "",
					swapStatus: "pending",
					swapTime: "",
					node: node,
					bridgeVersion: extendObj.VERSION ? extendObj.VERSION : "V1",
					chainID: config.chainID,
					bindAddr: recipient.address,
					pairid: pairid,
				},
			},
		});
		cleanInput();
	}

	function sendTxns(node) {
		if (isSpecialCoin(inputSymbol) && !isBTCAddress(recipient.address, inputSymbol)) {
			alert("Illegal address!");
			return;
		}
		if (!isDisabled) return;
		setIsDisableed(false);
		setTimeout(() => {
			setIsDisableed(true);
		}, 3000);

		let amountVal = ethers.utils.parseUnits(inputValueFormatted.toString(), inputDecimals);
		if (amountVal.gt(inputBalance)) {
			amountVal = inputBalance;
		}
		let address = recipient.address;
		let token = extendObj && extendObj.APPROVE ? extendObj.APPROVE : inputCurrency;
		console.log(token);
		if (config.supportWallet.includes(walletType)) {
			setIsHardwareError(false);
			setIsHardwareTip(true);
			setHardwareTxnsInfo(amountFormatter(amountVal, inputDecimals, inputDecimals) + " " + inputSymbol);

			let web3Contract = getWeb3ConTract(swapETHABI, token);
			if (isSpecialCoin(inputSymbol)) {
				web3Contract = getWeb3ConTract(swapBTCABI, token);
			}
			let data = web3Contract.methods.Swapout(amountVal, address).encodeABI();
			getWeb3BaseInfo(token, data, account).then((res) => {
				if (res.msg === "Success") {
					// console.log(res.info)
					sendTxnsEnd(res.info, amountVal, address, node);
				} else {
					alert(res.error);
				}
				setIsHardwareTip(false);
			});
			return;
		}

		if (isSpecialCoin(inputSymbol) === 0) {
			tokenETHContract
				.Swapout(amountVal, address)
				.then((res) => {
					sendTxnsEnd(res, amountVal, address, node);
					setIsHardwareTip(false);
				})
				.catch((err) => {
					console.log(err);
					setIsHardwareTip(false);
				});
		} else {
			tokenContract
				.Swapout(amountVal, address)
				.then((res) => {
					sendTxnsEnd(res, amountVal, address, node);
					setIsHardwareTip(false);
				})
				.catch((err) => {
					console.log(err);
					setIsHardwareTip(false);
				});
		}
	}

	function MintModelView() {
		if (!registerAddress) return;
		dispatchSwapState({
			type: "UPDATE_MINTTYPE",
			payload: isViewMintModel ? false : true,
		});
	}
	function MintInfoModelView() {
		dispatchSwapState({
			type: "UPDATE_MINTINFOTYPE",
			payload: isViewMintInfo ? false : true,
		});
	}
	function changeMorR(type) {
		// let bt = ''
		// if ()
		// if (bridgeType && bridgeType === 'redeem') {
		//   bt = 'mint'
		// } else {
		//   bt = 'redeem'
		// }
		dispatchSwapState({ type: "UPDATE_BREDGETYPE", payload: type });
		cleanInput();
	}

	function insertMintHistory(pairid, coin, value, hash, from, to, node, status, swapHash, swapStatus, swapTime) {
		let data = {
			account: account,
			coin: coin,
			value: value,
			hash: hash,
			from: from,
			to: to,
			status: status ? status : 0,
			timestamp: Date.now(),
			swapHash: swapHash ? swapHash : "",
			swapStatus: swapStatus ? swapStatus : "",
			swapTime: swapTime ? swapTime : "",
			node: node,
			bridgeVersion: extendObj.VERSION ? extendObj.VERSION : "V1",
			chainID: config.chainID,
			pairid: pairid,
		};
		console.log(data);
		dispatchSwapState({
			type: "UPDATE_HASH_STATUS",
			payload: {
				type: 0,
				hashData: data,
			},
		});
	}

	function mintAmount(mintAddress, mintCoin) {
		let coin = formatCoin(mintCoin);

		if (initDepositAddress.toLowerCase() !== mintAddress.toLowerCase()) {
			alert("Data error, please refresh and try again!");
			setIsHardwareTip(false);
			setMintSureBtn(false);
			setMintModelTitle("");
			setMintModelTip("");
			return;
		}

		// let token = extendObj && extendObj.APPROVE ? extendObj.APPROVE : inputCurrency
		let token = inputCurrency;

		if (walletType === "Ledger") {
			setHardwareTxnsInfo(inputValueFormatted + " " + coin);
			setIsHardwareTip(true);
			setMintSureBtn(false);
			// MintModelView()
			HDsendERC20Txns(
				coin,
				account,
				mintAddress,
				inputValueFormatted,
				PlusGasPricePercentage,
				bridgeNode,
				token
			).then((res) => {
				// console.log(res)
				if (res.msg === "Success") {
					recordTxns(res.info, "DEPOSIT", inputSymbol, account, mintAddress, bridgeNode);
					insertMintHistory(
						pairid,
						coin,
						inputValueFormatted,
						res.info.hash,
						account,
						mintAddress,
						bridgeNode
					);
					cleanInput();
					setIsHardwareTip(false);
					setMintModelTitle("");
					setMintModelTip("");
					setMintSureBtn(false);
				} else {
					setIsHardwareError(true);
					alert(res.error.toString());
				}
			});
		} else {
			setMintSureBtn(false);
			MMsendERC20Txns(
				coin,
				account,
				mintAddress,
				inputValueFormatted,
				PlusGasPricePercentage,
				bridgeNode,
				token
			).then((res) => {
				// console.log(res)
				if (res.msg === "Success") {
					console.log(bridgeNode);
					recordTxns(res.info, "DEPOSIT", inputSymbol, account, mintAddress, bridgeNode);
					insertMintHistory(
						pairid,
						coin,
						inputValueFormatted,
						res.info.hash,
						account,
						mintAddress,
						bridgeNode
					);
					cleanInput();
				} else {
					console.log(res.error);
					alert(res.error.toString());
				}
				setIsHardwareTip(false);
				setMintSureBtn(false);
				setMintModelTitle("");
				setMintModelTip("");
			});
		}
	}

	const [removeHashStatus, setRemoveHashStatus] = useState();
	function removeHash(index) {
		let arr = [];
		if (bridgeType === "redeem") {
			for (let i = 0, len = withdrawArr.length; i < len; i++) {
				if (index === i) continue;
				arr.push(withdrawArr[i]);
			}
			dispatchSwapState({
				type: "UPDATE_WITHDRAW_STATUS",
				payload: {
					type: 1,
					withdrawData: arr,
				},
			});
		} else {
			for (let i = 0, len = hashArr.length; i < len; i++) {
				if (index === i) continue;
				arr.push(hashArr[i]);
			}
			dispatchSwapState({
				type: "UPDATE_HASH_STATUS",
				payload: {
					type: 1,
					hashData: arr,
				},
			});
		}
		setRemoveHashStatus(Date.now());
	}

	const updateHashStatusData = useCallback(
		(res) => {
			if (hashArr[res.index] && res.hash === hashArr[res.index].hash) {
				hashArr[res.index].status = res.status;
				hashArr[res.index].swapHash = res.swapHash ? res.swapHash : "";
				hashArr[res.index].swapStatus = res.swapStatus ? res.swapStatus : "";
				hashArr[res.index].swapTime = res.swapTime ? res.swapTime : "";
				dispatchSwapState({
					type: "UPDATE_HASH_STATUS",
					payload: {
						type: 1,
						hashData: hashArr,
						NewHashCount: 1,
					},
				});
			}
		},
		[hashArr]
	);

	const updateHashStatus = useCallback(() => {
		if (hashArr.length > 0) {
			for (let i = 0, len = hashArr.length; i < len; i++) {
				if (hashArr[i].chainID && hashArr[i].chainID !== config.chainID) continue;
				if (
					!hashArr[i].status ||
					!hashArr[i].swapStatus ||
					hashArr[i].swapStatus === "pending" ||
					hashArr[i].swapStatus === "confirming" ||
					hashArr[i].swapStatus === "minting"
				) {
					if (isSpecialCoin(hashArr[i].coin)) {
						GetBTChashStatus(
							hashArr[i].hash,
							i,
							hashArr[i].coin,
							hashArr[i].status,
							hashArr[i].account,
							hashArr[i].bridgeVersion,
							hashArr[i].pairid
						).then((res) => {
							updateHashStatusData(res);
						});
					} else {
						getHashStatus(
							hashArr[i].hash,
							i,
							hashArr[i].coin,
							hashArr[i].status,
							hashArr[i].node,
							hashArr[i].account,
							hashArr[i].bridgeVersion,
							hashArr[i].pairid
						).then((res) => {
							updateHashStatusData(res);
						});
					}
				}
			}
		}
	}, [hashArr, updateHashStatusData]);

	const updateWithdrawStatus = useCallback(() => {
		if (withdrawArr.length > 0) {
			for (let i = 0, len = withdrawArr.length; i < len; i++) {
				if (withdrawArr[i].chainID && withdrawArr[i].chainID !== config.chainID) continue;
				if (
					!withdrawArr[i].status ||
					!withdrawArr[i].swapStatus ||
					withdrawArr[i].swapStatus === "pending" ||
					withdrawArr[i].swapStatus === "confirming" ||
					withdrawArr[i].swapStatus === "minting"
				) {
					let binAddr = withdrawArr[i].bindAddr;
					getWithdrawHashStatus(
						withdrawArr[i].hash,
						i,
						withdrawArr[i].coin,
						withdrawArr[i].status,
						withdrawArr[i].node,
						binAddr,
						withdrawArr[i].bridgeVersion,
						withdrawArr[i].pairid
					).then((res) => {
						// console.log(res)
						if (withdrawArr[res.index] && res.hash === withdrawArr[res.index].hash) {
							withdrawArr[res.index].status = res.status ? res.status : 0;
							withdrawArr[res.index].swapHash = res.swapHash ? res.swapHash : "";
							withdrawArr[res.index].swapStatus = res.swapStatus ? res.swapStatus : "pending";
							withdrawArr[res.index].swapTime = res.swapTime ? res.swapTime : "";
							dispatchSwapState({
								type: "UPDATE_WITHDRAW_STATUS",
								payload: {
									type: 1,
									withdrawData: withdrawArr,
									withdrawCount: 1,
								},
							});
						}
					});
				}
			}
		}
	}, [withdrawArr]);

	useEffect(() => {
		if (!account) return;
		clearInterval(hashInterval);
		updateHashStatus();
		updateWithdrawStatus();
		hashInterval = setInterval(() => {
			if (window.location.pathname.indexOf("bridge") !== -1) {
				updateHashStatus();
				updateWithdrawStatus();
			} else {
				clearInterval(hashInterval);
			}
		}, 1000 * 30);
	}, [removeHashStatus, account, updateHashStatus, updateWithdrawStatus]);

	const [mintBTCErrorTip, setMintBTCErrorTip] = useState();
	const [loadingState, setLoadingState] = useState(false);

	function getBTCtxns() {
		setLoadingState(true);
		GetBTCtxnsAll(
			registerAddress,
			account,
			formatCoin(inputSymbol),
			extendObj.VERSION ? extendObj.VERSION : "V1"
		).then((res) => {
			// console.log(res)
			if (res) {
				for (let obj of hashArr) {
					if (res.hash === obj.hash) {
						setMintBTCErrorTip(
							`No new deposit transaction found. Please send ${formatCoin(
								inputSymbol
							)} to deposit address first.`
						);
						MintModelView();
						return;
					}
				}
				insertMintHistory(
					pairid,
					res.coin,
					res.value,
					res.hash,
					account,
					res.to,
					0,
					res.status,
					res.swapHash,
					res.swapStatus,
					res.swapTime
				);
				cleanInput();
				setMintDtil(res);
				setMintDtilView(true);
			} else {
				setMintBTCErrorTip(
					`No new deposit transaction found. Please send ${formatCoin(inputSymbol)} to deposit address first.`
				);
				MintModelView();
			}
			setLoadingState(false);
		});
	}

	function walletTip() {
		let node = extendObj && extendObj.BRIDGE ? extendObj.BRIDGE[0] : "";
		if (node) {
			let coin = config.bridgeAll[node.type].symbol;
			return (
				// eslint-disable-next-line
				<dd>
					<i></i>💀 {`ONLY the deposits from your ${coin} wallet ${account} will be credited!!!`}
				</dd>
			);
		}
	}

	function txnsList(arr, count) {
		return (
			<MintHahshList key={count}>
				<ul>
					{arr.map((item, index) => {
						if (item.account !== account) {
							return "";
						}
						return (
							<li key={count ? index + count : index}>
								<Flex className="pd0">
									<TokenLogo
										address={item.coin}
										size={"2rem"}
										onClick={() => {
											setMintDtil(item);
											setMintDtilView(true);
										}}
									/>
									<div
										className="del"
										onClick={() => {
											removeHash(index);
										}}
									>
										x
									</div>
								</Flex>
							</li>
						);
					})}
				</ul>
			</MintHahshList>
		);
	}

	function txnsListDtil() {
		if (!mintDtil || !mintDtil.hash) return "";
		let hashCurObj = {};
		let hashOutObj = {};
		if (bridgeType === "redeem") {
			hashCurObj = {
				hash: mintDtil.hash,
				url: config.bridgeAll[chainId].lookHash + mintDtil.hash,
			};
			if (isSpecialCoin(mintDtil.coin)) {
				hashOutObj = {
					hash: mintDtil.swapHash,
					url: config[formatCoin(mintDtil.coin).toLowerCase()].lookHash + mintDtil.swapHash,
				};
			} else {
				hashOutObj = {
					hash: mintDtil.swapHash,
					url: config.bridgeAll[mintDtil.node].lookHash + mintDtil.swapHash,
				};
			}
		} else {
			hashOutObj = {
				hash: mintDtil.swapHash,
				url: config.bridgeAll[chainId].lookHash + mintDtil.swapHash,
			};
			if (isSpecialCoin(mintDtil.coin)) {
				hashCurObj = {
					hash: mintDtil.hash,
					url: config[formatCoin(mintDtil.coin).toLowerCase()].lookHash + mintDtil.hash,
				};
			} else {
				hashCurObj = {
					hash: mintDtil.hash,
					url: config.bridgeAll[mintDtil.node].lookHash + mintDtil.hash,
				};
			}
		}

		let outNodeName = "",
			curNodeName = config.bridgeAll[chainId].name;
		if (!mintDtil.node) {
			if (isSpecialCoin(mintDtil.coin) === 1) {
				outNodeName = "Bitcoin";
			} else if (isSpecialCoin(mintDtil.coin) === 2) {
				outNodeName = "Litecoin";
			} else if (isSpecialCoin(mintDtil.coin) === 3) {
				outNodeName = "Blocknet";
			}
		} else {
			outNodeName = config.bridgeAll[mintDtil.node].name;
		}
		let curHash = (
			<MintListVal>
				<a href={hashCurObj.url} rel="noopener noreferrer" target="_blank" className="link">
					{hashCurObj.hash}
				</a>
				<Copy toCopy={hashCurObj.hash} />
			</MintListVal>
		);
		let outHash = (
			<MintListVal>
				<a href={hashOutObj.url} rel="noopener noreferrer" target="_blank" className="link">
					{hashOutObj.hash}
				</a>
				<Copy toCopy={hashOutObj.hash} />
			</MintListVal>
		);
		let outStatus = (
			<HashStatus className={!mintDtil.status ? "yellow" : mintDtil.status === 1 ? "green" : "red"}>
				<div>
					<img src={ScheduleIcon} alt="" style={{ marginRight: "10px" }} />
					{outNodeName + " " + t("txnsStatus")}
				</div>
				{!mintDtil.status ? (
					<span className="green">{bridgeType === "redeem" ? "Redeeming" : "Pending"}</span>
				) : (
					""
				)}
				{mintDtil.status === 1 ? <span className="green">Success</span> : ""}
				{mintDtil.status === 2 ? <span className="red">Failure</span> : ""}
			</HashStatus>
		);
		const fromView = (
			<MintList>
				<MintListLabel>{bridgeType === "redeem" ? t("from") : t("to")}:</MintListLabel>
				<MintListVal>
					{mintDtil.from ? mintDtil.from : account}
					<Copy toCopy={mintDtil.from ? mintDtil.from : account} />
				</MintListVal>
			</MintList>
		);
		const toView = (
			<MintList>
				<MintListLabel>{bridgeType === "redeem" ? t("to") : t("from")}:</MintListLabel>
				<MintListVal>
					{mintDtil.to}
					<Copy toCopy={mintDtil.to} />
				</MintListVal>
			</MintList>
		);
		return (
			<MintDiv>
				<MintList>
					<MintListLabel>
						{(bridgeType === "redeem" ? curNodeName : outNodeName) + " " + t("hash")}:
					</MintListLabel>
					{curHash}
				</MintList>
				{hashOutObj.hash ? (
					<MintList>
						<MintListLabel>
							{(bridgeType === "redeem" ? outNodeName : curNodeName) + " " + t("hash")}:
						</MintListLabel>
						{outHash}
					</MintList>
				) : (
					""
				)}
				{bridgeType === "redeem" ? (
					<>
						{fromView}
						{toView}
					</>
				) : (
					<>
						{toView}
						{fromView}
					</>
				)}
				<MintList>
					<MintListLabel>{t("value")}:</MintListLabel>
					<MintListVal>{Number(mintDtil.value)}</MintListVal>
				</MintList>
				<Flex className="pd0">
					<TokenLogoBox1>
						<TokenLogo address={mintDtil.coin} size={"26px"} />
					</TokenLogoBox1>
				</Flex>
				<Flex className="pd0">
					<DepositValue>
						<p>{bridgeType === "redeem" ? t("ValueWithdraw") : t("ValueDeposited")}</p>
						<span>
							{Number(mintDtil.value)} {mintDtil.coin}
						</span>
					</DepositValue>
				</Flex>
				{bridgeType && bridgeType === "redeem" ? "" : outStatus}
				{mintDtil.swapStatus ? (
					<HashStatus
						className={
							mintDtil.swapStatus === "confirming" || mintDtil.swapStatus === "minting"
								? "yellow"
								: mintDtil.swapStatus === "failure" || mintDtil.swapStatus === "timeout"
								? "red"
								: "green"
						}
					>
						<div>
							<img src={ScheduleIcon} alt="" style={{ marginRight: "10px" }} />
							{curNodeName + " " + t("txnsStatus")}
						</div>
						<span style={{ textTransform: "Capitalize" }}>{mintDtil.swapStatus}</span>
					</HashStatus>
				) : (
					""
				)}
				{bridgeType && bridgeType === "redeem" && mintDtil.swapStatus === "success" ? outStatus : ""}
			</MintDiv>
		);
	}

	function approve() {
		let _userTokenBalance = ethers.constants.MaxUint256.toString();

		let token = extendObj.APPROVE;
		let sourceToken = inputCurrency;
		setApproveNumBtnView("");
		// let token = '0xe23edd629f264c14333b1d7cb3374259e9df5d55'
		// let sourceToken = '0xd5190a1C83B7cf3566098605E00fA0C0fD5F3778'
		if (config.supportWallet.includes(walletType)) {
			// setIsHardwareTip(true)
			// setHardwareTxnsInfo('Approve ' + inputSymbol)
			setIsHardwareError(false);
			setIsHardwareTip(true);
			setHardwareTxnsInfo("Unlock " + inputSymbol);
			let web3Contract = getWeb3ConTract(erc20, sourceToken);
			const data = web3Contract.methods.approve(token, _userTokenBalance).encodeABI();
			getWeb3BaseInfo(sourceToken, data, account).then((res) => {
				if (res.msg === "Success") {
					console.log(res.info);
					addTransaction(res.info);
				} else {
					alert(res.error);
					setApproveNumBtnView(1);
				}
				setIsHardwareTip(false);
			});
			return;
		}

		tokenERC20Contract
			.approve(token, _userTokenBalance)
			.then((res) => {
				console.log(res);
				addTransaction(res);
				setIsHardwareTip(false);
			})
			.catch((err) => {
				setIsHardwareTip(false);
				setApproveNumBtnView(1);
				console.log(err);
			});
	}

	function redeemBtn(type, index) {
		return (
			<>
				<Button
					disabled={isRedeemBtn}
					key={index}
					onClick={() => {
						sendTxns(type);
					}}
					variant={"primary"}
				>
					Redeem
				</Button>
			</>
		);
	}

	function mintBtn(type, index) {
		return (
			<>
				<Button
					disabled={isMintBtn}
					key={index}
					onClick={() => {
						// MintModelView()
						if (!isDisabled) return;
						setIsDisableed(false);
						setTimeout(() => {
							setIsDisableed(true);
						}, 3000);
						if (isSpecialCoin(inputSymbol)) {
							// MintModelView()
							getBTCtxns();
						} else {
							setBridgeNode(type);
							setMintSureBtn(true);
							setHardwareTxnsInfo(inputValueFormatted + " " + formatCoin(inputSymbol));
							setIsHardwareTip(true);
							setMintModelTitle("CrossChain Deposit");
							if (walletType === "Ledger") {
								setMintModelTip("Please confirm transaction on your Ledger");
							} else {
								setMintModelTip("Please click confirm button to sign on your Metamask.");
							}
						}
					}}
					variant={"primary"}
				>
					CrossChain Deposit
				</Button>
			</>
		);
	}

	function viewBtn(type) {
		let btn = "";
		if (type === "redeem") {
			if (extendObj && extendObj.BRIDGE) {
				btn = extendObj.BRIDGE.map((item, index) => {
					if (item.isSwitch) {
						return redeemBtn(item.type, index);
					} else {
						return "";
					}
				});
			} else {
				btn = redeemBtn("");
			}
		} else {
			if (loadingState) {
				btn = (
					<Button disabled={true} variant={"primary"}>
						Querying
					</Button>
				);
			} else {
				if (extendObj && extendObj.BRIDGE) {
					btn = extendObj.BRIDGE.map((item, index) => {
						if (item.isSwitch) {
							// return mintBtn(item.type, index)
							return mintBtn(item.type, index);
						} else {
							return "";
						}
					});
				} else {
					btn = mintBtn("");
				}
			}
		}
		return btn;
	}

	function noBalanceTip() {
		let node =
			extendObj && extendObj.BRIDGE && extendObj.BRIDGE[0] && extendObj.BRIDGE[0].type
				? extendObj.BRIDGE[0].type
				: "";
		if (
			(bridgeType && bridgeType === "redeem") ||
			!account ||
			!registerAddress ||
			isSpecialCoin(inputSymbol) ||
			(Number(outNetETHBalance) >= 0.02 && Number(outNetBalance) > Number(depositMinNum)) ||
			!node
		) {
			return "";
		} else {
			let coin = formatCoin(inputSymbol);
			if (node === 1 || node === 4) {
				if (coin !== "ETH") {
					coin = coin + "-ERC20";
				}
			}
			return (
				<Col xs={12}>
					<AlertContainer className={"mt-4"}>
						<AlertText>
							You need have{" "}
							<strong>
								{coin} and 0.02 {config.bridgeAll[node].symbol} gas fee
							</strong>{" "}
							on your same eth wallet first: {shortenAddress(account)}
						</AlertText>
					</AlertContainer>
				</Col>
			);
		}
	}

	return (
		<Page networkSensitive={false}>
			<Row>
				<Col xs={12} lg={{ span: 8, offset: 2 }}>
					<ListGroup horizontal className="mb-5">
						<ListGroup.Item action href="/#/cross/anyswap">
							{t("menu.anySwap")}
						</ListGroup.Item>
						<ListGroup.Item action href="/#/cross/bridges" active>
							{t("menu.bridges")}
						</ListGroup.Item>
						<ListGroup.Item action href="/#/cross/balance">
							{t("menu.crossBalance")}
						</ListGroup.Item>
					</ListGroup>

					<Header>
						<Title>{bridgeType && bridgeType === "redeem" ? "Redeem" : "Deposit"}</Title>

						<TabHeader>
							<TabButton
								onClick={() => changeMorR("mint")}
								variant={bridgeType && bridgeType !== "redeem" ? "primary" : "light-primary"}
							>
								Deposit
							</TabButton>
							<TabButton
								onClick={() => changeMorR("redeem")}
								variant={bridgeType && bridgeType === "redeem" ? "primary" : "light-primary"}
							>
								Redeem
							</TabButton>
						</TabHeader>
					</Header>

					<HardwareTip
						HardwareTipOpen={isHardwareTip}
						closeHardwareTip={() => {
							setIsHardwareTip(false);
							setIsHardwareError(false);
						}}
						error={isHardwareError}
						txnsInfo={hardwareTxnsInfo}
						isSelfBtn={mintSureBtn}
						onSure={() => {
							mintAmount(registerAddress, inputSymbol);
						}}
						title={mintModelTitle}
						tipInfo={mintModelTip}
						coin={inputSymbol}
					/>

					<Modal show={isViewMintModel} onHide={MintModelView} centered>
						<Modal.Header>
							<Modal.Title>Deposit</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<MintDiv>
								{inputValueFormatted && (
									<MintList>
										<MintListLabel>
											Deposit {inputSymbol && formatCoin(inputSymbol)} amount:
										</MintListLabel>
										<MintListVal>{inputValueFormatted}</MintListVal>
									</MintList>
								)}

								<MintList>
									<MintListLabel>
										Deposit {inputSymbol && formatCoin(inputSymbol)} address:
									</MintListLabel>
									<MintListVal>
										{registerAddress ? registerAddress : ""}
										<Copy toCopy={registerAddress} />
									</MintListVal>
								</MintList>
								<MintListCenter>
									<WalletConnectData size={160} uri={registerAddress} />
								</MintListCenter>

								{mintBTCErrorTip && (
									<AlertContainer>
										<AlertText>{mintBTCErrorTip}</AlertText>
									</AlertContainer>
								)}
							</MintDiv>
						</Modal.Body>
					</Modal>

					<Modal show={isViewMintInfo} onHide={MintInfoModelView} centered>
						<Modal.Body>
							<MintDiv>
								<MintList>
									<MintListLabel>{t("hash")}:</MintListLabel>
									<MintListVal>
										{mintHistory && mintHistory?.mintHash ? mintHistory?.mintHash : ""}
									</MintListVal>
								</MintList>
								<MintList>
									<MintListLabel>{t("from")}:</MintListLabel>
									<MintListVal>
										{mintHistory && mintHistory?.from ? mintHistory?.from : ""}
									</MintListVal>
								</MintList>
								<MintList>
									<MintListLabel>{t("to")}:</MintListLabel>
									<MintListVal>{registerAddress ? registerAddress : ""}</MintListVal>
								</MintList>
								<MintList>
									<MintListLabel>{t("value")}:</MintListLabel>
									<MintListVal>
										{mintHistory && mintHistory?.mintValue ? mintHistory?.mintValue : ""}
									</MintListVal>
								</MintList>
								<MintList>
									<MintListLabel>{t("fee")}:</MintListLabel>
									<MintListVal>
										{mintHistory && mintHistory?.mintValue && (fee || fee === 0)
											? Number(mintHistory?.mintValue) * Number(fee)
											: 0}
									</MintListVal>
								</MintList>
								<MintList>
									<MintListLabel>{t("receive")}:</MintListLabel>
									<MintListVal>
										{mintHistory && mintHistory?.mintValue && (fee || fee === 0)
											? Number(mintHistory?.mintValue) * (1 - Number(fee))
											: ""}
									</MintListVal>
								</MintList>
								<MintList>
									<MintListLabel>
										{t("receive")} {config?.symbol} {t("address")}:
									</MintListLabel>
									<MintListVal>{account}</MintListVal>
								</MintList>
							</MintDiv>
						</Modal.Body>
					</Modal>

					<Modal show={mintDtilView} onHide={setMintDtilView.bind(this, false)} centered>
						<Modal.Header>
							<Modal.Title>Transaction Details</Modal.Title>
						</Modal.Header>
						<Modal.Body>{mintDtil ? txnsListDtil() : ""}</Modal.Body>
					</Modal>

					{mintHistory && mintHistory?.mintTip && (
						<Card>
							<MintTip onClick={MintInfoModelView}>
								<Flex className="pd0">
									<Flex className="pd0">
										<TokenLogo
											size={"32px"}
											address={inputSymbol ? "BTC" : formatCoin(inputSymbol)}
										/>
									</Flex>
									<MintListVal className="txt">
										<Flex className="pd0">Waiting for deposit</Flex>
									</MintListVal>
								</Flex>
							</MintTip>
						</Card>
					)}

					<Card>
						<BridgeInputPanel
							urlAddedTokens={urlAddedTokens}
							selectedTokens={[inputCurrency, outputCurrency]}
							selectedTokenAddress={inputCurrency}
							value={inputValueFormatted}
							selfUseAllToken={selfUseAllToken}
							isSelfSymbol={
								bridgeType && bridgeType === "redeem" && inputSymbol
									? inputSymbol
									: inputSymbol && formatCoin(inputSymbol)
							}
							isSelfLogo={
								bridgeType && bridgeType === "redeem" && inputSymbol
									? ""
									: inputSymbol && formatCoin(inputSymbol)
							}
							isSelfName={
								bridgeType && bridgeType === "redeem" && inputName
									? ""
									: formatName(inputName, extendObj)
							}
							onUserInput={(inputValue) => {
								let iValue = formatDecimal(inputValue, inputDecimals);
								let inputVal =
									iValue && Number(iValue)
										? new BigNumber(
												ethers.utils.parseUnits(iValue.toString(), inputDecimals).toString()
										  )
										: new BigNumber(0);
								let _fee = inputVal
									.times(ethers.utils.parseUnits(dFee.toString(), 18).toString())
									.dividedBy(new BigNumber(10).pow(new BigNumber(18)).toString());
								let _minFee = new BigNumber(
									ethers.utils.parseUnits(dMinFee.toString(), inputDecimals).toString()
								);
								let _maxFee = new BigNumber(
									ethers.utils.parseUnits(dMaxFee.toString(), inputDecimals).toString()
								);
								if (bridgeType && bridgeType === "redeem") {
									_fee = inputVal
										.times(ethers.utils.parseUnits(fee.toString(), 18).toString())
										.dividedBy(new BigNumber(10).pow(new BigNumber(18)).toString());
									_minFee = new BigNumber(
										ethers.utils.parseUnits(minFee.toString(), inputDecimals).toString()
									);
									_maxFee = new BigNumber(
										ethers.utils.parseUnits(maxFee.toString(), inputDecimals).toString()
									);
								}
								if (_fee.isZero()) {
									// inputVal = inputVal
								} else {
									if (_fee.lt(_minFee)) {
										_fee = _minFee;
									} else if (_fee.gt(_maxFee)) {
										_fee = _maxFee;
									}
									inputVal = inputVal.minus(_fee);
								}
								if ((inputVal || inputVal === 0) && inputValue !== "") {
									inputVal = amountFormatter(inputVal, inputDecimals, Math.min(10, inputDecimals));
								} else {
									inputVal = "";
								}
								dispatchSwapState({
									type: "UPDATE_INDEPENDENT",
									payload: {
										value: inputValue,
										field: INPUT,
										// realyValue: bridgeType && bridgeType === 'redeem' ? inputVal : inputValue
										realyValue: inputVal ? Number(Number(inputVal).toFixed(8)) : "",
									},
								});
							}}
							onMax={setInputAmount}
							label={bridgeType && bridgeType !== "redeem" ? "Deposit" : "Redeem"}
							onCurrencySelect={(inputCurrency) => {
								dispatchSwapState({
									type: "SELECT_CURRENCY",
									payload: { currency: inputCurrency, field: INPUT },
								});
							}}
							currency={inputCurrencySwap}
							otherCurrency={outputCurrencySwap}
							id={"bridge-input-currency"}
							showCommonBases={false}
							withoutMargin={true}
							hideETH={true}
						/>

						<div className={"d-flex align-items-center justify-content-center"}>
							<SwapCurrencies
								onClick={() => {
									if (bridgeType && bridgeType === "redeem") {
										changeMorR("mint");
									} else {
										changeMorR("redeem");
									}
								}}
							>
								<SVG src={SwapIcon} width={24} height={24} />
							</SwapCurrencies>
						</div>

						<BridgeInputPanel
							urlAddedTokens={urlAddedTokens}
							extraText={
								bridgeType && bridgeType === "redeem" && inputBalanceFormatted
									? outNetBalance && !isSpecialCoin(inputSymbol)
										? formatBalance(outNetBalance)
										: ""
									: inputBalanceFormatted && formatBalance(inputBalanceFormatted)
							}
							onCurrencySelect={(inputCurrency) => {
								dispatchSwapState({
									type: "SELECT_CURRENCY",
									payload: { currency: inputCurrency, field: INPUT },
								});
							}}
							isSelfSymbol={
								bridgeType && bridgeType === "redeem" && inputSymbol
									? formatCoin(inputSymbol)
									: inputSymbol
							}
							isSelfLogo={
								bridgeType && bridgeType === "redeem" && inputSymbol ? formatCoin(inputSymbol) : ""
							}
							isSelfName={
								bridgeType && bridgeType === "redeem" && inputName
									? formatName(inputName, extendObj)
									: ""
							}
							showUnlock={false}
							disableUnlock={true}
							onUserInput={setOutputAmount}
							onMax={setOutputAmount}
							label={"Receive"}
							currency={outputCurrencySwap}
							otherCurrency={inputCurrencySwap}
							id={"bridge-output-currency"}
							showCommonBases={false}
							withoutMargin={true}
							selectedTokens={[inputCurrency, outputCurrency]}
							selectedTokenAddress={inputCurrency}
							value={realyValue ? realyValue : ""}
							hideETH={true}
							selfUseAllToken={selfUseAllToken}
						/>

						{bridgeType && bridgeType === "redeem" ? (
							<div className={"pt-4"}>
								<AddressInputPanel
									value={recipient.address}
									onChange={(val) =>
										setRecipient((r) => {
											return {
												...r,
												address: val,
											};
										})
									}
									label={`Recipient ${inputSymbol ? formatCoin(inputSymbol) : inputSymbol} Address`}
								/>
							</div>
						) : isSpecialCoin(inputSymbol) && account && registerAddress ? (
							<div className={"pt-4"}>
								<AddressInputPanel
									value={account && registerAddress ? registerAddress : ""}
									onChange={(val) => setRecipient(val)}
									label={
										"Deposit " + (inputSymbol ? formatCoin(inputSymbol) : inputSymbol) + " Address"
									}
								/>
							</div>
						) : null}

						{bridgeType && bridgeType === "redeem" && Number(FSNBalanceNum) < 0.001 && account && (
							<div className={"pt-4"}>
								<AlertContainer>
									<AlertText>Insufficient Balance</AlertText>
								</AlertContainer>
							</div>
						)}

						{!isLimitAction && (
							<div className={"pt-4"}>
								<AlertContainer>
									<AlertText>
										The liquidity of the cross chain bridge is insufficient, please try again later.
										Balance: {thousandBit(limitAmount, 2)} {inputSymbol}
									</AlertText>
								</AlertContainer>
							</div>
						)}

						{isDeposit === 0 || isRedeem === 0 ? (
							<div className={"pt-4"}>
								<AlertContainer>
									<AlertText>Deposit and Withdraw stopped, node maintenance!</AlertText>
								</AlertContainer>
							</div>
						) : null}

						{noBalanceTip()}

						<SubmitButtonContainer>
							{isDeposit || isRedeem ? (
								account ? (
									viewBtn(bridgeType)
								) : (
									<Button disabled={showBetaMessage} onClick={toggleWalletModal}>
										Connect wallet
									</Button>
								)
							) : bridgeType &&
							  bridgeType === "redeem" &&
							  extendObj &&
							  extendObj.APPROVE &&
							  (!approveNum || !Number(approveNum)) ? (
								<Button disabled={showBetaMessage} onClick={approve}>
									{approveBtnView ? "Approve" : "Pending"}
								</Button>
							) : isDeposit === 0 && isRedeem === 0 ? (
								<Button disabled={true}>Coming soon</Button>
							) : (
								<Button disabled={true}>CrossChain Deposit</Button>
							)}
						</SubmitButtonContainer>
					</Card>

					<WarningTip />
				</Col>
			</Row>
		</Page>
	);
};

export default CrossBridge;
