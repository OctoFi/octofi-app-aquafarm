import { ChainId, JSBI, Percent, Token, WETH } from '@uniswap/sdk'

export const ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'

export const CONTRACTS = {
  curve: '0xcCdd1f20Fd50DD63849A87994bdD11806e4363De',
  balancer: '0xA3128cC400E2878571368ae0a83F588Eb838552b',
  yVault: '0x9c57618bfCDfaE4cE8e49226Ca22A7837DE64A2d',
  uniswap: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
}

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
}


export const DAI = new Token(ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin')
export const USDC = new Token(ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD//C')
export const USDT = new Token(ChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD')
export const COMP = new Token(ChainId.MAINNET, '0xc00e94Cb662C3520282E6f5717214004A7f26888', 18, 'COMP', 'Compound')
export const MKR = new Token(ChainId.MAINNET, '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', 18, 'MKR', 'Maker')
export const AMPL = new Token(ChainId.MAINNET, '0xD46bA6D942050d489DBd938a2C909A5d5039A161', 9, 'AMPL', 'Ampleforth')
export const WBTC = new Token(ChainId.MAINNET, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 18, 'WBTC', 'Wrapped BTC')

export const BalanceToken = new Token(
    ChainId.MAINNET,
    process.env.REACT_APP_BALANCE_CHECK_TOKEN_ADDRESS || "",
    Number(process.env.REACT_APP_BALANCE_CHECK_TOKEN_DECIMAL),
    process.env.REACT_APP_BALANCE_CHECK_TOKEN_SYMBOL,
    process.env.REACT_APP_BALANCE_CHECK_TOKEN_NAME,
)

// TODO this is only approximate, it's actually based on blocks
export const PROPOSAL_LENGTH_IN_DAYS = 7

export const GOVERNANCE_ADDRESS = '0x5e4be8Bc9637f0EAA1A755019e06A68ce081D58F'

const UNI_ADDRESS = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
export const UNI: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, UNI_ADDRESS, 18, 'UNI', 'Uniswap'),
  [ChainId.RINKEBY]: new Token(ChainId.RINKEBY, UNI_ADDRESS, 18, 'UNI', 'Uniswap'),
  [ChainId.ROPSTEN]: new Token(ChainId.ROPSTEN, UNI_ADDRESS, 18, 'UNI', 'Uniswap'),
  [ChainId.GÖRLI]: new Token(ChainId.GÖRLI, UNI_ADDRESS, 18, 'UNI', 'Uniswap'),
  [ChainId.KOVAN]: new Token(ChainId.KOVAN, UNI_ADDRESS, 18, 'UNI', 'Uniswap')
}

// TODO: specify merkle distributor for mainnet
export const MERKLE_DISTRIBUTOR_ADDRESS: { [chainId in ChainId]?: string } = {
  [ChainId.MAINNET]: '0x090D4613473dEE047c3f2706764f49E0821D256e'
}

const WETH_ONLY: ChainTokenList = {
  [ChainId.MAINNET]: [WETH[ChainId.MAINNET]],
  [ChainId.ROPSTEN]: [WETH[ChainId.ROPSTEN]],
  [ChainId.RINKEBY]: [WETH[ChainId.RINKEBY]],
  [ChainId.GÖRLI]: [WETH[ChainId.GÖRLI]],
  [ChainId.KOVAN]: [WETH[ChainId.KOVAN]]
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], DAI, USDC, USDT, COMP, MKR]
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.MAINNET]: {
    [AMPL.address]: [DAI, WETH[ChainId.MAINNET]]
  }
}

// used for display in the default list when adding liquidity
export const SUGGESTED_BASES: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], DAI, USDC, USDT]
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WETH_ONLY,
  [ChainId.MAINNET]: [...WETH_ONLY[ChainId.MAINNET], DAI, USDC, USDT]
}

export const PINNED_PAIRS: { readonly [chainId in ChainId]?: [Token, Token][] } = {
  [ChainId.MAINNET]: [
    [
      new Token(ChainId.MAINNET, '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', 8, 'cDAI', 'Compound Dai'),
      new Token(ChainId.MAINNET, '0x39AA39c021dfbaE8faC545936693aC917d5E7563', 8, 'cUSDC', 'Compound USD Coin')
    ],
    [USDC, USDT],
    [DAI, USDT]
  ]
}

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

