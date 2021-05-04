import { OrderMapper } from "@dydxprotocol/exchange-wrappers";
import { AccountOperation } from "./AccountOperation";

export class Operation {
	constructor(contracts, limitOrders, stopLimitOrders, canonicalOrders, networkId) {
		this.contracts = contracts;
		this.orderMapper = new OrderMapper(networkId);
		this.limitOrders = limitOrders;
		this.stopLimitOrders = stopLimitOrders;
		this.canonicalOrders = canonicalOrders;
		this.networkId = networkId;
	}

	setNetworkId(networkId) {
		this.orderMapper.setNetworkId(networkId);
	}

	initiate(options) {
		return new AccountOperation(
			this.contracts,
			this.orderMapper,
			this.limitOrders,
			this.stopLimitOrders,
			this.canonicalOrders,
			this.networkId,
			options || {}
		);
	}
}
