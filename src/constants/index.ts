import {ChainId, JSBI, Percent, Token, WETH} from "@uniswap/sdk";
import {BigNumber} from "@0x/utils";

export * from "./spot";
export * from "./derivatives";

export enum Network {
	Mainnet = 1,
	Ropsten = 3,
	Rinkeby = 4,
	Kovan = 42,
	Ganache = 50,
}

export enum ProviderType {
	Parity = "PARITY",
	MetaMask = "META_MASK",
	Mist = "MIST",
	CoinbaseWallet = "COINBASE_WALLET",
	EnjinWallet = "ENJIN_WALLET",
	Cipher = "CIPHER",
	TrustWallet = "TRUST_WALLET",
	Opera = "OPERA",
	Fallback = "FALLBACK",
	// tslint:disable-next-line: max-file-line-count
}

export const PROXY_URL = process.env.REACT_APP_PROXY_URL || "http://localhost:3001/";
export const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

export const CONTRACTS = {
	curve: "0xcCdd1f20Fd50DD63849A87994bdD11806e4363De",
	balancer: "0xA3128cC400E2878571368ae0a83F588Eb838552b",
	yVault: "0x9c57618bfCDfaE4cE8e49226Ca22A7837DE64A2d",
	uniswap: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
};

export const REMOVE_CONTRACTS = {
	curve: "0xA3061Cf6aC1423c6F40917AD49602cBA187181Dc",
	balancer: "0x00d0f137b51692D0AC708bdE7b367a373865cFfe",
	yVault: "0xB0880df8420974ef1b040111e5e0e95f05F8fee1",
	uniswap: "0x79B6C6F8634ea477ED725eC23b7b6Fcb41F00E58",
};

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const DEFAULT_DECIMALS = 18;

export const ADDRESS_PATTERN = /^[13][a-km-zA-HJ-NP-Z1-9]{25,80}$|^(bc1)[0-9A-Za-z]{25,80}$|^(0x[a-fA-F0-9]{40})$|^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;

// a list of tokens by chain
type ChainTokenList = {
	readonly [chainId in ChainId]: Token[];
};

export const DAI = new Token(
	ChainId.MAINNET,
	"0x6B175474E89094C44Da98b954EedeAC495271d0F",
	18,
	"DAI",
	"Dai Stablecoin"
);
export const USDC = new Token(ChainId.MAINNET, "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", 6, "USDC", "USD//C");
export const USDT = new Token(ChainId.MAINNET, "0xdAC17F958D2ee523a2206206994597C13D831ec7", 6, "USDT", "Tether USD");
export const COMP = new Token(ChainId.MAINNET, "0xc00e94Cb662C3520282E6f5717214004A7f26888", 18, "COMP", "Compound");
export const MKR = new Token(ChainId.MAINNET, "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2", 18, "MKR", "Maker");
export const AMPL = new Token(ChainId.MAINNET, "0xD46bA6D942050d489DBd938a2C909A5d5039A161", 9, "AMPL", "Ampleforth");
export const WBTC = new Token(ChainId.MAINNET, "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", 18, "WBTC", "Wrapped BTC");
export const OCTO = new Token(ChainId.MAINNET, "0x7240aC91f01233BaAf8b064248E80feaA5912BA3", 18, "OCTO", "Octo.fi");

export const BalanceToken = new Token(
	ChainId.MAINNET,
	process.env.REACT_APP_BALANCE_CHECK_TOKEN_ADDRESS || "",
	Number(process.env.REACT_APP_BALANCE_CHECK_TOKEN_DECIMAL),
	process.env.REACT_APP_BALANCE_CHECK_TOKEN_SYMBOL,
	process.env.REACT_APP_BALANCE_CHECK_TOKEN_NAME
);

// TODO this is only approximate, it's actually based on blocks
export const PROPOSAL_LENGTH_IN_DAYS = 7;

export const GOVERNANCE_ADDRESS = "0x5e4be8Bc9637f0EAA1A755019e06A68ce081D58F";

