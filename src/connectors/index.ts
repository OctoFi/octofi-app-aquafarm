import { Web3Provider } from "@ethersproject/providers";
import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { LedgerConnector } from "@web3-react/ledger-connector";
import { TrezorConnector } from "@web3-react/trezor-connector";
import { NetworkConnector } from "./NetworkConnector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";
import { TorusConnector } from "@web3-react/torus-connector";
import { PortisConnector } from "@web3-react/portis-connector";
import { POLLING_INTERVAL } from "../constants";
import { AbstractConnector } from "@web3-react/abstract-connector";
import getConfig from '../config';

const PORTIS_ID = process.env.REACT_APP_PORTIS_ID;

const config = getConfig();

// @ts-ignore
const NETWORK_URL = config.nodeRpc
// @ts-ignore
const CHAIN_ID = Number(config.chainID);

const chains = [
	1,
	32659,
	56,
	250,
	128,
	137,
	100,
	43114
]

const networks = {
	"1": process.env.REACT_APP_NETWORK_URL || "",
	"56": "https://bsc-dataseed1.ninicoin.io/",
	"100": "https://rpc.xdaichain.com",
	"128": "https://http-mainnet.hecochain.com",
	"137": "https://rpc-mainnet.maticvigil.com",
	"250": "https://rpcapi.fantom.network",
	"32659": "https://mainnet.anyswap.exchange",
	"43114": "https://api.avax.network/ext/bc/C/rpc"
}

export const NETWORK_CHAIN_ID = parseInt(process.env.REACT_APP_CHAIN_ID ?? "1");

if (typeof NETWORK_URL === "undefined") {
	throw new Error(`REACT_APP_NETWORK_URL must be a defined environment variable`);
}

export const network = new NetworkConnector({
	urls: networks,
	defaultChainId: CHAIN_ID
});

let networkLibrary: Web3Provider | undefined;
export function getNetworkLibrary(): Web3Provider {
	return (networkLibrary = networkLibrary ?? new Web3Provider(network.provider as any));
}

export const injected = new InjectedConnector({
	supportedChainIds: chains,
});

// mainnet only
export const walletconnect = new WalletConnectConnector({
	rpc: { 1: NETWORK_URL },
	bridge: "https://bridge.walletconnect.org",
	qrcode: true,
	pollingInterval: POLLING_INTERVAL,
});

export const ledger = (derivationPath: string | undefined) =>
	new LedgerConnector({
		chainId: 1,
		url: NETWORK_URL,
		pollingInterval: POLLING_INTERVAL,
		baseDerivationPath: derivationPath,
	});

export const trezor = new TrezorConnector({
	chainId: 1,
	url: NETWORK_URL,
	pollingInterval: POLLING_INTERVAL,
	manifestEmail: process.env.REACT_APP_MANIFEST_EMAIL ?? "",
	manifestAppUrl: process.env.REACT_APP_MANIFEST_URL ?? "",
});

export const walletlink = new WalletLinkConnector({
	url: NETWORK_URL,
	appName: "DeFiDashboard",
});

export const portis = new PortisConnector({
	dAppId: PORTIS_ID ?? "",
	networks: [1],
});

export const torus = new TorusConnector({
	chainId: 1,
});

const connectors: {
	[connector: string]: {
		provider: any;
		name: string;
	};
} = {
	injected: {
		provider: injected,
		name: "MetaMask",
	},
	walletConnect: {
		provider: walletconnect,
		name: "Wallet Connect",
	},
	ledger: {
		provider: ledger,
		name: "Ledger",
	},
	trezor: {
		provider: trezor,
		name: "Trezor",
	},
	trustWallet: {
		provider: walletconnect,
		name: "Trust Wallet",
	},
	portis: {
		provider: portis,
		name: "Portis",
	},
	torus: {
		provider: torus,
		name: "Torus",
	},
	coinbase: {
		provider: walletlink,
		name: "Coinbase",
	},
};

export interface WalletInfo {
	connector?: AbstractConnector | any;
	name: string;
	description: string;
	href: string | null;
	color: string;
	primary?: true;
	mobile?: true;
	mobileOnly?: true;
	supportedNetworks?: string[]
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
	metamask: {
		connector: injected,
		name: "MetaMask",
		description: "Easy-to-use browser extension.",
		href: null,
		color: "#E8831D",
		supportedNetworks: ["MATIC", "FSN", "FTM", "HT", "BNB", "ETH", "xDAI", "AVAX"]
	},
	ledger: {
		connector: ledger,
		name: "Ledger",
		description: "Connect to your Ledger hardware",
		href: null,
		color: "#315CF5",
		supportedNetworks: ["MATIC", "FSN", "FTM", "HT", "BNB", "ETH", "xDAI", "AVAX"]
	},
	blank: {
		connector: injected,
		name: "Blank",
		description: "THE MOST PRIVATE, NON-CUSTODIAL ETHEREUM WALLET",
		href: null,
		color: "#000",
		supportedNetworks: ["MATIC", "FSN", "FTM", "HT", "BNB", "ETH", "xDAI", "AVAX"]
	},
	walletConnect: {
		connector: walletconnect,
		name: "WalletConnect",
		description: "Connect to Wallet that supports walletConnect...",
		href: null,
		color: "#4196FC",
		mobile: true,
		supportedNetworks: ["ETH"]
	},
	trezor: {
		connector: trezor,
		name: "Trezor",
		description: "Connect to your Trezor wallet",
		href: null,
		color: "#142533",
		supportedNetworks: ["ETH"]
	},
	trustWallet: {
		connector: walletconnect,
		name: "Trust Wallet",
		description: "Connect to Trust Wallet",
		href: null,
		color: "#3375BB",
		mobile: true,
		supportedNetworks: ["ETH"]
	},
	portis: {
		connector: portis,
		name: "Portis",
		description: "Login using Portis hosted wallet",
		href: null,
		color: "#4A6C9B",
		mobile: true,
		supportedNetworks: ["ETH"]
	},
	coinbase: {
		connector: walletlink,
		name: "Coinbase Wallet",
		description: "Use Coinbase Wallet app on mobile device",
		href: null,
		color: "#315CF5",
		supportedNetworks: ["ETH"]
	},
	coinbase_mobile: {
		name: "Open in Coinbase Wallet",
		description: "Open in Coinbase Wallet app.",
		href: "https://go.cb-w.com/mtUDhEZPy1",
		color: "#315CF5",
		mobile: true,
		mobileOnly: true,
		supportedNetworks: ["ETH"]
	},
	torus: {
		connector: torus,
		name: "Torus",
		description: "Torus Wallet by TorusLabs",
		href: null,
		color: "#0364FF",
		supportedNetworks: ["ETH"]
	},
};

export default connectors;
