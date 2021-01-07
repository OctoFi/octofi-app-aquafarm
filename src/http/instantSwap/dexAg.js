import axios from 'axios';
import {encodeQuery} from "../../lib/helper";

export default class DexAgApi {
    constructor() {
        this.instance = axios.create({
            baseURL: 'https://api-v2.dex.ag/'
        })
    }

    get(type, payload = {}) {
        switch(type) {
            case 'tokens': {
                return this.getTokens();
            }
        }
    }

    getTokens() {
        return this.instance.get('token-list-full');
    }

}