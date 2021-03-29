/**
 * Represents varying order takerFee types that can be pruned for by OrderPruner.
 */
export const OrderPrunerPermittedFeeTypes = {
	NoFees: "NO_FEES",
	MakerDenominatedTakerFee: "MAKER_DENOMINATED_TAKER_FEE",
	TakerDenominatedTakerFee: "TAKER_DENOMINATED_TAKER_FEE",
};

/**
 * Represents the varying smart contracts that can consume a valid swap quote
 */
export const ExtensionContractType = {
	Forwarder: "FORWARDER",
	None: "NONE",
};
