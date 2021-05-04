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
import { classUtils, logUtils, providerUtils } from "@0x/utils";
import { EventCallback, IndexedFilterValues, SimpleContractArtifact } from "@0x/types";
// @ts-ignore
import { Web3Wrapper } from "@0x/web3-wrapper";
import { assert } from "@0x/assert";
import * as ethers from "ethers";
// tslint:enable:no-unused-variable

export type LendingPoolAddressesProviderEventArgs =
	| LendingPoolAddressesProviderEthereumAddressUpdatedEventArgs
	| LendingPoolAddressesProviderFeeProviderUpdatedEventArgs
	| LendingPoolAddressesProviderLendingPoolConfiguratorUpdatedEventArgs
	| LendingPoolAddressesProviderLendingPoolCoreUpdatedEventArgs
	| LendingPoolAddressesProviderLendingPoolDataProviderUpdatedEventArgs
	| LendingPoolAddressesProviderLendingPoolLiquidationManagerUpdatedEventArgs
	| LendingPoolAddressesProviderLendingPoolManagerUpdatedEventArgs
	| LendingPoolAddressesProviderLendingPoolParametersProviderUpdatedEventArgs
	| LendingPoolAddressesProviderLendingPoolUpdatedEventArgs
	| LendingPoolAddressesProviderLendingRateOracleUpdatedEventArgs
	| LendingPoolAddressesProviderOwnershipTransferredEventArgs
	| LendingPoolAddressesProviderPriceOracleUpdatedEventArgs
	| LendingPoolAddressesProviderProxyCreatedEventArgs
	| LendingPoolAddressesProviderTokenDistributorUpdatedEventArgs;

export enum LendingPoolAddressesProviderEvents {
	EthereumAddressUpdated = "EthereumAddressUpdated",
	FeeProviderUpdated = "FeeProviderUpdated",
	LendingPoolConfiguratorUpdated = "LendingPoolConfiguratorUpdated",
	LendingPoolCoreUpdated = "LendingPoolCoreUpdated",
	LendingPoolDataProviderUpdated = "LendingPoolDataProviderUpdated",
	LendingPoolLiquidationManagerUpdated = "LendingPoolLiquidationManagerUpdated",
	LendingPoolManagerUpdated = "LendingPoolManagerUpdated",
	LendingPoolParametersProviderUpdated = "LendingPoolParametersProviderUpdated",
	LendingPoolUpdated = "LendingPoolUpdated",
	LendingRateOracleUpdated = "LendingRateOracleUpdated",
	OwnershipTransferred = "OwnershipTransferred",
	PriceOracleUpdated = "PriceOracleUpdated",
	ProxyCreated = "ProxyCreated",
	TokenDistributorUpdated = "TokenDistributorUpdated",
}

export interface LendingPoolAddressesProviderEthereumAddressUpdatedEventArgs extends DecodedLogArgs {
	newAddress: string;
}

export interface LendingPoolAddressesProviderFeeProviderUpdatedEventArgs extends DecodedLogArgs {
	newAddress: string;
}

export interface LendingPoolAddressesProviderLendingPoolConfiguratorUpdatedEventArgs extends DecodedLogArgs {
	newAddress: string;
}

export interface LendingPoolAddressesProviderLendingPoolCoreUpdatedEventArgs extends DecodedLogArgs {
	newAddress: string;
}

export interface LendingPoolAddressesProviderLendingPoolDataProviderUpdatedEventArgs extends DecodedLogArgs {
	newAddress: string;
}

export interface LendingPoolAddressesProviderLendingPoolLiquidationManagerUpdatedEventArgs extends DecodedLogArgs {
	newAddress: string;
}

export interface LendingPoolAddressesProviderLendingPoolManagerUpdatedEventArgs extends DecodedLogArgs {
	newAddress: string;
}

export interface LendingPoolAddressesProviderLendingPoolParametersProviderUpdatedEventArgs extends DecodedLogArgs {
	newAddress: string;
}

export interface LendingPoolAddressesProviderLendingPoolUpdatedEventArgs extends DecodedLogArgs {
	newAddress: string;
}

