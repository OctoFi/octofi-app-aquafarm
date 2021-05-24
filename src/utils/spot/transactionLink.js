import { Network } from "../../constants";

export const ETHERSCAN_TRANSACTION_URL = {
	[Network.Mainnet]: "https://etherscan.io/tx/",
	[Network.Ropsten]: "https://ropsten.etherscan.io/tx/",
	[Network.Rinkeby]: "https://rinkeby.etherscan.io/tx/",
	[Network.Kovan]: "https://kovan.etherscan.io/tx/",
	[Network.Ganache]: "https://etherscan.io/tx/",
};

export const ETHERSCAN_URL = {
	[Network.Mainnet]: "https://etherscan.io/",
	[Network.Ropsten]: "https://ropsten.etherscan.io/",
	[Network.Rinkeby]: "https://rinkeby.etherscan.io/",
	[Network.Kovan]: "https://kovan.etherscan.io/",
	[Network.Ganache]: "https://etherscan.io/",
};
