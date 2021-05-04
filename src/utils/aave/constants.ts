import { CHAIN_ID } from "../../constants";

export enum ChainId {
	Mainnet = 1,
	Ropsten = 3,
	Kovan = 42,
	Ganache = 1337,
}

export const AAVE_ETH_TOKEN = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

export const LENDING_POOL_ADDRESS = (() => {
	switch (CHAIN_ID) {
		case ChainId.Mainnet:
			return "0x398eC7346DcD622eDc5ae82352F02bE94C62d119";
		case ChainId.Ropsten:
			return "0x9E5C7835E4b13368fd628196C4f1c6cEc89673Fa";
		case ChainId.Kovan:
			return "";
		default:
			return "";
	}
})();

export const AAVE_READER_ADDRESS = (() => {
	switch (CHAIN_ID) {
		case ChainId.Mainnet:
			return "0xc3dA51901031F2A3FD9a2927d7Cc0Afc77CDb93e";
		case ChainId.Ropsten:
			return "0x16E2Efcd37E1ac7f7D5531876BbbB7cDC83aD118";
		case ChainId.Kovan:
			return "";
		default:
			return "";
	}
})();

export const LENDING_POOL_CORE_ADDRESS = (() => {
	switch (CHAIN_ID) {
		case ChainId.Mainnet:
			return "0x3dfd23A6c5E8BbcFc9581d2E864a68feb6a076d3";
		case ChainId.Ropsten:
			return "0x4295Ee704716950A4dE7438086d6f0FBC0BA9472";
		case ChainId.Kovan:
			return "";
		default:
			return "";
	}
})();

export const AAVE_GRAPH_URI = (() => {
	switch (CHAIN_ID) {
		case ChainId.Mainnet:
			return "https://api.thegraph.com/subgraphs/name/aave/protocol-raw";
		case ChainId.Ropsten:
			return "https://api.thegraph.com/subgraphs/name/aave/protocol-ropsten-raw";
		case ChainId.Kovan:
			return "";
		default:
			return "";
	}
})();
