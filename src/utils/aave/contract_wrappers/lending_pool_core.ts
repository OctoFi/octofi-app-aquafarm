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
import { BigNumber, classUtils, logUtils, providerUtils } from "@0x/utils";
import { EventCallback, IndexedFilterValues, SimpleContractArtifact } from "@0x/types";
// @ts-ignore
import { Web3Wrapper } from "@0x/web3-wrapper";
import { assert } from "@0x/assert";
import * as ethers from "ethers";
// tslint:enable:no-unused-variable

export type LendingPoolCoreEventArgs = LendingPoolCoreReserveUpdatedEventArgs;

export enum LendingPoolCoreEvents {
	ReserveUpdated = "ReserveUpdated",
}

export interface LendingPoolCoreReserveUpdatedEventArgs extends DecodedLogArgs {
	reserve: string;
	liquidityRate: BigNumber;
	stableBorrowRate: BigNumber;
	variableBorrowRate: BigNumber;
	liquidityIndex: BigNumber;
	variableBorrowIndex: BigNumber;
}

/* istanbul ignore next */
// tslint:disable:no-parameter-reassignment
// tslint:disable-next-line:class-name
export class LendingPoolCoreContract extends BaseContract {
	/**
	 * @ignore
	 */
	public static deployedBytecode: string | undefined;
	public static contractName = "LendingPoolCore";
	private readonly _methodABIIndex: { [name: string]: number } = {};
	private readonly _subscriptionManager: SubscriptionManager<LendingPoolCoreEventArgs, LendingPoolCoreEvents>;
	public static async deployFrom0xArtifactAsync(
		artifact: ContractArtifact | SimpleContractArtifact,
		supportedProvider: SupportedProvider,
		txDefaults: Partial<TxData>,
		logDecodeDependencies: { [contractName: string]: ContractArtifact | SimpleContractArtifact }
	): Promise<LendingPoolCoreContract> {
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
		return LendingPoolCoreContract.deployAsync(bytecode, abi, provider, txDefaults, logDecodeDependenciesAbiOnly);
	}
	public static async deployAsync(
		bytecode: string,
		abi: ContractAbi,
		supportedProvider: SupportedProvider,
		txDefaults: Partial<TxData>,
		logDecodeDependencies: { [contractName: string]: ContractAbi }
	): Promise<LendingPoolCoreContract> {
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
		logUtils.log(`LendingPoolCore successfully deployed at ${txReceipt.contractAddress}`);
		const contractInstance = new LendingPoolCoreContract(
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
						name: "reserve",
						type: "address",
						indexed: true,
					},
					{
						name: "liquidityRate",
						type: "uint256",
						indexed: false,
					},
					{
						name: "stableBorrowRate",
						type: "uint256",
						indexed: false,
					},
					{
						name: "variableBorrowRate",
						type: "uint256",
						indexed: false,
					},
					{
						name: "liquidityIndex",
						type: "uint256",
						indexed: false,
					},
					{
						name: "variableBorrowIndex",
						type: "uint256",
						indexed: false,
					},
				],
				name: "ReserveUpdated",
				outputs: [],
				type: "event",
			},
			{
				inputs: [],
				outputs: [],
				payable: true,
				stateMutability: "payable",
				type: "fallback",
			},
			{
				constant: true,
				inputs: [],
				name: "CORE_REVISION",
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
				name: "addressesProvider",
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
				name: "lendingPoolAddress",
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
						type: "uint256",
					},
				],
				name: "reservesList",
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
						name: "_addressesProvider",
						type: "address",
					},
				],
				name: "initialize",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_reserve",
						type: "address",
					},
					{
						name: "_user",
						type: "address",
					},
					{
						name: "_amount",
						type: "uint256",
					},
					{
						name: "_isFirstDeposit",
						type: "bool",
					},
				],
				name: "updateStateOnDeposit",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_reserve",
						type: "address",
					},
					{
						name: "_user",
						type: "address",
					},
					{
						name: "_amountRedeemed",
						type: "uint256",
					},
					{
						name: "_userRedeemedEverything",
						type: "bool",
					},
				],
				name: "updateStateOnRedeem",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_reserve",
						type: "address",
					},
					{
						name: "_availableLiquidityBefore",
						type: "uint256",
					},
					{
						name: "_income",
						type: "uint256",
					},
					{
						name: "_protocolFee",
						type: "uint256",
					},
				],
				name: "updateStateOnFlashLoan",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_reserve",
						type: "address",
					},
					{
						name: "_user",
						type: "address",
					},
					{
						name: "_amountBorrowed",
						type: "uint256",
					},
					{
						name: "_borrowFee",
						type: "uint256",
					},
					{
						name: "_rateMode",
						type: "uint8",
					},
				],
				name: "updateStateOnBorrow",
				outputs: [
					{
						name: "",
						type: "uint256",
					},
					{
						name: "",
						type: "uint256",
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
						name: "_reserve",
						type: "address",
					},
					{
						name: "_user",
						type: "address",
					},
					{
						name: "_paybackAmountMinusFees",
						type: "uint256",
					},
					{
						name: "_originationFeeRepaid",
						type: "uint256",
					},
					{
						name: "_balanceIncrease",
						type: "uint256",
					},
					{
						name: "_repaidWholeLoan",
						type: "bool",
					},
				],
				name: "updateStateOnRepay",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_reserve",
						type: "address",
					},
					{
						name: "_user",
						type: "address",
					},
					{
						name: "_principalBorrowBalance",
						type: "uint256",
					},
					{
						name: "_compoundedBorrowBalance",
						type: "uint256",
					},
					{
						name: "_balanceIncrease",
						type: "uint256",
					},
					{
						name: "_currentRateMode",
						type: "uint8",
					},
				],
				name: "updateStateOnSwapRate",
				outputs: [
					{
						name: "",
						type: "uint8",
					},
					{
						name: "",
						type: "uint256",
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
						name: "_principalReserve",
						type: "address",
					},
					{
						name: "_collateralReserve",
						type: "address",
					},
					{
						name: "_user",
						type: "address",
					},
					{
						name: "_amountToLiquidate",
						type: "uint256",
					},
					{
						name: "_collateralToLiquidate",
						type: "uint256",
					},
					{
						name: "_feeLiquidated",
						type: "uint256",
					},
					{
						name: "_liquidatedCollateralForFee",
						type: "uint256",
					},
					{
						name: "_balanceIncrease",
						type: "uint256",
					},
					{
						name: "_liquidatorReceivesAToken",
						type: "bool",
					},
				],
				name: "updateStateOnLiquidation",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_reserve",
						type: "address",
					},
					{
						name: "_user",
						type: "address",
					},
					{
						name: "_balanceIncrease",
						type: "uint256",
					},
				],
				name: "updateStateOnRebalance",
				outputs: [
					{
						name: "",
						type: "uint256",
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
						name: "_reserve",
						type: "address",
					},
					{
						name: "_user",
						type: "address",
					},
					{
						name: "_useAsCollateral",
						type: "bool",
					},
				],
				name: "setUserUseReserveAsCollateral",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_reserve",
						type: "address",
					},
					{
						name: "_user",
						type: "address",
					},
					{
						name: "_amount",
						type: "uint256",
					},
				],
				name: "transferToUser",
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
						name: "_user",
						type: "address",
					},
					{
						name: "_amount",
						type: "uint256",
					},
					{
						name: "_destination",
						type: "address",
					},
				],
				name: "transferToFeeCollectionAddress",
				outputs: [],
				payable: true,
				stateMutability: "payable",
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
						name: "_amount",
						type: "uint256",
					},
					{
						name: "_destination",
						type: "address",
					},
				],
				name: "liquidateFee",
				outputs: [],
				payable: true,
				stateMutability: "payable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_reserve",
						type: "address",
					},
					{
						name: "_user",
						type: "address",
					},
					{
						name: "_amount",
						type: "uint256",
					},
				],
				name: "transferToReserve",
				outputs: [],
				payable: true,
				stateMutability: "payable",
				type: "function",
			},
			{
				constant: true,
				inputs: [
					{
						name: "_reserve",
						type: "address",
					},
					{
						name: "_user",
						type: "address",
					},
				],
				name: "getUserBasicReserveData",
				outputs: [
					{
						name: "",
						type: "uint256",
					},
					{
						name: "",
						type: "uint256",
					},
					{
						name: "",
						type: "uint256",
					},
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
						name: "_reserve",
						type: "address",
					},
					{
						name: "_user",
						type: "address",
					},
					{
						name: "_amount",
						type: "uint256",
					},
				],
				name: "isUserAllowedToBorrowAtStable",
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
						name: "_reserve",
						type: "address",
					},
					{
						name: "_user",
						type: "address",
					},
				],
				name: "getUserUnderlyingAssetBalance",
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
						name: "_reserve",
						type: "address",
					},
				],
				name: "getReserveInterestRateStrategyAddress",
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
						name: "_reserve",
						type: "address",
					},
				],
				name: "getReserveATokenAddress",
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
						name: "_reserve",
						type: "address",
					},
				],
				name: "getReserveAvailableLiquidity",
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
						name: "_reserve",
						type: "address",
					},
				],
				name: "getReserveTotalLiquidity",
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
						name: "_reserve",
						type: "address",
					},
				],
				name: "getReserveNormalizedIncome",
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
						name: "_reserve",
						type: "address",
					},
				],
				name: "getReserveTotalBorrows",
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
						name: "_reserve",
						type: "address",
					},
				],
				name: "getReserveTotalBorrowsStable",
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
						name: "_reserve",
						type: "address",
					},
				],
				name: "getReserveTotalBorrowsVariable",
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
						name: "_reserve",
						type: "address",
					},
				],
				name: "getReserveLiquidationThreshold",
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
						name: "_reserve",
						type: "address",
					},
				],
				name: "getReserveLiquidationBonus",
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
						name: "_reserve",
						type: "address",
					},
				],
				name: "getReserveCurrentVariableBorrowRate",
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
						name: "_reserve",
						type: "address",
					},
				],
				name: "getReserveCurrentStableBorrowRate",
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
						name: "_reserve",
						type: "address",
					},
				],
				name: "getReserveCurrentAverageStableBorrowRate",
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
						name: "_reserve",
						type: "address",
					},
				],
				name: "getReserveCurrentLiquidityRate",
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
						name: "_reserve",
						type: "address",
					},
				],
				name: "getReserveLiquidityCumulativeIndex",
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
						name: "_reserve",
						type: "address",
					},
				],
				name: "getReserveVariableBorrowsCumulativeIndex",
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
						name: "_reserve",
						type: "address",
					},
				],
				name: "getReserveConfiguration",
				outputs: [
					{
						name: "",
						type: "uint256",
					},
					{
						name: "",
						type: "uint256",
					},
					{
						name: "",
						type: "uint256",
					},
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
						name: "_reserve",
						type: "address",
					},
				],
				name: "getReserveDecimals",
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
						name: "_reserve",
						type: "address",
					},
				],
				name: "isReserveBorrowingEnabled",
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
						name: "_reserve",
						type: "address",
					},
				],
				name: "isReserveUsageAsCollateralEnabled",
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
						name: "_reserve",
						type: "address",
					},
				],
				name: "getReserveIsStableBorrowRateEnabled",
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
						name: "_reserve",
						type: "address",
					},
				],
				name: "getReserveIsActive",
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
						name: "_reserve",
						type: "address",
					},
				],
				name: "getReserveIsFreezed",
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
						name: "_reserve",
						type: "address",
					},
				],
				name: "getReserveLastUpdate",
				outputs: [
					{
						name: "timestamp",
						type: "uint40",
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
						name: "_reserve",
						type: "address",
					},
				],
				name: "getReserveUtilizationRate",
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
				name: "getReserves",
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
						name: "_reserve",
						type: "address",
					},
					{
						name: "_user",
						type: "address",
					},
				],
				name: "isUserUseReserveAsCollateralEnabled",
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
						name: "_reserve",
						type: "address",
					},
					{
						name: "_user",
						type: "address",
					},
				],
				name: "getUserOriginationFee",
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
						name: "_reserve",
						type: "address",
					},
					{
						name: "_user",
						type: "address",
					},
				],
				name: "getUserCurrentBorrowRateMode",
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
				constant: true,
				inputs: [
					{
						name: "_reserve",
						type: "address",
					},
					{
						name: "_user",
						type: "address",
					},
				],
				name: "getUserCurrentStableBorrowRate",
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
						name: "_reserve",
						type: "address",
					},
					{
						name: "_user",
						type: "address",
					},
				],
				name: "getUserBorrowBalances",
				outputs: [
					{
						name: "",
						type: "uint256",
					},
					{
						name: "",
						type: "uint256",
					},
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
						name: "_reserve",
						type: "address",
					},
					{
						name: "_user",
						type: "address",
					},
				],
				name: "getUserVariableBorrowCumulativeIndex",
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
						name: "_reserve",
						type: "address",
					},
					{
						name: "_user",
						type: "address",
					},
				],
				name: "getUserLastUpdate",
				outputs: [
					{
						name: "timestamp",
						type: "uint256",
					},
				],
				payable: false,
				stateMutability: "view",
				type: "function",
			},
			{
				constant: false,
				inputs: [],
				name: "refreshConfiguration",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_reserve",
						type: "address",
					},
					{
						name: "_aTokenAddress",
						type: "address",
					},
					{
						name: "_decimals",
						type: "uint256",
					},
					{
						name: "_interestRateStrategyAddress",
						type: "address",
					},
				],
				name: "initReserve",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_reserve",
						type: "address",
					},
					{
						name: "_rateStrategyAddress",
						type: "address",
					},
				],
				name: "setReserveInterestRateStrategyAddress",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_reserve",
						type: "address",
					},
					{
						name: "_stableBorrowRateEnabled",
						type: "bool",
					},
				],
				name: "enableBorrowingOnReserve",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_reserve",
						type: "address",
					},
				],
				name: "disableBorrowingOnReserve",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_reserve",
						type: "address",
					},
					{
						name: "_baseLTVasCollateral",
						type: "uint256",
					},
					{
						name: "_liquidationThreshold",
						type: "uint256",
					},
					{
						name: "_liquidationBonus",
						type: "uint256",
					},
				],
				name: "enableReserveAsCollateral",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_reserve",
						type: "address",
					},
				],
				name: "disableReserveAsCollateral",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_reserve",
						type: "address",
					},
				],
				name: "enableReserveStableBorrowRate",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_reserve",
						type: "address",
					},
				],
				name: "disableReserveStableBorrowRate",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_reserve",
						type: "address",
					},
				],
				name: "activateReserve",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_reserve",
						type: "address",
					},
				],
				name: "deactivateReserve",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_reserve",
						type: "address",
					},
				],
				name: "freezeReserve",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_reserve",
						type: "address",
					},
				],
				name: "unfreezeReserve",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_reserve",
						type: "address",
					},
					{
						name: "_ltv",
						type: "uint256",
					},
				],
				name: "setReserveBaseLTVasCollateral",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_reserve",
						type: "address",
					},
					{
						name: "_threshold",
						type: "uint256",
					},
				],
				name: "setReserveLiquidationThreshold",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_reserve",
						type: "address",
					},
					{
						name: "_bonus",
						type: "uint256",
					},
				],
				name: "setReserveLiquidationBonus",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_reserve",
						type: "address",
					},
					{
						name: "_decimals",
						type: "uint256",
					},
				],
				name: "setReserveDecimals",
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
		const methodAbi = LendingPoolCoreContract.ABI()[index] as MethodAbi; // tslint:disable-line:no-unnecessary-type-assertion
		const functionSignature = methodAbiToFunctionSignature(methodAbi);
		return functionSignature;
	}
	public getABIDecodedTransactionData<T>(methodName: string, callData: string): T {
		const functionSignature = this.getFunctionSignature(methodName);
		const self = (this as any) as LendingPoolCoreContract;
		const abiEncoder = self._lookupAbiEncoder(functionSignature);
		const abiDecodedCallData = abiEncoder.strictDecode<T>(callData);
		return abiDecodedCallData;
	}
	public getABIDecodedReturnData<T>(methodName: string, callData: string): T {
		const functionSignature = this.getFunctionSignature(methodName);
		const self = (this as any) as LendingPoolCoreContract;
		const abiEncoder = self._lookupAbiEncoder(functionSignature);
		const abiDecodedCallData = abiEncoder.strictDecodeReturnValue<T>(callData);
		return abiDecodedCallData;
	}
	public getSelector(methodName: string): string {
		const functionSignature = this.getFunctionSignature(methodName);
		const self = (this as any) as LendingPoolCoreContract;
		const abiEncoder = self._lookupAbiEncoder(functionSignature);
		return abiEncoder.getSelector();
	}

	public CORE_REVISION(): ContractFunctionObj<BigNumber> {
		const self = (this as any) as LendingPoolCoreContract;
		const functionSignature = "CORE_REVISION()";

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
	public addressesProvider(): ContractFunctionObj<string> {
		const self = (this as any) as LendingPoolCoreContract;
		const functionSignature = "addressesProvider()";

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
	public lendingPoolAddress(): ContractFunctionObj<string> {
		const self = (this as any) as LendingPoolCoreContract;
		const functionSignature = "lendingPoolAddress()";

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
	public reservesList(index_0: BigNumber): ContractFunctionObj<string> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isBigNumber("index_0", index_0);
		const functionSignature = "reservesList(uint256)";

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
				return self._strictEncodeArguments(functionSignature, [index_0]);
			},
		};
	}
	public initialize(_addressesProvider: string): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_addressesProvider", _addressesProvider);
		const functionSignature = "initialize(address)";

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
				return self._strictEncodeArguments(functionSignature, [_addressesProvider.toLowerCase()]);
			},
		};
	}
	public updateStateOnDeposit(
		_reserve: string,
		_user: string,
		_amount: BigNumber,
		_isFirstDeposit: boolean
	): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		assert.isString("_user", _user);
		assert.isBigNumber("_amount", _amount);
		assert.isBoolean("_isFirstDeposit", _isFirstDeposit);
		const functionSignature = "updateStateOnDeposit(address,address,uint256,bool)";

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
				return self._strictEncodeArguments(functionSignature, [
					_reserve.toLowerCase(),
					_user.toLowerCase(),
					_amount,
					_isFirstDeposit,
				]);
			},
		};
	}
	public updateStateOnRedeem(
		_reserve: string,
		_user: string,
		_amountRedeemed: BigNumber,
		_userRedeemedEverything: boolean
	): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		assert.isString("_user", _user);
		assert.isBigNumber("_amountRedeemed", _amountRedeemed);
		assert.isBoolean("_userRedeemedEverything", _userRedeemedEverything);
		const functionSignature = "updateStateOnRedeem(address,address,uint256,bool)";

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
				return self._strictEncodeArguments(functionSignature, [
					_reserve.toLowerCase(),
					_user.toLowerCase(),
					_amountRedeemed,
					_userRedeemedEverything,
				]);
			},
		};
	}
	public updateStateOnFlashLoan(
		_reserve: string,
		_availableLiquidityBefore: BigNumber,
		_income: BigNumber,
		_protocolFee: BigNumber
	): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		assert.isBigNumber("_availableLiquidityBefore", _availableLiquidityBefore);
		assert.isBigNumber("_income", _income);
		assert.isBigNumber("_protocolFee", _protocolFee);
		const functionSignature = "updateStateOnFlashLoan(address,uint256,uint256,uint256)";

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
				return self._strictEncodeArguments(functionSignature, [
					_reserve.toLowerCase(),
					_availableLiquidityBefore,
					_income,
					_protocolFee,
				]);
			},
		};
	}
	public updateStateOnBorrow(
		_reserve: string,
		_user: string,
		_amountBorrowed: BigNumber,
		_borrowFee: BigNumber,
		_rateMode: number | BigNumber
	): ContractTxFunctionObj<[BigNumber, BigNumber]> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		assert.isString("_user", _user);
		assert.isBigNumber("_amountBorrowed", _amountBorrowed);
		assert.isBigNumber("_borrowFee", _borrowFee);
		assert.isNumberOrBigNumber("_rateMode", _rateMode);
		const functionSignature = "updateStateOnBorrow(address,address,uint256,uint256,uint8)";

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
			async callAsync(
				callData: Partial<CallData> = {},
				defaultBlock?: BlockParam
			): Promise<[BigNumber, BigNumber]> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<[BigNumber, BigNumber]>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, [
					_reserve.toLowerCase(),
					_user.toLowerCase(),
					_amountBorrowed,
					_borrowFee,
					_rateMode,
				]);
			},
		};
	}
	public updateStateOnRepay(
		_reserve: string,
		_user: string,
		_paybackAmountMinusFees: BigNumber,
		_originationFeeRepaid: BigNumber,
		_balanceIncrease: BigNumber,
		_repaidWholeLoan: boolean
	): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		assert.isString("_user", _user);
		assert.isBigNumber("_paybackAmountMinusFees", _paybackAmountMinusFees);
		assert.isBigNumber("_originationFeeRepaid", _originationFeeRepaid);
		assert.isBigNumber("_balanceIncrease", _balanceIncrease);
		assert.isBoolean("_repaidWholeLoan", _repaidWholeLoan);
		const functionSignature = "updateStateOnRepay(address,address,uint256,uint256,uint256,bool)";

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
				return self._strictEncodeArguments(functionSignature, [
					_reserve.toLowerCase(),
					_user.toLowerCase(),
					_paybackAmountMinusFees,
					_originationFeeRepaid,
					_balanceIncrease,
					_repaidWholeLoan,
				]);
			},
		};
	}
	public updateStateOnSwapRate(
		_reserve: string,
		_user: string,
		_principalBorrowBalance: BigNumber,
		_compoundedBorrowBalance: BigNumber,
		_balanceIncrease: BigNumber,
		_currentRateMode: number | BigNumber
	): ContractTxFunctionObj<[BigNumber, BigNumber]> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		assert.isString("_user", _user);
		assert.isBigNumber("_principalBorrowBalance", _principalBorrowBalance);
		assert.isBigNumber("_compoundedBorrowBalance", _compoundedBorrowBalance);
		assert.isBigNumber("_balanceIncrease", _balanceIncrease);
		assert.isNumberOrBigNumber("_currentRateMode", _currentRateMode);
		const functionSignature = "updateStateOnSwapRate(address,address,uint256,uint256,uint256,uint8)";

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
			async callAsync(
				callData: Partial<CallData> = {},
				defaultBlock?: BlockParam
			): Promise<[BigNumber, BigNumber]> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<[BigNumber, BigNumber]>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, [
					_reserve.toLowerCase(),
					_user.toLowerCase(),
					_principalBorrowBalance,
					_compoundedBorrowBalance,
					_balanceIncrease,
					_currentRateMode,
				]);
			},
		};
	}
	public updateStateOnLiquidation(
		_principalReserve: string,
		_collateralReserve: string,
		_user: string,
		_amountToLiquidate: BigNumber,
		_collateralToLiquidate: BigNumber,
		_feeLiquidated: BigNumber,
		_liquidatedCollateralForFee: BigNumber,
		_balanceIncrease: BigNumber,
		_liquidatorReceivesAToken: boolean
	): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_principalReserve", _principalReserve);
		assert.isString("_collateralReserve", _collateralReserve);
		assert.isString("_user", _user);
		assert.isBigNumber("_amountToLiquidate", _amountToLiquidate);
		assert.isBigNumber("_collateralToLiquidate", _collateralToLiquidate);
		assert.isBigNumber("_feeLiquidated", _feeLiquidated);
		assert.isBigNumber("_liquidatedCollateralForFee", _liquidatedCollateralForFee);
		assert.isBigNumber("_balanceIncrease", _balanceIncrease);
		assert.isBoolean("_liquidatorReceivesAToken", _liquidatorReceivesAToken);
		const functionSignature =
			"updateStateOnLiquidation(address,address,address,uint256,uint256,uint256,uint256,uint256,bool)";

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
				return self._strictEncodeArguments(functionSignature, [
					_principalReserve.toLowerCase(),
					_collateralReserve.toLowerCase(),
					_user.toLowerCase(),
					_amountToLiquidate,
					_collateralToLiquidate,
					_feeLiquidated,
					_liquidatedCollateralForFee,
					_balanceIncrease,
					_liquidatorReceivesAToken,
				]);
			},
		};
	}
	public updateStateOnRebalance(
		_reserve: string,
		_user: string,
		_balanceIncrease: BigNumber
	): ContractTxFunctionObj<BigNumber> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		assert.isString("_user", _user);
		assert.isBigNumber("_balanceIncrease", _balanceIncrease);
		const functionSignature = "updateStateOnRebalance(address,address,uint256)";

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
				return self._strictEncodeArguments(functionSignature, [
					_reserve.toLowerCase(),
					_user.toLowerCase(),
					_balanceIncrease,
				]);
			},
		};
	}
	public setUserUseReserveAsCollateral(
		_reserve: string,
		_user: string,
		_useAsCollateral: boolean
	): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		assert.isString("_user", _user);
		assert.isBoolean("_useAsCollateral", _useAsCollateral);
		const functionSignature = "setUserUseReserveAsCollateral(address,address,bool)";

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
				return self._strictEncodeArguments(functionSignature, [
					_reserve.toLowerCase(),
					_user.toLowerCase(),
					_useAsCollateral,
				]);
			},
		};
	}
	public transferToUser(_reserve: string, _user: string, _amount: BigNumber): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		assert.isString("_user", _user);
		assert.isBigNumber("_amount", _amount);
		const functionSignature = "transferToUser(address,address,uint256)";

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
				return self._strictEncodeArguments(functionSignature, [
					_reserve.toLowerCase(),
					_user.toLowerCase(),
					_amount,
				]);
			},
		};
	}
	public transferToFeeCollectionAddress(
		_token: string,
		_user: string,
		_amount: BigNumber,
		_destination: string
	): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_token", _token);
		assert.isString("_user", _user);
		assert.isBigNumber("_amount", _amount);
		assert.isString("_destination", _destination);
		const functionSignature = "transferToFeeCollectionAddress(address,address,uint256,address)";

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
				return self._strictEncodeArguments(functionSignature, [
					_token.toLowerCase(),
					_user.toLowerCase(),
					_amount,
					_destination.toLowerCase(),
				]);
			},
		};
	}
	public liquidateFee(_token: string, _amount: BigNumber, _destination: string): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_token", _token);
		assert.isBigNumber("_amount", _amount);
		assert.isString("_destination", _destination);
		const functionSignature = "liquidateFee(address,uint256,address)";

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
				return self._strictEncodeArguments(functionSignature, [
					_token.toLowerCase(),
					_amount,
					_destination.toLowerCase(),
				]);
			},
		};
	}
	public transferToReserve(_reserve: string, _user: string, _amount: BigNumber): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		assert.isString("_user", _user);
		assert.isBigNumber("_amount", _amount);
		const functionSignature = "transferToReserve(address,address,uint256)";

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
				return self._strictEncodeArguments(functionSignature, [
					_reserve.toLowerCase(),
					_user.toLowerCase(),
					_amount,
				]);
			},
		};
	}
	public getUserBasicReserveData(
		_reserve: string,
		_user: string
	): ContractFunctionObj<[BigNumber, BigNumber, BigNumber, boolean]> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		assert.isString("_user", _user);
		const functionSignature = "getUserBasicReserveData(address,address)";

		return {
			async callAsync(
				callData: Partial<CallData> = {},
				defaultBlock?: BlockParam
			): Promise<[BigNumber, BigNumber, BigNumber, boolean]> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<[BigNumber, BigNumber, BigNumber, boolean]>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase(), _user.toLowerCase()]);
			},
		};
	}
	public isUserAllowedToBorrowAtStable(
		_reserve: string,
		_user: string,
		_amount: BigNumber
	): ContractFunctionObj<boolean> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		assert.isString("_user", _user);
		assert.isBigNumber("_amount", _amount);
		const functionSignature = "isUserAllowedToBorrowAtStable(address,address,uint256)";

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
				return self._strictEncodeArguments(functionSignature, [
					_reserve.toLowerCase(),
					_user.toLowerCase(),
					_amount,
				]);
			},
		};
	}
	public getUserUnderlyingAssetBalance(_reserve: string, _user: string): ContractFunctionObj<BigNumber> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		assert.isString("_user", _user);
		const functionSignature = "getUserUnderlyingAssetBalance(address,address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase(), _user.toLowerCase()]);
			},
		};
	}
	public getReserveInterestRateStrategyAddress(_reserve: string): ContractFunctionObj<string> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "getReserveInterestRateStrategyAddress(address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public getReserveATokenAddress(_reserve: string): ContractFunctionObj<string> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "getReserveATokenAddress(address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public getReserveAvailableLiquidity(_reserve: string): ContractFunctionObj<BigNumber> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "getReserveAvailableLiquidity(address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public getReserveTotalLiquidity(_reserve: string): ContractFunctionObj<BigNumber> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "getReserveTotalLiquidity(address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public getReserveNormalizedIncome(_reserve: string): ContractFunctionObj<BigNumber> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "getReserveNormalizedIncome(address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public getReserveTotalBorrows(_reserve: string): ContractFunctionObj<BigNumber> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "getReserveTotalBorrows(address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public getReserveTotalBorrowsStable(_reserve: string): ContractFunctionObj<BigNumber> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "getReserveTotalBorrowsStable(address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public getReserveTotalBorrowsVariable(_reserve: string): ContractFunctionObj<BigNumber> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "getReserveTotalBorrowsVariable(address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public getReserveLiquidationThreshold(_reserve: string): ContractFunctionObj<BigNumber> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "getReserveLiquidationThreshold(address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public getReserveLiquidationBonus(_reserve: string): ContractFunctionObj<BigNumber> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "getReserveLiquidationBonus(address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public getReserveCurrentVariableBorrowRate(_reserve: string): ContractFunctionObj<BigNumber> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "getReserveCurrentVariableBorrowRate(address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public getReserveCurrentStableBorrowRate(_reserve: string): ContractFunctionObj<BigNumber> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "getReserveCurrentStableBorrowRate(address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public getReserveCurrentAverageStableBorrowRate(_reserve: string): ContractFunctionObj<BigNumber> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "getReserveCurrentAverageStableBorrowRate(address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public getReserveCurrentLiquidityRate(_reserve: string): ContractFunctionObj<BigNumber> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "getReserveCurrentLiquidityRate(address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public getReserveLiquidityCumulativeIndex(_reserve: string): ContractFunctionObj<BigNumber> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "getReserveLiquidityCumulativeIndex(address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public getReserveVariableBorrowsCumulativeIndex(_reserve: string): ContractFunctionObj<BigNumber> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "getReserveVariableBorrowsCumulativeIndex(address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public getReserveConfiguration(_reserve: string): ContractFunctionObj<[BigNumber, BigNumber, BigNumber, boolean]> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "getReserveConfiguration(address)";

		return {
			async callAsync(
				callData: Partial<CallData> = {},
				defaultBlock?: BlockParam
			): Promise<[BigNumber, BigNumber, BigNumber, boolean]> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<[BigNumber, BigNumber, BigNumber, boolean]>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public getReserveDecimals(_reserve: string): ContractFunctionObj<BigNumber> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "getReserveDecimals(address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public isReserveBorrowingEnabled(_reserve: string): ContractFunctionObj<boolean> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "isReserveBorrowingEnabled(address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public isReserveUsageAsCollateralEnabled(_reserve: string): ContractFunctionObj<boolean> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "isReserveUsageAsCollateralEnabled(address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public getReserveIsStableBorrowRateEnabled(_reserve: string): ContractFunctionObj<boolean> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "getReserveIsStableBorrowRateEnabled(address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public getReserveIsActive(_reserve: string): ContractFunctionObj<boolean> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "getReserveIsActive(address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public getReserveIsFreezed(_reserve: string): ContractFunctionObj<boolean> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "getReserveIsFreezed(address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public getReserveLastUpdate(_reserve: string): ContractFunctionObj<BigNumber> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "getReserveLastUpdate(address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public getReserveUtilizationRate(_reserve: string): ContractFunctionObj<BigNumber> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "getReserveUtilizationRate(address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public getReserves(): ContractFunctionObj<string[]> {
		const self = (this as any) as LendingPoolCoreContract;
		const functionSignature = "getReserves()";

		return {
			async callAsync(callData: Partial<CallData> = {}, defaultBlock?: BlockParam): Promise<string[]> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<string[]>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, []);
			},
		};
	}
	public isUserUseReserveAsCollateralEnabled(_reserve: string, _user: string): ContractFunctionObj<boolean> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		assert.isString("_user", _user);
		const functionSignature = "isUserUseReserveAsCollateralEnabled(address,address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase(), _user.toLowerCase()]);
			},
		};
	}
	public getUserOriginationFee(_reserve: string, _user: string): ContractFunctionObj<BigNumber> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		assert.isString("_user", _user);
		const functionSignature = "getUserOriginationFee(address,address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase(), _user.toLowerCase()]);
			},
		};
	}
	public getUserCurrentBorrowRateMode(_reserve: string, _user: string): ContractFunctionObj<BigNumber> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		assert.isString("_user", _user);
		const functionSignature = "getUserCurrentBorrowRateMode(address,address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase(), _user.toLowerCase()]);
			},
		};
	}
	public getUserCurrentStableBorrowRate(_reserve: string, _user: string): ContractFunctionObj<BigNumber> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		assert.isString("_user", _user);
		const functionSignature = "getUserCurrentStableBorrowRate(address,address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase(), _user.toLowerCase()]);
			},
		};
	}
	public getUserBorrowBalances(
		_reserve: string,
		_user: string
	): ContractFunctionObj<[BigNumber, BigNumber, BigNumber]> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		assert.isString("_user", _user);
		const functionSignature = "getUserBorrowBalances(address,address)";

		return {
			async callAsync(
				callData: Partial<CallData> = {},
				defaultBlock?: BlockParam
			): Promise<[BigNumber, BigNumber, BigNumber]> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<[BigNumber, BigNumber, BigNumber]>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase(), _user.toLowerCase()]);
			},
		};
	}
	public getUserVariableBorrowCumulativeIndex(_reserve: string, _user: string): ContractFunctionObj<BigNumber> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		assert.isString("_user", _user);
		const functionSignature = "getUserVariableBorrowCumulativeIndex(address,address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase(), _user.toLowerCase()]);
			},
		};
	}
	public getUserLastUpdate(_reserve: string, _user: string): ContractFunctionObj<BigNumber> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		assert.isString("_user", _user);
		const functionSignature = "getUserLastUpdate(address,address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase(), _user.toLowerCase()]);
			},
		};
	}
	public refreshConfiguration(): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolCoreContract;
		const functionSignature = "refreshConfiguration()";

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
	public initReserve(
		_reserve: string,
		_aTokenAddress: string,
		_decimals: BigNumber,
		_interestRateStrategyAddress: string
	): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		assert.isString("_aTokenAddress", _aTokenAddress);
		assert.isBigNumber("_decimals", _decimals);
		assert.isString("_interestRateStrategyAddress", _interestRateStrategyAddress);
		const functionSignature = "initReserve(address,address,uint256,address)";

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
				return self._strictEncodeArguments(functionSignature, [
					_reserve.toLowerCase(),
					_aTokenAddress.toLowerCase(),
					_decimals,
					_interestRateStrategyAddress.toLowerCase(),
				]);
			},
		};
	}
	public setReserveInterestRateStrategyAddress(
		_reserve: string,
		_rateStrategyAddress: string
	): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		assert.isString("_rateStrategyAddress", _rateStrategyAddress);
		const functionSignature = "setReserveInterestRateStrategyAddress(address,address)";

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
				return self._strictEncodeArguments(functionSignature, [
					_reserve.toLowerCase(),
					_rateStrategyAddress.toLowerCase(),
				]);
			},
		};
	}
	public enableBorrowingOnReserve(_reserve: string, _stableBorrowRateEnabled: boolean): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		assert.isBoolean("_stableBorrowRateEnabled", _stableBorrowRateEnabled);
		const functionSignature = "enableBorrowingOnReserve(address,bool)";

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
				return self._strictEncodeArguments(functionSignature, [
					_reserve.toLowerCase(),
					_stableBorrowRateEnabled,
				]);
			},
		};
	}
	public disableBorrowingOnReserve(_reserve: string): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "disableBorrowingOnReserve(address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public enableReserveAsCollateral(
		_reserve: string,
		_baseLTVasCollateral: BigNumber,
		_liquidationThreshold: BigNumber,
		_liquidationBonus: BigNumber
	): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		assert.isBigNumber("_baseLTVasCollateral", _baseLTVasCollateral);
		assert.isBigNumber("_liquidationThreshold", _liquidationThreshold);
		assert.isBigNumber("_liquidationBonus", _liquidationBonus);
		const functionSignature = "enableReserveAsCollateral(address,uint256,uint256,uint256)";

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
				return self._strictEncodeArguments(functionSignature, [
					_reserve.toLowerCase(),
					_baseLTVasCollateral,
					_liquidationThreshold,
					_liquidationBonus,
				]);
			},
		};
	}
	public disableReserveAsCollateral(_reserve: string): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "disableReserveAsCollateral(address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public enableReserveStableBorrowRate(_reserve: string): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "enableReserveStableBorrowRate(address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public disableReserveStableBorrowRate(_reserve: string): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "disableReserveStableBorrowRate(address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public activateReserve(_reserve: string): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "activateReserve(address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public deactivateReserve(_reserve: string): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "deactivateReserve(address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public freezeReserve(_reserve: string): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "freezeReserve(address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public unfreezeReserve(_reserve: string): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "unfreezeReserve(address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public setReserveBaseLTVasCollateral(_reserve: string, _ltv: BigNumber): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		assert.isBigNumber("_ltv", _ltv);
		const functionSignature = "setReserveBaseLTVasCollateral(address,uint256)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase(), _ltv]);
			},
		};
	}
	public setReserveLiquidationThreshold(_reserve: string, _threshold: BigNumber): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		assert.isBigNumber("_threshold", _threshold);
		const functionSignature = "setReserveLiquidationThreshold(address,uint256)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase(), _threshold]);
			},
		};
	}
	public setReserveLiquidationBonus(_reserve: string, _bonus: BigNumber): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		assert.isBigNumber("_bonus", _bonus);
		const functionSignature = "setReserveLiquidationBonus(address,uint256)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase(), _bonus]);
			},
		};
	}
	public setReserveDecimals(_reserve: string, _decimals: BigNumber): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolCoreContract;
		assert.isString("_reserve", _reserve);
		assert.isBigNumber("_decimals", _decimals);
		const functionSignature = "setReserveDecimals(address,uint256)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase(), _decimals]);
			},
		};
	}

	/**
	 * Subscribe to an event type emitted by the LendingPoolCore contract.
	 * @param eventName The LendingPoolCore contract event you would like to subscribe to.
	 * @param indexFilterValues An object where the keys are indexed args returned by the event and
	 * the value is the value you are interested in. E.g `{maker: aUserAddressHex}`
	 * @param callback Callback that gets called when a log is added/removed
	 * @param isVerbose Enable verbose subscription warnings (e.g recoverable network issues encountered)
	 * @return Subscription token used later to unsubscribe
	 */
	public subscribe<ArgsType extends LendingPoolCoreEventArgs>(
		eventName: LendingPoolCoreEvents,
		indexFilterValues: IndexedFilterValues,
		callback: EventCallback<ArgsType>,
		isVerbose: boolean = false,
		blockPollingIntervalMs?: number
	): string {
		assert.doesBelongToStringEnum("eventName", eventName, LendingPoolCoreEvents);
		assert.doesConformToSchema("indexFilterValues", indexFilterValues, schemas.indexFilterValuesSchema);
		assert.isFunction("callback", callback);
		const subscriptionToken = this._subscriptionManager.subscribe<ArgsType>(
			this.address,
			eventName,
			indexFilterValues,
			LendingPoolCoreContract.ABI(),
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
	 * @param eventName The LendingPoolCore contract event you would like to subscribe to.
	 * @param blockRange Block range to get logs from.
	 * @param indexFilterValues An object where the keys are indexed args returned by the event and
	 * the value is the value you are interested in. E.g `{_from: aUserAddressHex}`
	 * @return Array of logs that match the parameters
	 */
	public async getLogsAsync<ArgsType extends LendingPoolCoreEventArgs>(
		eventName: LendingPoolCoreEvents,
		blockRange: BlockRange,
		indexFilterValues: IndexedFilterValues
	): Promise<Array<LogWithDecodedArgs<ArgsType>>> {
		assert.doesBelongToStringEnum("eventName", eventName, LendingPoolCoreEvents);
		assert.doesConformToSchema("blockRange", blockRange, schemas.blockRangeSchema);
		assert.doesConformToSchema("indexFilterValues", indexFilterValues, schemas.indexFilterValuesSchema);
		const logs = await this._subscriptionManager.getLogsAsync<ArgsType>(
			this.address,
			eventName,
			blockRange,
			indexFilterValues,
			LendingPoolCoreContract.ABI()
		);
		return logs;
	}
	constructor(
		address: string,
		supportedProvider: SupportedProvider,
		txDefaults?: Partial<TxData>,
		logDecodeDependencies?: { [contractName: string]: ContractAbi },
		deployedBytecode: string | undefined = LendingPoolCoreContract.deployedBytecode
	) {
		super(
			"LendingPoolCore",
			LendingPoolCoreContract.ABI(),
			address,
			supportedProvider,
			txDefaults,
			logDecodeDependencies,
			deployedBytecode
		);
		classUtils.bindAll(this, ["_abiEncoderByFunctionSignature", "address", "_web3Wrapper"]);
		this._subscriptionManager = new SubscriptionManager<LendingPoolCoreEventArgs, LendingPoolCoreEvents>(
			LendingPoolCoreContract.ABI(),
			this._web3Wrapper
		);
		LendingPoolCoreContract.ABI().forEach((item, index) => {
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