const UNI_ADDRESS = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";
export const UNI: { [chainId in ChainId]: Token } = {
	[ChainId.MAINNET]: new Token(ChainId.MAINNET, UNI_ADDRESS, 18, "UNI", "Uniswap"),
	[ChainId.RINKEBY]: new Token(ChainId.RINKEBY, UNI_ADDRESS, 18, "UNI", "Uniswap"),
	[ChainId.ROPSTEN]: new Token(ChainId.ROPSTEN, UNI_ADDRESS, 18, "UNI", "Uniswap"),
	[ChainId.GÖRLI]: new Token(ChainId.GÖRLI, UNI_ADDRESS, 18, "UNI", "Uniswap"),
	[ChainId.KOVAN]: new Token(ChainId.KOVAN, UNI_ADDRESS, 18, "UNI", "Uniswap"),
};

// TODO: specify merkle distributor for mainnet
export const MERKLE_DISTRIBUTOR_ADDRESS: { [chainId in ChainId]?: string } = {
	[ChainId.MAINNET]: "0x090D4613473dEE047c3f2706764f49E0821D256e",
};

const WETH_ONLY: ChainTokenList = {
	[ChainId.MAINNET]: [WETH[ChainId.MAINNET]],
	[ChainId.ROPSTEN]: [WETH[ChainId.ROPSTEN]],
	[ChainId.RINKEBY]: [WETH[ChainId.RINKEBY]],
	[ChainId.GÖRLI]: [WETH[ChainId.GÖRLI]],
	[ChainId.KOVAN]: [WETH[ChainId.KOVAN]],
};

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
	...WETH_ONLY,
	[ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], DAI, USDC, USDT, COMP, MKR],
};

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
	[ChainId.MAINNET]: {
		[AMPL.address]: [DAI, WETH[ChainId.MAINNET]],
	},
};

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {
	...WETH_ONLY,
	[ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], DAI, USDC, USDT],
};

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
	...WETH_ONLY,
	[ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], DAI, USDC, USDT],
};

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {
	[ChainId.MAINNET]: [
		[
			new Token(ChainId.MAINNET, "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643", 8, "cDAI", "Compound Dai"),
			new Token(ChainId.MAINNET, "0x39AA39c021dfbaE8faC545936693aC917d5E7563", 8, "cUSDC", "Compound USD Coin"),
		],
		[USDC, USDT],
		[DAI, USDT],
	],
};

export const NetworkContextName = "NETWORK";

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50;
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20;

export const BIG_INT_ZERO = JSBI.BigInt(0);

export const LAUNCHPAD_WETH_ADDRESS = process.env.REACT_APP_LAUNCHPAD_WETH || "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

export const LAUNCHPAD_WETH_TOKEN = new Token(ChainId.MAINNET, LAUNCHPAD_WETH_ADDRESS, 18, "ETH", "Ethereum");

export const LAUNCHPAD_WHITELIST_CONTRACTS =
	!process.env.REACT_APP_PRESALE_WHITELIST_CONTRACTS
		? []
		: process.env.REACT_APP_PRESALE_WHITELIST_CONTRACTS
			?.split(',')
			?.map(address => address?.toLowerCase());

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000));
export const BIPS_BASE = JSBI.BigInt(10000);
// used for warning state
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE); // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE); // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE); // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE); // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE); // 15%

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)); // .01 ETH
export const BETTER_TRADE_LINK_THRESHOLD = new Percent(JSBI.BigInt(75), JSBI.BigInt(10000));

export const POLLING_INTERVAL = 12000;

export const ZERO = new BigNumber(0);
export const MAX_AMOUNT_TOKENS_IN_UNITS = 100000000000000000000000000000000000;
export const UI_DECIMALS_DISPLAYED_ORDER_SIZE = 0;
export const UI_DECIMALS_DISPLAYED_PRICE_ETH = 7;
export const UI_DECIMALS_DISPLAYED_SPREAD_PERCENT = 2;

export const IS_ORDER_LIMIT_MATCHING: boolean = process.env.REACT_APP_MATCH_LIMIT_ORDERS === "true" ? true : false;

export const NOTIFICATIONS_LIMIT: number =
	Number.parseInt(process.env.REACT_APP_NOTIFICATIONS_LIMIT as string, 10) || 20;

export const FILLS_LIMIT: number = Number.parseInt(process.env.REACT_APP_FILLS_LIMIT as string, 10) || 50;

export const START_BLOCK_LIMIT: number = Number.parseInt(process.env.REACT_APP_START_BLOCK_LIMIT as string, 10) || 1000;

export const UNLIMITED_ALLOWANCE_IN_BASE_UNITS = new BigNumber(2).pow(256).minus(1);

export const COLLECTIBLES_SOURCE: string = process.env.REACT_APP_COLLECTIBLES_SOURCE || "mocked";

