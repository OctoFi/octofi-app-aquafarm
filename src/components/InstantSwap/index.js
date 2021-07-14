import React from "react";
import { connect } from "react-redux";
import { isMobile } from "react-device-detect";
import QRCode from "react-qr-code";
import _ from "lodash";
import { ThemeContext } from "styled-components";
import { Row, Col, ProgressBar, Button } from "react-bootstrap";
import { toast } from "react-hot-toast";
import { withTranslation } from "react-i18next";
import { ArrowDown, Download, Plus, Minus } from "react-feather";
import { ChainId } from "@uniswap/sdk";
import moment from "moment";
import Web3 from "web3";
import BigNumber from "bignumber.js";
import { assert } from "@0x/assert";
import { AbiDecoder, intervalUtils } from "@0x/utils";
import { ResponsiveCard } from "../Card";

import {
	BTC,
	CHANGE_NOW_FLOW,
	PARASWAP_REFERRER_ACCOUNT,
	SIMPLE_SWAP_FIXED,
	supportedDEXes,
	ZERO,
} from "../../constants";
import ERC20_ABI from "../../constants/abis/erc20.json";
import { walletTokens as tokens } from "../../constants/spot-config/mainnet/config.json";
import InstantSwapApi from "../../http/instantSwap";
import { addTransaction } from "../../state/transactions/actions";
import { CloseIcon } from "../../theme";
import { getContract } from "../../utils";

import AddressInputPanel from "../AddressInputPanel";
import withWeb3Account from "../hoc/withWeb3Account";
import { Modal } from "../Modal/bootstrap";
import { RowBetween } from "../Row";
import RateList from "./RateList";
import SwapInputPanel from "./SwapInputPanel";
import RefreshRatesButton from "./RefreshRatesButton";
import * as Styled from "./styleds";

const HEX_REGEX = /^0x[0-9A-F]*$/i;

const PATTERN = {
	btc: /^[13][a-km-zA-HJ-NP-Z1-9]{25,80}$|^(bc1)[0-9A-Za-z]{25,80}$/,
	eth: /^(0x[a-fA-F0-9]{40})$/,
	usdt: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
	global: /^[13][a-km-zA-HJ-NP-Z1-9]{25,80}$|^(bc1)[0-9A-Za-z]{25,80}$|^(0x[a-fA-F0-9]{40})$|^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
};

class InstantSwap extends React.Component {
	static contextType = ThemeContext;

	constructor(props) {
		super(props);
		this.web3 = new Web3(Web3.givenProvider || new Web3.providers.HttpProvider(process.env.REACT_APP_WSS_URL));
		this.api = InstantSwapApi;
		this.typeTimeout = undefined;
		this.isExchangeInProgress = false;
		this.abiDecoder = new AbiDecoder([]);
		this.priceInterval = null;

		this.state = {
			loading: false,
			priceLoading: false,
			loadingState: {
				all: 36,
				loaded: 0,
			},
			tokens: [],
			pair: {
				deposit: {
					token: null,
					value: "",
				},
				destination: {
					token: null,
					value: "",
				},
			},
			hasEnoughBalance: true,
			rates: [],
			rate: undefined,
			showMore: false,
			buyState: "not_started",
			max: 0,
			showQrModal: false,
			orderType: null,
			order: {},
			recipient: null,
		};
	}

	getBuyStates = () => {
		const { t } = this.props;
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
	};

	isHexString(str) {
		if (HEX_REGEX.test(str)) {
			return true;
		} else {
			throw new Error("Entered value isn't hex string");
		}
	}

	async awaitTransactionMinedAsync(txHash, pollingIntervalMs = 1000, timeoutMs = 30000) {
		this.isHexString(txHash);
		assert.isNumber("pollingIntervalMs", pollingIntervalMs);
		if (timeoutMs !== undefined) {
			assert.isNumber("timeoutMs", timeoutMs);
		}
		// Immediately check if the transaction has already been mined.
		let transactionReceipt = await this.props.web3.library.getTransactionReceipt(txHash);
		if (transactionReceipt !== undefined) {
			const logsWithDecodedArgs = _.map(
				transactionReceipt.logs,
				this.abiDecoder.tryToDecodeLogOrNoop.bind(this.abiDecoder)
			);
			const transactionReceiptWithDecodedLogArgs = {
				...transactionReceipt,
				logs: logsWithDecodedArgs,
			};
			return transactionReceiptWithDecodedLogArgs;
		}

		// Otherwise, check again every pollingIntervalMs.
		let wasTimeoutExceeded = false;
		if (timeoutMs) {
			setTimeout(() => (wasTimeoutExceeded = true), timeoutMs);
		}

		const txReceiptPromise = new Promise((resolve, reject) => {
			const intervalId = intervalUtils.setAsyncExcludingInterval(
				async () => {
					if (wasTimeoutExceeded) {
						intervalUtils.clearAsyncExcludingInterval(intervalId);
						return reject({
							code: "timeout",
							message: "Timeout",
						});
					}

					transactionReceipt = await this.props.web3.library.getTransactionReceipt(txHash);
					if (transactionReceipt !== undefined) {
						intervalUtils.clearAsyncExcludingInterval(intervalId);
						const logsWithDecodedArgs = _.map(
							transactionReceipt.logs,
							this.abiDecoder.tryToDecodeLogOrNoop.bind(this.abiDecoder)
						);
						const transactionReceiptWithDecodedLogArgs = {
							...transactionReceipt,
							logs: logsWithDecodedArgs,
						};
						resolve(transactionReceiptWithDecodedLogArgs);
					}
				},
				pollingIntervalMs,
				(err) => {
					intervalUtils.clearAsyncExcludingInterval(intervalId);
					reject(err);
				}
			);
		});
		const txReceipt = await txReceiptPromise;
		return txReceipt;
	}

	async awaitTransactionSuccessAsync(txHash, pollingIntervalMs = 1000, timeoutMs) {
		const receipt = await this.awaitTransactionMinedAsync(txHash, pollingIntervalMs, timeoutMs);
		if (receipt.status !== 1) {
			throw new Error(this.props.t("errors.invalidHexString"));
		}
		return receipt;
	}

