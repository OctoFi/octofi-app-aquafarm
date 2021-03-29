// tslint:disable:no-consecutive-blank-lines ordered-imports align trailing-comma enum-naming
// tslint:disable:whitespace no-unbound-method no-trailing-whitespace
// tslint:disable:no-unused-variable
import { ContractFunctionObj, BaseContract, methodAbiToFunctionSignature } from "@0x/base-contract";
import { schemas } from "@0x/json-schemas";
import {
	BlockParam,
	CallData,
	ContractAbi,
	ContractArtifact,
	MethodAbi,
	TxData,
	SupportedProvider,
} from "ethereum-types";
import { BigNumber, classUtils, providerUtils } from "@0x/utils";
import { SimpleContractArtifact } from "@0x/types";
import { Web3Wrapper } from "@0x/web3-wrapper";
import { assert } from "@0x/assert";
import * as ethers from "ethers";
// tslint:enable:no-unused-variable

/* istanbul ignore next */
// tslint:disable:no-parameter-reassignment
// tslint:disable-next-line:class-name
export class AaveReaderContract extends BaseContract {
	/**
	 * @ignore
	 */
	public static deployedBytecode: string | undefined;
	public static contractName = "AaveReader";
	private readonly _methodABIIndex: { [name: string]: number } = {};
	public static async deployFrom0xArtifactAsync(
		artifact: ContractArtifact | SimpleContractArtifact,
		supportedProvider: SupportedProvider,
		txDefaults: Partial<TxData>,
		logDecodeDependencies: { [contractName: string]: ContractArtifact | SimpleContractArtifact },
		_lendingPoolAddressProvider: string
	): Promise<AaveReaderContract> {
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
		return AaveReaderContract.deployAsync(
			bytecode,
			abi,
			provider,
			txDefaults,
			logDecodeDependenciesAbiOnly,
			_lendingPoolAddressProvider
		);
	}
	public static async deployAsync(
		bytecode: string,
		abi: ContractAbi,
		supportedProvider: SupportedProvider,
		txDefaults: Partial<TxData>,
		logDecodeDependencies: { [contractName: string]: ContractAbi },
		_lendingPoolAddressProvider: string
	): Promise<AaveReaderContract> {
		assert.isHexString("bytecode", bytecode);
		assert.doesConformToSchema("txDefaults", txDefaults, schemas.txDataSchema, [
			schemas.addressSchema,
			schemas.numberSchema,
			schemas.jsNumber,
		]);
		const provider = providerUtils.standardizeOrThrow(supportedProvider);
		const constructorAbi = BaseContract._lookupConstructorAbi(abi);
		[_lendingPoolAddressProvider] = BaseContract._formatABIDataItemList(
			constructorAbi.inputs,
			[_lendingPoolAddressProvider],
			BaseContract._bigNumberToString
		);
		// @ts-ignore
		const iface = new ethers.utils.Interface(abi);
		// @ts-ignore
		const deployInfo = iface.deployFunction;
		const txData = deployInfo.encode(bytecode, [_lendingPoolAddressProvider]);
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
		const contractInstance = new AaveReaderContract(
			txReceipt.contractAddress as string,
			provider,
			txDefaults,
			logDecodeDependencies
		);
		contractInstance.constructorArgs = [_lendingPoolAddressProvider];
		return contractInstance;
	}

	/**
	 * @returns      The contract ABI
	 */
	public static ABI(): ContractAbi {
		const abi = [
			{
				constant: true,
				inputs: [
					{
						name: "ethAccount",
						type: "address",
					},
					{
						name: "reserves",
						type: "address[]",
					},
				],
				name: "getBatchATokensData",
				outputs: [
					{
						name: "tokenData",
						type: "tuple[]",
						components: [
							{
								name: "reserveAddress",
								type: "address",
							},
							{
								name: "allowance",
								type: "uint256",
							},
							{
								name: "balance",
								type: "uint256",
							},
							{
								name: "balanceUnderlying",
								type: "uint256",
							},
							{
								name: "borrowBalance",
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
				inputs: [
					{
						name: "_lendingPoolAddressProvider",
						type: "address",
					},
				],
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "constructor",
			},
		] as ContractAbi;
		return abi;
	}

	public getFunctionSignature(methodName: string): string {
		const index = this._methodABIIndex[methodName];
		const methodAbi = AaveReaderContract.ABI()[index] as MethodAbi; // tslint:disable-line:no-unnecessary-type-assertion
		const functionSignature = methodAbiToFunctionSignature(methodAbi);
		return functionSignature;
	}
	public getABIDecodedTransactionData<T>(methodName: string, callData: string): T {
		const functionSignature = this.getFunctionSignature(methodName);
		const self = (this as any) as AaveReaderContract;
		const abiEncoder = self._lookupAbiEncoder(functionSignature);
		const abiDecodedCallData = abiEncoder.strictDecode<T>(callData);
		return abiDecodedCallData;
	}
	public getABIDecodedReturnData<T>(methodName: string, callData: string): T {
		const functionSignature = this.getFunctionSignature(methodName);
		const self = (this as any) as AaveReaderContract;
		const abiEncoder = self._lookupAbiEncoder(functionSignature);
		const abiDecodedCallData = abiEncoder.strictDecodeReturnValue<T>(callData);
		return abiDecodedCallData;
	}
	public getSelector(methodName: string): string {
		const functionSignature = this.getFunctionSignature(methodName);
		const self = (this as any) as AaveReaderContract;
		const abiEncoder = self._lookupAbiEncoder(functionSignature);
		return abiEncoder.getSelector();
	}

	public getBatchATokensData(
		ethAccount: string,
		reserves: string[]
	): ContractFunctionObj<
		Array<{
			reserveAddress: string;
			allowance: BigNumber;
			balance: BigNumber;
			balanceUnderlying: BigNumber;
			borrowBalance: BigNumber;
		}>
	> {
		const self = (this as any) as AaveReaderContract;
		assert.isString("ethAccount", ethAccount);
		assert.isArray("reserves", reserves);
		const functionSignature = "getBatchATokensData(address,address[])";

		return {
			async callAsync(
				callData: Partial<CallData> = {},
				defaultBlock?: BlockParam
			): Promise<
				Array<{
					reserveAddress: string;
					allowance: BigNumber;
					balance: BigNumber;
					balanceUnderlying: BigNumber;
					borrowBalance: BigNumber;
				}>
			> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<
					Array<{
						reserveAddress: string;
						allowance: BigNumber;
						balance: BigNumber;
						balanceUnderlying: BigNumber;
						borrowBalance: BigNumber;
					}>
				>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, [ethAccount.toLowerCase(), reserves]);
			},
		};
	}

	constructor(
		address: string,
		supportedProvider: SupportedProvider,
		txDefaults?: Partial<TxData>,
		logDecodeDependencies?: { [contractName: string]: ContractAbi },
		deployedBytecode: string | undefined = AaveReaderContract.deployedBytecode
	) {
		super(
			"AaveReader",
			AaveReaderContract.ABI(),
			address,
			supportedProvider,
			txDefaults,
			logDecodeDependencies,
			deployedBytecode
		);
		classUtils.bindAll(this, ["_abiEncoderByFunctionSignature", "address", "_web3Wrapper"]);
		AaveReaderContract.ABI().forEach((item, index) => {
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
