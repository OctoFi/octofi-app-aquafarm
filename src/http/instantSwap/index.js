import { ParaSwap } from "paraswap";
import DEXAG from "dexag-sdk";

import ChangeNow from "./ChangeNow";
import DexAgApi from "./dexAg";
import GodexApi from "./Godex";
import OneInchApi from "./OneInch";
import SideShift from "./SideShift";
import SimpleSwapApi from "./SimpleSwap";
import StealthexApi from "./Stealthex";

const providers = {
	changeNow: new ChangeNow(),
	dexag: {
		api: new DexAgApi(),
		sdk: DEXAG.fromProvider(window.ethereum),
	},
	godex: new GodexApi(),
	oneInch: new OneInchApi(),
	paraswap: new ParaSwap(),
	sideShift: new SideShift(),
	simpleSwap: new SimpleSwapApi(),
	stealthex: new StealthexApi(),
};

export default providers;