	onChangeBalance = (balance) => {
		this.setState({
			max: balance,
		});
	};

	promiseHandler = (id, count, callback) => {
		return new Promise((resolve) => {
			callback()
				.then((response) => {
					this.setState((prevState) => {
						return {
							loadingState: {
								all: 36,
								loaded: prevState.loadingState.loaded + count,
							},
						};
					});
					resolve({
						id,
						result: response,
					});
				})
				.catch((error) => {
					this.setState((prevState) => {
						return {
							loadingState: {
								all: 36,
								loaded: prevState.loadingState.loaded + count,
							},
						};
					});
					resolve({
						id,
						result: undefined,
					});
				});
		});
	};

	getParaswapSortedRates = (rates) => {
		return _.orderBy(rates.others, ["rate"], ["desc"]);
	};

	getDexagSortedRates = (rates) => {
		return _.orderBy(rates, ["price"], ["desc"]);
	};

	getSortedRates = (response, type) => {
		if (!response) return [];
		switch (type) {
			case "paraswap": {
				return this.getParaswapSortedRates(response);
			}
			case "dexag": {
				return this.getDexagSortedRates(response);
			}
			default: {
				return response.hasOwnProperty("data") ? response.data : response;
			}
		}
	};

	transformRates = (rates) => {
		let result = [];
		for (let i in rates) {
			const key = rates[i][0];
			const apiRates = rates[i][1];
			switch (key) {
				case "1inch": {
					if (apiRates && typeof apiRates.toTokenAmount === "string") {
						result.push({
							rate: apiRates.toTokenAmount / 10 ** this.state.pair.destination.token.decimals,
							platform: "oneInch",
							source: "1inch",
						});
					}
					break;
				}
				case "paraswap": {
					if (apiRates) {
						apiRates.forEach((rate) => {
							if (supportedDEXes["paraswap"].includes(rate.exchange)) {
								result.push({
									rate: rate.unit / 10 ** this.state.pair.destination.token.decimals,
									platform: rate.exchange,
									source: "paraswap",
								});
							}
						});
					}
					break;
				}
				case "dexag": {
					if (apiRates) {
						apiRates.forEach((rate) => {
							if (supportedDEXes["dexag"].includes(rate.dex)) {
								result.push({
									rate: Number(rate.price),
									platform: rate.dex,
									source: "dexag",
								});
							}
						});
					}
					break;
				}
				case "simpleSwap": {
					if (apiRates.rate !== null) {
						result.push({
							rate: Number(apiRates.rate),
							min: Number(apiRates.min || 0),
							max: Number(apiRates.max || 0),
							platform: "simpleSwap",
							source: "simpleSwap",
						});
					}
					break;
				}
				case "stealthex": {
					if (apiRates.estimated_amount !== null) {
						result.push({
							rate: Number(apiRates.estimated_amount),
							min: Number(apiRates.min_amount || 0),
							max: Number(apiRates.max_amount || 0),
							platform: "stealthex",
							source: "stealthex",
						});
					}
					break;
				}
				case "changeNow": {
					if (
						apiRates.hasOwnProperty("rate") &&
						apiRates?.rate?.toAmount &&
						apiRates.hasOwnProperty("range")
					) {
						result.push({
							rate: Number(apiRates?.rate?.toAmount || 0),
							rateId: apiRates?.rate?.rateId,
							min: Number(apiRates?.range?.minAmount || 0),
							max: Number(apiRates?.range?.maxAmount || 0),
							platform: "changeNow",
							source: "changeNow",
						});
					}
					break;
				}
				case "sideShift": {
					if (apiRates.hasOwnProperty("rate")) {
						result.push({
							rate: Number(apiRates?.rate || 0),
							min: Number(apiRates?.min || 0),
							max: Number(apiRates?.max || 0),
							platform: "sideShift",
							source: "sideShift",
						});
					}
					break;
				}
				default: {
					break;
				}
			}
		}

		return result;
	};

	getSortedResult = (response) => {
		let sortedParts = Object.keys(response).map((key) => [key, this.getSortedRates(response[key], key)]);
		let transformedRates = this.transformRates(sortedParts);
		return _.sortBy(transformedRates, (o) => -o.rate);
	};

	transformFetchedData = (data) => {
		const result = {};
		for (let i in data) {
			const row = data[i];
			if (row?.id === "oneInch") {
				result["1inch"] = row?.result;
			}

			result[row?.id] = row?.result;
		}

		return result;
	};

	getPricesPromises = (deposit, destination) => {
		let fromAmount = 10 ** deposit.token.decimals;

		let dexagParams = {
			to: destination.token.symbol,
			from: deposit.token.symbol,
			dex: "all",
			fromAmount: 1,
		};

		const promises = [];

		promises.push(
			this.promiseHandler("oneInch", 10, () =>
				this.api.oneInch.get("quote", {
					fromTokenAddress: deposit.token.address,
					toTokenAddress: destination.token.address,
					amount: fromAmount,
				})
			)
		);

		promises.push(
			this.promiseHandler("paraswap", 6, () =>
				this.api.paraswap.getRate(deposit.token.address, destination.token.address, fromAmount)
			)
		);

		promises.push(this.promiseHandler("dexag", 8, () => this.api.dexag.sdk.getPrice(dexagParams)));

		promises.push(
			this.promiseHandler("simpleSwap", 3, () =>
				this.api.simpleSwap.get("exchange", {
					query: {
						fixed: SIMPLE_SWAP_FIXED,
						currency_from: deposit.token.symbol.toLowerCase(),
						currency_to: destination.token.symbol.toLowerCase(),
					},
				})
			)
		);

		promises.push(
			this.promiseHandler("changeNow", 5, () =>
				this.api.changeNow.get("exchange", {
					range: {
						params: {
							fromNetwork: "eth",
							toNetwork: destination.token.symbol.toLowerCase() === "btc" ? "btc" : "eth",
							fromCurrency: deposit.token.symbol.toLowerCase(),
							toCurrency: destination.token.symbol.toLowerCase(),
							flow: CHANGE_NOW_FLOW,
						},
					},
					rate: {
						params: {
							fromNetwork: "eth",
							toNetwork: destination.token.symbol.toLowerCase() === "btc" ? "btc" : "eth",
							fromCurrency: deposit.token.symbol.toLowerCase(),
							toCurrency: destination.token.symbol.toLowerCase(),
							flow: CHANGE_NOW_FLOW,
							useRateId: !!(CHANGE_NOW_FLOW === "fixed-rate"),
							fromAmount: 1,
						},
					},
				})
			)
		);

		promises.push(
			this.promiseHandler("sideShift", 4, () =>
				this.api.sideShift.get("pairs", {
					fromCurrency: deposit.token.symbol.toLowerCase(),
					toCurrency: destination.token.symbol.toLowerCase(),
				})
			)
		);

		return promises;
	};

