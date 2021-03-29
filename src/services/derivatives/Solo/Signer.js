import { promisify } from "es6-promisify";

import { stripHexPrefix } from "./lib/helpers";
import { SIGNATURE_TYPES } from "./types";
import { SigningMethod } from "./types";
import Web3 from "web3";

export class Signer {
	constructor(web3) {
		this.web3 = web3;
	}

	getEIP712Hash(structHash) {
		return Web3.utils.soliditySha3(
			{ t: "bytes2", v: "0x1901" },
			{ t: "bytes32", v: this.getDomainHash() },
			{ t: "bytes32", v: structHash }
		);
	}

	async ethSignTypedDataInternal(signer, data, signingMethod) {
		let sendMethod;
		let rpcMethod;
		let rpcData;

		switch (signingMethod) {
			case SigningMethod.TypedData:
				sendMethod = "send";
				rpcMethod = "eth_signTypedData";
				rpcData = data;
				break;
			case SigningMethod.MetaMask:
				sendMethod = "sendAsync";
				rpcMethod = "eth_signTypedData_v3";
				rpcData = JSON.stringify(data);
				break;
			case SigningMethod.MetaMaskLatest:
				sendMethod = "sendAsync";
				rpcMethod = "eth_signTypedData_v4";
				rpcData = JSON.stringify(data);
				break;
			case SigningMethod.CoinbaseWallet:
				sendMethod = "sendAsync";
				rpcMethod = "eth_signTypedData";
				rpcData = data;
				break;
			default:
				throw new Error(`Invalid signing method ${signingMethod}`);
		}

		const provider = this.web3.givenProvider;
		const sendAsync = promisify(provider[sendMethod]).bind(provider);
		const response = await sendAsync({
			method: rpcMethod,
			params: [signer, rpcData],
			jsonrpc: "2.0",
			id: new Date().getTime(),
		});
		if (response.error) {
			throw new Error(response.error.message);
		}
		return `0x${stripHexPrefix(response.result)}0${SIGNATURE_TYPES.NO_PREPEND}`;
	}
}
