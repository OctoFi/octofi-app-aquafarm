import * as multicall from '@makerdao/multicall'

import getConfig from '../../config'
import {ZERO} from "../../constants";
import BigNumber from "bignumber.js";

const config = getConfig();
const multicallConfig = {
	rpcUrl: config.nodeRpc,
	multicallAddress: config.queryToken
}


function getExchangeRate(inputValue, inputDecimals, outputValue, outputDecimals, invert = false) {
	try {
		if (
			inputValue &&
			(inputDecimals || inputDecimals === 0) &&
			outputValue &&
			(outputDecimals || outputDecimals === 0)
		) {
			const factor = new BigNumber(10).pow(new BigNumber(18))
			const inputValueTransformed = new BigNumber(inputValue.toString());
			const outputValueTransformed = new BigNumber(outputValue.toString());

			if (invert) {
				const result = inputValueTransformed
					.times(factor)
					.times(new BigNumber(10).pow(new BigNumber(outputDecimals)))
					.dividedBy(new BigNumber(10).pow(new BigNumber(inputDecimals)))
					.dividedBy(outputValueTransformed)
				console.log(result);
				return result;
			} else {
				const result = outputValueTransformed
					.times(factor)
					.times(new BigNumber(10).pow(new BigNumber(inputDecimals)))
					.dividedBy(new BigNumber(10).pow(new BigNumber(outputDecimals)))
					.dividedBy(inputValueTransformed)
				console.log(result);
				return result;
			}
		}
	} catch (e) {
		console.log(e);
	}
}

function getMarketRate(reserveETH, reserveToken, decimals, invert = false) {
	return getExchangeRate(reserveETH, 18, reserveToken, decimals, invert)
}

export function getPoolInfo (arr, account) {
	return new Promise(resolve => {
		let callArr = []
		for (let obj of arr) {
			if (!obj.exchangeAddress || obj.exchangeAddress.indexOf('0x') !== 0) continue
			callArr.push(...[
				{
					target: obj.exchangeAddress,
					call: ['totalSupply()(uint256)'],
					returns: [['TS_' + obj.symbol, val => val / 10 ** 18]]
				},
				{
					target: obj.token,
					call: ['balanceOf(address)(uint256)', obj.exchangeAddress],
					returns: [['exchangeTokenBalancem_' + obj.symbol, val => val / 10 ** Number(obj.decimals)]]
				},
				{
					call: ['getEthBalance(address)(uint256)', obj.exchangeAddress],
					returns: [['exchangeETHBalance_' + obj.symbol, val => val / 10 ** Number(obj.decimals)]]
				}
			])
			if (account) {
				callArr.push({
					target: obj.exchangeAddress,
					call: ['balanceOf(address)(uint256)', account],
					returns: [['poolTokenBalance_' + obj.symbol, val => val / 10 ** Number(obj.decimals)]]
				})
			}
		}
		// console.log(callArr)
		// console.log(multicallConfig)
		multicall.aggregate([...callArr], multicallConfig).then(res => {
			// console.log(res)
			if (res.results) {
				let result = res.results.original
				for (let i = 0, len = arr.length; i < len; i++) {
					let obj = arr[i]
					let poolTokenPercentage = ZERO
					let balance = ZERO, Basebalance = 0, market = ZERO
					if (Number(result['TS_' + obj.symbol]) && Number(result['poolTokenBalance_' + obj.symbol])) {
						poolTokenPercentage = result['poolTokenBalance_' + obj.symbol].mul(new BigNumber(10).pow(new BigNumber(18))).div(result['TS_' + obj.symbol])
						if (Number(result['exchangeTokenBalancem_' + obj.symbol])) {
							balance = result['exchangeTokenBalancem_' + obj.symbol].mul(poolTokenPercentage).div(new BigNumber(10).pow(new BigNumber(18)))
						}
						if (Number(result['exchangeETHBalance_' + obj.symbol])) {
							Basebalance = result['exchangeETHBalance_' + obj.symbol].mul(poolTokenPercentage).div(new BigNumber(10).pow(new BigNumber(18)))
						}
					}
					if (Number(result['exchangeETHBalance_' + obj.symbol]) && Number(result['exchangeTokenBalancem_' + obj.symbol])) {
						market = getMarketRate(result['exchangeETHBalance_' + obj.symbol], result['exchangeTokenBalancem_' + obj.symbol], obj.decimals)
					}
					arr[i].supply = result['TS_' + obj.symbol] ? result['TS_' + obj.symbol] : ZERO
					arr[i].exchangeTokenBalancem = result['exchangeTokenBalancem_' + obj.symbol] ? result['exchangeTokenBalancem_' + obj.symbol] : ZERO
					arr[i].exchangeETHBalance = result['exchangeETHBalance_' + obj.symbol] ? result['exchangeETHBalance_' + obj.symbol] : ZERO
					arr[i].poolTokenBalance = result['poolTokenBalance_' + obj.symbol] ? result['poolTokenBalance_' + obj.symbol] : ZERO
					arr[i].pecent = poolTokenPercentage
					arr[i].balance = balance
					arr[i].Basebalance = Basebalance
					arr[i].market = market
				}
			}
			// console.log(arr)
			resolve(arr)
		}).catch(err => {
			console.log(err)
		})
	})
}