export const MIN_ORDER_EXPIRATION_TIME_ON_ORDERBOOK = 60;

export const TX_DEFAULTS = {
	gas: 1000000,
	// gasLimit: 1000000,
	//  gasTransferToken: 21000,
	//  shouldValidate: true,
};

export const MAKER_FEE_PERCENTAGE: string = process.env.REACT_APP_MAKER_FEE_PERCENTAGE || "0";
export const TAKER_FEE_PERCENTAGE: string = process.env.REACT_APP_TAKER_FEE_PERCENTAGE || "0";

export const UI_DECIMALS_DISPLAYED_DEFAULT_PRECISION = 2;

export const RELAYER_URL = process.env.REACT_APP_RELAYER_URL || "https://clickbackend.cloud/v3";

export const RELAYER_WS_URL = process.env.REACT_APP_RELAYER_WS_URL || "wss://clickbackend.cloud/websocket/";

export const RELAYER_RPS = 5;

export const USE_RELAYER_ORDER_CONFIG: boolean = process.env.REACT_APP_USE_RELAYER_ORDER_CONFIG === "true";

export const PROTOCOL_FEE_MULTIPLIER = 150000;

export const USE_ORDERBOOK_PRICES: boolean = process.env.USE_ORDERBOOK_PRICES === "true";
export const USE_RELAYER_MARKET_UPDATES = process.env.REACT_APP_USE_RELAYER_MARKET_UPDATES === "true";

export const CHAIN_ID: number = 1;

export const GWEI_IN_WEI = new BigNumber(1000000000);

export const ONE_MINUTE_MS = 1000 * 60;

export const DEFAULT_GAS_PRICE = GWEI_IN_WEI.multipliedBy(6);
export const LOGGER_ID: string = process.env.REACT_APP_LOGGER_ID || "defiDashboard";

export const DEFAULT_ESTIMATED_TRANSACTION_TIME_MS = ONE_MINUTE_MS * 2;
export const NETWORK_ID: number = Number.parseInt(process.env.REACT_APP_NETWORK_ID as string, 10) || 1;

const mockERC721Address = "0x07f96aa816c1f244cbc6ef114bb2b023ba54a2eb"; // Mock ERC721 in ganache
export const COLLECTIBLE_ADDRESS = process.env.REACT_APP_COLLECTIBLE_ADDRESS || mockERC721Address;

export const OPENSEA_API_KEY = process.env.REACT_APP_OPENSEA_API_KEY;

const DEFAULT_QUOTE_SLIPPAGE_PERCENTAGE = 0.03;

// Default value is enabled, 0 is disabled
export const UI_UPDATE_CHECK_INTERVAL: number = process.env.REACT_APP_UI_UPDATE_CHECK_INTERVAL
	? Number.parseInt(process.env.REACT_APP_UI_UPDATE_CHECK_INTERVAL as string, 10)
	: 5000;

// Default value is enabled, 0 is disabled
export const UPDATE_ETHER_PRICE_INTERVAL: number = process.env.REACT_APP_UPDATE_ETHER_PRICE_INTERVAL
	? Number.parseInt(process.env.REACT_APP_UPDATE_ETHER_PRICE_INTERVAL as string, 10)
	: 3600000;

// Default value is enabled, 0 is disabled
export const UPDATE_TOKENS_PRICE_INTERVAL: number = process.env.REACT_APP_UPDATE_TOKENS_PRICE_INTERVAL
	? Number.parseInt(process.env.REACT_APP_UPDATE_ETHER_PRICE_INTERVAL as string, 10)
	: 3600000;

// Default value is enabled, 0 is disabled
export const UPDATE_ERC20_MARKETS: number = process.env.REACT_APP_UPDATE_ERC20_MARKETS_INTERVAL
	? Number.parseInt(process.env.REACT_APP_UPDATE_ERC20_MARKETS_INTERVAL as string, 10)
	: 60000;

export const UPDATE_MARGIN_INTERVAL: number = 20000;

const EXCLUDED_SOURCES = (() => {
	switch (CHAIN_ID) {
		case ChainId.MAINNET:
			return [];
		default: {
			return [];
		}
	}
})();

