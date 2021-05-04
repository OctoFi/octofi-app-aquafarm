
import getNetConfig from '../../config'
const Web3Fn = require('web3')
const config = getNetConfig();
const web3Fn = new Web3Fn(new Web3Fn.providers.HttpProvider(config.nodeRpc))


export default web3Fn