import { BigNumber } from "@0x/utils";

export interface ATokenData {
	token: any;
	address: string;
	name: string;
	symbol: string;
	liquidityRate: BigNumber;
	variableBorrowRate: BigNumber;
	stableBorrowRate: BigNumber;
	// dependent of connected wallet
	balance?: BigNumber;
	borrowBalance?: BigNumber;
	isUnlocked?: boolean;
	/* reserve: AReserveData;
    user_reserve: UserReservaData;*/
}

export interface AaveReserveGQLResponse {
	id: string;
	name: string;
	symbol: string;
	decimals: number;
	liquidityRate: string;
	variableBorrowRate: string;
	stableBorrowRate: string;
	averageStableBorrowRate: string;
	aToken: { id: string };
	price: { priceInEth: string };
}

export interface AReserveData {
	totalLiquidity: BigNumber;
	availableLiquidity: BigNumber;
	totalBorrowsFixed: BigNumber;
	totalBorrowsVariable: BigNumber;
	liquidityRate: BigNumber;
	variableBorrowRate: BigNumber;
	fixedBorrowRate: BigNumber;
	averageFixedBorrowRate: BigNumber;
	utilizationRate: BigNumber;
	liquidityIndexRate: BigNumber;
	variableBorrowIndex: BigNumber;
	aTokenAddress: string;
	lastUpdateTimestamp: number;
}

export interface UserAccountData {
	totalLiquidity: BigNumber;
	totalCollateralETH: BigNumber;
	totalBorrowsETH: BigNumber;
	totalFeesETH: BigNumber;
	availableBorrowsETH: BigNumber;
	currentLiquidationThreshold: BigNumber;
	ltv: BigNumber;
	healthFactor: BigNumber;
}

export interface UserReservaData {
	currentATokenBalance: BigNumber;
	currentUnderlyingBalance: BigNumber;
	currentBorrowBalance: BigNumber;
	principalBorrowBalance: BigNumber;
	borrowRateMode: BigNumber;
	borrowRate: BigNumber;
	liquidityRate: BigNumber;
	originationFee: BigNumber;
	variableBorrowIndex: BigNumber;
	lastUpdateTimestamp: BigNumber;
}

export interface AaveState {
	readonly protocol: Protocol;
	readonly aTokensData: ATokenData[];
	readonly userAccountData?: UserAccountData;
	readonly aaveLoadingState: AaveLoadingState;
	readonly aaveGlobalLoadingState: AaveGlobalLoadingState;
	readonly aaveReservesGQLResponse: AaveReserveGQLResponse[];
	readonly currency: "NATIVE" | "USD";
}

export enum AaveLoadingState {
	Done = "Done",
	Error = "Error",
	Loading = "Loading",
	NotLoaded = "NotLoaded",
}

export enum AaveGlobalLoadingState {
	Done = "Done",
	Error = "Error",
	Loading = "Loading",
	NotLoaded = "NotLoaded",
}

export enum Protocol {
	Aave = "Aave",
	Bzx = "Bzx",
}