export const SIMPLE_SWAP_FIXED = process.env.REACT_APP_SIMPLESWAP_FIXED_RATE === "true" || false;
export const FEE_RECIPIENT = process.env.REACT_APP_FEE_RECIPIENT || ZERO_ADDRESS;
export const FEE_PERCENTAGE: number = process.env.REACT_APP_SPOT_FEE_PERCENTAGE
	? Number(process.env.REACT_APP_SPOT_FEE_PERCENTAGE)
	: 0;

export const NFT_REFERRER_ACCOUNT = process.env.REACT_APP_NFT_REFERRER_ACCOUNT
	? process.env.REACT_APP_NFT_REFERRER_ACCOUNT
	: process.env.REACT_APP_REFERRER_ACCOUNT;
export const ONE_INCH_REFERRER_ACCOUNT = process.env.REACT_APP_1INCH_REFERRER_ACCOUNT
	? process.env.REACT_APP_1INCH_REFERRER_ACCOUNT
	: process.env.REACT_APP_REFERRER_ACCOUNT;
export const ONE_INCH_FEE_PERCENTAGE = process.env.REACT_APP_1INCH_REFERRER_FEE_PERCENTAGE
	? process.env.REACT_APP_1INCH_REFERRER_FEE_PERCENTAGE
	: "0";
export const PARASWAP_REFERRER_ACCOUNT = process.env.REACT_APP_PARASWAP_REFERRER
	? process.env.REACT_APP_PARASWAP_REFERRER
	: process.env.REACT_APP_REFERRER_ACCOUNT;
export const BITREFILL_REF_TOKEN = process.env.REACT_APP_BITREFILL_REF_TOKEN
	? process.env.REACT_APP_BITREFILL_REF_TOKEN
	: process.env.REACT_APP_REFERRER_ACCOUNT;

export const ASSET_SWAPPER_MARKET_ORDERS_OPTS: any = {
	// @ts-ignore
	noConflicts: true,
	excludedSources: EXCLUDED_SOURCES,
	bridgeSlippage: DEFAULT_QUOTE_SLIPPAGE_PERCENTAGE,
	// maxFallbackSlippage: DEFAULT_FALLBACK_SLIPPAGE_PERCENTAGE,
	numSamples: 13,
	sampleDistributionBase: 1.05,
	runLimit: 4096,
	dustFractionThreshold: 0.0025,
	// feeSchedule,
	// gasSchedule,
};

export const DEFAULT_THEME: boolean = process.env.REACT_APP_DEFAULT_THEME === 'dark';
export const NETWORK_NAME: string = Network[NETWORK_ID];

export const PROVIDER_TYPE_TO_NAME: { [key in ProviderType]: string } = {
	[ProviderType.Cipher]: "Cipher",
	[ProviderType.EnjinWallet]: "Enjin Wallet",
	[ProviderType.MetaMask]: "MetaMask",
	[ProviderType.Mist]: "Mist",
	[ProviderType.CoinbaseWallet]: "Coinbase Wallet",
	[ProviderType.Parity]: "Parity",
	[ProviderType.TrustWallet]: "Trust Wallet",
	[ProviderType.Opera]: "Opera Wallet",
	[ProviderType.Fallback]: "Fallback",
};

export const ONE_SECOND_MS = 1000;

export const QUOTE_ORDER_EXPIRATION_BUFFER_MS = ONE_SECOND_MS * 30;

export const CHANGE_NOW_FLOW = process.env.REACT_APP_CHANGE_NOW_FLOW || 'standard';

export const SIDE_SHIFT_TYPE = process.env.REACT_APP_SIDE_SHIFT_TYPE || 'variable';

export const presaleAddresses = {
	'generator': process.env.REACT_APP_PRESALE_GENERATOR,
	'factory': process.env.REACT_APP_PRESALE_FACTORY,
	'settings': process.env.REACT_APP_PRESALE_SETTINGS
}

