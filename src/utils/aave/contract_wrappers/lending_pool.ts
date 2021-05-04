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

export type LendingPoolEventArgs =
	| LendingPoolBorrowEventArgs
	| LendingPoolDepositEventArgs
	| LendingPoolFlashLoanEventArgs
	| LendingPoolLiquidationCallEventArgs
	| LendingPoolOriginationFeeLiquidatedEventArgs
	| LendingPoolRebalanceStableBorrowRateEventArgs
	| LendingPoolRedeemUnderlyingEventArgs
	| LendingPoolRepayEventArgs
	| LendingPoolReserveUsedAsCollateralDisabledEventArgs
	| LendingPoolReserveUsedAsCollateralEnabledEventArgs
	| LendingPoolSwapEventArgs;

export enum LendingPoolEvents {
	Borrow = "Borrow",
	Deposit = "Deposit",
	FlashLoan = "FlashLoan",
	LiquidationCall = "LiquidationCall",
	OriginationFeeLiquidated = "OriginationFeeLiquidated",
	RebalanceStableBorrowRate = "RebalanceStableBorrowRate",
	RedeemUnderlying = "RedeemUnderlying",
	Repay = "Repay",
	ReserveUsedAsCollateralDisabled = "ReserveUsedAsCollateralDisabled",
	ReserveUsedAsCollateralEnabled = "ReserveUsedAsCollateralEnabled",
	Swap = "Swap",
}

export interface LendingPoolBorrowEventArgs extends DecodedLogArgs {
	_reserve: string;
	_user: string;
	_amount: BigNumber;
	_borrowRateMode: BigNumber;
	_borrowRate: BigNumber;
	_originationFee: BigNumber;
	_borrowBalanceIncrease: BigNumber;
	_referral: BigNumber;
	_timestamp: BigNumber;
}

export interface LendingPoolDepositEventArgs extends DecodedLogArgs {
	_reserve: string;
	_user: string;
	_amount: BigNumber;
	_referral: BigNumber;
	_timestamp: BigNumber;
}

export interface LendingPoolFlashLoanEventArgs extends DecodedLogArgs {
	_target: string;
	_reserve: string;
	_amount: BigNumber;
	_totalFee: BigNumber;
	_protocolFee: BigNumber;
	_timestamp: BigNumber;
}

export interface LendingPoolLiquidationCallEventArgs extends DecodedLogArgs {
	_collateral: string;
	_reserve: string;
	_user: string;
	_purchaseAmount: BigNumber;
	_liquidatedCollateralAmount: BigNumber;
	_accruedBorrowInterest: BigNumber;
	_liquidator: string;
	_receiveAToken: boolean;
	_timestamp: BigNumber;
}

export interface LendingPoolOriginationFeeLiquidatedEventArgs extends DecodedLogArgs {
	_collateral: string;
	_reserve: string;
	_user: string;
	_feeLiquidated: BigNumber;
	_liquidatedCollateralForFee: BigNumber;
	_timestamp: BigNumber;
}

export interface LendingPoolRebalanceStableBorrowRateEventArgs extends DecodedLogArgs {
	_reserve: string;
	_user: string;
	_newStableRate: BigNumber;
	_borrowBalanceIncrease: BigNumber;
	_timestamp: BigNumber;
}

export interface LendingPoolRedeemUnderlyingEventArgs extends DecodedLogArgs {
	_reserve: string;
	_user: string;
	_amount: BigNumber;
	_timestamp: BigNumber;
}

export interface LendingPoolRepayEventArgs extends DecodedLogArgs {
	_reserve: string;
	_user: string;
	_repayer: string;
	_amountMinusFees: BigNumber;
	_fees: BigNumber;
	_borrowBalanceIncrease: BigNumber;
	_timestamp: BigNumber;
}

export interface LendingPoolReserveUsedAsCollateralDisabledEventArgs extends DecodedLogArgs {
	_reserve: string;
	_user: string;
}

export interface LendingPoolReserveUsedAsCollateralEnabledEventArgs extends DecodedLogArgs {
	_reserve: string;
	_user: string;
}

