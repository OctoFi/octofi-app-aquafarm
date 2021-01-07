import axios from 'axios';

class TokenSet {
    /**
     * Create api class for token set api
     * @param baseUrl
     */
    constructor(baseUrl) {
        this.baseURL = baseUrl;

        this.request = axios.create({
            baseURL: this.baseURL,
            timeout: 30000
        })
    }

    /**
     * Create base get option for every request
     * @param endpoint
     * @param requestOptions
     * @returns {Promise<AxiosResponse<any>>}
     */
    async get(endpoint, requestOptions = {}) {
        try {
            return await this.request.get(endpoint, requestOptions);
        } catch(err) {
            return err;
        }
    }

    // Rebalances api

    async fetchAllSets() {
        return await this.get('public/v1/rebalancing_sets');
    }
    /**
     * Fetch Specific type of rebalances
     * @param type
     * @returns Promise
     */
    async fetchRebalanceSets(type= "") {
        return await this.get(`v1/rebalancing_sets/explore?type=${type}`);
    }

    /**
     * Fetch single rebalance details
     * @param id
     * @returns {Promise<AxiosResponse<*>>}
     */
    async fetchRebalanceDetails(id) {
        return await this.get(`v1/rebalancing_sets/${id}`)
    }

    async historicalRebalanceSet(id, interval = 'month', currency = 'usd') {
        return await this.get(`v1/rebalancing_set_historicals/${id}?interval=${interval}&currency=${currency}`)
    }

    // Funds (v2)

    /**
     * Fetch fund rebalances (3 major one)
     * @returns {Promise<*>}
     */
    async fetchFundSets() {
        return await this.fetchRebalanceSets('fund');
    }

    /**
     * Fetch fund rebalance details
     * @param id
     * @returns {Promise<AxiosResponse<*>>}
     */
    async fetchFundDetails(id) {
        return await this.get(`v2/funds/${id}`)
    }

    async historicalFundSet(id, interval = 'month', currency = 'usd') {
        return await this.get(`v2/fund_historicals/${id}?interval=${interval}&currency=${currency}`)
    }


    async fetchCoins() {
        return await this.get('v1/coins')
    }

    async fetchGasEstimates() {
        return await this.get('v1/gas_estimates')
    }

    // Traders
    async fetchTraders() {
        return await this.get(`v1/traders`)
    }
}

export default TokenSet;