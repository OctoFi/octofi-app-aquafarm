import {ParaSwap} from "paraswap";
import DEXAG from 'dexag-sdk'

import CoinSwitchApi from "./CoinSwitch";
import OneInchApi from "./OneInch";
import GodexApi from './Godex';
import DexAgApi from "./dexAg";

export default {
    paraswap: new ParaSwap(),
    oneInch: new OneInchApi(),
    coinSwitch: new CoinSwitchApi(),
    godex: new GodexApi(),
    dexag: {
        api: new DexAgApi(),
        sdk: DEXAG.fromProvider(window.ethereum),
    },
}