	fetchPrices = async (pair) => {
		const { t } = this.props;
		let { deposit, destination } = pair;

		clearInterval(this.priceInterval);

		if (deposit.token !== null && destination.token !== null) {
			this.setState({
				loading: true,
				loadingState: {
					all: 36,
					loaded: 0,
				},
			});

			let promises = this.getPricesPromises(deposit, destination);

			let promisesRes = await Promise.all(promises);

			const response = this.transformFetchedData(promisesRes);

			let result = this.getSortedResult(response);

			if (result.length > 0) {
				if (deposit.value) {
					pair.destination.value = (deposit.value * result[0].rate).toFixed(6);
				} else if (destination.value) {
					pair.deposit.value = (destination.value / result[0].rate).toFixed(6);
				}
				this.updatePriceIntervally(deposit, destination);
			} else {
				toast.error(t("errors.unavailablePair"));
			}

			this.setState({
				pair,
				rates: result,
				rate: result.length > 0 ? result[0] : undefined,
				loading: false,
				showMore: false,
				hasEnoughBalance:
					!this.state.max || Number(pair.deposit.value) <= Number(this.state.max.toSignificant(6)),
			});
		} else {
			this.setState({
				pair,
				showMore: false,
			});
		}
	};

	onSelect = async (token, type) => {
		let pair = this.state.pair;

		pair[type].token = token;
		this.setState(
			{
				pair,
			},
			this.fetchPrices.bind(this, this.state.pair)
		);
	};

	onSwapTokens = () => {
		let pair;
		this.setState(
			(prevState) => {
				pair = {
					deposit: {
						...prevState.pair.destination,
					},
					destination: {
						...prevState.pair.deposit,
					},
				};
				return {
					pair,
				};
			},
			() => this.fetchPrices(pair)
		);
	};

	onUserInputHandler = (value, type, max) => {
		this.setState((prevState) => {
			const pair = prevState.pair;
			pair[type].value = value;
			if (prevState.rate) {
				if (type === "deposit") {
					pair.destination.value = (value * prevState.rate.rate).toFixed(6);
				} else if (type === "destination") {
					pair.deposit.value = (value / prevState.rate.rate).toFixed(6);
				}
			}
			return {
				pair,
				hasEnoughBalance: !max || Number(value) <= Number(max.toSignificant(6)),
			};
		});
	};

	selectRate = (rate) => {
		this.setState((prevState) => {
			let pair = {
				...prevState.pair,
			};
			if (pair.deposit.value) {
				pair.destination.value = (pair.deposit.value * rate.rate).toFixed(6);
			} else if (pair.destination.value) {
				pair.deposit.value = (pair.destination.value / rate.rate).toFixed(6);
			}

			return {
				pair,
				rate,
			};
		});
	};

	setBuyState = (state = "not_started") => {
		this.setState({
			buyState: state,
		});
	};

	setDefaultBuyState = () => {
		setTimeout(this.setBuyState, 4000);
	};

	oneInchBuyHandler = async (pair, rate) => {
		const { t } = this.props;
		try {
			let canExchange = false;
			let pending = false;
			this.setBuyState("initializing");
			let { deposit, destination } = pair;
			let allowance = ZERO;

			const spenderRes = await this.api.oneInch.get("spender");
			const spender = spenderRes.data.address;

			let fromAmount = new BigNumber(deposit.value).times(10 ** deposit.token.decimals);

			if (deposit.token.symbol.toUpperCase() !== "ETH") {
				this.setBuyState("allowance");

				let contract = getContract(
					deposit.token.address,
					ERC20_ABI,
					this.props.web3.library,
					this.props.web3.account
				);

				allowance = await contract.functions.allowance(this.props.web3.account, spender);
				allowance = new BigNumber(allowance);

				if (fromAmount.isGreaterThan(allowance)) {
					this.setBuyState("approving");

					const maxAllowance = new BigNumber(2).pow(256).minus(1);
					let approve = await contract.functions.approve(spender, maxAllowance.toFixed(0));

					if (approve) {
						pending = true;
						let txn;
						try {
							txn = await this.awaitTransactionSuccessAsync(approve.hash);
						} catch (e) {
							canExchange = true;
						}

						if (txn) {
							pending = false;
							canExchange = true;
						}
					}
				} else {
					canExchange = true;
				}
			} else {
				canExchange = true;
			}

			if (canExchange) {
				if (deposit.token.symbol.toUpperCase() !== "ETH" && pending) {
					let contract = getContract(
						deposit.token.address,
						ERC20_ABI,
						this.props.web3.library,
						this.props.web3.account
					);

					allowance = await contract.functions.allowance(this.props.web3.account, spender);
					allowance = new BigNumber(allowance);

					if (fromAmount.isGreaterThan(allowance)) {
						toast.error(t("errors.approvalPending"));
						return false;
					}
				}

				this.setBuyState("create_tx");

				const res = await this.api.oneInch.get("swap", {
					fromTokenAddress: deposit.token.address,
					toTokenAddress: destination.token.address,
					amount: fromAmount.toFixed(0),
					fromAddress: this.props.web3.account,
					slippage: this.props.slippage / 100,
					destReceiver: this.state.recipient !== null ? this.state.recipient : undefined,
				});

				if (res?.statusCode === 500 && res?.message) {
					toast.error(res?.message);
					return false;
				}

				const tx = res?.data?.tx;

				this.setBuyState("send_tx");

				this.web3.eth.sendTransaction(tx, async (err, transactionHash) => {
					if (err) {
						this.setBuyState("failed");

						this.setDefaultBuyState();

						if (err.code === 4001) {
							toast.error(t("errors.canceled"));
						} else {
							toast.error(t("errors.default"));
						}
						this.isExchangeInProgress = false;
						return false;
					}

					this.setBuyState("submitted");

					this.setDefaultBuyState();
					this.isExchangeInProgress = false;
					toast.success(t("instantSwap.orderSubmitted"));
					if (typeof transactionHash === "string") {
						this.props.addTransaction({
							chainId: ChainId.MAINNET,
							addedTime: Date.now(),
							hash: transactionHash,
							from: this.props.web3.account,
						});
					}
				});
			} else {
				toast.error(t("errors.approvalPending"));
			}
			this.isExchangeInProgress = false;
		} catch (e) {
			this.setBuyState("failed");

			this.setDefaultBuyState();

			this.isExchangeInProgress = false;

			if (e.hasOwnProperty("code")) {
				if (e.code === 4001) {
					toast.error(t("errors.canceled"));
				} else {
					toast.error(t("errors.default"));
				}
			} else {
				if (e.hasOwnProperty("response")) {
					if (e?.response?.data?.message) {
						toast.error(e?.response?.data?.message);
						return false;
					}
					if (e.response.status === 500) {
						if (e.response.data.hasOwnProperty("errors")) {
							e.response.data.errors.map((err) => {
								toast.error(err.msg);
							});
						} else {
							toast.error(t("errors.unavailablePair"));
						}
					} else {
						toast.error(t("errors.default"));
					}
				} else {
					toast.error(t("errors.default"));
				}
			}
		}
	};

