// tslint:disable:no-consecutive-blank-lines ordered-imports align trailing-comma enum-naming
// tslint:disable:whitespace no-unbound-method no-trailing-whitespace
// tslint:disable:no-unused-variable
import { BaseContract, SubscriptionManager, methodAbiToFunctionSignature } from "@0x/base-contract";
import { schemas } from "@0x/json-schemas";
import { classUtils, logUtils, providerUtils } from "@0x/utils";
import { Web3Wrapper } from "@0x/web3-wrapper";
import { assert } from "@0x/assert";
import * as ethers from "ethers";

const TokenizedRegistryEvents = {
	OwnershipTransferred: "OwnershipTransferred",
};
/* istanbul ignore next */
// tslint:disable:no-parameter-reassignment
// tslint:disable-next-line:class-name
export class TokenizedRegistryContract extends BaseContract {
	/**
	 * @ignore
	 */
	deployedBytecode;
	contractName = "TokenizedRegistry";
	_methodABIIndex = {};
	_subscriptionManager;

	async deployFrom0xArtifactAsync(artifact, supportedProvider, txDefaults, logDecodeDependencies) {
		assert.doesConformToSchema("txDefaults", txDefaults, schemas.txDataSchema, [
			schemas.addressSchema,
			schemas.numberSchema,
			schemas.jsNumber,
		]);
		if (artifact.compilerOutput === undefined) {
			throw new Error("Compiler output not found in the artifact file");
		}
		const provider = providerUtils.standardizeOrThrow(supportedProvider);
		const bytecode = artifact.compilerOutput.evm.bytecode.object;
		const abi = artifact.compilerOutput.abi;
		const logDecodeDependenciesAbiOnly = {};
		if (Object.keys(logDecodeDependencies) !== undefined) {
			for (const key of Object.keys(logDecodeDependencies)) {
				logDecodeDependenciesAbiOnly[key] = logDecodeDependencies[key].compilerOutput.abi;
			}
		}
		return TokenizedRegistryContract.deployAsync(bytecode, abi, provider, txDefaults, logDecodeDependenciesAbiOnly);
	}

	async deployAsync(bytecode, abi, supportedProvider, txDefaults, logDecodeDependencies) {
		assert.isHexString("bytecode", bytecode);
		assert.doesConformToSchema("txDefaults", txDefaults, schemas.txDataSchema, [
			schemas.addressSchema,
			schemas.numberSchema,
			schemas.jsNumber,
		]);
		const provider = providerUtils.standardizeOrThrow(supportedProvider);
		const constructorAbi = BaseContract._lookupConstructorAbi(abi);
		[] = BaseContract._formatABIDataItemList(constructorAbi.inputs, [], BaseContract._bigNumberToString);
		//@ts-ignore
		const iface = new ethers.utils.Interface(abi);
		const deployInfo = iface.deployFunction;
		const txData = deployInfo.encode(bytecode, []);
		const web3Wrapper = new Web3Wrapper(provider);
		const txDataWithDefaults = await BaseContract._applyDefaultsToContractTxDataAsync(
			{
				data: txData,
				...txDefaults,
			},
			web3Wrapper.estimateGasAsync.bind(web3Wrapper)
		);
		const txHash = await web3Wrapper.sendTransactionAsync(txDataWithDefaults);
		logUtils.log(`transactionHash: ${txHash}`);
		const txReceipt = await web3Wrapper.awaitTransactionSuccessAsync(txHash);
		logUtils.log(`TokenizedRegistry successfully deployed at ${txReceipt.contractAddress}`);
		const contractInstance = new TokenizedRegistryContract(
			txReceipt.contractAddress,
			provider,
			txDefaults,
			logDecodeDependencies
		);
		contractInstance.constructorArgs = [];
		return contractInstance;
	}