export interface LendingPoolSwapEventArgs extends DecodedLogArgs {
	_reserve: string;
	_user: string;
	_newRateMode: BigNumber;
	_newRate: BigNumber;
	_borrowBalanceIncrease: BigNumber;
	_timestamp: BigNumber;
}

/* istanbul ignore next */
// tslint:disable:no-parameter-reassignment
// tslint:disable-next-line:class-name
export class LendingPoolContract extends BaseContract {
	/**
	 * @ignore
	 */
	public static deployedBytecode: string | undefined;
	public static contractName = "LendingPool";
	private readonly _methodABIIndex: { [name: string]: number } = {};
	private readonly _subscriptionManager: SubscriptionManager<LendingPoolEventArgs, LendingPoolEvents>;
	public static async deployFrom0xArtifactAsync(
		artifact: ContractArtifact | SimpleContractArtifact,
		supportedProvider: SupportedProvider,
		txDefaults: Partial<TxData>,
		logDecodeDependencies: { [contractName: string]: ContractArtifact | SimpleContractArtifact }
	): Promise<LendingPoolContract> {
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
		return LendingPoolContract.deployAsync(bytecode, abi, provider, txDefaults, logDecodeDependenciesAbiOnly);
	}
	public static async deployAsync(
		bytecode: string,
		abi: ContractAbi,
		supportedProvider: SupportedProvider,
		txDefaults: Partial<TxData>,
		logDecodeDependencies: { [contractName: string]: ContractAbi }
	): Promise<LendingPoolContract> {
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
		logUtils.log(`LendingPool successfully deployed at ${txReceipt.contractAddress}`);
		const contractInstance = new LendingPoolContract(
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
						name: "_reserve",
						type: "address",
						indexed: true,
					},
					{
						name: "_user",
						type: "address",
						indexed: true,
					},
					{
						name: "_amount",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_borrowRateMode",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_borrowRate",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_originationFee",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_borrowBalanceIncrease",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_referral",
						type: "uint16",
						indexed: true,
					},
					{
						name: "_timestamp",
						type: "uint256",
						indexed: false,
					},
				],
				name: "Borrow",
				outputs: [],
				type: "event",
			},
			{
				anonymous: false,
				inputs: [
					{
						name: "_reserve",
						type: "address",
						indexed: true,
					},
					{
						name: "_user",
						type: "address",
						indexed: true,
					},
					{
						name: "_amount",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_referral",
						type: "uint16",
						indexed: true,
					},
					{
						name: "_timestamp",
						type: "uint256",
						indexed: false,
					},
				],
				name: "Deposit",
				outputs: [],
				type: "event",
			},
			{
				anonymous: false,
				inputs: [
					{
						name: "_target",
						type: "address",
						indexed: true,
					},
					{
						name: "_reserve",
						type: "address",
						indexed: true,
					},
					{
						name: "_amount",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_totalFee",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_protocolFee",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_timestamp",
						type: "uint256",
						indexed: false,
					},
				],
				name: "FlashLoan",
				outputs: [],
				type: "event",
			},
			{
				anonymous: false,
				inputs: [
					{
						name: "_collateral",
						type: "address",
						indexed: true,
					},
					{
						name: "_reserve",
						type: "address",
						indexed: true,
					},
					{
						name: "_user",
						type: "address",
						indexed: true,
					},
					{
						name: "_purchaseAmount",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_liquidatedCollateralAmount",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_accruedBorrowInterest",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_liquidator",
						type: "address",
						indexed: false,
					},
					{
						name: "_receiveAToken",
						type: "bool",
						indexed: false,
					},
					{
						name: "_timestamp",
						type: "uint256",
						indexed: false,
					},
				],
				name: "LiquidationCall",
				outputs: [],
				type: "event",
			},
			{
				anonymous: false,
				inputs: [
					{
						name: "_collateral",
						type: "address",
						indexed: true,
					},
					{
						name: "_reserve",
						type: "address",
						indexed: true,
					},
					{
						name: "_user",
						type: "address",
						indexed: true,
					},
					{
						name: "_feeLiquidated",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_liquidatedCollateralForFee",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_timestamp",
						type: "uint256",
						indexed: false,
					},
				],
				name: "OriginationFeeLiquidated",
				outputs: [],
				type: "event",
			},
			{
				anonymous: false,
				inputs: [
					{
						name: "_reserve",
						type: "address",
						indexed: true,
					},
					{
						name: "_user",
						type: "address",
						indexed: true,
					},
					{
						name: "_newStableRate",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_borrowBalanceIncrease",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_timestamp",
						type: "uint256",
						indexed: false,
					},
				],
				name: "RebalanceStableBorrowRate",
				outputs: [],
				type: "event",
			},
			{
				anonymous: false,
				inputs: [
					{
						name: "_reserve",
						type: "address",
						indexed: true,
					},
					{
						name: "_user",
						type: "address",
						indexed: true,
					},
					{
						name: "_amount",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_timestamp",
						type: "uint256",
						indexed: false,
					},
				],
				name: "RedeemUnderlying",
				outputs: [],
				type: "event",
			},
			{
				anonymous: false,
				inputs: [
					{
						name: "_reserve",
						type: "address",
						indexed: true,
					},
					{
						name: "_user",
						type: "address",
						indexed: true,
					},
					{
						name: "_repayer",
						type: "address",
						indexed: true,
					},
					{
						name: "_amountMinusFees",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_fees",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_borrowBalanceIncrease",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_timestamp",
						type: "uint256",
						indexed: false,
					},
				],
				name: "Repay",
				outputs: [],
				type: "event",
			},
			{
				anonymous: false,
				inputs: [
					{
						name: "_reserve",
						type: "address",
						indexed: true,
					},
					{
						name: "_user",
						type: "address",
						indexed: true,
					},
				],
				name: "ReserveUsedAsCollateralDisabled",
				outputs: [],
				type: "event",
			},
			{
				anonymous: false,
				inputs: [
					{
						name: "_reserve",
						type: "address",
						indexed: true,
					},
					{
						name: "_user",
						type: "address",
						indexed: true,
					},
				],
				name: "ReserveUsedAsCollateralEnabled",
				outputs: [],
				type: "event",
			},
			{
				anonymous: false,
				inputs: [
					{
						name: "_reserve",
						type: "address",
						indexed: true,
					},
					{
						name: "_user",
						type: "address",
						indexed: true,
					},
					{
						name: "_newRateMode",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_newRate",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_borrowBalanceIncrease",
						type: "uint256",
						indexed: false,
					},
					{
						name: "_timestamp",
						type: "uint256",
						indexed: false,
					},
				],
				name: "Swap",
				outputs: [],
				type: "event",
			},
			{
				constant: true,
				inputs: [],
				name: "LENDINGPOOL_REVISION",
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
				name: "core",
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
				name: "dataProvider",
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
				name: "parametersProvider",
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
						name: "_amount",
						type: "uint256",
					},
					{
						name: "_referralCode",
						type: "uint16",
					},
				],
				name: "deposit",
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
					{
						name: "_aTokenBalanceAfterRedeem",
						type: "uint256",
					},
				],
				name: "redeemUnderlying",
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
						name: "_amount",
						type: "uint256",
					},
					{
						name: "_interestRateMode",
						type: "uint256",
					},
					{
						name: "_referralCode",
						type: "uint16",
					},
				],
				name: "borrow",
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
						name: "_amount",
						type: "uint256",
					},
					{
						name: "_onBehalfOf",
						type: "address",
					},
				],
				name: "repay",
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
				],
				name: "swapBorrowRateMode",
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
				],
				name: "rebalanceStableBorrowRate",
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
						name: "_collateral",
						type: "address",
					},
					{
						name: "_reserve",
						type: "address",
					},
					{
						name: "_user",
						type: "address",
					},
					{
						name: "_purchaseAmount",
						type: "uint256",
					},
					{
						name: "_receiveAToken",
						type: "bool",
					},
				],
				name: "liquidationCall",
				outputs: [],
				payable: true,
				stateMutability: "payable",
				type: "function",
			},
			{
				constant: false,
				inputs: [
					{
						name: "_receiver",
						type: "address",
					},
					{
						name: "_reserve",
						type: "address",
					},
					{
						name: "_amount",
						type: "uint256",
					},
					{
						name: "_params",
						type: "bytes",
					},
				],
				name: "flashLoan",
				outputs: [],
				payable: false,
				stateMutability: "nonpayable",
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
				name: "getReserveConfigurationData",
				outputs: [
					{
						name: "ltv",
						type: "uint256",
					},
					{
						name: "liquidationThreshold",
						type: "uint256",
					},
					{
						name: "liquidationBonus",
						type: "uint256",
					},
					{
						name: "interestRateStrategyAddress",
						type: "address",
					},
					{
						name: "usageAsCollateralEnabled",
						type: "bool",
					},
					{
						name: "borrowingEnabled",
						type: "bool",
					},
					{
						name: "stableBorrowRateEnabled",
						type: "bool",
					},
					{
						name: "isActive",
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
				name: "getReserveData",
				outputs: [
					{
						name: "totalLiquidity",
						type: "uint256",
					},
					{
						name: "availableLiquidity",
						type: "uint256",
					},
					{
						name: "totalBorrowsStable",
						type: "uint256",
					},
					{
						name: "totalBorrowsVariable",
						type: "uint256",
					},
					{
						name: "liquidityRate",
						type: "uint256",
					},
					{
						name: "variableBorrowRate",
						type: "uint256",
					},
					{
						name: "stableBorrowRate",
						type: "uint256",
					},
					{
						name: "averageStableBorrowRate",
						type: "uint256",
					},
					{
						name: "utilizationRate",
						type: "uint256",
					},
					{
						name: "liquidityIndex",
						type: "uint256",
					},
					{
						name: "variableBorrowIndex",
						type: "uint256",
					},
					{
						name: "aTokenAddress",
						type: "address",
					},
					{
						name: "lastUpdateTimestamp",
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
						name: "_user",
						type: "address",
					},
				],
				name: "getUserAccountData",
				outputs: [
					{
						name: "totalLiquidityETH",
						type: "uint256",
					},
					{
						name: "totalCollateralETH",
						type: "uint256",
					},
					{
						name: "totalBorrowsETH",
						type: "uint256",
					},
					{
						name: "totalFeesETH",
						type: "uint256",
					},
					{
						name: "availableBorrowsETH",
						type: "uint256",
					},
					{
						name: "currentLiquidationThreshold",
						type: "uint256",
					},
					{
						name: "ltv",
						type: "uint256",
					},
					{
						name: "healthFactor",
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
				name: "getUserReserveData",
				outputs: [
					{
						name: "currentATokenBalance",
						type: "uint256",
					},
					{
						name: "currentBorrowBalance",
						type: "uint256",
					},
					{
						name: "principalBorrowBalance",
						type: "uint256",
					},
					{
						name: "borrowRateMode",
						type: "uint256",
					},
					{
						name: "borrowRate",
						type: "uint256",
					},
					{
						name: "liquidityRate",
						type: "uint256",
					},
					{
						name: "originationFee",
						type: "uint256",
					},
					{
						name: "variableBorrowIndex",
						type: "uint256",
					},
					{
						name: "lastUpdateTimestamp",
						type: "uint256",
					},
					{
						name: "usageAsCollateralEnabled",
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
		] as ContractAbi;
		return abi;
	}

	public getFunctionSignature(methodName: string): string {
		const index = this._methodABIIndex[methodName];
		const methodAbi = LendingPoolContract.ABI()[index] as MethodAbi; // tslint:disable-line:no-unnecessary-type-assertion
		const functionSignature = methodAbiToFunctionSignature(methodAbi);
		return functionSignature;
	}
	public getABIDecodedTransactionData<T>(methodName: string, callData: string): T {
		const functionSignature = this.getFunctionSignature(methodName);
		const self = (this as any) as LendingPoolContract;
		const abiEncoder = self._lookupAbiEncoder(functionSignature);
		const abiDecodedCallData = abiEncoder.strictDecode<T>(callData);
		return abiDecodedCallData;
	}
	public getABIDecodedReturnData<T>(methodName: string, callData: string): T {
		const functionSignature = this.getFunctionSignature(methodName);
		const self = (this as any) as LendingPoolContract;
		const abiEncoder = self._lookupAbiEncoder(functionSignature);
		const abiDecodedCallData = abiEncoder.strictDecodeReturnValue<T>(callData);
		return abiDecodedCallData;
	}
	public getSelector(methodName: string): string {
		const functionSignature = this.getFunctionSignature(methodName);
		const self = (this as any) as LendingPoolContract;
		const abiEncoder = self._lookupAbiEncoder(functionSignature);
		return abiEncoder.getSelector();
	}

	public LENDINGPOOL_REVISION(): ContractFunctionObj<BigNumber> {
		const self = (this as any) as LendingPoolContract;
		const functionSignature = "LENDINGPOOL_REVISION()";

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
	public UINT_MAX_VALUE(): ContractFunctionObj<BigNumber> {
		const self = (this as any) as LendingPoolContract;
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
	public addressesProvider(): ContractFunctionObj<string> {
		const self = (this as any) as LendingPoolContract;
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
	public core(): ContractFunctionObj<string> {
		const self = (this as any) as LendingPoolContract;
		const functionSignature = "core()";

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
	public dataProvider(): ContractFunctionObj<string> {
		const self = (this as any) as LendingPoolContract;
		const functionSignature = "dataProvider()";

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
	public parametersProvider(): ContractFunctionObj<string> {
		const self = (this as any) as LendingPoolContract;
		const functionSignature = "parametersProvider()";

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
	public initialize(_addressesProvider: string): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolContract;
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
	public deposit(
		_reserve: string,
		_amount: BigNumber,
		_referralCode: number | BigNumber
	): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolContract;
		assert.isString("_reserve", _reserve);
		assert.isBigNumber("_amount", _amount);
		assert.isNumberOrBigNumber("_referralCode", _referralCode);
		const functionSignature = "deposit(address,uint256,uint16)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase(), _amount, _referralCode]);
			},
		};
	}
	public redeemUnderlying(
		_reserve: string,
		_user: string,
		_amount: BigNumber,
		_aTokenBalanceAfterRedeem: BigNumber
	): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolContract;
		assert.isString("_reserve", _reserve);
		assert.isString("_user", _user);
		assert.isBigNumber("_amount", _amount);
		assert.isBigNumber("_aTokenBalanceAfterRedeem", _aTokenBalanceAfterRedeem);
		const functionSignature = "redeemUnderlying(address,address,uint256,uint256)";

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
					_aTokenBalanceAfterRedeem,
				]);
			},
		};
	}
	public borrow(
		_reserve: string,
		_amount: BigNumber,
		_interestRateMode: BigNumber,
		_referralCode: number | BigNumber
	): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolContract;
		assert.isString("_reserve", _reserve);
		assert.isBigNumber("_amount", _amount);
		assert.isBigNumber("_interestRateMode", _interestRateMode);
		assert.isNumberOrBigNumber("_referralCode", _referralCode);
		const functionSignature = "borrow(address,uint256,uint256,uint16)";

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
					_amount,
					_interestRateMode,
					_referralCode,
				]);
			},
		};
	}
	public repay(_reserve: string, _amount: BigNumber, _onBehalfOf: string): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolContract;
		assert.isString("_reserve", _reserve);
		assert.isBigNumber("_amount", _amount);
		assert.isString("_onBehalfOf", _onBehalfOf);
		const functionSignature = "repay(address,uint256,address)";

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
					_amount,
					_onBehalfOf.toLowerCase(),
				]);
			},
		};
	}
	public swapBorrowRateMode(_reserve: string): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "swapBorrowRateMode(address)";

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
	public rebalanceStableBorrowRate(_reserve: string, _user: string): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolContract;
		assert.isString("_reserve", _reserve);
		assert.isString("_user", _user);
		const functionSignature = "rebalanceStableBorrowRate(address,address)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase(), _user.toLowerCase()]);
			},
		};
	}
	public setUserUseReserveAsCollateral(_reserve: string, _useAsCollateral: boolean): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolContract;
		assert.isString("_reserve", _reserve);
		assert.isBoolean("_useAsCollateral", _useAsCollateral);
		const functionSignature = "setUserUseReserveAsCollateral(address,bool)";

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
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase(), _useAsCollateral]);
			},
		};
	}
	public liquidationCall(
		_collateral: string,
		_reserve: string,
		_user: string,
		_purchaseAmount: BigNumber,
		_receiveAToken: boolean
	): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolContract;
		assert.isString("_collateral", _collateral);
		assert.isString("_reserve", _reserve);
		assert.isString("_user", _user);
		assert.isBigNumber("_purchaseAmount", _purchaseAmount);
		assert.isBoolean("_receiveAToken", _receiveAToken);
		const functionSignature = "liquidationCall(address,address,address,uint256,bool)";

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
					_collateral.toLowerCase(),
					_reserve.toLowerCase(),
					_user.toLowerCase(),
					_purchaseAmount,
					_receiveAToken,
				]);
			},
		};
	}
	public flashLoan(
		_receiver: string,
		_reserve: string,
		_amount: BigNumber,
		_params: string
	): ContractTxFunctionObj<void> {
		const self = (this as any) as LendingPoolContract;
		assert.isString("_receiver", _receiver);
		assert.isString("_reserve", _reserve);
		assert.isBigNumber("_amount", _amount);
		assert.isString("_params", _params);
		const functionSignature = "flashLoan(address,address,uint256,bytes)";

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
					_receiver.toLowerCase(),
					_reserve.toLowerCase(),
					_amount,
					_params,
				]);
			},
		};
	}
	public getReserveConfigurationData(
		_reserve: string
	): ContractFunctionObj<[BigNumber, BigNumber, BigNumber, string, boolean, boolean, boolean, boolean]> {
		const self = (this as any) as LendingPoolContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "getReserveConfigurationData(address)";

		return {
			async callAsync(
				callData: Partial<CallData> = {},
				defaultBlock?: BlockParam
			): Promise<[BigNumber, BigNumber, BigNumber, string, boolean, boolean, boolean, boolean]> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<
					[BigNumber, BigNumber, BigNumber, string, boolean, boolean, boolean, boolean]
				>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public getReserveData(
		_reserve: string
	): ContractFunctionObj<
		[
			BigNumber,
			BigNumber,
			BigNumber,
			BigNumber,
			BigNumber,
			BigNumber,
			BigNumber,
			BigNumber,
			BigNumber,
			BigNumber,
			BigNumber,
			string,
			BigNumber
		]
	> {
		const self = (this as any) as LendingPoolContract;
		assert.isString("_reserve", _reserve);
		const functionSignature = "getReserveData(address)";

		return {
			async callAsync(
				callData: Partial<CallData> = {},
				defaultBlock?: BlockParam
			): Promise<
				[
					BigNumber,
					BigNumber,
					BigNumber,
					BigNumber,
					BigNumber,
					BigNumber,
					BigNumber,
					BigNumber,
					BigNumber,
					BigNumber,
					BigNumber,
					string,
					BigNumber
				]
			> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<
					[
						BigNumber,
						BigNumber,
						BigNumber,
						BigNumber,
						BigNumber,
						BigNumber,
						BigNumber,
						BigNumber,
						BigNumber,
						BigNumber,
						BigNumber,
						string,
						BigNumber
					]
				>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase()]);
			},
		};
	}
	public getUserAccountData(
		_user: string
	): ContractFunctionObj<[BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber]> {
		const self = (this as any) as LendingPoolContract;
		assert.isString("_user", _user);
		const functionSignature = "getUserAccountData(address)";

		return {
			async callAsync(
				callData: Partial<CallData> = {},
				defaultBlock?: BlockParam
			): Promise<[BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber]> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<
					[BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber]
				>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, [_user.toLowerCase()]);
			},
		};
	}
	public getUserReserveData(
		_reserve: string,
		_user: string
	): ContractFunctionObj<
		[BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, boolean]
	> {
		const self = (this as any) as LendingPoolContract;
		assert.isString("_reserve", _reserve);
		assert.isString("_user", _user);
		const functionSignature = "getUserReserveData(address,address)";

		return {
			async callAsync(
				callData: Partial<CallData> = {},
				defaultBlock?: BlockParam
			): Promise<
				[
					BigNumber,
					BigNumber,
					BigNumber,
					BigNumber,
					BigNumber,
					BigNumber,
					BigNumber,
					BigNumber,
					BigNumber,
					boolean
				]
			> {
				BaseContract._assertCallParams(callData, defaultBlock);
				const rawCallResult = await self._performCallAsync(
					{ ...callData, data: this.getABIEncodedTransactionData() },
					defaultBlock
				);
				const abiEncoder = self._lookupAbiEncoder(functionSignature);
				return abiEncoder.strictDecodeReturnValue<
					[
						BigNumber,
						BigNumber,
						BigNumber,
						BigNumber,
						BigNumber,
						BigNumber,
						BigNumber,
						BigNumber,
						BigNumber,
						boolean
					]
				>(rawCallResult);
			},
			getABIEncodedTransactionData(): string {
				return self._strictEncodeArguments(functionSignature, [_reserve.toLowerCase(), _user.toLowerCase()]);
			},
		};
	}
	public getReserves(): ContractFunctionObj<string[]> {
		const self = (this as any) as LendingPoolContract;
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

	/**
	 * Subscribe to an event type emitted by the LendingPool contract.
	 * @param eventName The LendingPool contract event you would like to subscribe to.
	 * @param indexFilterValues An object where the keys are indexed args returned by the event and
	 * the value is the value you are interested in. E.g `{maker: aUserAddressHex}`
	 * @param callback Callback that gets called when a log is added/removed
	 * @param isVerbose Enable verbose subscription warnings (e.g recoverable network issues encountered)
	 * @return Subscription token used later to unsubscribe
	 */
	public subscribe<ArgsType extends LendingPoolEventArgs>(
		eventName: LendingPoolEvents,
		indexFilterValues: IndexedFilterValues,
		callback: EventCallback<ArgsType>,
		isVerbose: boolean = false,
		blockPollingIntervalMs?: number
	): string {
		assert.doesBelongToStringEnum("eventName", eventName, LendingPoolEvents);
		assert.doesConformToSchema("indexFilterValues", indexFilterValues, schemas.indexFilterValuesSchema);
		assert.isFunction("callback", callback);
		const subscriptionToken = this._subscriptionManager.subscribe<ArgsType>(
			this.address,
			eventName,
			indexFilterValues,
			LendingPoolContract.ABI(),
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
	 * @param eventName The LendingPool contract event you would like to subscribe to.
	 * @param blockRange Block range to get logs from.
	 * @param indexFilterValues An object where the keys are indexed args returned by the event and
	 * the value is the value you are interested in. E.g `{_from: aUserAddressHex}`
	 * @return Array of logs that match the parameters
	 */
	public async getLogsAsync<ArgsType extends LendingPoolEventArgs>(
		eventName: LendingPoolEvents,
		blockRange: BlockRange,
		indexFilterValues: IndexedFilterValues
	): Promise<Array<LogWithDecodedArgs<ArgsType>>> {
		assert.doesBelongToStringEnum("eventName", eventName, LendingPoolEvents);
		assert.doesConformToSchema("blockRange", blockRange, schemas.blockRangeSchema);
		assert.doesConformToSchema("indexFilterValues", indexFilterValues, schemas.indexFilterValuesSchema);
		const logs = await this._subscriptionManager.getLogsAsync<ArgsType>(
			this.address,
			eventName,
			blockRange,
			indexFilterValues,
			LendingPoolContract.ABI()
		);
		return logs;
	}
	constructor(
		address: string,
		supportedProvider: SupportedProvider,
		txDefaults?: Partial<TxData>,
		logDecodeDependencies?: { [contractName: string]: ContractAbi },
		deployedBytecode: string | undefined = LendingPoolContract.deployedBytecode
	) {
		super(
			"LendingPool",
			LendingPoolContract.ABI(),
			address,
			supportedProvider,
			txDefaults,
			logDecodeDependencies,
			deployedBytecode
		);
		classUtils.bindAll(this, ["_abiEncoderByFunctionSignature", "address", "_web3Wrapper"]);
		this._subscriptionManager = new SubscriptionManager<LendingPoolEventArgs, LendingPoolEvents>(
			LendingPoolContract.ABI(),
			this._web3Wrapper
		);
		LendingPoolContract.ABI().forEach((item, index) => {
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
