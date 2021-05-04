import { ethers } from 'ethers';

import getConfig from '../config';
import {isAddress} from "./index";
import {ERC20_ABI, FACTORY_ADDRESSES} from "../constants";
import FACTORY_ABI from '../constants/abis/factory'
import ERC20_BYTES32_ABI from '../constants/abis/erc20_bytes32.json'
import EXCHANGE_ABI from '../constants/abis/exchange.json'
import BigNumber from "bignumber.js";
import {useActiveWeb3React} from "../hooks";
import {useMemo} from "react";
import UncheckedJsonRpcSigner from "./jsonRpcSigner";

const config = getConfig();

export const ERROR_CODES = ['TOKEN_NAME', 'TOKEN_SYMBOL', 'TOKEN_DECIMALS'].reduce(
	(accumulator, currentValue, currentIndex) => {
		accumulator[currentValue] = currentIndex
		return accumulator
	},
	{}
)

export function safeAccess(object, path) {

	return object
		? path.reduce(
			(accumulator, currentValue) => (accumulator && accumulator[currentValue] ? accumulator[currentValue] : null),
			object
		)
		: null
}


// get the token allowance
export async function getTokenAllowance(address, tokenAddress, spenderAddress, library) {
	if (!isAddress(address) || !isAddress(tokenAddress) || !isAddress(spenderAddress)) {
		throw Error(
			"Invalid 'address' or 'tokenAddress' or 'spenderAddress' parameter" +
			`'${address}' or '${tokenAddress}' or '${spenderAddress}'.`
		)
	}

	return getContract(tokenAddress, ERC20_ABI, library).allowance(address, spenderAddress)
}


// get token name
export async function getTokenName(tokenAddress, library) {
	if (!isAddress(tokenAddress)) {
		throw Error(`Invalid 'tokenAddress' parameter '${tokenAddress}'.`)
	}

	return getContract(tokenAddress, ERC20_ABI, library)
		.name()
		.catch(() =>
			getContract(tokenAddress, ERC20_BYTES32_ABI, library)
				.name()
				.then(bytes32 => ethers.utils.parseBytes32String(bytes32))
		)
		.catch(error => {
			error.code = ERROR_CODES.TOKEN_SYMBOL
			throw error
		})
}

// get token symbol
export async function getTokenSymbol(tokenAddress, library) {
	if (!isAddress(tokenAddress)) {
		throw Error(`Invalid 'tokenAddress' parameter '${tokenAddress}'.`)
	}

	return getContract(tokenAddress, ERC20_ABI, library)
		.symbol()
		.catch(() => {
			const contractBytes32 = getContract(tokenAddress, ERC20_BYTES32_ABI, library)
			return contractBytes32.symbol().then(bytes32 => ethers.utils.parseBytes32String(bytes32))
		})
		.catch(error => {
			error.code = ERROR_CODES.TOKEN_SYMBOL
			throw error
		})
}

// get token decimals
export async function getTokenDecimals(tokenAddress, library) {
	if (!isAddress(tokenAddress)) {
		throw Error(`Invalid 'tokenAddress' parameter '${tokenAddress}'.`)
	}

	return getContract(tokenAddress, ERC20_ABI, library)
		.decimals()
		.catch(error => {
			error.code = ERROR_CODES.TOKEN_DECIMALS
			throw error
		})
}

// get the exchange address for a token from the factory
export async function getTokenExchangeAddressFromFactory(tokenAddress, networkId, library) {
	return getFactoryContract(networkId, library).getExchange(tokenAddress)
}

export function getFactoryContract(networkId, library, account) {
	return getContract(FACTORY_ADDRESSES[networkId], FACTORY_ABI, library, account)
}

// get the ether balance of an address
export async function getEtherBalance(address, library) {
	if (!isAddress(address)) {
		throw Error(`Invalid 'address' parameter '${address}'`)
	}
	return library.getBalance(address)
}


// get the token balance of an address
export async function getTokenBalance(tokenAddress, address, library) {
	if (!isAddress(tokenAddress) || !isAddress(address)) {
		throw Error(`Invalid 'tokenAddress' or 'address' parameter '${tokenAddress}' or '${address}'.`)
	}

	return getContract(tokenAddress, ERC20_ABI, library).balanceOf(address)
}

export function amountFormatter(amount, baseDecimals = 18, displayDecimals = 8, useLessThan = true) {
	displayDecimals = Math.min(displayDecimals, baseDecimals)
	if (baseDecimals > 18 || displayDecimals > 18 || displayDecimals > baseDecimals) {
		throw Error(`Invalid combination of baseDecimals '${baseDecimals}' and displayDecimals '${displayDecimals}.`)
	}

	// if balance is falsy, return undefined
	if (!amount) {
		return undefined
	}
	// if amount is 0, return
	else if (amount?.isZero()) {
		return '0'
	}
	// amount > 0
	else {
		// amount of 'wei' in 1 'ether'
		const baseAmount = new BigNumber(10).pow(new BigNumber(baseDecimals))

		const minimumDisplayAmount = baseAmount.div(
			new BigNumber(10).pow(new BigNumber(displayDecimals))
		)

		// if balance is less than the minimum display amount
		if (amount.lt(minimumDisplayAmount)) {
			return useLessThan
				? `<${minimumDisplayAmount?.dividedBy(10 ** baseDecimals)?.toFixed(4)}`
				: `${amount?.dividedBy(10 ** baseDecimals)?.toFixed(4)}`
		}
		// if the balance is greater than the minimum display amount
		else {
			const stringAmount = amount?.dividedBy(10 ** baseDecimals)?.toFixed(6);
			if (!stringAmount.match(/\./)) {
				return stringAmount
			}
			// if there is a decimal portion
			else {
				const [wholeComponent, decimalComponent] = stringAmount.split('.')
				const roundedDecimalComponent = new BigNumber(decimalComponent.padEnd(baseDecimals, '0'))
					.toString()
					.padStart(baseDecimals, '0')
					.substring(0, displayDecimals)

				// decimals are too small to show
				if (roundedDecimalComponent === '0'.repeat(displayDecimals)) {
					return wholeComponent
				}
				// decimals are not too small to show
				else {
					return `${wholeComponent}.${roundedDecimalComponent.toString().replace(/0*$/, '')}`
				}
			}
		}
	}
}



