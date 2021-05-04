import { Signer } from "./Signer";
import { SIGNATURE_TYPES, SigningMethod } from "./types";
import { addressesAreEqual, createTypedSignature, ecRecoverTypedSignature } from "./lib/helpers";

export class OrderSigner extends Signer {
	constructor(web3, contracts) {
		super(web3);
		this.contracts = contracts;
	}

	// ============ Getter Contract Methods ============

	/**
	 * Returns true if the contract can process orders.
	 */
	async isOperational(options = {}) {
		return this.contracts.call(this.getContract().methods.g_isOperational(), options);
	}

	// ============ On-Chain Approve / On-Chain Cancel ============

	/**
	 * Sends an transaction to pre-approve an order on-chain (so that no signature is required when
	 * filling the order).
	 */

	async approveOrder(order, options = {}) {
		const stringifiedOrder = this.stringifyOrder(order);
		return this.contracts.send(this.getContract().methods.approveOrder(stringifiedOrder), options);
	}

	async cancelOrder(order, options = {}) {
		const stringifiedOrder = this.stringifyOrder(order);
		return this.contracts.send(this.getContract().methods.cancelOrder(stringifiedOrder), options);
	}

	// ============ Signing Methods ============

	async signOrder(order, signingMethod) {
		switch (signingMethod) {
			case SigningMethod.Hash:
			case SigningMethod.UnsafeHash:
			case SigningMethod.Compatibility:
				const orderHash = this.getOrderHash(order);
				const rawSignature = await this.web3.eth.sign(orderHash, order.makerAccountOwner);
				const hashSig = createTypedSignature(rawSignature, SIGNATURE_TYPES.DECIMAL);
				if (signingMethod === SigningMethod.Hash) {
					return hashSig;
				}
				const unsafeHashSig = createTypedSignature(rawSignature, SIGNATURE_TYPES.NO_PREPEND);
				if (signingMethod === SigningMethod.UnsafeHash) {
					return unsafeHashSig;
				}
				if (this.orderByHashHasValidSignature(orderHash, unsafeHashSig, order.makerAccountOwner)) {
					return unsafeHashSig;
				}
				return hashSig;

			case SigningMethod.TypedData:
			case SigningMethod.MetaMask:
			case SigningMethod.MetaMaskLatest:
			case SigningMethod.CoinbaseWallet:
				return this.ethSignTypedOrderInternal(order, signingMethod);

			default:
				throw new Error(`Invalid signing method ${signingMethod}`);
		}
	}

	/**
	 * Sends order to current provider for signing of a cancel message. Can sign locally if the
	 * signing account is loaded into web3 and SigningMethod.Hash is used.
	 */
	async signCancelOrder(order, signingMethod) {
		return this.signCancelOrderByHash(this.getOrderHash(order), order.makerAccountOwner, signingMethod);
	}

	/**
	 * Sends orderHash to current provider for signing of a cancel message. Can sign locally if
	 * the signing account is loaded into web3 and SigningMethod.Hash is used.
	 */
	async signCancelOrderByHash(orderHash, signer, signingMethod) {
		switch (signingMethod) {
			case SigningMethod.Hash:
			case SigningMethod.UnsafeHash:
			case SigningMethod.Compatibility:
				const cancelHash = this.orderHashToCancelOrderHash(orderHash);
				const rawSignature = await this.web3.eth.sign(cancelHash, signer);
				const hashSig = createTypedSignature(rawSignature, SIGNATURE_TYPES.DECIMAL);
				if (signingMethod === SigningMethod.Hash) {
					return hashSig;
				}
				const unsafeHashSig = createTypedSignature(rawSignature, SIGNATURE_TYPES.NO_PREPEND);
				if (signingMethod === SigningMethod.UnsafeHash) {
					return unsafeHashSig;
				}
				if (this.cancelOrderByHashHasValidSignature(orderHash, unsafeHashSig, signer)) {
					return unsafeHashSig;
				}
				return hashSig;

			case SigningMethod.TypedData:
			case SigningMethod.MetaMask:
			case SigningMethod.MetaMaskLatest:
			case SigningMethod.CoinbaseWallet:
				return this.ethSignTypedCancelOrderInternal(orderHash, signer, signingMethod);

			default:
				throw new Error(`Invalid signing method ${signingMethod}`);
		}
	}

	// ============ Signature Verification ============

	/**
	 * Returns true if the order object has a non-null valid signature from the maker of the order.
	 */
	orderHasValidSignature(order) {
		return this.orderByHashHasValidSignature(
			this.getOrderHash(order),
			order.typedSignature,
			order.makerAccountOwner
		);
	}

	/**
	 * Returns true if the order hash has a non-null valid signature from a particular signer.
	 */
	orderByHashHasValidSignature(orderHash, typedSignature, expectedSigner) {
		const signer = ecRecoverTypedSignature(orderHash, typedSignature);
		return addressesAreEqual(signer, expectedSigner);
	}

	/**
	 * Returns true if the cancel order message has a valid signature.
	 */
	cancelOrderHasValidSignature(order, typedSignature) {
		return this.cancelOrderByHashHasValidSignature(
			this.getOrderHash(order),
			typedSignature,
			order.makerAccountOwner
		);
	}

	/**
	 * Returns true if the cancel order message has a valid signature.
	 */
	cancelOrderByHashHasValidSignature(orderHash, typedSignature, expectedSigner) {
		const cancelHash = this.orderHashToCancelOrderHash(orderHash);
		const signer = ecRecoverTypedSignature(cancelHash, typedSignature);
		return addressesAreEqual(signer, expectedSigner);
	}
}