export const rates: {
	[rateName: string]: {
		image: any;
		type: string;
		symbol: string;
		lng?: string;
	};
} = {
	CAD: {
		image: require("../assets/images/currencies/CAD.svg").default,
		type: "normal",
		symbol: "CA$",
		lng: "fr",
	},
	GBP: {
		image: require("../assets/images/currencies/GBP.svg").default,
		type: "normal",
		symbol: "£",
		lng: "en",
	},
	RUB: {
		image: require("../assets/images/currencies/RUB.svg").default,
		type: "normal",
		symbol: "RUB",
		lng: "ru",
	},
	JPY: {
		image: require("../assets/images/currencies/JPY.svg").default,
		type: "normal",
		symbol: "¥",
		lng: "ja",
	},
	CHF: {
		image: require("../assets/images/currencies/CHF.svg").default,
		type: "normal",
		symbol: "CHF",
		lng: "de",
	},
	EUR: {
		image: require("../assets/images/currencies/EUR.svg").default,
		type: "normal",
		symbol: "€",
		lng: "en",
	},
	INR: {
		image: require("../assets/images/currencies/INR.svg").default,
		type: "normal",
		symbol: "₹",
		lng: "hi",
	},
	CNY: {
		image: require("../assets/images/currencies/CNY.svg").default,
		type: "normal",
		symbol: "CN¥",
		lng: "zh",
	},
	NZD: {
		image: require("../assets/images/currencies/NZD.svg").default,
		type: "normal",
		symbol: "NZ$",
		lng: "en",
	},
	USD: {
		image: require("../assets/images/currencies/USD.svg").default,
		type: "normal",
		symbol: "$",
		lng: "en",
	},
	SGD: {
		image: require("../assets/images/currencies/SGD.svg").default,
		type: "normal",
		symbol: "SGD",
		lng: "en",
	},
	AUD: {
		image: require("../assets/images/currencies/AUD.svg").default,
		type: "normal",
		symbol: "A$",
		lng: "en",
	},
	KRW: {
		image: require("../assets/images/currencies/KRW.svg").default,
		type: "normal",
		symbol: "₩",
		lng: "ko",
	},
	BTC: {
		image: require("../assets/images/currencies/BTC.svg").default,
		type: "crypto",
		symbol: "₿",
		lng: "en",
	},
	ETH: {
		image: require("../assets/images/currencies/ETH.svg").default,
		type: "crypto",
		symbol: "Ξ",
		lng: "en",
	},
	LINK: {
		image: require("../assets/images/currencies/LINK.svg").default,
		type: "crypto",
		symbol: "⬡",
		lng: "en",
	},
};

export enum OrderSide {
	Sell,
	Buy,
}

export const Platforms = ["uniswap-v2", "bancor", "curve", "balancer"];

export const setProtocolConfig = {
	coreAddress: "0xf55186CC537E7067EA616F2aaE007b4427a120C8",
	exchangeIssuanceModuleAddress: "0x73dF03B5436C84Cf9d5A758fb756928DCEAf19d7",
	kyberNetworkWrapperAddress: "0x9B3Eb3B22DC2C29e878d7766276a86A8395fB56d",
	protocolViewerAddress: "0x589d4b4d311EFaAc93f0032238BecD6f4D397b0f",
	rebalanceAuctionModuleAddress: "0xe23FB31dD2edacEbF7d92720358bB92445F47fDB",
	rebalancingSetExchangeIssuanceModule: "0xd4240987D6F92B06c8B5068B1E4006A97c47392b",
	rebalancingSetIssuanceModule: "0xcEDA8318522D348f1d1aca48B24629b8FbF09020",
	rebalancingSetTokenFactoryAddress: "0x15518Cdd49d83471e9f85cdCFBD72c8e2a78dDE2",
	setTokenFactoryAddress: "0xE1Cd722575801fE92EEef2CA23396557F7E3B967",
	transferProxyAddress: "0x882d80D3a191859d64477eb78Cca46599307ec1C",
	vaultAddress: "0x5B67871C3a857dE81A1ca0f9F7945e5670D986Dc",
	wrappedEtherAddress: "0xc6449473BE76AB2a70329fA66Cbe504a25005338",
};

export const FACTORY_ADDRESSES = {
	1: '0x73a001e72f0Fe3CA366d6079dC3427af7865839b',
	2: '0x4a0b2579ef8a2a7d321f3deaaa2681c23e4eaa92', // OKB-Test
	42: '0xD3E51Ef092B2845f10401a0159B2B96e8B6c3D30',
	56: '0x73a001e72f0fe3ca366d6079dc3427af7865839b', // BNB-Main
	97: '0x7e8B5B722f1a3C5ab2bd8510EAba24dAe97565d1', // BNB-Test
	128: '0xdd2bc74e7a5e613379663e72689e668300b42f37', // HT-Main
	256: '0x87fe4ea2692aeb64dbab6593de87cc4741e20c7f', // HT-Test
	250: '0x0911fD5BCbC574c59bee6D7B772587B4A03D2778', // FTM-Test
	32659: '0xa12cba22e4c316820bf4883ebb98a3789cf194a3', // Fusion-Main
	46688: '0x421d35f8f8fd822f898e75db43f057f7ea448298', // Fusion-Test
	79377087078960: '0xb081b9acc88ea2329036a776825ab2ea2c0255d6',
	137: '0xBdEc57d323dEb07959d9fF5FFCCd5F055F313380',
	100: '0xBdEc57d323dEb07959d9fF5FFCCd5F055F313380',
	43114: '0xbFf74Da37df72695b1d7e8185edD47fD0771eE3A',
	1287: '0x9e73d56dd1942743ffdf055449b052a806b854be',
}