	/**
	 * @returns      The contract ABI
	 */
	ABI() {
		const abi = [
			{
				constant: true,
				inputs: [],
				name: "owner",
				outputs: [
					{
						name: "",
						type: "address",
					},
				],
				payable: false,
				stateMutability: "view",
				type: "function",
			},
			{
				constant: true,
				inputs: [
					{
						name: "index_0",
						type: "address",
					},
				],
				name: "tokens",
				outputs: [
					{
						name: "token",
						type: "address",
					},
					{
						name: "asset",
						type: "address",
					},
					{
						name: "name",
						type: "string",
					},
					{
						name: "symbol",
						type: "string",
					},
					{
						name: "tokenType",
						type: "uint256",
					},
					{
						name: "index",
						type: "uint256",
					},
				],
				payable: false,
				stateMutability: "view",
				type: "function",
			},
			{
				constant: true,
				inputs: [
					{
						name: "index_0",
						type: "uint256",
					},
				],
				name: "tokenAddresses",
				outputs: [
					{
						name: "",
						type: "address",
					},
				],
				payable: false,
				stateMutability: "view",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_newOwner",
						type: "address",
					},
				],
				name: "transferOwnership",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				anonymous: false,
				inputs: [
					{
						name: "previousOwner",
						type: "address",
						indexed: true,
					},
					{
						name: "newOwner",
						type: "address",
						indexed: true,
					},
				],
				name: "OwnershipTransferred",
				outputs: [],
				type: "event",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_tokens",
						type: "address[]",
					},
					{
						name: "_assets",
						type: "address[]",
					},
					{
						name: "_names",
						type: "string[]",
					},
					{
						name: "_symbols",
						type: "string[]",
					},
					{
						name: "_types",
						type: "uint256[]",
					},
				],
				name: "addTokens",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_tokens",
						type: "address[]",
					},
				],
				name: "removeTokens",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_token",
						type: "address",
					},
					{
						name: "_asset",
						type: "address",
					},
					{
						name: "_name",
						type: "string",
					},
					{
						name: "_symbol",
						type: "string",
					},
					{
						name: "_type",
						type: "uint256",
					},
				],
				name: "addToken",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_token",
						type: "address",
					},
				],
				name: "removeToken",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_token",
						type: "address",
					},
					{
						name: "_name",
						type: "string",
					},
				],
				name: "setTokenName",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_token",
						type: "address",
					},
					{
						name: "_symbol",
						type: "string",
					},
				],
				name: "setTokenSymbol",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: true,
				inputs: [
					{
						name: "_symbol",
						type: "string",
					},
				],
				name: "getTokenAddressBySymbol",
				outputs: [
					{
						name: "",
						type: "address",
					},
				],
				payable: false,
				stateMutability: "view",
				type: "function",
			},
			{
				constant: true,
				inputs: [
					{
						name: "_name",
						type: "string",
					},
				],
				name: "getTokenAddressByName",
				outputs: [
					{
						name: "",
						type: "address",
					},
				],
				payable: false,
				stateMutability: "view",
				type: "function",
			},
			{
				constant: true,
				inputs: [
					{
						name: "_token",
						type: "address",
					},
				],
				name: "getTokenByAddress",
				outputs: [
					{
						name: "",
						type: "tuple",
						components: [
							{
								name: "token",
								type: "address",
							},
							{
								name: "asset",
								type: "address",
							},
							{
								name: "name",
								type: "string",
							},
							{
								name: "symbol",
								type: "string",
							},
							{
								name: "tokenType",
								type: "uint256",
							},
							{
								name: "index",
								type: "uint256",
							},
						],
					},
				],
				payable: false,
				stateMutability: "view",
				type: "function",
			},
			{
				constant: true,
				inputs: [
					{
						name: "_name",
						type: "string",
					},
				],
				name: "getTokenByName",
				outputs: [
					{
						name: "",
						type: "tuple",
						components: [
							{
								name: "token",
								type: "address",
							},
							{
								name: "asset",
								type: "address",
							},
							{
								name: "name",
								type: "string",
							},
							{
								name: "symbol",
								type: "string",
							},
							{
								name: "tokenType",
								type: "uint256",
							},
							{
								name: "index",
								type: "uint256",
							},
						],
					},
				],
				payable: false,
				stateMutability: "view",
				type: "function",
			},
			{
				constant: true,
				inputs: [
					{
						name: "_symbol",
						type: "string",
					},
				],
				name: "getTokenBySymbol",
				outputs: [
					{
						name: "",
						type: "tuple",
						components: [
							{
								name: "token",
								type: "address",
							},
							{
								name: "asset",
								type: "address",
							},
							{
								name: "name",
								type: "string",
							},
							{
								name: "symbol",
								type: "string",
							},
							{
								name: "tokenType",
								type: "uint256",
							},
							{
								name: "index",
								type: "uint256",
							},
						],
					},
				],
				payable: false,
				stateMutability: "view",
				type: "function",
			},
			{
				constant: true,
				inputs: [],
				name: "getTokenAddresses",
				outputs: [
					{
						name: "",
						type: "address[]",
					},
				],
				payable: false,
				stateMutability: "view",
				type: "function",
			},
			{
				constant: true,
				inputs: [
					{
						name: "_start",
						type: "uint256",
					},
					{
						name: "_count",
						type: "uint256",
					},
					{
						name: "_tokenType",
						type: "uint256",
					},
				],
				name: "getTokens",
				outputs: [
					{
						name: "tokenData",
						type: "tuple[]",
						components: [
							{
								name: "token",
								type: "address",
							},
							{
								name: "asset",
								type: "address",
							},
							{
								name: "name",
								type: "string",
							},
							{
								name: "symbol",
								type: "string",
							},
							{
								name: "tokenType",
								type: "uint256",
							},
							{
								name: "index",
								type: "uint256",
							},
						],
					},
				],
				payable: false,
				stateMutability: "view",
				type: "function",
			},
			{
				constant: true,
				inputs: [
					{
						name: "_token",
						type: "address",
					},
					{
						name: "_tokenType",
						type: "uint256",
					},
				],
				name: "isTokenType",
				outputs: [
					{
						name: "valid",
						type: "bool",
					},
				],
				payable: false,
				stateMutability: "view",
				type: "function",
			},
			{
				constant: true,
				inputs: [
					{
						name: "_token",
						type: "address",
					},
					{
						name: "_tokenType",
						type: "uint256",
					},
				],
				name: "getTokenAsset",
				outputs: [
					{
						name: "",
						type: "address",
					},
				],
				payable: false,
				stateMutability: "view",
				type: "function",
			},
		];
		return abi;
	}

	getFunctionSignature(methodName) {
		const index = this._methodABIIndex[methodName];
		const methodAbi = TokenizedRegistryContract.ABI()[index]; // tslint:disable-line:no-unnecessary-type-assertion
		const functionSignature = methodAbiToFunctionSignature(methodAbi);
		return functionSignature;
	}

	getABIDecodedTransactionData(methodName, callData) {
		const functionSignature = this.getFunctionSignature(methodName);
		const self = this;
		const abiEncoder = self._lookupAbiEncoder(functionSignature);
		const abiDecodedCallData = abiEncoder.strictDecode(callData);
		return abiDecodedCallData;
	}

	getABIDecodedReturnData(methodName, callData) {
		const functionSignature = this.getFunctionSignature(methodName);
		const self = this;
		const abiEncoder = self._lookupAbiEncoder(functionSignature);
		const abiDecodedCallData = abiEncoder.strictDecodeReturnValue(callData);
		return abiDecodedCallData;
	}

	getSelector(methodName) {
		const functionSignature = this.getFunctionSignature(methodName);
		const self = this;
		const abiEncoder = self._lookupAbiEncoder(functionSignature);
		return abiEncoder.getSelector();
	}

	owner() {
		const self = this;
		const functionSignature = "owner()";

		return {
			async callAsync(callData = {}, defaultBlock) {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue < string > (rawCallResult);
			},
			getABIEncodedTransactionData() {
				return self._strictEncodeArguments(functionSignature, []);
			},
		};
	}

	tokens(index_0) {
		const self = this;
		assert.isString("index_0", index_0);
		const functionSignature = "tokens(address)";

		return {
			async callAsync(callData = {}, defaultBlock) {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue(rawCallResult);
			},
			getABIEncodedTransactionData() {
				return self._strictEncodeArguments(functionSignature, [index_0.toLowerCase()]);
			},
		};
	}

	tokenAddresses(index_0) {
		const self = this;
		assert.isBigNumber("index_0", index_0);
		const functionSignature = "tokenAddresses(uint256)";

		return {
			async callAsync(callData = {}, defaultBlock) {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue < string > (rawCallResult);
			},
			getABIEncodedTransactionData() {
				return self._strictEncodeArguments(functionSignature, [index_0]);
			},
		};
	}

	transferOwnership(_newOwner) {
		const self = this;
		assert.isString("_newOwner", _newOwner);
		const functionSignature = "transferOwnership(address)";

		return {
			async sendTransactionAsync(txData, opts = { shouldValidate: true }) {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
					{ ...txData, data: this.getABIEncodedTransactionData() },
					this.estimateGasAsync.bind(this)
				);
				if (opts.shouldValidate !== false) {
					await this.callAsync(txDataWithDefaults);
				}
				return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
			},
			awaitTransactionSuccessAsync(txData, opts = { shouldValidate: true }) {
				return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
			},
			async estimateGasAsync(txData) {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
					...txData,
					data: this.getABIEncodedTransactionData(),
				});
				return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
			},
			async callAsync(callData = {}, defaultBlock) {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue(rawCallResult);
			},
			getABIEncodedTransactionData() {
				return self._strictEncodeArguments(functionSignature, [_newOwner.toLowerCase()]);
			},
		};
	}

	addTokens(_tokens, _assets, _names, _symbols, _types) {
		const self = this;
		assert.isArray("_tokens", _tokens);
		assert.isArray("_assets", _assets);
		assert.isArray("_names", _names);
		assert.isArray("_symbols", _symbols);
		assert.isArray("_types", _types);
		const functionSignature = "addTokens(address[],address[],string[],string[],uint256[])";

		return {
			async sendTransactionAsync(txData, opts = { shouldValidate: true }) {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
					{ ...txData, data: this.getABIEncodedTransactionData() },
					this.estimateGasAsync.bind(this)
				);
				if (opts.shouldValidate !== false) {
					await this.callAsync(txDataWithDefaults);
				}
				return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
			},
			awaitTransactionSuccessAsync(txData, opts = { shouldValidate: true }) {
				return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
			},
			async estimateGasAsync(txData) {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
					...txData,
					data: this.getABIEncodedTransactionData(),
				});
				return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
			},
			async callAsync(callData = {}, defaultBlock) {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue(rawCallResult);
			},
			getABIEncodedTransactionData() {
				return self._strictEncodeArguments(functionSignature, [_tokens, _assets, _names, _symbols, _types]);
			},
		};
	}

	removeTokens(_tokens) {
		const self = this;
		assert.isArray("_tokens", _tokens);
		const functionSignature = "removeTokens(address[])";

		return {
			async sendTransactionAsync(txData, opts = { shouldValidate: true }) {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
					{ ...txData, data: this.getABIEncodedTransactionData() },
					this.estimateGasAsync.bind(this)
				);
				if (opts.shouldValidate !== false) {
					await this.callAsync(txDataWithDefaults);
				}
				return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
			},
			awaitTransactionSuccessAsync(txData, opts = { shouldValidate: true }) {
				return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
			},
			async estimateGasAsync(txData) {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
					...txData,
					data: this.getABIEncodedTransactionData(),
				});
				return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
			},
			async callAsync(callData = {}, defaultBlock) {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue(rawCallResult);
			},
			getABIEncodedTransactionData() {
				return self._strictEncodeArguments(functionSignature, [_tokens]);
			},
		};
	}

	addToken(_token, _asset, _name, _symbol, _type) {
		const self = this;
		assert.isString("_token", _token);
		assert.isString("_asset", _asset);
		assert.isString("_name", _name);
		assert.isString("_symbol", _symbol);
		assert.isBigNumber("_type", _type);
		const functionSignature = "addToken(address,address,string,string,uint256)";

		return {
			async sendTransactionAsync(txData, opts = { shouldValidate: true }) {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
					{ ...txData, data: this.getABIEncodedTransactionData() },
					this.estimateGasAsync.bind(this)
				);
				if (opts.shouldValidate !== false) {
					await this.callAsync(txDataWithDefaults);
				}
				return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
			},
			awaitTransactionSuccessAsync(txData, opts = { shouldValidate: true }) {
				return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
			},
			async estimateGasAsync(txData) {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
					...txData,
					data: this.getABIEncodedTransactionData(),
				});
				return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
			},
			async callAsync(callData = {}, defaultBlock) {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue(rawCallResult);
			},
			getABIEncodedTransactionData() {
				return self._strictEncodeArguments(functionSignature, [
					_token.toLowerCase(),
					_asset.toLowerCase(),
					_name,
					_symbol,
					_type,
				]);
			},
		};
	}

	removeToken(_token) {
		const self = this;
		assert.isString("_token", _token);
		const functionSignature = "removeToken(address)";

		return {
			async sendTransactionAsync(txData, opts = { shouldValidate: true }) {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
					{ ...txData, data: this.getABIEncodedTransactionData() },
					this.estimateGasAsync.bind(this)
				);
				if (opts.shouldValidate !== false) {
					await this.callAsync(txDataWithDefaults);
				}
				return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
			},
			awaitTransactionSuccessAsync(txData, opts = { shouldValidate: true }) {
				return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
			},
			async estimateGasAsync(txData) {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
					...txData,
					data: this.getABIEncodedTransactionData(),
				});
				return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
			},
			async callAsync(callData = {}, defaultBlock) {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue(rawCallResult);
			},
			getABIEncodedTransactionData() {
				return self._strictEncodeArguments(functionSignature, [_token.toLowerCase()]);
			},
		};
	}

	setTokenName(_token, _name) {
		const self = this;
		assert.isString("_token", _token);
		assert.isString("_name", _name);
		const functionSignature = "setTokenName(address,string)";

		return {
			async sendTransactionAsync(txData, opts = { shouldValidate: true }) {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
					{ ...txData, data: this.getABIEncodedTransactionData() },
					this.estimateGasAsync.bind(this)
				);
				if (opts.shouldValidate !== false) {
					await this.callAsync(txDataWithDefaults);
				}
				return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
			},
			awaitTransactionSuccessAsync(txData, opts = { shouldValidate: true }) {
				return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
			},
			async estimateGasAsync(txData) {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
					...txData,
					data: this.getABIEncodedTransactionData(),
				});
				return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
			},
			async callAsync(callData = {}, defaultBlock) {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue(rawCallResult);
			},
			getABIEncodedTransactionData() {
				return self._strictEncodeArguments(functionSignature, [_token.toLowerCase(), _name]);
			},
		};
	}

	setTokenSymbol(_token, _symbol) {
		const self = this;
		assert.isString("_token", _token);
		assert.isString("_symbol", _symbol);
		const functionSignature = "setTokenSymbol(address,string)";

		return {
			async sendTransactionAsync(txData, opts = { shouldValidate: true }) {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
					{ ...txData, data: this.getABIEncodedTransactionData() },
					this.estimateGasAsync.bind(this)
				);
				if (opts.shouldValidate !== false) {
					await this.callAsync(txDataWithDefaults);
				}
				return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
			},
			awaitTransactionSuccessAsync(txData, opts = { shouldValidate: true }) {
				return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
			},
			async estimateGasAsync(txData) {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
					...txData,
					data: this.getABIEncodedTransactionData(),
				});
				return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
			},
			async callAsync(callData = {}, defaultBlock) {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue(rawCallResult);
			},
			getABIEncodedTransactionData() {
				return self._strictEncodeArguments(functionSignature, [_token.toLowerCase(), _symbol]);
			},
		};
	}

	getTokenAddressBySymbol(_symbol) {
		const self = this;
		assert.isString("_symbol", _symbol);
		const functionSignature = "getTokenAddressBySymbol(string)";

		return {
			async callAsync(callData = {}, defaultBlock) {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue < string > (rawCallResult);
			},
			getABIEncodedTransactionData() {
				return self._strictEncodeArguments(functionSignature, [_symbol]);
			},
		};
	}

	getTokenAddressByName(_name) {
		const self = this;
		assert.isString("_name", _name);
		const functionSignature = "getTokenAddressByName(string)";

		return {
			async callAsync(callData = {}, defaultBlock) {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue < string > (rawCallResult);
			},
			getABIEncodedTransactionData() {
				return self._strictEncodeArguments(functionSignature, [_name]);
			},
		};
	}

	getTokenByAddress(_token) {
		const self = this;
		assert.isString("_token", _token);
		const functionSignature = "getTokenByAddress(address)";

		return {
			async callAsync(callData = {}, defaultBlock) {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue(rawCallResult);
			},
			getABIEncodedTransactionData() {
				return self._strictEncodeArguments(functionSignature, [_token.toLowerCase()]);
			},
		};
	}

	getTokenByName(_name) {
		const self = this;
		assert.isString("_name", _name);
		const functionSignature = "getTokenByName(string)";

		return {
			async callAsync(callData = {}, defaultBlock) {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue(rawCallResult);
			},
			getABIEncodedTransactionData() {
				return self._strictEncodeArguments(functionSignature, [_name]);
			},
		};
	}

	getTokenBySymbol(_symbol) {
		const self = this;
		assert.isString("_symbol", _symbol);
		const functionSignature = "getTokenBySymbol(string)";

		return {
			async callAsync(callData = {}, defaultBlock) {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue(rawCallResult);
			},
			getABIEncodedTransactionData() {
				return self._strictEncodeArguments(functionSignature, [_symbol]);
			},
		};
	}

	getTokenAddresses() {
		const self = this;
		const functionSignature = "getTokenAddresses()";

		return {
			async callAsync(callData = {}, defaultBlock) {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue(rawCallResult);
			},
			getABIEncodedTransactionData() {
				return self._strictEncodeArguments(functionSignature, []);
			},
		};
	}

	getTokens(_start, _count, _tokenType) {
		const self = this;
		assert.isBigNumber("_start", _start);
		assert.isBigNumber("_count", _count);
		assert.isBigNumber("_tokenType", _tokenType);
		const functionSignature = "getTokens(uint256,uint256,uint256)";

		return {
			async callAsync(callData = {}, defaultBlock) {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue(rawCallResult);
			},
			getABIEncodedTransactionData() {
				return self._strictEncodeArguments(functionSignature, [_start, _count, _tokenType]);
			},
		};
	}

	isTokenType(_token, _tokenType) {
		const self = this;
		assert.isString("_token", _token);
		assert.isBigNumber("_tokenType", _tokenType);
		const functionSignature = "isTokenType(address,uint256)";

		return {
			async callAsync(callData = {}, defaultBlock) {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue(rawCallResult);
			},
			getABIEncodedTransactionData() {
				return self._strictEncodeArguments(functionSignature, [_token.toLowerCase(), _tokenType]);
			},
		};
	}

	getTokenAsset(_token, _tokenType) {
		const self = this;
		assert.isString("_token", _token);
		assert.isBigNumber("_tokenType", _tokenType);
		const functionSignature = "getTokenAsset(address,uint256)";

		return {
			async callAsync(callData = {}, defaultBlock) {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue(rawCallResult);
			},
			getABIEncodedTransactionData() {
				return self._strictEncodeArguments(functionSignature, [_token.toLowerCase(), _tokenType]);
			},
		};
	}

	/**
	 * Subscribe to an event type emitted by the TokenizedRegistry contract.
	 * @param eventName The TokenizedRegistry contract event you would like to subscribe to.
	 * @param indexFilterValues An object where the keys are indexed args returned by the event and
	 * the value is the value you are interested in. E.g `{maker: aUserAddressHex}`
	 * @param callback Callback that gets called when a log is added/removed
	 * @param isVerbose Enable verbose subscription warnings (e.g recoverable network issues encountered)
	 * @return Subscription token used later to unsubscribe
	 */
	subscribe(eventName, indexFilterValues, callback, isVerbose = false, blockPollingIntervalMs) {
		assert.doesBelongToStringEnum("eventName", eventName, TokenizedRegistryEvents);
		assert.doesConformToSchema("indexFilterValues", indexFilterValues, schemas.indexFilterValuesSchema);
		assert.isFunction("callback", callback);
		const subscriptionToken = this._subscriptionManager.subscribe(
			this.address,
			eventName,
			indexFilterValues,
			TokenizedRegistryContract.ABI(),
			callback,
			isVerbose,
			blockPollingIntervalMs
		);
		return subscriptionToken;
	}

	/**
	 * Cancel a subscription
	 * @param subscriptionToken Subscription token returned by `subscribe()`
	 */
	unsubscribe(subscriptionToken) {
		this._subscriptionManager.unsubscribe(subscriptionToken);
	}

	/**
	 * Cancels all existing subscriptions
	 */
	unsubscribeAll() {
		this._subscriptionManager.unsubscribeAll();
	}

	/**
	 * Gets historical logs without creating a subscription
	 * @param eventName The TokenizedRegistry contract event you would like to subscribe to.
	 * @param blockRange Block range to get logs from.
	 * @param indexFilterValues An object where the keys are indexed args returned by the event and
	 * the value is the value you are interested in. E.g `{_from: aUserAddressHex}`
	 * @return Array of logs that match the parameters
	 */
	async getLogsAsync(eventName, blockRange, indexFilterValues) {
		assert.doesBelongToStringEnum("eventName", eventName, TokenizedRegistryEvents);
		assert.doesConformToSchema("blockRange", blockRange, schemas.blockRangeSchema);
		assert.doesConformToSchema("indexFilterValues", indexFilterValues, schemas.indexFilterValuesSchema);
		const logs = await this._subscriptionManager.getLogsAsync(
			this.address,
			eventName,
			blockRange,
			indexFilterValues,
			TokenizedRegistryContract.ABI()
		);
		return logs;
	}

	constructor(
		address,
		supportedProvider,
		txDefaults,
		logDecodeDependencies,
		deployedBytecode = TokenizedRegistryContract.deployedBytecode
	) {
		super(
			"TokenizedRegistry",
			TokenizedRegistryContract.ABI(),
			address,
			supportedProvider,
			txDefaults,
			logDecodeDependencies,
			deployedBytecode
		);
		classUtils.bindAll(this, ["_abiEncoderByFunctionSignature", "address", "_web3Wrapper"]);
		this._subscriptionManager = new SubscriptionManager(TokenizedRegistryContract.ABI(), this._web3Wrapper);
		TokenizedRegistryContract.ABI().forEach((item, index) => {
			if (item.type === "function") {
				const methodAbi = item;
				this._methodABIIndex[methodAbi.name] = index;
			}
		});
	}
}

// tslint:disable:max-file-line-count
// tslint:enable:no-unbound-method no-parameter-reassignment no-consecutive-blank-lines ordered-imports align
// tslint:enable:trailing-comma whitespace no-trailing-whitespace
