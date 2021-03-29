import { ParaSwap } from "paraswap";
import DEXAG from "dexag-sdk";

import OneInchApi from "./OneInch";
import GodexApi from "./Godex";
import DexAgApi from "./dexAg";
import SimpleSwapApi from "./SimpleSwap";
import StealthexApi from "./Stealthex";
import ChangeNow from "./ChangeNow";
import SideShift from "./SideShift";

export default {
	paraswap: new ParaSwap(),
	oneInch: new OneInchApi(),
	godex: new GodexApi(),
	dexag: {
		api: new DexAgApi(),
		sdk: DEXAG.fromProvider(window.ethereum),
	},
	simpleSwap: new SimpleSwapApi(),
	stealthex: new StealthexApi(),
	changeNow: new ChangeNow(),
	sideShift: new SideShift(),
};
