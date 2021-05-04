import { BigNumber } from "bignumber.js";

export enum SigningMethod {
	Compatibility = "Compatibility", // picks intelligently between UnsafeHash and Hash
	UnsafeHash = "UnsafeHash", // raw hash signed
	Hash = "Hash", // hash prepended according to EIP-191
	TypedData = "TypedData", // order hashed according to EIP-712
	MetaMask = "MetaMask", // order hashed according to EIP-712 (MetaMask-only)
	MetaMaskLatest = "MetaMaskLatest", // ... according to latest version of EIP-712 (MetaMask-only)
	CoinbaseWallet = "CoinbaseWallet", // ... according to latest version of EIP-712 (CoinbaseWallet)
}

export enum SIGNATURE_TYPES {
	NO_PREPEND = 0,
	DECIMAL = 1,
	HEXADECIMAL = 2,
}

export const MarketId = {
	WETH: new BigNumber(0),
	SAI: new BigNumber(1),
	USDC: new BigNumber(2),
	DAI: new BigNumber(3),

	// This market number does not exist on the protocol,
	// but can be used for standard actions
	ETH: new BigNumber(-1),
};

export const EIP712_DOMAIN_STRING: string =
	"EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)";

export const EIP712_DOMAIN_STRUCT = [
	{ name: "name", type: "string" },
	{ name: "version", type: "string" },
	{ name: "chainId", type: "uint256" },
	{ name: "verifyingContract", type: "address" },
];

export enum ProxyType {
	None = "None",
	Payable = "Payable",
	Sender = "Sender",
	Signed = "Sender",
}

export enum ApiMarketName {
	WETH_DAI = "WETH-DAI",
	WETH_USDC = "WETH-USDC",
	DAI_USDC = "DAI-USDC",
}

export enum ActionType {
	Deposit = 0,
	Withdraw = 1,
	Transfer = 2,
	Buy = 3,
	Sell = 4,
	Trade = 5,
	Liquidate = 6,
	Vaporize = 7,
	Call = 8,
}

export enum ExpiryV2CallFunctionType {
	SetExpiry = 0,
	SetApproval = 1,
}

export enum LimitOrderCallFunctionType {
	Approve = 0,
	Cancel = 1,
	SetFillArgs = 2,
}

export enum AmountDenomination {
	Actual = 0,
	Principal = 1,
	Wei = 0,
	Par = 1,
}
export enum AmountReference {
	Delta = 0,
	Target = 1,
}

export enum ConfirmationType {
	Hash = 0,
	Confirmed = 1,
	Both = 2,
	Simulate = 3,
}
