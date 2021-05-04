import { assert } from "@0x/assert";
import { schemas } from "@0x/json-schemas";
import { AbiDecoder, addressUtils, BigNumber, intervalUtils, promisify, providerUtils } from "@0x/utils";
import * as _ from "lodash";

import { utils } from "./utils";
import { marshaller } from "./marshaller";
import { NodeType, Web3WrapperErrors } from "@0x/web3-wrapper";
import { BlockParamLiteral } from "ethereum-types";

const BASE_TEN = 10;

// These are unique identifiers contained in the response of the
// web3_clientVersion call.
const uniqueVersionIds = {
	geth: "Geth",
	ganache: "EthereumJS TestRPC",
};

/**
 * An alternative to the Web3.js library that provides a consistent, clean, promise-based interface.
 */
export class Web3Wrapper {
	/**
	 * Flag to check if this instance is of type Web3Wrapper
	 */
	isZeroExWeb3Wrapper = true;
	abiDecoder;
	_provider;
	// Raw provider passed in. Do not use. Only here to return the unmodified provider passed in via `getProvider()`
	_supportedProvider;
	_callAndTxnDefaults;
	_jsonRpcRequestId;
	/**
	 * Check if an address is a valid Ethereum address
	 * @param address Address to check
	 * @returns Whether the address is a valid Ethereum address
	 */
	static isAddress(address) {
		return addressUtils.isAddress(address);
	}
	/**
	 * A unit amount is defined as the amount of a token above the specified decimal places (integer part).
	 * E.g: If a currency has 18 decimal places, 1e18 or one quintillion of the currency is equivalent
	 * to 1 unit.
	 * @param   amount      The amount in baseUnits that you would like converted to units.
	 * @param   decimals    The number of decimal places the unit amount has.
	 * @return  The amount in units.
	 */
	static toUnitAmount(amount, decimals) {
		assert.isValidBaseUnitAmount("amount", amount);
		assert.isNumber("decimals", decimals);
		const aUnit = new BigNumber(BASE_TEN).pow(decimals);
		const unit = amount.div(aUnit);
		return unit;
	}
	/**
	 * A baseUnit is defined as the smallest denomination of a token. An amount expressed in baseUnits
	 * is the amount expressed in the smallest denomination.
	 * E.g: 1 unit of a token with 18 decimal places is expressed in baseUnits as 1000000000000000000
	 * @param   amount      The amount of units that you would like converted to baseUnits.
	 * @param   decimals    The number of decimal places the unit amount has.
	 * @return  The amount in baseUnits.
	 */
	static toBaseUnitAmount(amount, decimals) {
		assert.isNumber("decimals", decimals);
		const unit = new BigNumber(BASE_TEN).pow(decimals);
		const baseUnitAmount = unit.times(amount);
		const hasDecimals = baseUnitAmount.decimalPlaces() !== 0;
		if (hasDecimals) {
			throw new Error(`Invalid unit amount: ${amount.toString(BASE_TEN)} - Too many decimal places`);
		}
		return baseUnitAmount;
	}
	/**
	 * Convert an Ether amount from ETH to Wei
	 * @param ethAmount Amount of Ether to convert to wei
	 * @returns Amount in wei
	 */
	static toWei(ethAmount) {
		assert.isBigNumber("ethAmount", ethAmount);
		const ETH_DECIMALS = 18;
		const balanceWei = Web3Wrapper.toBaseUnitAmount(ethAmount, ETH_DECIMALS);
		return balanceWei;
	}
	static _assertBlockParam(blockParam) {
		if (_.isNumber(blockParam)) {
			return;
		} else if (_.isString(blockParam)) {
			assert.doesBelongToStringEnum("blockParam", blockParam, BlockParamLiteral);
		}
	}
	static _assertBlockParamOrString(blockParam) {
		try {
			Web3Wrapper._assertBlockParam(blockParam);
		} catch (err) {
			try {
				assert.isHexString("blockParam", blockParam);
				return;
			} catch (err) {
				throw new Error(`Expected blockParam to be of type "string | BlockParam", encountered ${blockParam}`);
			}
		}
	}
	static _normalizeTxReceiptStatus(status) {
		// Transaction status might have four values
		// undefined - Testrpc and other old clients
		// null - New clients on old transactions
		// number - Parity
		// hex - Geth
		if (_.isString(status)) {
			return utils.convertHexToNumber(status);
		} else if (status === undefined) {
			return null;
		} else {
			return status;
		}
	}
	/**
	 * Instantiates a new Web3Wrapper.
	 * @param   supportedProvider    The Web3 provider instance you would like the Web3Wrapper to use for interacting with
	 *                      the backing Ethereum node.
	 * @param   callAndTxnDefaults  Override Call and Txn Data defaults sent with RPC requests to the backing Ethereum node.
	 * @return  An instance of the Web3Wrapper class.
	 */
	constructor(supportedProvider, callAndTxnDefaults = {}) {
		this.abiDecoder = new AbiDecoder([]);
		this._supportedProvider = supportedProvider;
		this._provider = supportedProvider;
		this._callAndTxnDefaults = callAndTxnDefaults;
		this._jsonRpcRequestId = 1;
	}
	/**
	 * Get the contract defaults set to the Web3Wrapper instance
	 * @return  CallAndTxnData defaults (e.g gas, gasPrice, nonce, etc...)
	 */
	getContractDefaults() {
		return this._callAndTxnDefaults;
	}
	/**
	 * Retrieve the Web3 provider
	 * @return  Web3 provider instance
	 */
	getProvider() {
		return this._supportedProvider;
	}
	/**
	 * Update the used Web3 provider
	 * @param provider The new Web3 provider to be set
	 */
	setProvider(supportedProvider) {
		const provider = providerUtils.standardizeOrThrow(supportedProvider);
		this._provider = provider;
	}
	/**
	 * Check whether an address is available through the backing provider. This can be
	 * useful if you want to know whether a user can sign messages or transactions from
	 * a given Ethereum address.
	 * @param senderAddress Address to check availability for
	 * @returns Whether the address is available through the provider.
	 */
	async isSenderAddressAvailableAsync(senderAddress) {
		assert.isETHAddressHex("senderAddress", senderAddress);
		const addresses = await this.getAvailableAddressesAsync();
		const normalizedAddress = senderAddress.toLowerCase();
		return _.includes(addresses, normalizedAddress);
	}
	/**
	 * Fetch the backing Ethereum node's version string (e.g `MetaMask/v4.2.0`)
	 * @returns Ethereum node's version string
	 */
	async getNodeVersionAsync() {
		const nodeVersion = await this.sendRawPayloadAsync({ method: "web3_clientVersion" });
		return nodeVersion;
	}
	/**
	 * Fetches the networkId of the backing Ethereum node
	 * @returns The network id
	 */
	async getNetworkIdAsync() {
		const networkIdStr = await this.sendRawPayloadAsync({ method: "net_version" });
		const networkId = _.parseInt(networkIdStr);
		return networkId;
	}
	/**
	 * Fetches the chainId of the backing Ethereum node
	 * @returns The chain id
	 */
	async getChainIdAsync() {
		const chainIdStr = await this.sendRawPayloadAsync({ method: "eth_chainId" });
		const chainId = _.parseInt(chainIdStr);
		return chainId;
	}
	/**
	 * Retrieves the transaction receipt for a given transaction hash if found
	 * @param txHash Transaction hash
	 * @returns The transaction receipt, including it's status (0: failed, 1: succeeded). Returns undefined if transaction not found.
	 */
	async getTransactionReceiptIfExistsAsync(txHash) {
		assert.isHexString("txHash", txHash);
		const transactionReceiptRpc = await this.sendRawPayloadAsync({
			method: "eth_getTransactionReceipt",
			params: [txHash],
		});
		// HACK Parity can return a pending transaction receipt. We check for a non null
		// block number before continuing with returning a fully realised receipt.
		// ref: https://github.com/paritytech/parity-ethereum/issues/1180
		if (transactionReceiptRpc !== null && transactionReceiptRpc.blockNumber !== null) {
			transactionReceiptRpc.status = Web3Wrapper._normalizeTxReceiptStatus(transactionReceiptRpc.status);
			const transactionReceipt = marshaller.unmarshalTransactionReceipt(transactionReceiptRpc);
			return transactionReceipt;
		} else {
			return undefined;
		}
	}
	/**
	 * Retrieves the transaction data for a given transaction
	 * @param txHash Transaction hash
	 * @returns The raw transaction data
	 */
	async getTransactionByHashAsync(txHash) {
		assert.isHexString("txHash", txHash);
		const transactionRpc = await this.sendRawPayloadAsync({
			method: "eth_getTransactionByHash",
			params: [txHash],
		});
		const transaction = marshaller.unmarshalTransaction(transactionRpc);
		return transaction;
	}
	/**
	 * Retrieves an accounts Ether balance in wei
	 * @param owner Account whose balance you wish to check
	 * @param defaultBlock The block depth at which to fetch the balance (default=latest)
	 * @returns Balance in wei
	 */
	async getBalanceInWeiAsync(owner, defaultBlock) {
		assert.isETHAddressHex("owner", owner);
		if (defaultBlock !== undefined) {
			Web3Wrapper._assertBlockParam(defaultBlock);
		}
		const marshalledDefaultBlock = marshaller.marshalBlockParam(defaultBlock);
		const encodedOwner = marshaller.marshalAddress(owner);
		const balanceInWei = await this.sendRawPayloadAsync({
			method: "eth_getBalance",
			params: [encodedOwner, marshalledDefaultBlock],
		});
		// Rewrap in a new BigNumber
		return new BigNumber(balanceInWei);
	}
	/**
	 * Check if a contract exists at a given address
	 * @param address Address to which to check
	 * @returns Whether or not contract code was found at the supplied address
	 */
	async doesContractExistAtAddressAsync(address) {
		assert.isETHAddressHex("address", address);
		const code = await this.getContractCodeAsync(address);
		// Regex matches 0x0, 0x00, 0x in order to accommodate poorly implemented clients
		const isCodeEmpty = /^0x0{0,40}$/i.test(code);
		return !isCodeEmpty;
	}
	/**
	 * Gets the contract code by address
	 * @param  address Address of the contract
	 * @param defaultBlock Block height at which to make the call. Defaults to `latest`
	 * @return Code of the contract
	 */
	async getContractCodeAsync(address, defaultBlock) {
		assert.isETHAddressHex("address", address);
		if (defaultBlock !== undefined) {
			Web3Wrapper._assertBlockParam(defaultBlock);
		}
		const marshalledDefaultBlock = marshaller.marshalBlockParam(defaultBlock);
		const encodedAddress = marshaller.marshalAddress(address);
		const code = await this.sendRawPayloadAsync({
			method: "eth_getCode",
			params: [encodedAddress, marshalledDefaultBlock],
		});
		return code;
	}
	/**
	 * Gets the debug trace of a transaction
	 * @param  txHash Hash of the transactuon to get a trace for
	 * @param  traceParams Config object allowing you to specify if you need memory/storage/stack traces.
	 * @return Transaction trace
	 */
	async getTransactionTraceAsync(txHash, traceParams) {
		assert.isHexString("txHash", txHash);
		const trace = await this.sendRawPayloadAsync({
			method: "debug_traceTransaction",
			params: [txHash, traceParams],
		});
		return trace;
	}
	/**
	 * Sign a message with a specific address's private key (`eth_sign`)
	 * @param address Address of signer
	 * @param message Message to sign
	 * @returns Signature string (might be VRS or RSV depending on the Signer)
	 */
	async signMessageAsync(address, message) {
		assert.isETHAddressHex("address", address);
		assert.isString("message", message); // TODO: Should this be stricter? Hex string?
		const signData = await this.sendRawPayloadAsync({
			method: "eth_sign",
			params: [address, message],
		});
		return signData;
	}
	/**
	 * Sign an EIP712 typed data message with a specific address's private key (`eth_signTypedData`)
	 * @param address Address of signer
	 * @param typedData Typed data message to sign
	 * @returns Signature string (as RSV)
	 */
	async signTypedDataAsync(address, typedData) {
		assert.isETHAddressHex("address", address);
		assert.doesConformToSchema("typedData", typedData, schemas.eip712TypedDataSchema);
		// Try decreasing versions of `eth_signTypedData` until it works.
		const methodsToTry = ["eth_signTypedData_v4", "eth_signTypedData_v3", "eth_signTypedData"];
		let lastErr;
		for (const method of methodsToTry) {
			try {
				return await this.sendRawPayloadAsync({
					method,
					// `eth_signTypedData` expects an object, whereas the others expect
					// a JSON string.
					params: [address, method === "eth_signTypedData" ? typedData : JSON.stringify(typedData)],
				});
			} catch (err) {
				lastErr = err;
				// If there are no more methods to try or the error says something other
				// than the method not existing, throw.
				if (!/(not handled|does not exist|not supported)/.test(err.message)) {
					throw err;
				}
			}
		}
		throw lastErr;
	}
	/**
	 * Fetches the latest block number
	 * @returns Block number
	 */
	async getBlockNumberAsync() {
		const blockNumberHex = await this.sendRawPayloadAsync({
			method: "eth_blockNumber",
			params: [],
		});
		const blockNumber = utils.convertHexToNumberOrNull(blockNumberHex);
		return blockNumber;
	}
	/**
	 * Fetches the nonce for an account (transaction count for EOAs).
	 * @param address Address of account.
	 * @param defaultBlock Block height at which to make the call. Defaults to `latest`
	 * @returns Account nonce.
	 */
	async getAccountNonceAsync(address, defaultBlock) {
		assert.isETHAddressHex("address", address);
		if (defaultBlock !== undefined) {
			Web3Wrapper._assertBlockParam(defaultBlock);
		}
		const marshalledDefaultBlock = marshaller.marshalBlockParam(defaultBlock);
		const encodedAddress = marshaller.marshalAddress(address);
		const nonceHex = await this.sendRawPayloadAsync({
			method: "eth_getTransactionCount",
			params: [encodedAddress, marshalledDefaultBlock],
		});
		assert.isHexString("nonce", nonceHex);
		// tslint:disable-next-line:custom-no-magic-numbers
		return parseInt(nonceHex.substr(2), 16);
	}
	/**
	 * Fetch a specific Ethereum block without transaction data
	 * @param blockParam The block you wish to fetch (blockHash, blockNumber or blockLiteral)
	 * @returns The requested block without transaction data, or undefined if block was not found
	 * (e.g the node isn't fully synced, there was a block re-org and the requested block was uncles, etc...)
	 */
	async getBlockIfExistsAsync(blockParam) {
		Web3Wrapper._assertBlockParamOrString(blockParam);
		const encodedBlockParam = marshaller.marshalBlockParam(blockParam);
		const method = utils.isHexStrict(blockParam) ? "eth_getBlockByHash" : "eth_getBlockByNumber";
		const shouldIncludeTransactionData = false;
		const blockWithoutTransactionDataWithHexValuesOrNull =
			(await this.sendRawPayloadAsync) <
			BlockWithoutTransactionDataRPC >
			{
				method,
				params: [encodedBlockParam, shouldIncludeTransactionData],
			};
		let blockWithoutTransactionDataIfExists;
		if (blockWithoutTransactionDataWithHexValuesOrNull !== null) {
			blockWithoutTransactionDataIfExists = marshaller.unmarshalIntoBlockWithoutTransactionData(
				blockWithoutTransactionDataWithHexValuesOrNull
			);
		}
		return blockWithoutTransactionDataIfExists;
	}
	/**
	 * Fetch a specific Ethereum block with transaction data
	 * @param blockParam The block you wish to fetch (blockHash, blockNumber or blockLiteral)
	 * @returns The requested block with transaction data
	 */
	async getBlockWithTransactionDataAsync(blockParam) {
		Web3Wrapper._assertBlockParamOrString(blockParam);
		let encodedBlockParam = blockParam;
		if (_.isNumber(blockParam)) {
			encodedBlockParam = utils.numberToHex(blockParam);
		}
		const method = utils.isHexStrict(blockParam) ? "eth_getBlockByHash" : "eth_getBlockByNumber";
		const shouldIncludeTransactionData = true;
		const blockWithTransactionDataWithHexValues = await this.sendRawPayloadAsync({
			method,
			params: [encodedBlockParam, shouldIncludeTransactionData],
		});
		const blockWithoutTransactionData = marshaller.unmarshalIntoBlockWithTransactionData(
			blockWithTransactionDataWithHexValues
		);
		return blockWithoutTransactionData;
	}
	/**
	 * Fetch a block's timestamp
	 * @param blockParam The block you wish to fetch (blockHash, blockNumber or blockLiteral)
	 * @returns The block's timestamp
	 */
	async getBlockTimestampAsync(blockParam) {
		Web3Wrapper._assertBlockParamOrString(blockParam);
		const blockIfExists = await this.getBlockIfExistsAsync(blockParam);
		if (blockIfExists === undefined) {
			throw new Error(`Failed to fetch block with blockParam: ${JSON.stringify(blockParam)}`);
		}
		return blockIfExists.timestamp;
	}
	/**
	 * Retrieve the user addresses available through the backing provider
	 * @returns Available user addresses
	 */
	async getAvailableAddressesAsync() {
		const addresses = await this.sendRawPayloadAsync({
			method: "eth_accounts",
			params: [],
		});
		const normalizedAddresses = _.map(addresses, (address) => address.toLowerCase());
		return normalizedAddresses;
	}
	/**
	 * Take a snapshot of the blockchain state on a TestRPC/Ganache local node
	 * @returns The snapshot id. This can be used to revert to this snapshot
	 */
	async takeSnapshotAsync() {
		const snapshotId = Number(await this.sendRawPayloadAsync({ method: "evm_snapshot", params: [] }));
		return snapshotId;
	}
	/**
	 * Revert the blockchain state to a previous snapshot state on TestRPC/Ganache local node
	 * @param snapshotId snapshot id to revert to
	 * @returns Whether the revert was successful
	 */
	async revertSnapshotAsync(snapshotId) {
		assert.isNumber("snapshotId", snapshotId);
		const didRevert = await this.sendRawPayloadAsync({ method: "evm_revert", params: [snapshotId] });
		return didRevert;
	}
	/**
	 * Mine a block on a TestRPC/Ganache local node
	 */
	async mineBlockAsync() {
		await this.sendRawPayloadAsync({ method: "evm_mine", params: [] });
	}
	/**
	 * Increase the next blocks timestamp on TestRPC/Ganache or Geth local node.
	 * Will throw if provider is neither TestRPC/Ganache or Geth.
	 * @param timeDelta Amount of time to add in seconds
	 */
	async increaseTimeAsync(timeDelta) {
		assert.isNumber("timeDelta", timeDelta);
		// Detect Geth vs. Ganache and use appropriate endpoint.
		const version = await this.getNodeVersionAsync();
		if (_.includes(version, uniqueVersionIds.geth)) {
			return this.sendRawPayloadAsync({ method: "debug_increaseTime", params: [timeDelta] });
		} else if (_.includes(version, uniqueVersionIds.ganache)) {
			return this.sendRawPayloadAsync({ method: "evm_increaseTime", params: [timeDelta] });
		} else {
			throw new Error(`Unknown client version: ${version}`);
		}
	}
	/**
	 * Retrieve smart contract logs for a given filter
	 * @param filter Parameters by which to filter which logs to retrieve
	 * @returns The corresponding log entries
	 */
	async getLogsAsync(filter) {
		if (filter.blockHash !== undefined && (filter.fromBlock !== undefined || filter.toBlock !== undefined)) {
			throw new Error(
				`Cannot specify 'blockHash' as well as 'fromBlock'/'toBlock' in the filter supplied to 'getLogsAsync'`
			);
		}

		let fromBlock = filter.fromBlock;
		if (_.isNumber(fromBlock)) {
			fromBlock = utils.numberToHex(fromBlock);
		}
		let toBlock = filter.toBlock;
		if (_.isNumber(toBlock)) {
			toBlock = utils.numberToHex(toBlock);
		}
		const serializedFilter = {
			...filter,
			fromBlock,
			toBlock,
		};
		const payload = {
			method: "eth_getLogs",
			params: [serializedFilter],
		};
		const rawLogs = await this.sendRawPayloadAsync(payload);
		const formattedLogs = _.map(rawLogs, marshaller.unmarshalLog.bind(marshaller));
		return formattedLogs;
	}
	/**
	 * Calculate the estimated gas cost for a given transaction
	 * @param txData Transaction data
	 * @returns Estimated gas cost
	 */
	async estimateGasAsync(txData) {
		assert.doesConformToSchema("txData", txData, schemas.txDataSchema, [
			schemas.addressSchema,
			schemas.numberSchema,
			schemas.jsNumber,
		]);
		const txDataHex = marshaller.marshalTxData(txData);
		const gasHex = await this.sendRawPayloadAsync({ method: "eth_estimateGas", params: [txDataHex] });
		const gas = utils.convertHexToNumber(gasHex);
		return gas;
	}
	/**
	 * Call a smart contract method at a given block height
	 * @param callData Call data
	 * @param defaultBlock Block height at which to make the call. Defaults to `latest`
	 * @returns The raw call result
	 */
	async callAsync(callData, defaultBlock) {
		assert.doesConformToSchema("callData", callData, schemas.callDataSchema, [
			schemas.addressSchema,
			schemas.numberSchema,
			schemas.jsNumber,
		]);
		if (defaultBlock !== undefined) {
			Web3Wrapper._assertBlockParam(defaultBlock);
		}
		const marshalledDefaultBlock = marshaller.marshalBlockParam(defaultBlock);
		const callDataHex = marshaller.marshalCallData(callData);
		const overrides = marshaller.marshalCallOverrides(callData.overrides || {});
		const rawCallResult = await this.sendRawPayloadAsync({
			method: "eth_call",
			params: [callDataHex, marshalledDefaultBlock, ...(Object.keys(overrides).length === 0 ? [] : [overrides])],
		});
		return rawCallResult;
	}
	/**
	 * Send a transaction
	 * @param txData Transaction data
	 * @returns Transaction hash
	 */
	async sendTransactionAsync(txData) {
		assert.doesConformToSchema("txData", txData, schemas.txDataSchema, [
			schemas.addressSchema,
			schemas.numberSchema,
			schemas.jsNumber,
		]);
		const txDataHex = marshaller.marshalTxData(txData);
		const txHash = await this.sendRawPayloadAsync({ method: "eth_sendTransaction", params: [txDataHex] });
		return txHash;
	}
	/**
	 * Waits for a transaction to be mined and returns the transaction receipt.
	 * Note that just because a transaction was mined does not mean it was
	 * successful. You need to check the status code of the transaction receipt
	 * to find out if it was successful, or use the helper method
	 * awaitTransactionSuccessAsync.
	 * @param   txHash            Transaction hash
	 * @param   pollingIntervalMs How often (in ms) should we check if the transaction is mined.
	 * @param   timeoutMs         How long (in ms) to poll for transaction mined until aborting.
	 * @return  Transaction receipt with decoded log args.
	 */
	async awaitTransactionMinedAsync(txHash, pollingIntervalMs = 1000, timeoutMs) {
		assert.isHexString("txHash", txHash);
		assert.isNumber("pollingIntervalMs", pollingIntervalMs);
		if (timeoutMs !== undefined) {
			assert.isNumber("timeoutMs", timeoutMs);
		}
		// Immediately check if the transaction has already been mined.
		let transactionReceipt = await this.getTransactionReceiptIfExistsAsync(txHash);
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
						return reject(Web3WrapperErrors.TransactionMiningTimeout);
					}