	paraSwapBuyHandler = async (pair, rate) => {
		const { t } = this.props;
		const { recipient } = this.state;
		try {
			this.setBuyState("initializing");
			let pending = false;
			let { deposit, destination } = pair;
			let canExchange = false;
			const paraswap = this.api.paraswap.setWeb3Provider(this.web3.givenProvider);

			let fromAmount = new BigNumber(deposit.value).times(10 ** deposit.token.decimals);
			let toAmount = new BigNumber(destination.value).times(10 ** destination.token.decimals);

			this.setBuyState("allowance");
			const allowanceRes = await paraswap.getAllowance(this.props.web3.account, deposit.token.address);
			let allowance = new BigNumber(allowanceRes.allowance);
			if (deposit.token.symbol !== "ETH" && fromAmount.isGreaterThan(allowance)) {
				const maxAllowance = new BigNumber(2).pow(256).minus(1);
				this.setBuyState("approving");
				try {
					const approve = await paraswap.approveToken(
						maxAllowance.toFixed(),
						this.props.web3.account,
						deposit.token.address
					);
					canExchange = true;
					pending = true;
					let txn;

					try {
						txn = await this.awaitTransactionSuccessAsync(approve);
						if (txn) {
							pending = false;
							canExchange = true;
						}
					} catch (e) {
						canExchange = true;
					}
				} catch (e) {
					canExchange = false;
				}
			} else {
				canExchange = true;
			}

			if (canExchange) {
				if (pending) {
					const allowanceRes = await paraswap.getAllowance(this.props.web3.account, deposit.token.address);
					let allowance = new BigNumber(allowanceRes.allowance);
					if (deposit.token.symbol !== "ETH" && fromAmount.isGreaterThan(allowance)) {
						toast.error(t("errors.approvalPending"));
						return false;
					}
				}

				this.setBuyState("create_tx");
				const rates = await paraswap.getRate(
					deposit.token.address,
					destination.token.address,
					fromAmount.toFixed(0)
				);
				const selectedRoute = rates.others.find((item) => item.exchange === rate.platform);
				const txRoute = [
					{
						...rates.bestRoute[0],
						...selectedRoute,
					},
				];
				rates.bestRoute = txRoute;
				const txParams = await paraswap.buildTx(
					deposit.token.address,
					destination.token.address,
					fromAmount.toFixed(0),
					toAmount.toFixed(0),
					rates,
					this.props.web3.account,
					PARASWAP_REFERRER_ACCOUNT,
					recipient !== null ? recipient : undefined
				);

				this.setBuyState("send_tx");

				if (txParams?.message) {
					toast.error(txParams.message);

					this.setBuyState("failed");
					this.setDefaultBuyState();

					return false;
				}

				this.web3.eth.sendTransaction(txParams, async (err, transactionHash) => {
					if (err) {
						this.setBuyState("failed");

						this.setDefaultBuyState();

						if (err.code === 4001) {
							toast.error(t("errors.canceled"));
						} else {
							toast.error(t("errors.default"));
						}

						this.isExchangeInProgress = false;
						return false;
					}
					this.setBuyState("submitted");

					this.setDefaultBuyState();
					this.isExchangeInProgress = false;
					toast.success(t("instantSwap.orderSubmitted"));
					if (typeof transactionHash === "string") {
						this.props.addTransaction({
							chainId: ChainId.MAINNET,
							addedTime: Date.now(),
							hash: transactionHash,
							from: this.props.web3.account,
						});
					}
				});
			} else {
				this.setBuyState("pending");

				this.setDefaultBuyState();
			}
		} catch (e) {
			this.setBuyState("failed");

			this.setDefaultBuyState();

			if (e.hasOwnProperty("code")) {
				if (e.code === 4001) {
					toast.error(t("errors.canceled"));
				} else {
					toast.error(t("errors.default"));
				}
			} else {
				toast.error(t("errors.default"));
			}
			this.isExchangeInProgress = false;
		}
	};

