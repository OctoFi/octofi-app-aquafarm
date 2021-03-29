// tslint:disable:no-consecutive-blank-lines ordered-imports align trailing-comma enum-naming
// tslint:disable:whitespace no-unbound-method no-trailing-whitespace
// tslint:disable:no-unused-variable
import {
	AwaitTransactionSuccessOpts,
	ContractFunctionObj,
	ContractTxFunctionObj,
	SendTransactionOpts,
	BaseContract,
	SubscriptionManager,
	PromiseWithTransactionHash,
	methodAbiToFunctionSignature,
} from "@0x/base-contract";
import { schemas } from "@0x/json-schemas";
import {
	BlockParam,
	BlockRange,
	CallData,
	ContractAbi,
	ContractArtifact,
	DecodedLogArgs,
	LogWithDecodedArgs,
	MethodAbi,
	TransactionReceiptWithDecodedLogs,
	TxData,
	SupportedProvider,
} from "ethereum-types";
import { BigNumber, classUtils, providerUtils } from "@0x/utils";
import { EventCallback, IndexedFilterValues, SimpleContractArtifact } from "@0x/types";
// @ts-ignore
import { Web3Wrapper } from "@0x/web3-wrapper";
import { assert } from "@0x/assert";
import * as ethers from "ethers";
// tslint:enable:no-unused-variable

export type AtokenEventArgs =
	| AtokenApprovalEventArgs
	| AtokenBalanceTransferEventArgs
	| AtokenBurnOnLiquidationEventArgs
	| AtokenInterestRedirectionAllowanceChangedEventArgs
	| AtokenInterestStreamRedirectedEventArgs
	| AtokenMintOnDepositEventArgs
	| AtokenRedeemEventArgs
	| AtokenRedirectedBalanceUpdatedEventArgs
	| AtokenTransferEventArgs;

export enum AtokenEvents {
	Approval = "Approval",
	BalanceTransfer = "BalanceTransfer",
	BurnOnLiquidation = "BurnOnLiquidation",
	InterestRedirectionAllowanceChanged = "InterestRedirectionAllowanceChanged",
	InterestStreamRedirected = "InterestStreamRedirected",
	MintOnDeposit = "MintOnDeposit",
	Redeem = "Redeem",
	RedirectedBalanceUpdated = "RedirectedBalanceUpdated",
	Transfer = "Transfer",
}

export interface AtokenApprovalEventArgs extends DecodedLogArgs {
	owner: string;
	spender: string;
	value: BigNumber;
}

export interface AtokenBalanceTransferEventArgs extends DecodedLogArgs {
	_from: string;
	_to: string;
	_value: BigNumber;
	_fromBalanceIncrease: BigNumber;
	_toBalanceIncrease: BigNumber;
	_fromIndex: BigNumber;
	_toIndex: BigNumber;
}

export interface AtokenBurnOnLiquidationEventArgs extends DecodedLogArgs {
	_from: string;
	_value: BigNumber;
	_fromBalanceIncrease: BigNumber;
	_fromIndex: BigNumber;
}

export interface AtokenInterestRedirectionAllowanceChangedEventArgs extends DecodedLogArgs {
	_from: string;
	_to: string;
}

export interface AtokenInterestStreamRedirectedEventArgs extends DecodedLogArgs {
	_from: string;
	_to: string;
	_redirectedBalance: BigNumber;
	_fromBalanceIncrease: BigNumber;
	_fromIndex: BigNumber;
}

export interface AtokenMintOnDepositEventArgs extends DecodedLogArgs {
	_from: string;
	_value: BigNumber;
	_fromBalanceIncrease: BigNumber;
	_fromIndex: BigNumber;
}

export interface AtokenRedeemEventArgs extends DecodedLogArgs {
	_from: string;
	_value: BigNumber;
	_fromBalanceIncrease: BigNumber;
	_fromIndex: BigNumber;
}

export interface AtokenRedirectedBalanceUpdatedEventArgs extends DecodedLogArgs {
	_targetAddress: string;
	_targetBalanceIncrease: BigNumber;
	_targetIndex: BigNumber;
	_redirectedBalanceAdded: BigNumber;
	_redirectedBalanceRemoved: BigNumber;
}

export interface AtokenTransferEventArgs extends DecodedLogArgs {
	from: string;
	to: string;
	value: BigNumber;
}

