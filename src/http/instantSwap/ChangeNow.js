import axios from "axios";

export default class ChangeNow {
    constructor(baseURL = "https://api.changenow.io/v2") {
        this.instance = axios.create({
            baseURL,
            timeout: 30000,
            headers: {
                "x-changenow-api-key": process.env.REACT_APP_CHANGE_NOW_API_KEY || ""
            }
        })
        this.baseURL = baseURL;

        this.instance.interceptors.response.use((res) => {
            if(res?.hasOwnProperty("data")) {
                return res?.data;
            }

            return res;
        }, err => {
            if(err?.hasOwnProperty("response")) {
                return err?.response?.data;
            }

            return err;
        })
    }

    get(method, payload) {
        switch(method) {
            case "exchange": {
                return this.getExchange(payload);
            }
            case "currencies": {
                return this.getCurrencies(payload);
            }
            case "min_amount": {
                return this.getMinAmount(payload);
            }
            case "range": {
                return this.getRange(payload);
            }
            case "estimated": {
                return this.getEstimated(payload);
            }
            case "address_validation": {
                return this.validateAddress(payload);
            }
            default: {
                return new Promise((resolve, reject) => {
                    resolve(null);
                });
            }
        }
    }

    createTransaction(payload) {
        return this.instance.post("exchange", payload.body, {
            "Content-Type": "application/json"
        });
    }

    getCurrencies(payload) {
        return this.instance.get("exchange/currencies", {
            params: payload.params,
        })
    }

    getMinAmount(payload) {
        return this.instance.get("exchange/min-amount", {
            params: payload.params,
        })
    }

    getRange(payload) {
        return this.instance.get("exchange/range", {
            params: payload.params,
        })
    }

    getEstimated(payload) {
        return this.instance.get("exchange/estimated-amount", {
            params: payload.params,
        })
    }

    validateAddress(payload) {
        return axios.get(`${this.baseURL}/validate/address`, {
            params: payload.params,
        })
    }


    async getExchange(payload) {
        try {
            const rate = await this.getEstimated(payload.rate);
            const range = await this.getRange(payload.range);

            return {
                rate,
                range,
            };
        } catch (e) {
            return {
                rate: null,
                min: null,
                max: null,
            };
        }
    }
}