export const exploreSections = {
	tokens: {
		title: "Top Tokens",
		slug: "tokens",
		description: "Top tokens by Market Cap",
		data: [],
		loading: true,
		schema: (row: any) => {
			return {
				img: row.image,
				name: row.name,
				symbol: row.symbol.toUpperCase(),
				price: row.current_price,
				priceDiff: row.price_change_percentage_24h,
				title: false,
				src: "/coins/" + row.id,
			};
		},
		seeMore: "/#/invest/tokens",
	},
	tokenSets: {
		title: "Token Sets",
		slug: "sets",
		description: "Automate trading strategies with TokenSets",
		data: [],
		loading: true,
		schema: (row: any) => {
			return {
				img: row.image,
				name: row.name,
				symbol: row.short_description,
				price: row.price_usd,
				priceDiff: false,
				title: false,
			};
		},
		seeMore: "/#/invest/tokensets",
	},
	pools: {
		title: "Pools",
		slug: "pools",
		description: "Earn trading fees by providing liquidity in a single transaction",
		data: [],
		loading: true,
		schema: (row: any) => {
			return {
				img: `https://token-icons.s3.amazonaws.com/${row?.ownershipToken}.png`,
				name: row?.poolName || "-",
				symbol: row?.platform || "-",
				price: row?.usdLiquidity || "-",
				priceDiff: false,
				title: "Total Liquidity",
			};
		},
		seeMore: "/#/invest/pools",
	},
	trending: {
		title: "Trending on Coingecko",
		slug: "coingecko",
		description: "Trending coins (Top-5) on CoinGecko in the last 24 hours",
		data: [],
		loading: true,
		schema: (row: any) => {
			return {
				img: row?.image?.large,
				name: row?.name || "-",
				symbol: row?.symbol?.toUpperCase() || "-",
				price: row.market_data.current_price.usd,
				priceDiff: row.market_data.price_change_percentage_24h,
				title: false,
				src: "/coins/" + row.id,
			};
		},
		seeMore: false,
	},
	derivatives: {
		title: "Top 5 Derivatives",
		slug: "derivatives",
		description: "Top Derivatives by Volume (24h)",
		data: [],
		loading: true,
		schema: (row: any, imageComponent: any) => {
			return {
				imageComponent: imageComponent,
				name: row?.market,
				symbol: row?.symbol?.toUpperCase() || "-",
				price: row?.volume_24h,
				priceDiff: row.price_percentage_change_24h,
				seeMore: "/#/invest/derivatives",
				title: "Volume (24h)",
			};
		},
		seeMore: false,
	},
	gainers: {
		title: "Top 5 Gainer Tokens (24h)",
		slug: "gainers",
		description: "Top 5 Gainer Tokens by Price Change Percentage (24h)",
		data: [],
		loading: true,
		schema: (row: any) => {
			return {
				img: row?.image,
				name: row?.name || "-",
				symbol: row?.symbol?.toUpperCase() || "-",
				price: row?.current_price || "-",
				priceDiff: row?.price_change_percentage_24h || "-",
				title: false,
				src: "/coins/" + row?.id,
			};
		},
		seeMore: false,
	},
	losers: {
		title: "Top 5 Loser Tokens (24h)",
		slug: "losers",
		description: "Top 5 Loser Tokens by Price Change Percentage (24h)",
		data: [],
		loading: true,
		schema: (row: any) => {
			return {
				img: row?.image,
				name: row?.name || "-",
				symbol: row?.symbol?.toUpperCase() || "-",
				price: row?.current_price || "-",
				priceDiff: row?.price_change_percentage_24h || "-",
				title: false,
				src: "/coins/" + row?.id,
			};
		},
		seeMore: false,
	},
};