/* istanbul ignore next */
// tslint:disable:no-parameter-reassignment
// tslint:disable-next-line:class-name
export class AtokenContract extends BaseContract {
	/**
	 * @ignore
	 */
	public static deployedBytecode: string | undefined;
	public static contractName = "Atoken";
	private readonly _methodABIIndex: { [name: string]: number } = {};
	private readonly _subscriptionManager: SubscriptionManager<AtokenEventArgs, AtokenEvents>;
	public static async deployFrom0xArtifactAsync(
		artifact: ContractArtifact | SimpleContractArtifact,
		supportedProvider: SupportedProvider,
		txDefaults: Partial<TxData>,
		logDecodeDependencies: { [contractName: string]: ContractArtifact | SimpleContractArtifact },
		_addressesProvider: string,
		_underlyingAsset: string,
		_underlyingAssetDecimals: number | BigNumber,
		_name: string,
		_symbol: string
	): Promise<AtokenContract> {
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
		const logDecodeDependenciesAbiOnly: { [contractName: string]: ContractAbi } = {};
		if (Object.keys(logDecodeDependencies) !== undefined) {
			for (const key of Object.keys(logDecodeDependencies)) {
				logDecodeDependenciesAbiOnly[key] = logDecodeDependencies[key].compilerOutput.abi;
			}
		}
		return AtokenContract.deployAsync(
			bytecode,
			abi,
			provider,
			txDefaults,
			logDecodeDependenciesAbiOnly,
			_addressesProvider,
			_underlyingAsset,
			_underlyingAssetDecimals,
			_name,
			_symbol
		);
	}
	public static async deployAsync(
		bytecode: string,
		abi: ContractAbi,
		supportedProvider: SupportedProvider,
		txDefaults: Partial<TxData>,
		logDecodeDependencies: { [contractName: string]: ContractAbi },
		_addressesProvider: string,
		_underlyingAsset: string,
		_underlyingAssetDecimals: number | BigNumber,
		_name: string,
		_symbol: string
	): Promise<AtokenContract> {
		assert.isHexString("bytecode", bytecode);
		assert.doesConformToSchema("txDefaults", txDefaults, schemas.txDataSchema, [
			schemas.addressSchema,
			schemas.numberSchema,
			schemas.jsNumber,
		]);
		const provider = providerUtils.standardizeOrThrow(supportedProvider);
		const constructorAbi = BaseContract._lookupConstructorAbi(abi);
		[
			_addressesProvider,
			_underlyingAsset,
			_underlyingAssetDecimals,
			_name,
			_symbol,
		] = BaseContract._formatABIDataItemList(
			constructorAbi.inputs,
			[_addressesProvider, _underlyingAsset, _underlyingAssetDecimals, _name, _symbol],
			BaseContract._bigNumberToString
		);
		// @ts-ignore
		const iface = new ethers.utils.Interface(abi);
		// @ts-ignore
		const deployInfo = iface.deployFunction;
		const txData = deployInfo.encode(bytecode, [
			_addressesProvider,
			_underlyingAsset,
			_underlyingAssetDecimals,
			_name,
			_symbol,
		]);
		const web3Wrapper = new Web3Wrapper(provider);
		const txDataWithDefaults = await BaseContract._applyDefaultsToContractTxDataAsync(
			{
				data: txData,
				...txDefaults,
			},
			web3Wrapper.estimateGasAsync.bind(web3Wrapper)
		);
		const txHash = await web3Wrapper.sendTransactionAsync(txDataWithDefaults);
		const txReceipt = await web3Wrapper.awaitTransactionSuccessAsync(txHash);
		const contractInstance = new AtokenContract(
			txReceipt.contractAddress as string,
			provider,
			txDefaults,
			logDecodeDependencies
		);
		contractInstance.constructorArgs = [
			_addressesProvider,
			_underlyingAsset,
			_underlyingAssetDecimals,
			_name,
			_symbol,
		];
		return contractInstance;
	}

