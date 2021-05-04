import { DeFiSDK } from "defi-sdk";

const nodeUrl = process.env.REACT_APP_NETWORK_URL || "https://eth-mainnet.zerion.io/";
const defiSdk = new DeFiSDK(nodeUrl);

export default defiSdk;
