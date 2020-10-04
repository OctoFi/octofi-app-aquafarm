import React from 'react';

import MetaMask from '../../../assets/images/providers/metamask.svg'
import WalletConnect from '../../../assets/images/providers/walletconnect.svg'
import Ledger from '../../../assets/images/providers/ledger.svg'
import Trezor from '../../../assets/images/providers/trezor.svg'
import TrustWallet from '../../../assets/images/providers/trustwallet-i.svg'

const icon = props => {
    let Icon = null;
    switch(props.type) {
        case 'injected':
        case 'metamask': {
            Icon = MetaMask;
            break;
        }
        case 'walletConnect': {
            Icon = WalletConnect;
            break;
        }
        case 'ledger': {
            Icon = Ledger;
            break;
        }
        case 'trezor': {
            Icon = Trezor;
            break;
        }
        case 'trustWallet': {
            Icon = TrustWallet;
            break;
        }
        default: {
            Icon = MetaMask;
        }
    }

    return <img src={Icon} alt={props.type} className={'provider__icon'}/>
}

export default icon;