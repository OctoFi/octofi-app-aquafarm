import { Web3Provider } from '@ethersproject/providers'
import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { LedgerConnector } from '@web3-react/ledger-connector'
import { TrezorConnector } from '@web3-react/trezor-connector'
import { NetworkConnector } from "./NetworkConnector";
import {
    POLLING_INTERVAL
} from "../constants";
import {AbstractConnector} from "@web3-react/abstract-connector";

const NETWORK_URL = process.env.REACT_APP_NETWORK_URL;

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

export const ledger = new LedgerConnector({ chainId: 1, url: NETWORK_URL, pollingInterval: POLLING_INTERVAL })

export const trezor = new TrezorConnector({
    chainId: 1,
    url: NETWORK_URL,
    pollingInterval: POLLING_INTERVAL,
    manifestEmail: process.env.REACT_APP_MANIFEST_EMAIL ?? '',
    manifestAppUrl: process.env.REACT_APP_MANIFEST_URL ?? ''
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
    }
}




export interface WalletInfo {
    connector?: AbstractConnector
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
    }
}

export default connectors;