import { Web3Provider } from '@ethersproject/providers'
import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { LedgerConnector } from '@web3-react/ledger-connector'
import { TrezorConnector } from '@web3-react/trezor-connector'
import { NetworkConnector } from "./NetworkConnector";
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { TorusConnector } from "@web3-react/torus-connector";
import { PortisConnector} from "@web3-react/portis-connector";
import {
    POLLING_INTERVAL
} from "../constants";
import {AbstractConnector} from "@web3-react/abstract-connector";

const NETWORK_URL = process.env.REACT_APP_NETWORK_URL;
const PORTIS_ID = process.env.REACT_APP_PORTIS_ID

export const NETWORK_CHAIN_ID = parseInt(process.env.REACT_APP_CHAIN_ID ?? '1')


if (typeof NETWORK_URL === 'undefined') {
    throw new Error(`REACT_APP_NETWORK_URL must be a defined environment variable`)
}

export const network = new NetworkConnector({
    urls: { [NETWORK_CHAIN_ID]: NETWORK_URL }
})

let networkLibrary: Web3Provider | undefined
export function getNetworkLibrary(): Web3Provider {
    return (networkLibrary = networkLibrary ?? new Web3Provider(network.provider as any))
}

export const injected = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42]
})

// mainnet only
export const walletconnect = new WalletConnectConnector({
    rpc: { 1: NETWORK_URL },
    bridge: 'https://bridge.walletconnect.org',
    qrcode: true,
    pollingInterval: POLLING_INTERVAL
})

export const ledger = (derivationPath: string | undefined) => new LedgerConnector({ chainId: 1, url: NETWORK_URL, pollingInterval: POLLING_INTERVAL, baseDerivationPath: derivationPath })

export const trezor = new TrezorConnector({
    chainId: 1,
    url: NETWORK_URL,
    pollingInterval: POLLING_INTERVAL,
    manifestEmail: process.env.REACT_APP_MANIFEST_EMAIL ?? '',
    manifestAppUrl: process.env.REACT_APP_MANIFEST_URL ?? ''
})

export const walletlink = new WalletLinkConnector({
    url: NETWORK_URL,
    appName: 'DeFiDashboard',
})

export const portis = new PortisConnector({
    dAppId: PORTIS_ID ?? '',
    networks: [1]
})

export const torus = new TorusConnector({
    chainId: 1,
})

const connectors: {
    [connector: string]: {
        provider: any,
        name: string
    }
} = {
    'injected': {
        provider: injected,
        name: 'MetaMask'
    },
    'walletConnect': {
        provider: walletconnect,
        name: 'Wallet Connect'
    },
    'ledger': {
        provider: ledger,
        name: 'Ledger'
    },
    'trezor': {
        provider: trezor,
        name: 'Trezor',
    },
    'trustWallet': {
        provider: walletconnect,
        name: 'Trust Wallet'
    },
    'portis': {
        provider: portis,
        name: "Portis",
    },
    'torus': {
        provider: torus,
        name: 'Torus',
    },
    'coinbase': {
        provider: walletlink,
        name: 'Coinbase',
    }
}


export interface WalletInfo {
    connector?: AbstractConnector | any
    name: string
    description: string
    href: string | null
    color: string
    primary?: true
    mobile?: true
    mobileOnly?: true
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
    metamask: {
        connector: injected,
        name: 'MetaMask',
        description: 'Easy-to-use browser extension.',
        href: null,
        color: '#E8831D'
    },
    walletConnect: {
        connector: walletconnect,
        name: 'WalletConnect',
        description: 'Connect to Wallet that supports walletConnect...',
        href: null,
        color: '#4196FC',
        mobile: true
    },
    ledger: {
        connector: ledger,
        name: 'Ledger',
        description: 'Connect to your Ledger hardware',
        href: null,
        color: '#315CF5'
    },
    trezor: {
        connector: trezor,
        name: 'Trezor',
        description: 'Connect to your Trezor wallet',
        href: null,
        color: '#142533',
    },
    trustWallet: {
        connector: walletconnect,
        name: 'Trust Wallet',
        description: 'Connect to Trust Wallet',
        href: null,
        color: '#3375BB',
        mobile: true
    },
    portis: {
        connector: portis,
        name: 'Portis',
        description: 'Login using Portis hosted wallet',
        href: null,
        color: '#4A6C9B',
        mobile: true
    },
    coinbase: {
        connector: walletlink,
        name: 'Coinbase Wallet',
        description: 'Use Coinbase Wallet app on mobile device',
        href: null,
        color: '#315CF5'
    },
    coinbase_mobile: {
        name: 'Open in Coinbase Wallet',
        description: 'Open in Coinbase Wallet app.',
        href: 'https://go.cb-w.com/mtUDhEZPy1',
        color: '#315CF5',
        mobile: true,
        mobileOnly: true
    },
    torus: {
        connector: torus,
        name: 'Torus',
        description: 'Torus Wallet by TorusLabs',
        href: null,
        color: '#0364FF',
    },
}

export default connectors;