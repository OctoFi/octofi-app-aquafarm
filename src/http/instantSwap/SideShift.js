import axios from "axios";
import {SIDE_SHIFT_TYPE} from "../../constants";

export default class SideShift {
    constructor(baseURL = "https://sideshift.ai/api/v1") {
        this.instance = axios.create({
            baseURL,
            timeout: 30000
        })

        this.instance.interceptors.response.use(res => {
            if(res?.hasOwnProperty('data')) {
                return res?.data;
            }

            return res;
        }, e => {
            if(e?.hasOwnProperty('response')) {
                return e?.response?.data;
            }

            return e;
        })
    }

    get(method, payload) {
        switch(method) {
            case "facts": {
                return this.getFacts();
            }
            case "pairs": {
                return this.getPair(payload);
            }
            case "permissions": {
                return this.getPermission();
            }
            default: {
                return new Promise((resolve, reject) => {
                    resolve(null);
                });
            }
        }
    }

    post(method, payload) {
        switch(method) {
            case "order": {
                return this.createOrder(payload);
            }
            case "quotes": {
                return this.quotes(payload);
            }
            case "variableOrder": {
                return this.createVariableOrder(payload);
            }
            case "fixedOrder": {
                return this.createFixedOrder(payload);
            }
            default: {
                return new Promise((resolve, reject) => {
                    resolve(null);
                });
            }
        }
    }

    async createOrder(payload) {
        try {
            let quote = null;
            if(SIDE_SHIFT_TYPE === 'fixed') {
                quote = await this.quotes({
                    body: {
                        "depositMethod": payload.body.depositMethod,
                        "settleMethod": payload.body.settleMethod,
                        "depositAmount": payload.body.depositAmount,
                    }
                });
            }

            const body = SIDE_SHIFT_TYPE === "fixed" ? {
                "type": SIDE_SHIFT_TYPE,
                "depositMethodId": payload.body.depositMethod,
                "settleMethodId": payload.body.settleMethod,
                "settleAddress": payload.body.settleAddress,
                "quoteId": quote?.id,
            } : {
                "type": SIDE_SHIFT_TYPE,
                "depositMethodId": payload.body.depositMethod,
                "settleMethodId": payload.body.settleMethod,
                "settleAddress": payload.body.settleAddress,
            }

            const order = SIDE_SHIFT_TYPE === "fixed" ? await this.createFixedOrder({ body }) : await this.createVariableOrder({ body });

            return order;

        } catch(e) {
            console.log(e);

            return e;
        }

    }

    createVariableOrder(payload) {
        return this.instance.post("orders", payload.body, {
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    createFixedOrder(payload) {
        return this.instance.post("orders", payload.body, {
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    quotes(payload) {
        return this.instance.post("quotes", payload.body, {
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    getFacts() {
        return this.instance.get("facts")
    }

    getPair(payload) {
        return this.instance.get(`pairs/${payload.fromCurrency}/${payload.toCurrency}`)
    }

    getPermission() {
        return this.instance.get("permissions");
    }
}