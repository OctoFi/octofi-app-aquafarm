import { SIGNATURE_TYPES } from "../types";
import Web3 from "web3";
import { ethers } from "ethers";
import { BigNumber } from "bignumber.js";

export const PREPEND_DEC = "\x19Ethereum Signed Message:\n32";

export const PREPEND_HEX = "\x19Ethereum Signed Message:\n\x20";

export function stripHexPrefix(input) {
	if (input.indexOf("0x") === 0) {
		return input.substr(2);
	}
	return input;
}

export function createTypedSignature(signature, sigType) {
	if (!isValidSigType(sigType)) {
		throw new Error(`Invalid signature type: ${sigType}`);
	}
	return `${fixRawSignature(signature)}0${sigType}`;
}

export function isValidSigType(sigType) {
	switch (sigType) {
		case SIGNATURE_TYPES.NO_PREPEND:
		case SIGNATURE_TYPES.DECIMAL:
		case SIGNATURE_TYPES.HEXADECIMAL:
			return true;
		default:
			return false;
	}
}

export function fixRawSignature(signature) {
	const stripped = stripHexPrefix(signature);

	if (stripped.length !== 130) {
		throw new Error(`Invalid raw signature: ${signature}`);
	}

	const rs = stripped.substr(0, 128);
	const v = stripped.substr(128, 2);

	switch (v) {
		case "00":
			return `0x${rs}1b`;
		case "01":
			return `0x${rs}1c`;
		case "1b":
		case "1c":
			return `0x${stripped}`;
		default:
			throw new Error(`Invalid v value: ${v}`);
	}
}

export function ecRecoverTypedSignature(hash, typedSignature) {
	if (stripHexPrefix(typedSignature).length !== 66 * 2) {
		throw new Error(`Unable to ecrecover signature: ${typedSignature}`);
	}

	const sigType = parseInt(typedSignature.slice(-2), 16);

	let prependedHash;
	switch (sigType) {
		case SIGNATURE_TYPES.NO_PREPEND:
			prependedHash = hash;
			break;
		case SIGNATURE_TYPES.DECIMAL:
			prependedHash = Web3.utils.soliditySha3({ t: "string", v: PREPEND_DEC }, { t: "bytes32", v: hash });
			break;
		case SIGNATURE_TYPES.HEXADECIMAL:
			prependedHash = Web3.utils.soliditySha3({ t: "string", v: PREPEND_HEX }, { t: "bytes32", v: hash });
			break;
		default:
			throw new Error(`Invalid signature type: ${sigType}`);
	}

	const signature = typedSignature.slice(0, -2);

	return ethers.utils.recoverAddress(ethers.utils.arrayify(prependedHash), signature);
}

export function addressesAreEqual(addressOne, addressTwo) {
	return (
		addressOne &&
		addressTwo &&
		stripHexPrefix(addressOne).toLowerCase() === stripHexPrefix(addressTwo).toLowerCase()
	);
}

export function hashString(input) {
	return Web3.utils.soliditySha3({ t: "string", v: input });
}

export function addressToBytes32(input) {
	return `0x000000000000000000000000${stripHexPrefix(input)}`;
}

export function argToBytes(val) {
	let v = val;
	if (typeof val === "boolean") {
		v = val ? "1" : "0";
	}
	if (typeof val === "number") {
		v = val.toString();
	}
	if (val instanceof BigNumber) {
		v = val.toFixed(0);
	}

	return Web3.utils.hexToBytes(Web3.utils.padLeft(Web3.utils.toHex(v), 64, "0"));
}

export function bytesToHexString(input) {
	return ethers.utils.hexlify(input.map((x) => new BigNumber(x[0]).toNumber()));
}

export function toBytes(...args) {
	const result = args.reduce((acc, val) => acc.concat(argToBytes(val)), []);
	return result.map((a) => [a]);
}

export function hexStringToBytes(hex) {
	if (!hex || hex === "0x") {
		return [];
	}
	return Web3.utils.hexToBytes(hex).map((x) => [x]);
}

export function toNumber(input) {
	return new BigNumber(input).toNumber();
}

export function toString(input) {
	return new BigNumber(input).toFixed(0);
}