					transactionReceipt = await this.getTransactionReceiptIfExistsAsync(txHash);
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
	/**
	 * Waits for a transaction to be mined and returns the transaction receipt.
	 * Unlike awaitTransactionMinedAsync, it will throw if the receipt has a
	 * status that is not equal to 1. A status of 0 or null indicates that the
	 * transaction was mined, but failed. See:
	 * https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethgettransactionreceipt
	 * @param   txHash            Transaction hash
	 * @param   pollingIntervalMs How often (in ms) should we check if the transaction is mined.
	 * @param   timeoutMs         How long (in ms) to poll for transaction mined until aborting.
	 * @return  Transaction receipt with decoded log args.
	 */
	async awaitTransactionSuccessAsync(txHash, pollingIntervalMs = 1000, timeoutMs) {
		const receipt = await this.awaitTransactionMinedAsync(txHash, pollingIntervalMs, timeoutMs);
		if (receipt.status !== 1) {
			throw new Error(`Transaction failed: ${txHash}`);
		}
		return receipt;
	}
	/**
	 * Calls the 'debug_setHead' JSON RPC method, which sets the current head of
	 * the local chain by block number. Note, this is a destructive action and
	 * may severely damage your chain. Use with extreme caution. As of now, this
	 * is only supported by Geth. It sill throw if the 'debug_setHead' method is
	 * not supported.
	 * @param  blockNumber The block number to reset to.
	 */
	async setHeadAsync(blockNumber) {
		assert.isNumber("blockNumber", blockNumber);
		await this.sendRawPayloadAsync({ method: "debug_setHead", params: [utils.numberToHex(blockNumber)] });
	}
	/**
	 * Sends a raw Ethereum JSON RPC payload and returns the response's `result` key
	 * @param payload A partial JSON RPC payload. No need to include version, id, params (if none needed)
	 * @return The contents nested under the result key of the response body
	 */
	async sendRawPayloadAsync(payload) {
		const sendAsync = this._provider.sendAsync.bind(this._provider);
		const payloadWithDefaults = {
			id: this._jsonRpcRequestId++,
			params: [],
			jsonrpc: "2.0",
			...payload,
		};
		const response = await promisify(sendAsync)(payloadWithDefaults);
		if (response.error) {
			throw new Error(response.error.message);
		}
		const result = response.result;
		return result;
	}
	/**
	 * Returns either NodeType.Geth or NodeType.Ganache depending on the type of
	 * the backing Ethereum node. Throws for any other type of node.
	 */
	async getNodeTypeAsync() {
		const version = await this.getNodeVersionAsync();
		if (_.includes(version, uniqueVersionIds.geth)) {
			return NodeType.Geth;
		} else if (_.includes(version, uniqueVersionIds.ganache)) {
			return NodeType.Ganache;
		} else {
			throw new Error(`Unknown client version: ${version}`);
		}
	}
}
