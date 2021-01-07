import axios from 'axios';
import {encodeQuery} from "../../lib/helper";

export default class CoinSwitchApi {
    constructor() {
        this.instance = axios.create({
            baseURL: 'https://api.coinswitch.co/v2/',
            headers: {
                'x-api-key': process.env.REACT_APP_COINSWITCH_API_KEY,
                'x-user-ip': '1.1.1.1',
            }
        })
    }

    get(type, payload = {}) {
        switch(type) {
            case 'tokens': {
                return this.getTokens();
            }
            case 'pairs': {
                return this.getPairs(payload);
            }
            case 'rate': {
                return this.getRate(payload);
            }
            case 'bulk-rate': {
                return this.getBulkRate(payload);
            }
            case 'order': {
                return this.sendOrder(payload);
            }
            case 'orders': {
                return this.getOrders();
            }
            case 'getOrder': {
                return this.getOrder(payload);
            }
            case 'invoice': {
                return this.createInvoice(payload);
            }
            case 'status': {
                return this.getInvoiceStatus(payload);
            }
        }
    }

    getTokens() {
        return this.instance.get('coins');
    }

    getPairs(payload) {
        return this.instance.post('pairs', payload);
    }

    getRate(payload) {
        return this.instance.post('rate', payload);
    }

    getOrders() {
        return this.instance.get('orders');
    }

    getOrder({ id }) {
        return this.instance.get(`order/${id}`)
    }

    sendOrder(payload) {
        return this.instance.post('order', payload);
    }

    getBulkRate(payload) {
        return this.instance.post('bulk-rate', payload);
    }

    createInvoice(payload) {
        return this.instance.post('payment/invoice', payload);
    }

    getInvoiceStatus({ id }) {
        return this.instance.get(`payment/invoice/${id}`)
    }
}