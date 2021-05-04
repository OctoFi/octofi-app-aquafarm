import axios from 'axios'
import qs from "qs"
import getNetConfig from '../../config'

const ID_CODE = 'ID_CODE'
const config = getNetConfig();

export function recordTxns (txnData, type, pairs, account, to, outChainId) {
  let idCode = localStorage.getItem(ID_CODE) ? localStorage.getItem(ID_CODE) : ''
  let hash = txnData.hash, outHash = ''
  if (type === 'DEPOSIT') {
    hash = ''
    outHash = txnData.hash
  }
  axios.post(config.recordsTxnsUrl, qs.stringify({
    hash: hash,
    from: account,
    to: to,
    pairs: pairs,
    chainId: config.chainID,
    outHash: outHash,
    outChainId: outChainId ? outChainId : '',
    type: type,
    idCode: idCode,
    status: 0,
    timestamp: Date.now(),
  })).then(res => {
    console.log(res)
  })
}