	dexagBuyHandler = async (pair, rate) => {
		let valid = false;
		const { t } = this.props;
		try {
			this.setBuyState("initializing");

			let { deposit, destination } = pair;

			const { sdk, api } = this.api.dexag;
			sdk.registerStatusHandler((status, data) => {
				switch (status) {
					case "rejected": {
						this.setBuyState("failed");
						this.setDefaultBuyState();
						toast.error(t("errors.failedTxn"));
						break;
					}
					case "network": {
						toast.error(t("errors.wrongNetwork"));
						break;
					}
					case "send_trade": {
						this.setBuyState("submitted");
						this.setDefaultBuyState();

						if (typeof data === "string") {
							this.props.addTransaction({
								chainId: ChainId.MAINNET,
								addedTime: Date.now(),
								hash: data,
								from: this.props.web3.account,
							});
						}
						break;
					}
					case "failed": {
						this.setBuyState("failed");
						this.setDefaultBuyState();
						toast.error(t("errors.failedTxn"));
						break;
					}
					case "bad_tx": {
						this.setBuyState("failed");
						this.setDefaultBuyState();
						toast.error(t("errors.insufficientGas"));
						break;
					}
					default: {
						break;
					}
				}
			});

			this.setBuyState("create_tx");
			const tx = await api.get("trade", {
				params: {
					to: destination.token.symbol,
					from: deposit.token.symbol,
					fromAmount: deposit.value,
					dex: rate.platform,
					recipient: this.state.recipient !== null ? this.state.recipient : undefined,
				},
			});

			this.setBuyState("validation");
			valid = await sdk.validate(tx);

			if (valid) {
				const { query } = tx?.metadata;
				const details = {
					pair: {
						base: query.to,
						quote: query.from,
					},
					amount: query.fromAmount || query.toAmount,
					dex: query.dex,
					isBuying: true,
				};
				sdk.sendTrade(tx, details);
			} else {
				this.setBuyState("failed");
				this.setDefaultBuyState();
				toast.error(t("errors.instantSwapInvalidTxn"));
			}
		} catch (e) {
			this.setBuyState("failed");
			this.setDefaultBuyState();

			if (e.hasOwnProperty("code")) {
				if (e.code !== 4001) {
					toast.error(t("errors.default"));
				}

				if (!valid) {
					toast.error(t("errors.instantSwapInvalidTxn"));
				}
			} else {
				if (!valid) {
					toast.error(t("errors.instantSwapInvalidTxn"));
				}
				toast.error(t("errors.default"));
			}

			this.isExchangeInProgress = false;
		}
	};

	simpleSwapBuyHandler = async (pair, rate) => {
		try {
			this.setBuyState("initializing");
			let { deposit, destination } = pair;

			this.setBuyState("validation");
			if (deposit.value < rate.min || (rate.max > 0 && deposit.value >= rate.max)) {
				toast.error(
					deposit.value < rate.min
						? `The minimum value for this transaction is ${rate.min}`
						: `The maximum value for this transaction is ${rate.max}`
				);
				this.setBuyState("failed");
				this.setDefaultBuyState();
				return;
			}

			this.setBuyState("create_tx");
			const res = await this.api.simpleSwap.set("exchange", {
				data: {
					fixed: SIMPLE_SWAP_FIXED,
					currency_from: deposit.token.symbol.toLowerCase(),
					currency_to: destination.token.symbol.toLowerCase(),
					amount: deposit.value,
					address_to: this.state.recipient !== null ? this.state.recipient : this.props.web3.account,
				},
			});

			if (res) {
				if (res.code && res.code !== 200) {
					toast.error(res.message);
				} else {
					toast.success("Your order submitted successfully!");
					this.setBuyState("submitted");
					this.setState({
						showQrModal: true,
						orderType: "simpleSwap",
						order: res,
					});
					this.setDefaultBuyState();
				}
			}
		} catch (e) {
			toast.error("An Error was occurred");
			this.setBuyState("failed");
			this.setDefaultBuyState();
		}
	};

	stealthexBuyHandler = async (pair, rate) => {
		const { t } = this.props;
		try {
			this.setBuyState("initializing");
			let { deposit, destination } = pair;

			this.setBuyState("validation");
			if (deposit.value < rate.min || (rate.max > 0 && deposit.value >= rate.max)) {
				toast.error(
					deposit.value < rate.min ? `${t("errors.min")} ${rate.min}` : `${t("errors.max")} ${rate.max}`
				);
				this.setBuyState("failed");
				this.setDefaultBuyState();
				return;
			}

			this.setBuyState("create_tx");
			const res = await this.api.stealthex.set("exchange", {
				data: {
					currency_from: deposit.token.symbol.toLowerCase(),
					currency_to: destination.token.symbol.toLowerCase(),
					amount_from: deposit.value,
					address_to: this.state.recipient !== null ? this.state.recipient : this.props.web3.account,
				},
			});

			if (res) {
				if (res?.code && res?.code !== 200) {
					toast.error(res?.message || t("errors.default"));
				} else {
					toast.success(t("instantSwap.orderSubmitted"));
					this.setBuyState("submitted");
					this.setState({
						showQrModal: true,
						orderType: "stealthex",
						order: res,
					});
					this.setDefaultBuyState();
				}
			}
		} catch (e) {
			toast.error(t("errors.default"));
			this.setBuyState("failed");
			this.setDefaultBuyState();
		}
	};