	/**
	 * @returns      The contract ABI
	 */
	public static ABI(): ContractAbi {
		const abi = [
			{
				inputs: [
					{
						name: "_addressesProvider",
						type: "address",
					},
					{
						name: "_underlyingAsset",
						type: "address",
					},
					{
						name: "_underlyingAssetDecimals",
						type: "uint8",
					},
					{
						name: "_name",
						type: "string",
					},
					{
						name: "_symbol",
						type: "string",
					},
				],
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "constructor",
			},
			{
				anonymous: false,
				inputs: [
					{
						name: "owner",
						type: "address",
						indexed: true,
					},
					{
						name: "spender",
						type: "address",
						indexed: true,
					},
					{
						name: "value",
						type: "uint256",
						indexed: false,
					},
				],
				name: "Approval",
				outputs: [],
				type: "event",
			},
			{
				anonymous: false,
				inputs: [
					{
						name: "_from",
						type: "address",
						indexed: true,
					},
					{
						name: "_to",
						type: "address",
						indexed: true,
					},
					{
						name: "_value",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_fromBalanceIncrease",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_toBalanceIncrease",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_fromIndex",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_toIndex",
						type: "uint256",
						indexed: false,
					},
				],
				name: "BalanceTransfer",
				outputs: [],
				type: "event",
			},
			{
				anonymous: false,
				inputs: [
					{
						name: "_from",
						type: "address",
						indexed: true,
					},
					{
						name: "_value",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_fromBalanceIncrease",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_fromIndex",
						type: "uint256",
						indexed: false,
					},
				],
				name: "BurnOnLiquidation",
				outputs: [],
				type: "event",
			},
			{
				anonymous: false,
				inputs: [
					{
						name: "_from",
						type: "address",
						indexed: true,
					},
					{
						name: "_to",
						type: "address",
						indexed: true,
					},
				],
				name: "InterestRedirectionAllowanceChanged",
				outputs: [],
				type: "event",
			},
			{
				anonymous: false,
				inputs: [
					{
						name: "_from",
						type: "address",
						indexed: true,
					},
					{
						name: "_to",
						type: "address",
						indexed: true,
					},
					{
						name: "_redirectedBalance",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_fromBalanceIncrease",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_fromIndex",
						type: "uint256",
						indexed: false,
					},
				],
				name: "InterestStreamRedirected",
				outputs: [],
				type: "event",
			},
			{
				anonymous: false,
				inputs: [
					{
						name: "_from",
						type: "address",
						indexed: true,
					},
					{
						name: "_value",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_fromBalanceIncrease",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_fromIndex",
						type: "uint256",
						indexed: false,
					},
				],
				name: "MintOnDeposit",
				outputs: [],
				type: "event",
			},
			{
				anonymous: false,
				inputs: [
					{
						name: "_from",
						type: "address",
						indexed: true,
					},
					{
						name: "_value",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_fromBalanceIncrease",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_fromIndex",
						type: "uint256",
						indexed: false,
					},
				],
				name: "Redeem",
				outputs: [],
				type: "event",
			},
			{
				anonymous: false,
				inputs: [
					{
						name: "_targetAddress",
						type: "address",
						indexed: true,
					},
					{
						name: "_targetBalanceIncrease",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_targetIndex",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_redirectedBalanceAdded",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_redirectedBalanceRemoved",
						type: "uint256",
						indexed: false,
					},
				],
				name: "RedirectedBalanceUpdated",
				outputs: [],
				type: "event",
			},
			{
				anonymous: false,
				inputs: [
					{
						name: "from",
						type: "address",
						indexed: true,
					},
					{
						name: "to",
						type: "address",
						indexed: true,
					},
					{
						name: "value",
						type: "uint256",
						indexed: false,
					},
				],
				name: "Transfer",
				outputs: [],
				type: "event",
			},
			{
				constant: true,
				inputs: [],
				name: "UINT_MAX_VALUE",
				outputs: [
					{
						name: "",
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
						name: "owner",
						type: "address",
					},
					{
						name: "spender",
						type: "address",
					},
				],
				name: "allowance",
				outputs: [
					{
						name: "",
						type: "uint256",
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
						name: "spender",
						type: "address",
					},
					{
						name: "value",
						type: "uint256",
					},
				],
				name: "approve",
				outputs: [
					{
						name: "",
						type: "bool",
					},
				],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: true,
				inputs: [],
				name: "decimals",
				outputs: [
					{
						name: "",
						type: "uint8",
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
						name: "spender",
						type: "address",
					},
					{
						name: "subtractedValue",
						type: "uint256",
					},
				],
				name: "decreaseAllowance",
				outputs: [
					{
						name: "",
						type: "bool",
					},
				],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "spender",
						type: "address",
					},
					{
						name: "addedValue",
						type: "uint256",
					},
				],
				name: "increaseAllowance",
				outputs: [
					{
						name: "",
						type: "bool",
					},
				],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: true,
				inputs: [],
				name: "name",
				outputs: [
					{
						name: "",
						type: "string",
					},
				],
				payable: false,
				stateMutability: "view",
				type: "function",
			},
			{
				constant: true,
				inputs: [],
				name: "symbol",
				outputs: [
					{
						name: "",
						type: "string",
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
						name: "recipient",
						type: "address",
					},
					{
						name: "amount",
						type: "uint256",
					},
				],
				name: "transfer",
				outputs: [
					{
						name: "",
						type: "bool",
					},
				],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "sender",
						type: "address",
					},
					{
						name: "recipient",
						type: "address",
					},
					{
						name: "amount",
						type: "uint256",
					},
				],
				name: "transferFrom",
				outputs: [
					{
						name: "",
						type: "bool",
					},
				],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: true,
				inputs: [],
				name: "underlyingAssetAddress",
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
						name: "_to",
						type: "address",
					},
				],
				name: "redirectInterestStream",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_from",
						type: "address",
					},
					{
						name: "_to",
						type: "address",
					},
				],
				name: "redirectInterestStreamOf",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_to",
						type: "address",
					},
				],
				name: "allowInterestRedirectionTo",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_amount",
						type: "uint256",
					},
				],
				name: "redeem",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_account",
						type: "address",
					},
					{
						name: "_amount",
						type: "uint256",
					},
				],
				name: "mintOnDeposit",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_account",
						type: "address",
					},
					{
						name: "_value",
						type: "uint256",
					},
				],
				name: "burnOnLiquidation",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_from",
						type: "address",
					},
					{
						name: "_to",
						type: "address",
					},
					{
						name: "_value",
						type: "uint256",
					},
				],
				name: "transferOnLiquidation",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: true,
				inputs: [
					{
						name: "_user",
						type: "address",
					},
				],
				name: "balanceOf",
				outputs: [
					{
						name: "",
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
						name: "_user",
						type: "address",
					},
				],
				name: "principalBalanceOf",
				outputs: [
					{
						name: "",
						type: "uint256",
					},
				],
				payable: false,
				stateMutability: "view",
				type: "function",
			},
			{
				constant: true,
				inputs: [],
				name: "totalSupply",
				outputs: [
					{
						name: "",
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
						name: "_user",
						type: "address",
					},
					{
						name: "_amount",
						type: "uint256",
					},
				],
				name: "isTransferAllowed",
				outputs: [
					{
						name: "",
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
						name: "_user",
						type: "address",
					},
				],
				name: "getUserIndex",
				outputs: [
					{
						name: "",
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
						name: "_user",
						type: "address",
					},
				],
				name: "getInterestRedirectionAddress",
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
						name: "_user",
						type: "address",
					},
				],
				name: "getRedirectedBalance",
				outputs: [
					{
						name: "",
						type: "uint256",
					},
				],
				payable: false,
				stateMutability: "view",
				type: "function",
			},
		] as ContractAbi;
		return abi;
	}

	public getFunctionSignature(methodName: string): string {
		const index = this._methodABIIndex[methodName];
		const methodAbi = AtokenContract.ABI()[index] as MethodAbi; // tslint:disable-line:no-unnecessary-type-assertion
		const functionSignature = methodAbiToFunctionSignature(methodAbi);
		return functionSignature;
	}
	public getABIDecodedTransactionData<T>(methodName: string, callData: string): T {
		const functionSignature = this.getFunctionSignature(methodName);
		const self = (this as any) as AtokenContract;
		const abiEncoder = self._lookupAbiEncoder(functionSignature);
		const abiDecodedCallData = abiEncoder.strictDecode<T>(callData);
		return abiDecodedCallData;
	}
	public getABIDecodedReturnData<T>(methodName: string, callData: string): T {
		const functionSignature = this.getFunctionSignature(methodName);
		const self = (this as any) as AtokenContract;
		const abiEncoder = self._lookupAbiEncoder(functionSignature);
		const abiDecodedCallData = abiEncoder.strictDecodeReturnValue<T>(callData);
		return abiDecodedCallData;
	}
	public getSelector(methodName: string): string {
		const functionSignature = this.getFunctionSignature(methodName);
		const self = (this as any) as AtokenContract;
		const abiEncoder = self._lookupAbiEncoder(functionSignature);
		return abiEncoder.getSelector();
	}

	public UINT_MAX_VALUE(): ContractFunctionObj<BigNumber> {
		const self = (this as any) as AtokenContract;
		const functionSignature = "UINT_MAX_VALUE()";

		return {
			async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<BigNumber> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<BigNumber>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, []);
			},
		};
	}
	public allowance(owner: string, spender: string): ContractFunctionObj<BigNumber> {
		const self = (this as any) as AtokenContract;
		assert.isString("owner", owner);
		assert.isString("spender", spender);
		const functionSignature = "allowance(address,address)";

		return {
			async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<BigNumber> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<BigNumber>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, [owner.toLowerCase(), spender.toLowerCase()]);
			},
		};
	}
	public approve(spender: string, value: BigNumber): ContractTxFunctionObj<boolean> {
		const self = (this as any) as AtokenContract;
		assert.isString("spender", spender);
		assert.isBigNumber("value", value);
		const functionSignature = "approve(address,uint256)";

		return {
			async sendTransactionAsync(
				txData?: Partial<TxData> | undefined,
				opts: SendTransactionOpts = { shouldValidate: true }
			): Promise<string> {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
					{ ...txData, data: this.getABIEncodedTransactionData() },
					this.estimateGasAsync.bind(this)
				);
				if (opts.shouldValidate !== false) {
					await this.callAsync(txDataWithDefaults);
				}
				return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
			},
			awaitTransactionSuccessAsync(
				txData?: Partial<TxData>,
				opts: AwaitTransactionSuccessOpts = { shouldValidate: true }
			): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
				return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
			},
			async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
					...txData,
					data: this.getABIEncodedTransactionData(),
				});
				return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
			},
			async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<boolean> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<boolean>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, [spender.toLowerCase(), value]);
			},
		};
	}
	public decimals(): ContractFunctionObj<BigNumber> {
		const self = (this as any) as AtokenContract;
		const functionSignature = "decimals()";

		return {
			async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<BigNumber> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<BigNumber>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, []);
			},
		};
	}
	public decreaseAllowance(spender: string, subtractedValue: BigNumber): ContractTxFunctionObj<boolean> {
		const self = (this as any) as AtokenContract;
		assert.isString("spender", spender);
		assert.isBigNumber("subtractedValue", subtractedValue);
		const functionSignature = "decreaseAllowance(address,uint256)";

		return {
			async sendTransactionAsync(
				txData?: Partial<TxData> | undefined,
				opts: SendTransactionOpts = { shouldValidate: true }
			): Promise<string> {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
					{ ...txData, data: this.getABIEncodedTransactionData() },
					this.estimateGasAsync.bind(this)
				);
				if (opts.shouldValidate !== false) {
					await this.callAsync(txDataWithDefaults);
				}
				return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
			},
			awaitTransactionSuccessAsync(
				txData?: Partial<TxData>,
				opts: AwaitTransactionSuccessOpts = { shouldValidate: true }
			): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
				return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
			},
			async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
					...txData,
					data: this.getABIEncodedTransactionData(),
				});
				return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
			},
			async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<boolean> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<boolean>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, [spender.toLowerCase(), subtractedValue]);
			},
		};
	}
	public increaseAllowance(spender: string, addedValue: BigNumber): ContractTxFunctionObj<boolean> {
		const self = (this as any) as AtokenContract;
		assert.isString("spender", spender);
		assert.isBigNumber("addedValue", addedValue);
		const functionSignature = "increaseAllowance(address,uint256)";

		return {
			async sendTransactionAsync(
				txData?: Partial<TxData> | undefined,
				opts: SendTransactionOpts = { shouldValidate: true }
			): Promise<string> {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
					{ ...txData, data: this.getABIEncodedTransactionData() },
					this.estimateGasAsync.bind(this)
				);
				if (opts.shouldValidate !== false) {
					await this.callAsync(txDataWithDefaults);
				}
				return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
			},
			awaitTransactionSuccessAsync(
				txData?: Partial<TxData>,
				opts: AwaitTransactionSuccessOpts = { shouldValidate: true }
			): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
				return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
			},
			async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
					...txData,
					data: this.getABIEncodedTransactionData(),
				});
				return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
			},
			async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<boolean> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<boolean>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, [spender.toLowerCase(), addedValue]);
			},
		};
	}
	public name(): ContractFunctionObj<string> {
		const self = (this as any) as AtokenContract;
		const functionSignature = "name()";

		return {
			async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<string> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<string>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, []);
			},
		};
	}
	public symbol(): ContractFunctionObj<string> {
		const self = (this as any) as AtokenContract;
		const functionSignature = "symbol()";

		return {
			async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<string> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<string>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, []);
			},
		};
	}
	public transfer(recipient: string, amount: BigNumber): ContractTxFunctionObj<boolean> {
		const self = (this as any) as AtokenContract;
		assert.isString("recipient", recipient);
		assert.isBigNumber("amount", amount);
		const functionSignature = "transfer(address,uint256)";

		return {
			async sendTransactionAsync(
				txData?: Partial<TxData> | undefined,
				opts: SendTransactionOpts = { shouldValidate: true }
			): Promise<string> {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
					{ ...txData, data: this.getABIEncodedTransactionData() },
					this.estimateGasAsync.bind(this)
				);
				if (opts.shouldValidate !== false) {
					await this.callAsync(txDataWithDefaults);
				}
				return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
			},
			awaitTransactionSuccessAsync(
				txData?: Partial<TxData>,
				opts: AwaitTransactionSuccessOpts = { shouldValidate: true }
			): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
				return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
			},
			async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
					...txData,
					data: this.getABIEncodedTransactionData(),
				});
				return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
			},
			async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<boolean> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<boolean>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, [recipient.toLowerCase(), amount]);
			},
		};
	}
	public transferFrom(sender: string, recipient: string, amount: BigNumber): ContractTxFunctionObj<boolean> {
		const self = (this as any) as AtokenContract;
		assert.isString("sender", sender);
		assert.isString("recipient", recipient);
		assert.isBigNumber("amount", amount);
		const functionSignature = "transferFrom(address,address,uint256)";

		return {
			async sendTransactionAsync(
				txData?: Partial<TxData> | undefined,
				opts: SendTransactionOpts = { shouldValidate: true }
			): Promise<string> {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
					{ ...txData, data: this.getABIEncodedTransactionData() },
					this.estimateGasAsync.bind(this)
				);
				if (opts.shouldValidate !== false) {
					await this.callAsync(txDataWithDefaults);
				}
				return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
			},
			awaitTransactionSuccessAsync(
				txData?: Partial<TxData>,
				opts: AwaitTransactionSuccessOpts = { shouldValidate: true }
			): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
				return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
			},
			async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
					...txData,
					data: this.getABIEncodedTransactionData(),
				});
				return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
			},
			async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<boolean> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<boolean>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, [
					sender.toLowerCase(),
					recipient.toLowerCase(),
					amount,
				]);
			},
		};
	}
	public underlyingAssetAddress(): ContractFunctionObj<string> {
		const self = (this as any) as AtokenContract;
		const functionSignature = "underlyingAssetAddress()";

		return {
			async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<string> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<string>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, []);
			},
		};
	}
	public redirectInterestStream(_to: string): ContractTxFunctionObj<void> {
		const self = (this as any) as AtokenContract;
		assert.isString("_to", _to);
		const functionSignature = "redirectInterestStream(address)";

		return {
			async sendTransactionAsync(
				txData?: Partial<TxData> | undefined,
				opts: SendTransactionOpts = { shouldValidate: true }
			): Promise<string> {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
					{ ...txData, data: this.getABIEncodedTransactionData() },
					this.estimateGasAsync.bind(this)
				);
				if (opts.shouldValidate !== false) {
					await this.callAsync(txDataWithDefaults);
				}
				return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
			},
			awaitTransactionSuccessAsync(
				txData?: Partial<TxData>,
				opts: AwaitTransactionSuccessOpts = { shouldValidate: true }
			): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
				return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
			},
			async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
					...txData,
					data: this.getABIEncodedTransactionData(),
				});
				return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
			},
			async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<void> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<void>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, [_to.toLowerCase()]);
			},
		};
	}
	public redirectInterestStreamOf(_from: string, _to: string): ContractTxFunctionObj<void> {
		const self = (this as any) as AtokenContract;
		assert.isString("_from", _from);
		assert.isString("_to", _to);
		const functionSignature = "redirectInterestStreamOf(address,address)";

		return {
			async sendTransactionAsync(
				txData?: Partial<TxData> | undefined,
				opts: SendTransactionOpts = { shouldValidate: true }
			): Promise<string> {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
					{ ...txData, data: this.getABIEncodedTransactionData() },
					this.estimateGasAsync.bind(this)
				);
				if (opts.shouldValidate !== false) {
					await this.callAsync(txDataWithDefaults);
				}
				return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
			},
			awaitTransactionSuccessAsync(
				txData?: Partial<TxData>,
				opts: AwaitTransactionSuccessOpts = { shouldValidate: true }
			): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
				return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
			},
			async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
					...txData,
					data: this.getABIEncodedTransactionData(),
				});
				return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
			},
			async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<void> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<void>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, [_from.toLowerCase(), _to.toLowerCase()]);
			},
		};
	}
	public allowInterestRedirectionTo(_to: string): ContractTxFunctionObj<void> {
		const self = (this as any) as AtokenContract;
		assert.isString("_to", _to);
		const functionSignature = "allowInterestRedirectionTo(address)";

		return {
			async sendTransactionAsync(
				txData?: Partial<TxData> | undefined,
				opts: SendTransactionOpts = { shouldValidate: true }
			): Promise<string> {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
					{ ...txData, data: this.getABIEncodedTransactionData() },
					this.estimateGasAsync.bind(this)
				);
				if (opts.shouldValidate !== false) {
					await this.callAsync(txDataWithDefaults);
				}
				return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
			},
			awaitTransactionSuccessAsync(
				txData?: Partial<TxData>,
				opts: AwaitTransactionSuccessOpts = { shouldValidate: true }
			): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
				return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
			},
			async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
					...txData,
					data: this.getABIEncodedTransactionData(),
				});
				return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
			},
			async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<void> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<void>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, [_to.toLowerCase()]);
			},
		};
	}
	public redeem(_amount: BigNumber): ContractTxFunctionObj<void> {
		const self = (this as any) as AtokenContract;
		assert.isBigNumber("_amount", _amount);
		const functionSignature = "redeem(uint256)";

		return {
			async sendTransactionAsync(
				txData?: Partial<TxData> | undefined,
				opts: SendTransactionOpts = { shouldValidate: true }
			): Promise<string> {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
					{ ...txData, data: this.getABIEncodedTransactionData() },
					this.estimateGasAsync.bind(this)
				);
				if (opts.shouldValidate !== false) {
					await this.callAsync(txDataWithDefaults);
				}
				return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
			},
			awaitTransactionSuccessAsync(
				txData?: Partial<TxData>,
				opts: AwaitTransactionSuccessOpts = { shouldValidate: true }
			): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
				return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
			},
			async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
					...txData,
					data: this.getABIEncodedTransactionData(),
				});
				return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
			},
			async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<void> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<void>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, [_amount]);
			},
		};
	}
	public mintOnDeposit(_account: string, _amount: BigNumber): ContractTxFunctionObj<void> {
		const self = (this as any) as AtokenContract;
		assert.isString("_account", _account);
		assert.isBigNumber("_amount", _amount);
		const functionSignature = "mintOnDeposit(address,uint256)";

		return {
			async sendTransactionAsync(
				txData?: Partial<TxData> | undefined,
				opts: SendTransactionOpts = { shouldValidate: true }
			): Promise<string> {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
					{ ...txData, data: this.getABIEncodedTransactionData() },
					this.estimateGasAsync.bind(this)
				);
				if (opts.shouldValidate !== false) {
					await this.callAsync(txDataWithDefaults);
				}
				return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
			},
			awaitTransactionSuccessAsync(
				txData?: Partial<TxData>,
				opts: AwaitTransactionSuccessOpts = { shouldValidate: true }
			): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
				return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
			},
			async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
					...txData,
					data: this.getABIEncodedTransactionData(),
				});
				return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
			},
			async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<void> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<void>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, [_account.toLowerCase(), _amount]);
			},
		};
	}
	public burnOnLiquidation(_account: string, _value: BigNumber): ContractTxFunctionObj<void> {
		const self = (this as any) as AtokenContract;
		assert.isString("_account", _account);
		assert.isBigNumber("_value", _value);
		const functionSignature = "burnOnLiquidation(address,uint256)";

		return {
			async sendTransactionAsync(
				txData?: Partial<TxData> | undefined,
				opts: SendTransactionOpts = { shouldValidate: true }
			): Promise<string> {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
					{ ...txData, data: this.getABIEncodedTransactionData() },
					this.estimateGasAsync.bind(this)
				);
				if (opts.shouldValidate !== false) {
					await this.callAsync(txDataWithDefaults);
				}
				return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
			},
			awaitTransactionSuccessAsync(
				txData?: Partial<TxData>,
				opts: AwaitTransactionSuccessOpts = { shouldValidate: true }
			): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
				return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
			},
			async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
					...txData,
					data: this.getABIEncodedTransactionData(),
				});
				return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
			},
			async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<void> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<void>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, [_account.toLowerCase(), _value]);
			},
		};
	}
	public transferOnLiquidation(_from: string, _to: string, _value: BigNumber): ContractTxFunctionObj<void> {
		const self = (this as any) as AtokenContract;
		assert.isString("_from", _from);
		assert.isString("_to", _to);
		assert.isBigNumber("_value", _value);
		const functionSignature = "transferOnLiquidation(address,address,uint256)";

		return {
			async sendTransactionAsync(
				txData?: Partial<TxData> | undefined,
				opts: SendTransactionOpts = { shouldValidate: true }
			): Promise<string> {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync(
					{ ...txData, data: this.getABIEncodedTransactionData() },
					this.estimateGasAsync.bind(this)
				);
				if (opts.shouldValidate !== false) {
					await this.callAsync(txDataWithDefaults);
				}
				return self._web3Wrapper.sendTransactionAsync(txDataWithDefaults);
			},
			awaitTransactionSuccessAsync(
				txData?: Partial<TxData>,
				opts: AwaitTransactionSuccessOpts = { shouldValidate: true }
			): PromiseWithTransactionHash<TransactionReceiptWithDecodedLogs> {
				return self._promiseWithTransactionHash(this.sendTransactionAsync(txData, opts), opts);
			},
			async estimateGasAsync(txData?: Partial<TxData> | undefined): Promise<number> {
				const txDataWithDefaults = await self._applyDefaultsToTxDataAsync({
					...txData,
					data: this.getABIEncodedTransactionData(),
				});
				return self._web3Wrapper.estimateGasAsync(txDataWithDefaults);
			},
			async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<void> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<void>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, [_from.toLowerCase(), _to.toLowerCase(), _value]);
			},
		};
	}
	public balanceOf(_user: string): ContractFunctionObj<BigNumber> {
		const self = (this as any) as AtokenContract;
		assert.isString("_user", _user);
		const functionSignature = "balanceOf(address)";

		return {
			async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<BigNumber> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<BigNumber>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, [_user.toLowerCase()]);
			},
		};
	}
	public principalBalanceOf(_user: string): ContractFunctionObj<BigNumber> {
		const self = (this as any) as AtokenContract;
		assert.isString("_user", _user);
		const functionSignature = "principalBalanceOf(address)";

		return {
			async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<BigNumber> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<BigNumber>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, [_user.toLowerCase()]);
			},
		};
	}
	public totalSupply(): ContractFunctionObj<BigNumber> {
		const self = (this as any) as AtokenContract;
		const functionSignature = "totalSupply()";

		return {
			async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<BigNumber> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<BigNumber>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, []);
			},
		};
	}
	public isTransferAllowed(_user: string, _amount: BigNumber): ContractFunctionObj<boolean> {
		const self = (this as any) as AtokenContract;
		assert.isString("_user", _user);
		assert.isBigNumber("_amount", _amount);
		const functionSignature = "isTransferAllowed(address,uint256)";

		return {
			async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<boolean> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<boolean>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, [_user.toLowerCase(), _amount]);
			},
		};
	}
	public getUserIndex(_user: string): ContractFunctionObj<BigNumber> {
		const self = (this as any) as AtokenContract;
		assert.isString("_user", _user);
		const functionSignature = "getUserIndex(address)";

		return {
			async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<BigNumber> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<BigNumber>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, [_user.toLowerCase()]);
			},
		};
	}
	public getInterestRedirectionAddress(_user: string): ContractFunctionObj<string> {
		const self = (this as any) as AtokenContract;
		assert.isString("_user", _user);
		const functionSignature = "getInterestRedirectionAddress(address)";

		return {
			async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<string> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<string>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, [_user.toLowerCase()]);
			},
		};
	}
	public getRedirectedBalance(_user: string): ContractFunctionObj<BigNumber> {
		const self = (this as any) as AtokenContract;
		assert.isString("_user", _user);
		const functionSignature = "getRedirectedBalance(address)";

		return {
			async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<BigNumber> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<BigNumber>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, [_user.toLowerCase()]);
			},
		};
	}

	/**
	 * Subscribe to an event type emitted by the Atoken contract.
	 * @param eventName The Atoken contract event you would like to subscribe to.
	 * @param indexFilterValues An object where the keys are indexed args returned by the event and
	 * the value is the value you are interested in. E.g `{maker: aUserAddressHex}`
	 * @param callback Callback that gets called when a log is added/removed
	 * @param isVerbose Enable verbose subscription warnings (e.g recoverable network issues encountered)
	 * @return Subscription token used later to unsubscribe
	 */
	public subscribe<ArgsType extends AtokenEventArgs>(
		eventName: AtokenEvents,
		indexFilterValues: IndexedFilterValues,
		callback: EventCallback<ArgsType>,
		isVerbose: boolean = false,
		blockPollingIntervalMs?: number
	): string {
		assert.doesBelongToStringEnum("eventName", eventName, AtokenEvents);
		assert.doesConformToSchema("indexFilterValues", indexFilterValues, schemas.indexFilterValuesSchema);
		assert.isFunction("callback", callback);
		const subscriptionToken = this._subscriptionManager.subscribe<ArgsType>(
			this.address,
			eventName,
			indexFilterValues,
			AtokenContract.ABI(),
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
	public unsubscribe(subscriptionToken: string): void {
		this._subscriptionManager.unsubscribe(subscriptionToken);
	}
	/**
	 * Cancels all existing subscriptions
	 */
	public unsubscribeAll(): void {
		this._subscriptionManager.unsubscribeAll();
	}
	/**
	 * Gets historical logs without creating a subscription
	 * @param eventName The Atoken contract event you would like to subscribe to.
	 * @param blockRange Block range to get logs from.
	 * @param indexFilterValues An object where the keys are indexed args returned by the event and
	 * the value is the value you are interested in. E.g `{_from: aUserAddressHex}`
	 * @return Array of logs that match the parameters
	 */
	public async getLogsAsync<ArgsType extends AtokenEventArgs>(
		eventName: AtokenEvents,
		blockRange: BlockRange,
		indexFilterValues: IndexedFilterValues
	): Promise<Array<LogWithDecodedArgs<ArgsType>>> {
		assert.doesBelongToStringEnum("eventName", eventName, AtokenEvents);
		assert.doesConformToSchema("blockRange", blockRange, schemas.blockRangeSchema);
		assert.doesConformToSchema("indexFilterValues", indexFilterValues, schemas.indexFilterValuesSchema);
		const logs = await this._subscriptionManager.getLogsAsync<ArgsType>(
			this.address,
			eventName,
			blockRange,
			indexFilterValues,
			AtokenContract.ABI()
		);
		return logs;
	}
	constructor(
		address: string,
		supportedProvider: SupportedProvider,
		txDefaults?: Partial<TxData>,
		logDecodeDependencies?: { [contractName: string]: ContractAbi },
		deployedBytecode: string | undefined = AtokenContract.deployedBytecode
	) {
		super(
			"Atoken",
			AtokenContract.ABI(),
			address,
			supportedProvider,
			txDefaults,
			logDecodeDependencies,
			deployedBytecode
		);
		classUtils.bindAll(this, ["_abiEncoderByFunctionSignature", "address", "_web3Wrapper"]);
		this._subscriptionManager = new SubscriptionManager<AtokenEventArgs, AtokenEvents>(
			AtokenContract.ABI(),
			this._web3Wrapper
		);
		AtokenContract.ABI().forEach((item, index) => {
			if (item.type === "function") {
				const methodAbi = item as MethodAbi;
				this._methodABIIndex[methodAbi.name] = index;
			}
		});
	}
}

// tslint:disable:max-file-line-count
// tslint:enable:no-unbound-method no-parameter-reassignment no-consecutive-blank-lines ordered-imports align
// tslint:enable:trailing-comma whitespace no-trailing-whitespace
