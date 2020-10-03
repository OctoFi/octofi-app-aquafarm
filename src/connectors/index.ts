import { Web3Provider } from '@ethersproject/providers'
import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { LedgerConnector } from '@web3-react/ledger-connector'
import { TrezorConnector } from '@web3-react/trezor-connector'
import { NetworkConnector } from "./NetworkConnector";
import {
    POLLING_INTERVAL
} from "../constants";

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


export default connectors;