export const BIG_INT_ZERO = JSBI.BigInt(0)

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 ETH
export const BETTER_TRADE_LINK_THRESHOLD = new Percent(JSBI.BigInt(75), JSBI.BigInt(10000))

export const POLLING_INTERVAL = 12000



export const rates: {
  [rateName: string]: {
    image: any,
    type: string,
    symbol: string,
  }
} = {
  CAD: {
    image: require('../assets/images/currencies/CAD.svg'),
    type: 'normal',
    symbol: 'CA$'
  },
  GBP: {
    image: require('../assets/images/currencies/GBP.svg'),
    type: 'normal',
    symbol: '£'
  },
  RUB: {
    image: require('../assets/images/currencies/RUB.svg'),
    type: 'normal',
    symbol: 'RUB'
  },
  JPY: {
    image: require('../assets/images/currencies/JPY.svg'),
    type: 'normal',
    symbol: '¥'
  },
  CHF: {
    image: require('../assets/images/currencies/CHF.svg'),
    type: 'normal',
    symbol: 'CHF'
  },
  EUR: {
    image: require('../assets/images/currencies/EUR.svg'),
    type: 'normal',
    symbol: '€'
  },
  INR: {
    image: require('../assets/images/currencies/INR.svg'),
    type: 'normal',
    symbol: '₹'
  },
  CNY: {
    image: require('../assets/images/currencies/CNY.svg'),
    type: 'normal',
    symbol: 'CN¥'
  },
  NZD: {
    image: require('../assets/images/currencies/NZD.svg'),
    type: 'normal',
    symbol: 'NZ$'
  },
  USD: {
    image: require('../assets/images/currencies/USD.svg'),
    type: 'normal',
    symbol: '$'
  },
  SGD: {
    image: require('../assets/images/currencies/SGD.svg'),
    type: 'normal',
    symbol: 'SGD'
  },
  AUD: {
    image: require('../assets/images/currencies/AUD.svg'),
    type: 'normal',
    symbol: 'A$'
  },
  KRW: {
    image: require('../assets/images/currencies/KRW.svg'),
    type: 'normal',
    symbol: '₩'
  },
  BTC: {
    image: require('../assets/images/currencies/BTC.svg'),
    type: 'crypto',
    symbol: '₿'
  },
  ETH: {
    image: require('../assets/images/currencies/ETH.svg'),
    type: 'crypto',
    symbol: 'Ξ'
  },
  LINK: {
    image: require('../assets/images/currencies/LINK.svg'),
    type: 'crypto',
    symbol: '⬡'
  }
}

export const Platforms = [
   'uniswap-v2',
   'bancor',
   'curve',
   'balancer',
]

export const setProtocolConfig = {
  coreAddress: '0xf55186CC537E7067EA616F2aaE007b4427a120C8',
  exchangeIssuanceModuleAddress: '0x73dF03B5436C84Cf9d5A758fb756928DCEAf19d7',
  kyberNetworkWrapperAddress: '0x9B3Eb3B22DC2C29e878d7766276a86A8395fB56d',
  protocolViewerAddress: '0x589d4b4d311EFaAc93f0032238BecD6f4D397b0f',
  rebalanceAuctionModuleAddress: '0xe23FB31dD2edacEbF7d92720358bB92445F47fDB',
  rebalancingSetExchangeIssuanceModule: '0xd4240987D6F92B06c8B5068B1E4006A97c47392b',
  rebalancingSetIssuanceModule: '0xcEDA8318522D348f1d1aca48B24629b8FbF09020',
  rebalancingSetTokenFactoryAddress: '0x15518Cdd49d83471e9f85cdCFBD72c8e2a78dDE2',
  setTokenFactoryAddress: '0xE1Cd722575801fE92EEef2CA23396557F7E3B967',
  transferProxyAddress: '0x882d80D3a191859d64477eb78Cca46599307ec1C',
  vaultAddress: '0x5B67871C3a857dE81A1ca0f9F7945e5670D986Dc',
  wrappedEtherAddress: '0xc6449473BE76AB2a70329fA66Cbe504a25005338',
}

