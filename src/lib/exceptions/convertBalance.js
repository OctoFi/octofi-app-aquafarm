export class ConvertBalanceMustNotBeEqualException extends Error {
	constructor(currentEthBalance, newEthBalance) {
		super(
			`Convert ETH/WETH values must not be equal, received: ${currentEthBalance.toString()} and ${newEthBalance.toString()}`
		);
		// Set the prototype explicitly.
		Object.setPrototypeOf(this, ConvertBalanceMustNotBeEqualException.prototype);
	}
}