	changeNowBuyHandler = async (pair, rate) => {
		const { t } = this.props;
		try {
			this.setBuyState("initializing");
			let { deposit, destination } = pair;

			this.setBuyState("validation");
			console.log(deposit.value, rate);
			if (deposit.value < rate.min || (rate.max > 0 && deposit.value >= rate.max)) {
				toast.error(
					deposit.value < rate.min
						? `The minimum value for this transaction is ${rate.min}`
						: `The maximum value for this transaction is ${rate.max}`
				);
				this.setBuyState("failed");
				this.setDefaultBuyState();
				return;
			}

			const validation = await this.api.changeNow.get("address_validation", {
				params: {
					currency: destination.token.symbol.toLowerCase(),
					address: this.state.recipient !== null ? this.state.recipient : this.props.web3.account,
				},
			});

			if (!validation?.data?.result) {
				toast.error(validation?.data?.message);
				return false;
			}

			this.setBuyState("create_tx");
			const res = await this.api.changeNow.createTransaction({
				body: {
					fromCurrency: deposit.token.symbol.toLowerCase(),
					toCurrency: destination.token.symbol.toLowerCase(),
					fromAmount: deposit.value,
					address: this.state.recipient !== null ? this.state.recipient : this.props.web3.account,
					flow: CHANGE_NOW_FLOW,
					type: "direct",
					rateId: CHANGE_NOW_FLOW === "fixed-rate" ? rate.rateId : "",
				},
			});

			if (res) {
				if (res?.message) {
					toast.error(res?.message);
					this.setBuyState("failed");
					this.setDefaultBuyState();
					return false;
				}
				toast.success("Your order submitted successfully!");
				this.setBuyState("submitted");
				this.setState({
					showQrModal: true,
					orderType: "changeNow",
					order: res,
				});
				this.setDefaultBuyState();
			} else {
				toast.error(t("errors.failedTxn"));
			}
		} catch (e) {
			if (e?.message) {
				toast.error(e?.message);
			} else if (e?.response?.data?.message) {
				toast.error(e?.message);
			} else {
				toast.error(t("errors.default"));
			}
			this.setBuyState("failed");
			this.setDefaultBuyState();
		}
	};

	sideShiftBuyHandler = async (pair, rate) => {
		const { t } = this.props;
		try {
			this.setBuyState("initializing");
			let { deposit, destination } = pair;

			this.setBuyState("validation");
			console.log(deposit.value, rate);
			if (deposit.value < rate.min || (rate.max > 0 && deposit.value >= rate.max)) {
				toast.error(
					deposit.value < rate.min
						? `The minimum value for this transaction is ${rate.min}`
						: `The maximum value for this transaction is ${rate.max}`
				);
				this.setBuyState("failed");
				this.setDefaultBuyState();
				return false;
			}

			const validation = await this.api.sideShift.get("permissions");
			if (!validation?.createOrder || !validation?.createQuote) {
				toast.error(t("errors.default"));
				return false;
			}

			const order = await this.api.sideShift.post("order", {
				body: {
					depositMethod: deposit.token.symbol.toLowerCase(),
					settleMethod: destination.token.symbol.toLowerCase(),
					settleAddress: this.state.recipient !== null ? this.state.recipient : this.props.web3.account,
					depositAmount: deposit.value,
				},
			});
			if (order) {
				if (order.hasOwnProperty("error")) {
					toast.error(order?.error?.message);
					this.setBuyState("failed");
					this.setDefaultBuyState();
					return false;
				} else {
					toast.success("Your order submitted successfully!");
					this.setBuyState("submitted");
					this.setState({
						showQrModal: true,
						orderType: "sideShift",
						order: {
							...order,
							fromAmount: deposit.value,
						},
					});
					this.setDefaultBuyState();
				}
			}
		} catch (e) {
			if (e?.hasOwnProperty("error")) {
				toast.error(e?.error?.message);
			} else if (e?.response?.data?.error) {
				toast.error(e?.response?.data?.error?.message);
			} else {
				toast.error(t("errors.default"));
			}
			this.setBuyState("failed");
			this.setDefaultBuyState();
		}
	};

	buyHandler = async () => {
		if (!this.props.web3.account) {
			this.props.toggleWalletModal();
		} else {
			if (!this.isExchangeInProgress) {
				this.isExchangeInProgress = true;

				const { t } = this.props;
				const { pair, rate, recipient } = this.state;

				if (pair.destination.token.symbol.toUpperCase() === "BTC") {
					if (recipient === null) {
						toast.error(t("errors.requiredAddress"));
						this.isExchangeInProgress = false;
						return false;
					} else if (!PATTERN.btc.test(recipient)) {
						toast.error(t("errors.invalidAddress"));
						this.isExchangeInProgress = false;
						return false;
					}
				}

				if (recipient !== null && !PATTERN.global.test(recipient)) {
					toast.error(t("errors.invalidAddress"));
					this.isExchangeInProgress = false;
					return false;
				}

				switch (rate.source) {
					case "1inch": {
						await this.oneInchBuyHandler(pair, rate);
						break;
					}
					case "paraswap": {
						await this.paraSwapBuyHandler(pair, rate);
						break;
					}
					case "dexag": {
						await this.dexagBuyHandler(pair, rate);
						break;
					}
					case "simpleSwap": {
						await this.simpleSwapBuyHandler(pair, rate);
						break;
					}
					case "stealthex": {
						await this.stealthexBuyHandler(pair, rate);
						break;
					}
					case "changeNow": {
						await this.changeNowBuyHandler(pair, rate);
						break;
					}
					case "sideShift": {
						await this.sideShiftBuyHandler(pair, rate);
						break;
					}
					case "godex": {
						await this.godexBuyHandler(pair, rate);
						break;
					}
					default: {
						break;
					}
				}

				this.isExchangeInProgress = false;
			}
		}
	};

	toggleShowMore = () => {
		this.setState((prevState) => {
			return {
				showMore: !prevState.showMore,
			};
		});
	};

	onChangeRecipient = (value) => {
		this.setState({
			recipient: value,
		});
	};

	getNewPrice = async (deposit, destination) => {
		const { t } = this.props;

		if (deposit.token !== null && destination.token !== null) {
			this.setState({
				priceLoading: true,
			});

			let promises = this.getPricesPromises(deposit, destination);

			let promisesRes = await Promise.all(promises);

			const response = this.transformFetchedData(promisesRes);

			let result = this.getSortedResult(response);

			if (result.length > 0) {
				if (deposit.value) {
					destination.value = (deposit.value * result[0].rate).toFixed(6);
				} else if (destination.value) {
					deposit.value = (destination.value / result[0].rate).toFixed(6);
				}
			} else {
				toast.error(t("errors.unavailablePair"));
			}

			this.setState((prevState) => {
				let newRate = result[0];
				if (prevState.rate?.hasOwnProperty("platform")) {
					const newRes = result.find((_) => _.platform === prevState.rate.platform);
					if (newRes) {
						newRate = newRes;
					}
				}
				return {
					rates: result,
					rate: result.length > 0 ? newRate : undefined,
					priceLoading: false,
					hasEnoughBalance: !prevState.max || Number(deposit.value) <= Number(prevState.max.toSignificant(6)),
				};
			});
		}
	};

