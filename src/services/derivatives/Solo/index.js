import Web3 from "web3";

import { Contracts } from "@dydxprotocol/solo/dist/src/lib/Contracts";
import { Websocket } from "@dydxprotocol/solo/dist/src/modules/Websocket";
import { Api } from "@dydxprotocol/solo/dist/src/modules/Api";
import { Token } from "@dydxprotocol/solo/dist/src/modules/Token";
import { ExpiryV2 } from "@dydxprotocol/solo/dist/src/modules/ExpiryV2";
import { Oracle } from "@dydxprotocol/solo/dist/src/modules/Oracle";
import { Weth } from "@dydxprotocol/solo/dist/src/modules/Weth";
import { Admin } from "@dydxprotocol/solo/dist/src/modules/Admin";
import { Getters } from "@dydxprotocol/solo/dist/src/modules/Getters";
import { Permissions } from "@dydxprotocol/solo/dist/src/modules/Permissions";
import { LiquidatorProxy } from "@dydxprotocol/solo/dist/src/modules/LiquidatorProxy";
import { Logs } from "@dydxprotocol/solo/dist/src/modules/Logs";
import { StandardActions } from "@dydxprotocol/solo/dist/src/modules/StandardActions";

import { Network } from "../../../constants";
import { CanonicalOrders } from "./CanonicalOrders";
import { LimitOrders } from "./LimitOrders";
import { Operation } from "./Operation";
import { StopLimitOrders } from "./StopLimitOrders";

export class Solo {
	constructor(
		options = {
			apiEndpoint: "",
			apiTimeout: 3000,
			wsTimeout: 3000,
			wsEndpoint: "",
			wsOrigin: null,
		}
	) {
		this.provider = new Web3.providers.HttpProvider(
			process.env.REACT_APP_NETWORK_URL,
			options.ethereumNodeTimeout || 10000
		);
		this.web3 = new Web3(this.provider);
		this.contracts = this.createContractsModule(this.provider, Network.Mainnet, this.web3, options);
		this.canonicalOrders = new CanonicalOrders(this.contracts, this.web3, Network.Mainnet);

		this.token = new Token(this.contracts);
		this.expiryV2 = new ExpiryV2(this.contracts);
		this.oracle = new Oracle(this.contracts);
		this.weth = new Weth(this.contracts, this.token);
		this.admin = new Admin(this.contracts);
		this.getters = new Getters(this.contracts);
		this.limitOrders = new LimitOrders(this.contracts, this.web3, Network.Mainnet);
		this.stopLimitOrders = new StopLimitOrders(this.contracts, this.web3, Network.Mainnet);
		this.liquidatorProxy = new LiquidatorProxy(this.contracts);
		this.permissions = new Permissions(this.contracts);
		this.logs = new Logs(this.contracts, this.web3);
		this.operation = new Operation(
			this.contracts,
			this.limitOrders,
			this.stopLimitOrders,
			this.canonicalOrders,
			Network.Mainnet
		);

		this.api = new Api(this.canonicalOrders);

		this.websocket = new Websocket(options.wsTimeout);

		this.standardActions = new StandardActions(this.operation, this.contracts);
	}

	createContractsModule(provider, networkId, web3, options) {
		return new Contracts(provider, networkId, web3, options);
	}
}