export interface LendingPoolAddressesProviderLendingRateOracleUpdatedEventArgs extends DecodedLogArgs {
	newAddress: string;
}

export interface LendingPoolAddressesProviderOwnershipTransferredEventArgs extends DecodedLogArgs {
	previousOwner: string;
	newOwner: string;
}

export interface LendingPoolAddressesProviderPriceOracleUpdatedEventArgs extends DecodedLogArgs {
	newAddress: string;
}

export interface LendingPoolAddressesProviderProxyCreatedEventArgs extends DecodedLogArgs {
	id: string;
	newAddress: string;
}

export interface LendingPoolAddressesProviderTokenDistributorUpdatedEventArgs extends DecodedLogArgs {
	newAddress: string;
}

/* istanbul ignore next */
// tslint:disable:no-parameter-reassignment
// tslint:disable-next-line:class-name
export class LendingPoolAddressesProviderContract extends BaseContract {
	/**
	 * @ignore
	 */
	public static deployedBytecode: string | undefined;
	public static contractName = "LendingPoolAddressesProvider";
	private readonly _methodABIIndex: { [name: string]: number } = {};
	private readonly _subscriptionManager: SubscriptionManager<
		LendingPoolAddressesProviderEventArgs,
		LendingPoolAddressesProviderEvents
	>;
	public static async deployFrom0xArtifactAsync(
		artifact: ContractArtifact | SimpleContractArtifact,
		supportedProvider: SupportedProvider,
		txDefaults: Partial<TxData>,
		logDecodeDependencies: { [contractName: string]: ContractArtifact | SimpleContractArtifact }
	): Promise<LendingPoolAddressesProviderContract> {
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
		return LendingPoolAddressesProviderContract.deployAsync(
			bytecode,
			abi,
			provider,
			txDefaults,
			logDecodeDependenciesAbiOnly
		);
	}
	public static async deployAsync(
		bytecode: string,
		abi: ContractAbi,
		supportedProvider: SupportedProvider,
		txDefaults: Partial<TxData>,
		logDecodeDependencies: { [contractName: string]: ContractAbi }
	): Promise<LendingPoolAddressesProviderContract> {
		assert.isHexString("bytecode", bytecode);
		assert.doesConformToSchema("txDefaults", txDefaults, schemas.txDataSchema, [
			schemas.addressSchema,
			schemas.numberSchema,
			schemas.jsNumber,
		]);
		const provider = providerUtils.standardizeOrThrow(supportedProvider);
		const constructorAbi = BaseContract._lookupConstructorAbi(abi);
		[] = BaseContract._formatABIDataItemList(constructorAbi.inputs, [], BaseContract._bigNumberToString);
		// @ts-ignore
		const iface = new ethers.utils.Interface(abi);
		// @ts-ignore
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
		logUtils.log(`LendingPoolAddressesProvider successfully deployed at ${txReceipt.contractAddress}`);
		const contractInstance = new LendingPoolAddressesProviderContract(
			txReceipt.contractAddress as string,
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
	public static ABI(): ContractAbi {
		const abi = [
			{
				anonymous: false,
				inputs: [
					{
						name: "newAddress",
						type: "address",
						indexed: true,
					},
				],
				name: "EthereumAddressUpdated",
				outputs: [],
				type: "event",
			},
			{
				anonymous: false,
				inputs: [
					{
						name: "newAddress",
						type: "address",
						indexed: true,
					},
				],
				name: "FeeProviderUpdated",
				outputs: [],
				type: "event",
			},
			{
				anonymous: false,
				inputs: [
					{
						name: "newAddress",
						type: "address",
						indexed: true,
					},
				],
				name: "LendingPoolConfiguratorUpdated",
				outputs: [],
				type: "event",
			},
			{
				anonymous: false,
				inputs: [
					{
						name: "newAddress",
						type: "address",
						indexed: true,
					},
				],
				name: "LendingPoolCoreUpdated",
				outputs: [],
				type: "event",
			},
			{
				anonymous: false,
				inputs: [
					{
						name: "newAddress",
						type: "address",
						indexed: true,
					},
				],
				name: "LendingPoolDataProviderUpdated",
				outputs: [],
				type: "event",
			},
			{
				anonymous: false,
				inputs: [
					{
						name: "newAddress",
						type: "address",
						indexed: true,
					},
				],
				name: "LendingPoolLiquidationManagerUpdated",
				outputs: [],
				type: "event",
			},
			{
				anonymous: false,
				inputs: [
					{
						name: "newAddress",
						type: "address",
						indexed: true,
					},
				],
				name: "LendingPoolManagerUpdated",
				outputs: [],
				type: "event",
			},
			{
				anonymous: false,
				inputs: [
					{
						name: "newAddress",
						type: "address",
						indexed: true,
					},
				],
				name: "LendingPoolParametersProviderUpdated",
				outputs: [],
				type: "event",
			},
			{
				anonymous: false,
				inputs: [
					{
						name: "newAddress",
						type: "address",
						indexed: true,
					},
				],
				name: "LendingPoolUpdated",
				outputs: [],
				type: "event",
			},
			{
				anonymous: false,
				inputs: [
					{
						name: "newAddress",
						type: "address",
						indexed: true,
					},
				],
				name: "LendingRateOracleUpdated",
				outputs: [],
				type: "event",
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
				anonymous: false,
				inputs: [
					{
						name: "newAddress",
						type: "address",
						indexed: true,
					},
				],
				name: "PriceOracleUpdated",
				outputs: [],
				type: "event",
			},
			{
				anonymous: false,
				inputs: [
					{
						name: "id",
						type: "bytes32",
						indexed: false,
					},
					{
						name: "newAddress",
						type: "address",
						indexed: true,
					},
				],
				name: "ProxyCreated",
				outputs: [],
				type: "event",
			},
			{
				anonymous: false,
				inputs: [
					{
						name: "newAddress",
						type: "address",
						indexed: true,
					},
				],
				name: "TokenDistributorUpdated",
				outputs: [],
				type: "event",
			},
			{
				constant: true,
				inputs: [
					{
						name: "_key",
						type: "bytes32",
					},
				],
				name: "getAddress",
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
				inputs: [],
				name: "isOwner",
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
				constant: false,
				inputs: [],
				name: "renounceOwnership",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "newOwner",
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
				constant: true,
				inputs: [],
				name: "getLendingPool",
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
						name: "_pool",
						type: "address",
					},
				],
				name: "setLendingPoolImpl",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: true,
				inputs: [],
				name: "getLendingPoolCore",
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
						name: "_lendingPoolCore",
						type: "address",
					},
				],
				name: "setLendingPoolCoreImpl",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: true,
				inputs: [],
				name: "getLendingPoolConfigurator",
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
						name: "_configurator",
						type: "address",
					},
				],
				name: "setLendingPoolConfiguratorImpl",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: true,
				inputs: [],
				name: "getLendingPoolDataProvider",
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
						name: "_provider",
						type: "address",
					},
				],
				name: "setLendingPoolDataProviderImpl",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: true,
				inputs: [],
				name: "getLendingPoolParametersProvider",
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
						name: "_parametersProvider",
						type: "address",
					},
				],
				name: "setLendingPoolParametersProviderImpl",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: true,
				inputs: [],
				name: "getFeeProvider",
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
						name: "_feeProvider",
						type: "address",
					},
				],
				name: "setFeeProviderImpl",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: true,
				inputs: [],
				name: "getLendingPoolLiquidationManager",
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
						name: "_manager",
						type: "address",
					},
				],
				name: "setLendingPoolLiquidationManager",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: true,
				inputs: [],
				name: "getLendingPoolManager",
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
						name: "_lendingPoolManager",
						type: "address",
					},
				],
				name: "setLendingPoolManager",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: true,
				inputs: [],
				name: "getPriceOracle",
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
						name: "_priceOracle",
						type: "address",
					},
				],
				name: "setPriceOracle",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: true,
				inputs: [],
				name: "getLendingRateOracle",
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
						name: "_lendingRateOracle",
						type: "address",
					},
				],
				name: "setLendingRateOracle",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: true,
				inputs: [],
				name: "getTokenDistributor",
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
						name: "_tokenDistributor",
						type: "address",
					},
				],
				name: "setTokenDistributor",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
		] as ContractAbi;
		return abi;
	}

	public getFunctionSignature(methodName: string): string {
		const index = this._methodABIIndex[methodName];
		const methodAbi = LendingPoolAddressesProviderContract.ABI()[index] as MethodAbi; // tslint:disable-line:no-unnecessary-type-assertion
		const functionSignature = methodAbiToFunctionSignature(methodAbi);
		return functionSignature;
	}
	public getABIDecodedTransactionData<T>(methodName: string, callData: string): T {
		const functionSignature = this.getFunctionSignature(methodName);
		const self = (this as any) as LendingPoolAddressesProviderContract;
		const abiEncoder = self._lookupAbiEncoder(functionSignature);
		const abiDecodedCallData = abiEncoder.strictDecode<T>(callData);
		return abiDecodedCallData;
	}
	public getABIDecodedReturnData<T>(methodName: string, callData: string): T {
		const functionSignature = this.getFunctionSignature(methodName);
		const self = (this as any) as LendingPoolAddressesProviderContract;
		const abiEncoder = self._lookupAbiEncoder(functionSignature);
		const abiDecodedCallData = abiEncoder.strictDecodeReturnValue<T>(callData);
		return abiDecodedCallData;
	}
	public getSelector(methodName: string): string {
		const functionSignature = this.getFunctionSignature(methodName);
		const self = (this as any) as LendingPoolAddressesProviderContract;
		const abiEncoder = self._lookupAbiEncoder(functionSignature);
		return abiEncoder.getSelector();
	}

	public getAddress(_key: string): ContractFunctionObj<string> {
		const self = (this as any) as LendingPoolAddressesProviderContract;
		assert.isString("_key", _key);
		const functionSignature = "getAddress(bytes32)";

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
				return self._strictEncodeArguments(functionSignature, [_key]);
			},
		};
	}
	public isOwner(): ContractFunctionObj<boolean> {
		const self = (this as any) as LendingPoolAddressesProviderContract;
		const functionSignature = "isOwner()";

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
				return self._strictEncodeArguments(functionSignature, []);
			},
		};
	}
	public owner(): ContractFunctionObj<string> {
		const self = (this as any) as LendingPoolAddressesProviderContract;
		const functionSignature = "owner()";

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
	public renounceOwnership(): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolAddressesProviderContract;
		const functionSignature = "renounceOwnership()";

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
				return self._strictEncodeArguments(functionSignature, []);
			},
		};
	}
	public transferOwnership(newOwner: string): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolAddressesProviderContract;
		assert.isString("newOwner", newOwner);
		const functionSignature = "transferOwnership(address)";

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
				return self._strictEncodeArguments(functionSignature, [newOwner.toLowerCase()]);
			},
		};
	}
	public getLendingPool(): ContractFunctionObj<string> {
		const self = (this as any) as LendingPoolAddressesProviderContract;
		const functionSignature = "getLendingPool()";

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
	public setLendingPoolImpl(_pool: string): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolAddressesProviderContract;
		assert.isString("_pool", _pool);
		const functionSignature = "setLendingPoolImpl(address)";

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
				return self._strictEncodeArguments(functionSignature, [_pool.toLowerCase()]);
			},
		};
	}
	public getLendingPoolCore(): ContractFunctionObj<string> {
		const self = (this as any) as LendingPoolAddressesProviderContract;
		const functionSignature = "getLendingPoolCore()";

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
	public setLendingPoolCoreImpl(_lendingPoolCore: string): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolAddressesProviderContract;
		assert.isString("_lendingPoolCore", _lendingPoolCore);
		const functionSignature = "setLendingPoolCoreImpl(address)";

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
				return self._strictEncodeArguments(functionSignature, [_lendingPoolCore.toLowerCase()]);
			},
		};
	}
	public getLendingPoolConfigurator(): ContractFunctionObj<string> {
		const self = (this as any) as LendingPoolAddressesProviderContract;
		const functionSignature = "getLendingPoolConfigurator()";

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
	public setLendingPoolConfiguratorImpl(_configurator: string): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolAddressesProviderContract;
		assert.isString("_configurator", _configurator);
		const functionSignature = "setLendingPoolConfiguratorImpl(address)";

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
				return self._strictEncodeArguments(functionSignature, [_configurator.toLowerCase()]);
			},
		};
	}
	public getLendingPoolDataProvider(): ContractFunctionObj<string> {
		const self = (this as any) as LendingPoolAddressesProviderContract;
		const functionSignature = "getLendingPoolDataProvider()";

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
	public setLendingPoolDataProviderImpl(_provider: string): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolAddressesProviderContract;
		assert.isString("_provider", _provider);
		const functionSignature = "setLendingPoolDataProviderImpl(address)";

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
				return self._strictEncodeArguments(functionSignature, [_provider.toLowerCase()]);
			},
		};
	}
	public getLendingPoolParametersProvider(): ContractFunctionObj<string> {
		const self = (this as any) as LendingPoolAddressesProviderContract;
		const functionSignature = "getLendingPoolParametersProvider()";

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
	public setLendingPoolParametersProviderImpl(_parametersProvider: string): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolAddressesProviderContract;
		assert.isString("_parametersProvider", _parametersProvider);
		const functionSignature = "setLendingPoolParametersProviderImpl(address)";

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
				return self._strictEncodeArguments(functionSignature, [_parametersProvider.toLowerCase()]);
			},
		};
	}
	public getFeeProvider(): ContractFunctionObj<string> {
		const self = (this as any) as LendingPoolAddressesProviderContract;
		const functionSignature = "getFeeProvider()";

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
	public setFeeProviderImpl(_feeProvider: string): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolAddressesProviderContract;
		assert.isString("_feeProvider", _feeProvider);
		const functionSignature = "setFeeProviderImpl(address)";

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
				return self._strictEncodeArguments(functionSignature, [_feeProvider.toLowerCase()]);
			},
		};
	}
	public getLendingPoolLiquidationManager(): ContractFunctionObj<string> {
		const self = (this as any) as LendingPoolAddressesProviderContract;
		const functionSignature = "getLendingPoolLiquidationManager()";

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
	public setLendingPoolLiquidationManager(_manager: string): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolAddressesProviderContract;
		assert.isString("_manager", _manager);
		const functionSignature = "setLendingPoolLiquidationManager(address)";

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
				return self._strictEncodeArguments(functionSignature, [_manager.toLowerCase()]);
			},
		};
	}
	public getLendingPoolManager(): ContractFunctionObj<string> {
		const self = (this as any) as LendingPoolAddressesProviderContract;
		const functionSignature = "getLendingPoolManager()";

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
	public setLendingPoolManager(_lendingPoolManager: string): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolAddressesProviderContract;
		assert.isString("_lendingPoolManager", _lendingPoolManager);
		const functionSignature = "setLendingPoolManager(address)";

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
				return self._strictEncodeArguments(functionSignature, [_lendingPoolManager.toLowerCase()]);
			},
		};
	}
	public getPriceOracle(): ContractFunctionObj<string> {
		const self = (this as any) as LendingPoolAddressesProviderContract;
		const functionSignature = "getPriceOracle()";

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
	public setPriceOracle(_priceOracle: string): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolAddressesProviderContract;
		assert.isString("_priceOracle", _priceOracle);
		const functionSignature = "setPriceOracle(address)";

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
				return self._strictEncodeArguments(functionSignature, [_priceOracle.toLowerCase()]);
			},
		};
	}
	public getLendingRateOracle(): ContractFunctionObj<string> {
		const self = (this as any) as LendingPoolAddressesProviderContract;
		const functionSignature = "getLendingRateOracle()";

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
	public setLendingRateOracle(_lendingRateOracle: string): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolAddressesProviderContract;
		assert.isString("_lendingRateOracle", _lendingRateOracle);
		const functionSignature = "setLendingRateOracle(address)";

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
				return self._strictEncodeArguments(functionSignature, [_lendingRateOracle.toLowerCase()]);
			},
		};
	}
	public getTokenDistributor(): ContractFunctionObj<string> {
		const self = (this as any) as LendingPoolAddressesProviderContract;
		const functionSignature = "getTokenDistributor()";

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
	public setTokenDistributor(_tokenDistributor: string): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolAddressesProviderContract;
		assert.isString("_tokenDistributor", _tokenDistributor);
		const functionSignature = "setTokenDistributor(address)";

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
				return self._strictEncodeArguments(functionSignature, [_tokenDistributor.toLowerCase()]);
			},
		};
	}

	/**
	 * Subscribe to an event type emitted by the LendingPoolAddressesProvider contract.
	 * @param eventName The LendingPoolAddressesProvider contract event you would like to subscribe to.
	 * @param indexFilterValues An object where the keys are indexed args returned by the event and
	 * the value is the value you are interested in. E.g `{maker: aUserAddressHex}`
	 * @param callback Callback that gets called when a log is added/removed
	 * @param isVerbose Enable verbose subscription warnings (e.g recoverable network issues encountered)
	 * @return Subscription token used later to unsubscribe
	 */
	public subscribe<ArgsType extends LendingPoolAddressesProviderEventArgs>(
		eventName: LendingPoolAddressesProviderEvents,
		indexFilterValues: IndexedFilterValues,
		callback: EventCallback<ArgsType>,
		isVerbose: boolean = false,
		blockPollingIntervalMs?: number
	): string {
		assert.doesBelongToStringEnum("eventName", eventName, LendingPoolAddressesProviderEvents);
		assert.doesConformToSchema("indexFilterValues", indexFilterValues, schemas.indexFilterValuesSchema);
		assert.isFunction("callback", callback);
		const subscriptionToken = this._subscriptionManager.subscribe<ArgsType>(
			this.address,
			eventName,
			indexFilterValues,
			LendingPoolAddressesProviderContract.ABI(),
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
	 * @param eventName The LendingPoolAddressesProvider contract event you would like to subscribe to.
	 * @param blockRange Block range to get logs from.
	 * @param indexFilterValues An object where the keys are indexed args returned by the event and
	 * the value is the value you are interested in. E.g `{_from: aUserAddressHex}`
	 * @return Array of logs that match the parameters
	 */
	public async getLogsAsync<ArgsType extends LendingPoolAddressesProviderEventArgs>(
		eventName: LendingPoolAddressesProviderEvents,
		blockRange: BlockRange,
		indexFilterValues: IndexedFilterValues
	): Promise<Array<LogWithDecodedArgs<ArgsType>>> {
		assert.doesBelongToStringEnum("eventName", eventName, LendingPoolAddressesProviderEvents);
		assert.doesConformToSchema("blockRange", blockRange, schemas.blockRangeSchema);
		assert.doesConformToSchema("indexFilterValues", indexFilterValues, schemas.indexFilterValuesSchema);
		const logs = await this._subscriptionManager.getLogsAsync<ArgsType>(
			this.address,
			eventName,
			blockRange,
			indexFilterValues,
			LendingPoolAddressesProviderContract.ABI()
		);
		return logs;
	}
	constructor(
		address: string,
		supportedProvider: SupportedProvider,
		txDefaults?: Partial<TxData>,
		logDecodeDependencies?: { [contractName: string]: ContractAbi },
		deployedBytecode: string | undefined = LendingPoolAddressesProviderContract.deployedBytecode
	) {
		super(
			"LendingPoolAddressesProvider",
			LendingPoolAddressesProviderContract.ABI(),
			address,
			supportedProvider,
			txDefaults,
			logDecodeDependencies,
			deployedBytecode
		);
		classUtils.bindAll(this, ["_abiEncoderByFunctionSignature", "address", "_web3Wrapper"]);
		this._subscriptionManager = new SubscriptionManager<
			LendingPoolAddressesProviderEventArgs,
			LendingPoolAddressesProviderEvents
		>(LendingPoolAddressesProviderContract.ABI(), this._web3Wrapper);
		LendingPoolAddressesProviderContract.ABI().forEach((item, index) => {
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
