import axios from 'axios';
import {encodeQuery} from "../../lib/helper";

export default class OneInchApi {
    constructor() {
        this.instance = axios.create({
            baseURL: 'https://api.1inch.exchange/v2.0/'
        })
    }

    get(type, payload = {}) {
        switch(type) {
            case 'tokens': {
                return this.getTokens();
            }
            case 'protocols': {
                return this.getProtocols();
            }
            case 'healthcheck': {
                return this.getHealthcheck();
            }
            case 'quote': {
                return this.getQuote(payload);
            }
            case 'swap': {
                return this.getSwap(payload);
            }
            case 'spender': {
                return this.getSpender();
            }
            case 'approve': {
                return this.getApprove(payload);
            }
        }
    }

    getTokens() {
        return this.instance.get('tokens');
    }

    getProtocols() {
        return this.instance.get('protocols');
    }
    getHealthcheck() {
        return this.instance.get('healthcheck');
    }
    getQuote(payload) {
        let query = encodeQuery(payload);
        return axios.get(`https://pathfinder-v3.1inch.exchange/v1.0/quotes?${query}&gasPrice=105000000000&deepLevel=1&mainRouteParts=20&parts=20&protocolWhiteList=WETH,UNISWAP_V1,UNISWAP_V2,SUSHI,MOONISWAP,BALANCER,COMPOUND,CURVE,CHAI,OASIS,KYBER,AAVE,IEARN,BANCOR,PMM1,CREAMSWAP,SWERVE,BLACKHOLESWAP,DODO,VALUELIQUID,SHELL,ZEROEX,DEFISWAP,COFIX,SAKESWAP,LUASWAP,MINISWAP&virtualParts=20&protocols=WETH,UNISWAP_V1,UNISWAP_V2,SUSHI,MOONISWAP,BALANCER,COMPOUND,CURVE,CHAI,OASIS,KYBER,AAVE,IEARN,BANCOR,PMM1,CREAMSWAP,SWERVE,BLACKHOLESWAP,DODO,VALUELIQUID,SHELL,ZEROEX,DEFISWAP,COFIX,SAKESWAP,LUASWAP,MINISWAP&deepLevels=1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1&mainRoutePartsList=1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1&partsList=1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1&virtualPartsList=1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1`);
    }

    getSwap(payload) {
        let query = encodeQuery(payload);
        return this.instance.get(`swap?${query}`);
    }

    getSpender() {
        return this.instance.get('approve/spender')
    }

    getApprove(payload) {
        let query = encodeQuery(payload);
        return this.instance.get(`approve/calldata?${query}`);
    }
}