export const marketCoins = [
	{
		id: "cardano",
		symbol: "ADA",
		name: "Cardano",
		address: "0xAE48c91dF1fE419994FFDa27da09D5aC69c30f55",
		paprikaId: "ada-cardano",
	},
	{
		id: "bitcoin-cash",
		symbol: "BCH",
		name: "Bitcoin Cash",
		address: "0x9F0F69428F923D6c95B781F89E165C9b2df9789D",
		paprikaId: "bch-bitcoin-cash",
	},
	{
		id: "binancecoin",
		symbol: "BNB",
		name: "Binance Coin",
		address: "0x14e613AC84a31f709eadbdF89C6CC390fDc9540A",
		paprikaId: "bnb-binance-coin",
	},
	{
		id: "bancor",
		symbol: "BNT",
		name: "Bancor Network Token",
		address: "0x1E6cF0D433de4FE882A437ABC654F58E1e78548c",
		paprikaId: "bnt-bancor",
	},
	{
		id: "bitcoin",
		symbol: "BTC",
		name: "Bitcoin",
		address: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
		paprikaId: "btc-bitcoin",
		decimals: 8,
	},
	{
		id: "compound-governance-token",
		symbol: "COMP",
		name: "Compound",
		address: "0xdbd020CAeF83eFd542f4De03e3cF0C28A4428bd5",
		paprikaId: "comp-compoundd",
	},
	{
		id: "dai",
		symbol: "DAI",
		name: "Dai",
		address: "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9",
		paprikaId: "dai-dai",
	},
	{
		id: "ethereum",
		symbol: "ETH",
		name: "Ethereum",
		address: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
		paprikaId: "eth-ethereum",
		decimals: 18,
	},
	{
		id: "kyber-network",
		symbol: "KNC",
		name: "Kyber Network",
		address: "0xf8fF43E991A81e6eC886a3D281A2C6cC19aE70Fc",
		paprikaId: "knc-kyber-network",
	},
	{
		id: "ethlend",
		symbol: "LEND",
		name: "Aave",
		address: "0x4aB81192BB75474Cf203B56c36D6a13623270A67",
		paprikaId: "lend-ethlend",
	},
	{
		id: "chainlink",
		symbol: "LINK",
		name: "Chainlink",
		address: "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
		paprikaId: "link-chainlink",
	},
	{
		id: "litecoin",
		symbol: "LTC",
		name: "Litecoin",
		address: "0x6AF09DF7563C363B5763b9102712EbeD3b9e859B",
		paprikaId: "ltc-litecoin",
	},
	{
		id: "republic-protocol",
		symbol: "REN",
		name: "REN",
		address: "0x0f59666EDE214281e956cb3b2D0d69415AfF4A01",
		paprikaId: "ren-republic-protocol",
	},
	{
		id: "havven",
		symbol: "SNX",
		name: "Synthetix Network Token",
		address: "0xDC3EA94CD0AC27d9A86C180091e7f78C683d3699",
		paprikaId: "snx-synthetix-network-token",
	},
	{
		id: "ripple",
		symbol: "XRP",
		name: "XRP",
		address: "0xCed2660c6Dd1Ffd856A5A82C67f3482d88C50b12",
		paprikaId: "xrp-xrp",
	},
];

export const TYPING_INTERVAL: number = 300;

export const supportedDEXes = {
	paraswap: [
		"MultiPath",
		"ParaSwapPool",
		"Swerve",
		"Balancer",
		"SushiSwap",
		"UniswapV2",
		"Uniswap",
		"Oasis",
		"Aave",
		"Weth",
		"Bancor",
		"Kyber",
		"Compound",
		"Zerox",
		"DefiSwap",
		"LINKSWAP",
	],
	dexag: ["synthetix", "ag", "curvefi", "zero_x"],
};

export const DEXesName = {
	Weth: "Radar Relay",
	Uniswap: "Uniswap (v1)",
	UniswapV2: "Uniswap",
	Compound: "Compound",
	CHAI: "Chai",
	Oasis: "Oasis",
	Kyber: "Kyber Network",
	Aave: "Aave",
	Bancor: "Bancor",
	zero_x: "0x",
	Zerox: "0x",
	MultiPath: "MultiPath",
	ParaSwapPool: "ParaSwapPool",
	Swerve: "Swerve",
	Balancer: "Balancer",
	SushiSwap: "SushiSwap",
	synthetix: "Synthetix",
	ag: "XBalster",
	curvefi: "Curve.fi",
	godex: "GODEX.io",
	oneInch: "1inch",
	coinSwitch: "Coin Switch",
	simpleSwap: "Simple Swap",
	stealthex: "StealthEx",
	DefiSwap: "Defi Swap",
	LINKSWAP: "Link Swap",
	changeNow: "Change Now",
	sideShift: "Side Shift"
};

