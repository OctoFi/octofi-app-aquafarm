import { INSUFFICIENT_ORDERS_TO_FILL_AMOUNT_ERR } from "./common";

export class InsufficientOrdersAmountException extends Error {
	constructor() {
		super(INSUFFICIENT_ORDERS_TO_FILL_AMOUNT_ERR);
	}
}

export class SignedOrderException extends Error {
	constructor(m) {
		super(m);
		// Set the prototype explicitly.
		Object.setPrototypeOf(this, SignedOrderException.prototype);
	}
}
