export const marketFilters = [
	{
		text: "ETH",
		value: "weth",
	},
	{
		text: "BTC",
		value: "wbtc",
	},
	{
		text: "USDC",
		value: "usdc",
	},
];

export const pairs = [
	{
		base: "weth",
		quote: "dai",
		config: {
			basePrecision: 3,
			pricePrecision: 5,
			minAmount: 0.01,
		},
	},
	{
		base: "wbtc",
		quote: "dai",
		config: {
			basePrecision: 3,
			pricePrecision: 5,
			minAmount: 0.01,
		},
	},
	{
		base: "usdc",
		quote: "dai",
		config: {
			basePrecision: 3,
			pricePrecision: 5,
			minAmount: 0.1,
		},
	},
	{
		base: "weth",
		quote: "usdc",
		config: {
			basePrecision: 2,
			pricePrecision: 6,
			minAmount: 0.01,
		},
	},
	{
		base: "wbtc",
		quote: "usdc",
		config: {
			basePrecision: 2,
			pricePrecision: 6,
			minAmount: 0.01,
		},
	},
	{
		base: "sdex",
		quote: "weth",
		config: {
			basePrecision: 6,
			pricePrecision: 8,
			minAmount: 0.00001,
		},
	},
	{
		base: "sdex",
		quote: "wbtc",
		config: {
			basePrecision: 6,
			pricePrecision: 8,
			minAmount: 0.00001,
		},
	},
	{
		base: "desh",
		quote: "weth",
		config: {
			basePrecision: 6,
			pricePrecision: 8,
			minAmount: 0.00001,
		},
	},
	{
		base: "desh",
		quote: "wbtc",
		config: {
			basePrecision: 6,
			pricePrecision: 8,
			minAmount: 0.00001,
		},
	},
	{
		base: "whackd",
		quote: "weth",
		config: {
			basePrecision: 0,
			pricePrecision: 8,
			minAmount: 0.1,
		},
	},
	{
		base: "whackd",
		quote: "wbtc",
		config: {
			basePrecision: 0,
			pricePrecision: 8,
			minAmount: 0.1,
		},
	},
	{
		base: "alex",
		quote: "weth",
		config: {
			basePrecision: 2,
			pricePrecision: 8,
			minAmount: 0.0001,
		},
	},
	{
		base: "alex",
		quote: "wbtc",
		config: {
			basePrecision: 2,
			pricePrecision: 8,
			minAmount: 0.0001,
		},
	},
	{
		base: "zrx",
		quote: "weth",
		config: {
			basePrecision: 2,
			pricePrecision: 5,
			minAmount: 10,
		},
	},
	{
		base: "zrx",
		quote: "wbtc",
		config: {
			basePrecision: 2,
			pricePrecision: 5,
			minAmount: 10,
		},
	},
	{
		base: "bat",
		quote: "weth",
		config: {
			basePrecision: 2,
			pricePrecision: 8,
		},
	},
	{
		base: "bat",
		quote: "wbtc",
		config: {
			basePrecision: 2,
			pricePrecision: 8,
		},
	},
	{
		base: "mkr",
		quote: "weth",
		config: {
			basePrecision: 2,
			pricePrecision: 6,
		},
	},
	{
		base: "mkr",
		quote: "wbtc",
		config: {
			basePrecision: 2,
			pricePrecision: 6,
		},
	},
	{
		base: "rep",
		quote: "weth",
		config: {
			basePrecision: 2,
			pricePrecision: 5,
		},
	},
	{
		base: "rep",
		quote: "wbtc",
		config: {
			basePrecision: 2,
			pricePrecision: 5,
		},
	},
	{
		base: "link",
		quote: "weth",
		config: {
			basePrecision: 2,
			pricePrecision: 5,
			minAmount: 1,
		},
	},
	{
		base: "link",
		quote: "wbtc",
		config: {
			basePrecision: 2,
			pricePrecision: 5,
			minAmount: 1,
		},
	},
	{
		base: "weth",
		quote: "usdt",
		config: {
			basePrecision: 2,
			pricePrecision: 6,
		},
	},
	{
		base: "wbtc",
		quote: "usdt",
		config: {
			basePrecision: 2,
			pricePrecision: 6,
		},
	},
	{
		base: "knc",
		quote: "weth",
		config: {
			basePrecision: 2,
			pricePrecision: 5,
			minAmount: 1,
		},
	},
	{
		base: "knc",
		quote: "wbtc",
		config: {
			basePrecision: 2,
			pricePrecision: 5,
			minAmount: 1,
		},
	},
	{
		base: "0xbtc",
		quote: "weth",
		config: {
			basePrecision: 2,
			pricePrecision: 8,
			minAmount: 1,
		},
	},
	{
		base: "0xbtc",
		quote: "wbtc",
		config: {
			basePrecision: 2,
			pricePrecision: 8,
			minAmount: 1,
		},
	},
];

export const ERC20_ABI = [
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
		constant: false,
		inputs: [
			{
				name: "_spender",
				type: "address",
			},
			{
				name: "_value",
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
		constant: true,
		inputs: [
			{
				name: "_owner",
				type: "address",
			},
		],
		name: "balanceOf",
		outputs: [
			{
				name: "balance",
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
				name: "_to",
				type: "address",
			},
			{
				name: "_value",
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
		constant: true,
		inputs: [
			{
				name: "_owner",
				type: "address",
			},
			{
				name: "_spender",
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
		inputs: [],
		outputs: [],
		payable: true,
		stateMutability: "payable",
		type: "fallback",
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
];

export const ServerState = {
	Done: "Done",
	Error: "Error",
	Loading: "Loading",
	NotLoaded: "NotLoaded",
};
