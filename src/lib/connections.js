import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { LedgerConnector } from "@web3-react/ledger-connector";
import { TrezorConnector } from "@web3-react/trezor-connector";
import { POLLING_INTERVAL } from "../constants";

const NETWORK_URL = process.env.REACT_APP_NETWORK_URL;

export const injected = new InjectedConnector({ supportedChainIds: [1, 3, 4, 5, 42] });

export const walletconnect = new WalletConnectConnector({
	rpc: { 1: NETWORK_URL },
	bridge: "https://bridge.walletconnect.org",
	qrcode: true,
	pollingInterval: POLLING_INTERVAL,
});

export const ledger = new LedgerConnector({ chainId: 1, url: NETWORK_URL, pollingInterval: POLLING_INTERVAL });

export const trezor = new TrezorConnector({
	chainId: 1,
	url: NETWORK_URL,
	pollingInterval: POLLING_INTERVAL,
	manifestEmail: process.env.REACT_APP_MANIFEST_EMAIL,
	manifestAppUrl: process.env.REACT_APP_MANIFEST_URL,
});

export default {
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
};
