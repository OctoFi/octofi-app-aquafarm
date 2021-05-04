export class InsufficientTokenBalanceException extends Error {
	constructor(quoteSymbol) {
		super(`You don't have enough ${quoteSymbol.toUpperCase()}...`);
	}
}
