import SetProtocol from "setprotocol.js";
// import BigNumber from "bignumber.js";
//
import { setProtocolConfig } from "../constants";

class Protocol {
	constructor() {
		this.setProtocol = "something2";
		this.web3 = window.web3 || undefined;

		try {
			// Use MetaMask/Mist provider
			const provider = this.web3.currentProvider;
			// this.setProtocol = new SetProtocol(provider, setProtocolConfig);
		} catch (err) {
			// Throws when user doesn't have MetaMask/Mist running
			throw new Error(`No injected web3 found when initializing setProtocol: ${err}`);
		}
	}
}

export default Protocol;