export function formatDecimal(num, decimal) {
	if (isNaN(num)) {
		return num
	}
	num = (num * 10000).toFixed(decimal) / 10000
	num = num.toString()
	let index = num.indexOf('.')
	if (index !== -1) {
		num = num.substring(0, decimal + index + 1)
	} else {
		num = num.substring(0)
	}
	return Number(parseFloat(num).toFixed(decimal))
}

export function formatNum (num) {
	if (isNaN(num)) {
		return num
	}
	num = Number(num)
	if (num >= 1) {
		return formatDecimal(num, 2)
	} else {
		return formatDecimal(num, config.keepDec)
	}
}


export function formatEthBalance(balance) {
	return amountFormatter(balance, 18, 6)
}

export function formatTokenBalance(balance, decimal) {
	return !!(balance && Number.isInteger(decimal)) ? amountFormatter(balance, decimal, Math.min(6, decimal)) : 0
}


export function getQueryParam(windowLocation, name) {
	var q = windowLocation.search.match(new RegExp('[?&]' + name + '=([^&#?]*)'))
	return q && q[1]
}

export function getAllQueryParams() {
	let params = {}

	params.inputCurrency = isAddress(getQueryParam(window.location, 'inputCurrency'))
		? isAddress(getQueryParam(window.location, 'inputCurrency')).toLowerCase()
		: ''
	params.outputCurrency = isAddress(getQueryParam(window.location, 'outputCurrency'))
		? isAddress(getQueryParam(window.location, 'outputCurrency')).toLowerCase()
		: getQueryParam(window.location, 'outputCurrency') === config.symbol
			? config.symbol
			: ''
	params.slippage = !isNaN(getQueryParam(window.location, 'slippage')) ? getQueryParam(window.location, 'slippage') : ''
	params.exactField = getQueryParam(window.location, 'exactField')
	params.exactAmount = !isNaN(getQueryParam(window.location, 'exactAmount'))
		? getQueryParam(window.location, 'exactAmount')
		: ''
	params.recipient = isAddress(getQueryParam(window.location, 'recipient'))
		? getQueryParam(window.location, 'recipient')
		: ''

	// Add Liquidity params
	params.ethAmount = !isNaN(getQueryParam(window.location, 'ethAmount'))
		? getQueryParam(window.location, 'ethAmount')
		: ''
	params.tokenAmount = !isNaN(getQueryParam(window.location, 'tokenAmount'))
		? getQueryParam(window.location, 'tokenAmount')
		: ''
	params.token = isAddress(getQueryParam(window.location, 'token'))
		? isAddress(getQueryParam(window.location, 'token'))
		: ''

	// Remove liquidity params
	params.poolTokenAmount = !isNaN(getQueryParam(window.location, 'poolTokenAmount'))
		? getQueryParam(window.location, 'poolTokenAmount')
		: ''
	params.poolTokenAddress = isAddress(getQueryParam(window.location, 'poolTokenAddress'))
		? isAddress(getQueryParam(window.location, 'poolTokenAddress'))
			? isAddress(getQueryParam(window.location, 'poolTokenAddress'))
			: ''
		: ''

	// Create Exchange params
	params.tokenAddress = isAddress(getQueryParam(window.location, 'tokenAddress'))
		? isAddress(getQueryParam(window.location, 'tokenAddress'))
		: ''

	params.lpToken = isAddress(getQueryParam(window.location, 'lpToken'))
		? isAddress(getQueryParam(window.location, 'lpToken'))
		: ''

	return params
}


export function getProviderOrSigner(library, account) {
	return account ? new UncheckedJsonRpcSigner(library.getSigner(account)) : library
}


export function getContract(address, ABI, library, account) {
	if (!isAddress(address) || address === ethers.constants.AddressZero) {
		throw Error(`Invalid 'address' parameter '${address}'.`)
	}
	return new ethers.Contract(address, ABI, getProviderOrSigner(library, account));
	// return new Contract(address, ABI, getProviderOrSigner(library, account))
}

export function getExchangeContract(exchangeAddress, library, account) {
	return getContract(exchangeAddress, EXCHANGE_ABI, library, account)
}

export function useExchangeContract(exchangeAddress, withSignerIfPossible = true) {
	const { library, account } = useActiveWeb3React()

	return useMemo(() => {
		try {
			return getExchangeContract(exchangeAddress, library, withSignerIfPossible ? account : undefined)
		} catch {
			return null
		}
	}, [exchangeAddress, library, withSignerIfPossible, account])
}