export const DEXesImages = {
	Weth: "RADARRELAY.jpg",
	Uniswap: "UNISWAP.svg",
	UniswapV2: "UNISWAP.svg",
	Compound: "COMPOUND.png",
	CHAI: "CHAI.png",
	Oasis: "OASIS.svg",
	Kyber: "KYBER.svg",
	Aave: "AAVE.png",
	Bancor: "BANCOR.svg",
	zero_x: "ZEROEX.png",
	Zerox: "ZEROEX.png",
	MultiPath: "PARASWAP.jpg",
	ParaSwapPool: "PARASWAP.jpg",
	Swerve: "SWERVE.png",
	Balancer: "BALANCER.svg",
	SushiSwap: "SUSHISWAP.svg",
	synthetix: "SYNTHETIX.jpg",
	ag: "XBLASTER.png",
	curvefi: "CURVEFI.png",
	godex: "GODEX.png",
	oneInch: "ONEINCH.svg",
	coinSwitch: "coinSwitch.png",
	simpleSwap: "simpleswap.png",
	stealthex: "Stealthex.png",
	DefiSwap: "defiSwap.png",
	LINKSWAP: "linkSwap.png",
	changeNow: "CHANGE_NOW.png",
	sideShift: "SIDESHIFT.png"
};

export const brokenTokens = [
	'0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
	'0x95dAaaB98046846bF4B2853e23cba236fa394A31',
	'0x55296f69f40Ea6d20E478533C15A6B08B654E758',
	'0xc3761EB917CD790B30dAD99f6Cc5b4Ff93C4F9eA',
	'0x5C406D99E04B8494dc253FCc52943Ef82bcA7D75',
	'0xa44E5137293E855B1b7bC7E2C6f8cD796fFCB037',
	'0x77599D2C6DB170224243e255e6669280F11F1473'
]

export const broken777Tokens = [
	'0x58e8a6c0e0b58bca809f1faee01f1662c9fc460e',
	'0xbdfa65533074b0b23ebc18c7190be79fa74b30c2',
	'0x5228a22e72ccc52d415ecfd199f99d0665e7733b',
	'0x9b869c2eaae08136c43d824ea75a2f376f1aa983',
	'0x09a8f2041be23e8ec3c72790c9a92089bc70fbca',
	'0x49d716dfe60b37379010a75329ae09428f17118d',
	'0x30e0c58c5670e0bdec98f29f66b092e43e98d699',
	'0x3212b29e33587a00fb1c83346f5dbfa69a458923',
	'0x5cffc0b73df80144f0f3f5bf75672777af2bbbfe',
	'0x0d31444c3f3cd583f30ca1b7cedc973db4bf5abf'
]


export const BTC = {
	symbol: "BTC",
	name: "Bitcoin",
	logoURI: "https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png?1547033579",
	decimals: 18,
	chainId: 1,
	address: "0x0000000000000000000000000000000000000001",
};

export const ApprovalState = {
	UNKNOWN: 0,
	NOT_APPROVED: 1,
	PENDING: 2,
	APPROVED: 3,
};

export enum StepKind {
	WrapEth = "WrapEth",
	ToggleTokenLock = "ToggleTokenLock",
	TransferToken = "TransferToken",
	LendingToken = "LendingToken",
	BorrowToken = "BorrowToken",
	RepayToken = "RepayToken",
	UnLendingToken = "UnLendingToken",
	BuySellLimit = "BuySellLimit",
	BuySellLimitMatching = "BuySellLimitMatching",
	BuySellMarket = "BuySellMarket",
	UnlockCollectibles = "UnlockCollectibles",
	SellCollectible = "SellCollectible",
	BuyCollectible = "BuyCollectible",
	SubmitConfig = "SubmitConfig",
}

export const TX_DEFAULTS_TRANSFER = {
	gas: 1000000,
	gasLimit: 1000000,
	gasTransferToken: 21000,
	shouldValidate: true,
};