export const exploreSections = {
  tokens: {
    title: 'Top Tokens',
    slug: 'tokens',
    description: 'Top tokens by Market Cap',
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
        src: '/coins/' + row.id
      }
    },
    seeMore: '/explore/tokens',

  },
  tokenSets: {
    title: 'Token Sets',
    slug: 'sets',
    description: 'Automate trading strategies with TokenSets',
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
      }
    },
    seeMore: '/explore/tokenSets',

  },
  pools: {
    title: 'Pools',
    slug: 'pools',
    description: 'Earn trading fees by providing liquidity in a single transaction',
    data: [],
    loading: true,
    schema: (row: any) => {
      return {
        img: `https://token-icons.s3.amazonaws.com/${row.ownershipToken}.png`,
        name: row.poolName,
        symbol: row.platform,
        price: row.usdLiquidity,
        priceDiff: false,
        title: 'Total Liquidity',
      }
    },
    seeMore: '/pools',
  },
  trending: {
    title: 'Trending on Coingecko',
    slug: 'coingecko',
    description: 'Trending coins (Top-5) on CoinGecko in the last 24 hours',
    data: [],
    loading: true,
    schema: (row: any) => {
      return {
        img: row.image.large,
        name: row.name,
        symbol: row.symbol.toUpperCase(),
        price: row.market_data.current_price.usd,
        priceDiff: row.market_data.price_change_percentage_24h,
        title: false,
        src: '/coins/' + row.id
      }
    },
    seeMore: false,
  },
  derivatives: {
    title: 'Top 5 Derivatives',
    slug: 'derivatives',
    description: 'Top Derivatives by Volume (24h)',
    data: [],
    loading: true,
    schema: (row: any, imageComponent: any) => {
      return {
        imageComponent: imageComponent,
        name: row.market,
        symbol: row.symbol.toUpperCase(),
        price: row.volume_24h,
        priceDiff: row.price_percentage_change_24h,
        seeMore: '/explore/derivatives',
        title: 'Volume (24h)',
      }
    },
    seeMore: false,
  },
  gainers: {
    title: 'Top 5 Gainer Tokens (24h)',
    slug: 'gainers',
    description: 'Top 5 Gainer Tokens by Price Change Percentage (24h)',
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
        src: '/coins/' + row.id
      }
    },
    seeMore: false,
  },
  losers: {
    title: 'Top 5 Loser Tokens (24h)',
    slug: 'losers',
    description: 'Top 5 Loser Tokens by Price Change Percentage (24h)',
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
        src: '/coins/' + row.id
      }
    },
    seeMore: false,
  },
}

export const marketCoins = [
  {
    "id": "cardano",
    "symbol": "ada",
    "name": "Cardano"
  },
  {
    "id": "bitcoin-cash",
    "symbol": "bch",
    "name": "Bitcoin Cash"
  },
  {
    "id": "binancecoin",
    "symbol": "bnb",
    "name": "Binance Coin"
  },
  {
    "id": "bancor",
    "symbol": "bnt",
    "name": "Bancor Network Token"
  },
  {
    "id":"bitcoin",
    "symbol":"btc",
    "name":"Bitcoin"
  },
  {
    "id": "compound-governance-token",
    "symbol": "comp",
    "name": "Compound"
  },
  {
    "id":"dai",
    "symbol":"dai",
    "name":"Dai"
  },
  {
    "id": "ethereum",
    "symbol": "eth",
    "name": "Ethereum"
  },
  {
    "id": "kyber-network",
    "symbol": "knc",
    "name": "Kyber Network"
  },
  {
    "id":"ethlend",
    "symbol":"lend",
    "name":"Aave"
  },
  {
    "id": "chainlink",
    "symbol": "link",
    "name": "Chainlink"
  },
  {
    "id":"litecoin",
    "symbol":"ltc",
    "name":"Litecoin"
  },
  {
    "id":"republic-protocol",
    "symbol":"ren",
    "name":"REN"
  },
  {
    "id":"havven",
    "symbol":"snx",
    "name":"Synthetix Network Token"
  },
  {
    "id":"ripple",
    "symbol":"xrp",
    "name":"XRP"
  },
];

export const cryptoBuyCurrencies = [
  {
    image: require('../assets/images/currencies/GBP.svg'),
    symbol: 'GBP',
    notation: '£'
  },
  {
    image: require('../assets/images/currencies/EUR.svg'),
    symbol: 'EUR',
    notation: '€'
  },
]