	updatePriceIntervally = (deposit, destination) => {
		if (this.priceInterval) {
			clearInterval(this.priceInterval);
			// this.priceInterval = null;
		}
		this.priceInterval = setInterval(() => {
			this.getNewPrice(deposit, destination);
		}, 15000);
	};

	forceRefreshPrices = async () => {
		const { deposit, destination } = this.state.pair;
		if (this.priceInterval) {
			clearInterval(this.priceInterval);
			this.priceInterval = null;
		}
		await this.getNewPrice(deposit, destination);
		this.updatePriceIntervally(deposit, destination);
	};

	render() {
		const {
			pair,
			rate,
			hasEnoughBalance,
			rates,
			loading,
			priceLoading,
			loadingState,
			buyState,
			// recipient,
		} = this.state;
		const { t } = this.props;
		const theme = this.context;

		return (
			<>
				<Row>
					<Col xs={12} md={{ offset: 0, span: 6 }}>
						<ResponsiveCard>
							<SwapInputPanel
								value={pair.deposit.value}
								onUserInput={this.onUserInputHandler}
								label={t("instantSwap.fromLabel")}
								onSelect={this.onSelect}
								selected={pair.deposit.token}
								currencies={tokens}
								type={"deposit"}
								id={"deposit"}
								onChangeBalance={this.onChangeBalance}
								showMaxButton={false}
							/>

							<Styled.SwitchCol clickable onClick={this.onSwapTokens}>
								<ArrowDown size={16} color={theme.text2} />
							</Styled.SwitchCol>

							<SwapInputPanel
								value={pair.destination.value}
								onUserInput={this.onUserInputHandler}
								label={t("instantSwap.toLabel")}
								onSelect={this.onSelect}
								selected={pair.destination.token}
								currencies={tokens.concat(BTC)}
								type={"destination"}
								id={"destination"}
							/>

							{/* {recipient === null ? (
								<div className="d-flex justify-content-end">
									<Button
										variant="link"
										className="d-flex align-items-center"
										onClick={() => this.onChangeRecipient("")}
									>
										<Plus size={16} className="mr-1" /> {t("addSend")} ({t("optional")})
									</Button>
								</div>
							) : (
								<>
									<div className="d-flex justify-content-start">
										<Styled.SwitchCol>
											<Download size={18} color={theme.text2} />
										</Styled.SwitchCol>
									</div>

									<div className="mb-4">
										<AddressInputPanel value={recipient} onChange={this.onChangeRecipient} />
									</div>

									<div className="d-flex justify-content-end">
										<Button
											variant="link"
											className="d-flex align-items-center"
											onClick={() => this.onChangeRecipient(null)}
										>
											<Minus size={16} className="mr-1" /> {t("removeSend")}
										</Button>
									</div>
								</>
							)} */}

							{!!rate && (
								<div className="d-flex justify-content-between align-items-center my-4">
									{/* <Styled.RateText fontWeight={400} fontSize={isMobile ? 12 : 14}>
										Exchange Rate
									</Styled.RateText> */}
									<Styled.RateText fontWeight={isMobile ? 400 : 500} fontSize={isMobile ? 12 : 16}>
										{pair.deposit.token && pair.destination.token
											? `1 ${
													pair.deposit.token.symbol || pair.deposit.token.code
											  } ≈ ${rate.rate.toFixed(4)} ${
													pair.destination.token.symbol || pair.destination.token.code
											  }`
											: null}
									</Styled.RateText>

									{rates.length > 0 && (
										<div className={"d-flex align-items-center justify-content-end"}>
											<RefreshRatesButton
												loading={loading}
												priceLoading={priceLoading}
												onRefresh={this.forceRefreshPrices}
											/>
										</div>
									)}
								</div>
							)}

							<div className="d-flex flex-column align-items-stretch align-items-md-center justify-content-center mt-4">
								{loading ? (
									<div
										className={`d-flex flex-column align-items-stretch justify-content-center align-self-stretch`}
									>
										<Styled.RateText fontWeight={400} fontSize={isMobile ? 12 : 16}>
											{t("instantSwap.exchangeSearch", {
												loaded: loadingState.loaded,
												all: loadingState.all,
											})}
										</Styled.RateText>
										<Styled.ProgressContainer>
											<ProgressBar
												className="align-self-stretch w-100 progress-xs"
												now={((loadingState.loaded / loadingState.all) * 100).toFixed(0)}
												variant={
													loadingState.loaded === loadingState.all ? "success" : "primary"
												}
											/>
										</Styled.ProgressContainer>
									</div>
								) : (
									<Styled.SwapButton
										onClick={this.buyHandler}
										variant={"primary"}
										disabled={
											this.props.web3.account &&
											(!(
												pair.deposit.token &&
												pair.deposit.value &&
												pair.destination.token &&
												pair.destination.value &&
												hasEnoughBalance &&
												Number(pair.deposit.value) > 0 &&
												rate
											) ||
												rate.platform === "godex")
										}
									>
										{!this.props.web3.account
											? t("wallet.connect")
											: !pair.deposit.token || !pair.destination.token
											? t("exchange.selectPair")
											: !hasEnoughBalance
											? t("insufficientBalance")
											: !pair.deposit.value || !pair.destination.value
											? t("exchange.enterAmount")
											: !rate && !loading
											? t("errors.unavailablePair")
											: rate.platform === "godex"
											? t("errors.unavailablePair")
											: Number(pair.deposit.value) > 0
											? this.getBuyStates()[buyState]
											: t("exchange.enterAmount")}
									</Styled.SwapButton>
								)}
							</div>
						</ResponsiveCard>
					</Col>

					<Col xs={12} md={6}>
						<RateList
							items={rates}
							loading={loading}
							onSelectRate={this.selectRate}
							rate={rate}
							pair={pair}
						/>
					</Col>
				</Row>

				<Modal
					show={this.state.showQrModal}
					centered
					onHide={() => {
						this.setState({
							showQrModal: false,
						});
					}}
					size={"lg"}
				>
					<Modal.Body className={"d-flex flex-column"} style={{ minHeight: 480, padding: "30px 60px" }}>
						<RowBetween style={{ padding: "8px 0 24px" }}>
							<div />
							<CloseIcon
								onClick={() => {
									this.setState({
										showQrModal: false,
									});
								}}
							/>
						</RowBetween>
						{this.state.orderType === "simpleSwap" || this.state.orderType === "stealthex" ? (
							<div className="d-flex flex-column flex-grow-1 justify-content-start align-items-center">
								<h4 className="font-weight-bold mt-0 mb-0" style={{ paddingTop: 30 }}>
									{t("instantSwap.submitted")}
								</h4>
								<div style={{ paddingTop: 40, paddingBottom: 45, marginBottom: "auto" }}>
									<QRCode
										value={this.state.order?.address_from || ""}
										fgColor={this.props.darkMode ? "#fff" : "#202020"}
										bgColor={"transparent"}
									/>
								</div>
								<div className="d-flex flex-column align-items-stretch align-self-stretch mb-4">
									<span className="font-size-large mb-2 d-block">
										{t("instantSwap.sendCrypto", {
											amount: this.state.order?.amount_from,
											crypto: this.state.order?.currency_from?.toUpperCase(),
										})}
									</span>
									<span className="opacity-50 font-size-sm">
										{t("instantSwap.exchangeDescription")}
									</span>
								</div>

								<div className={"align-self-stretch d-flex flex-column mb-3"}>
									<span className="opacity-50 mb-2">ADDRESS</span>
									<span className=" font-weight-bold">{this.state.order?.address_from}</span>
								</div>
								<div className={"align-self-stretch d-flex flex-column"}>
									<span className="opacity-50 mb-2">Order ID</span>
									<span>{this.state.order?.id}</span>
								</div>
							</div>
						) : this.state.orderType === "changeNow" ? (
							<div className="d-flex flex-column flex-grow-1 justify-content-start align-items-center">
								<h4 className="font-weight-bold mt-0 mb-0" style={{ paddingTop: 30 }}>
									{t("instantSwap.submitted")}
								</h4>
								<div style={{ paddingTop: 40, paddingBottom: 45, marginBottom: "auto" }}>
									<QRCode
										value={this.state.order?.payinAddress || ""}
										fgColor={this.props.darkMode ? "#fff" : "#202020"}
										bgColor={"transparent"}
									/>
								</div>
								<div className="d-flex flex-column align-items-stretch align-self-stretch mb-4">
									<span className="font-size-large mb-2 d-block">
										{t("instantSwap.sendCrypto", {
											amount: this.state.order?.fromAmount,
											crypto: this.state.order?.fromCurrency?.toUpperCase(),
										})}
									</span>
									<span className="opacity-50 font-size-sm">
										{t("instantSwap.exchangeDescription")}
									</span>
								</div>

								<div className={"align-self-stretch d-flex flex-column mb-3"}>
									<span className="opacity-50 mb-2">ADDRESS</span>
									<span className=" font-weight-bold">{this.state.order?.payinAddress}</span>
								</div>
								<div className={"align-self-stretch d-flex flex-column mb-3"}>
									<span className="opacity-50 mb-2">Order ID</span>
									<span>{this.state.order?.id}</span>
								</div>
								<div className={"align-self-stretch d-flex flex-column"}>
									<span className="opacity-50 mb-2">Recipient Address</span>
									<span>{this.state.order?.settleAddress?.address}</span>
								</div>
							</div>
						) : this.state.orderType === "sideShift" ? (
							<div className="d-flex flex-column flex-grow-1 justify-content-start align-items-center">
								<h4 className="font-weight-bold mt-0 mb-0" style={{ paddingTop: 30 }}>
									{t("instantSwap.submitted")}
								</h4>
								<div style={{ paddingTop: 40, paddingBottom: 45, marginBottom: "auto" }}>
									<QRCode
										value={this.state.order?.depositAddress?.address || ""}
										fgColor={this.props.darkMode ? "#fff" : "#202020"}
										bgColor={"transparent"}
									/>
								</div>
								<div className="d-flex flex-column align-items-stretch align-self-stretch mb-4">
									<span className="font-size-large mb-2 d-block">
										{t("instantSwap.sendCrypto", {
											amount: this.state.order?.fromAmount,
											crypto: this.state.order?.depositMethodId?.toUpperCase(),
										})}
									</span>
									<span className="opacity-50 font-size-sm">
										{t("instantSwap.exchangeDescription")}
									</span>
								</div>

								<div className={"align-self-stretch d-flex flex-column mb-3"}>
									<span className="opacity-50 mb-2">ADDRESS</span>
									<span className=" font-weight-bold">
										{this.state.order?.depositAddress?.address}
									</span>
								</div>
								<div className={"align-self-stretch d-flex flex-column mb-3"}>
									<span className="opacity-50 mb-2">EXPIRATION DATE</span>
									<span className=" font-weight-bold">
										{moment(this.state.order?.expiresAtISO).format("YYYY-MM-DD HH:mm")}
									</span>
								</div>
								<div className={"align-self-stretch d-flex flex-column mb-3"}>
									<span className="opacity-50 mb-2">Order ID</span>
									<span>{this.state.order?.orderId}</span>
								</div>
								<div className={"align-self-stretch d-flex flex-column"}>
									<span className="opacity-50 mb-2">Recipient Address</span>
									<span>{this.state.order?.settleAddress?.address}</span>
								</div>
							</div>
						) : null}
					</Modal.Body>
				</Modal>
			</>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		slippage: state.user.userSlippageTolerance,
		darkMode: state.user.userDarkMode,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		addTransaction: (txn) => dispatch(addTransaction(txn)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(withWeb3Account(InstantSwap)));
