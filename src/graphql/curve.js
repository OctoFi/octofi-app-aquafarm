import {ApolloClient, gql, InMemoryCache} from '@apollo/client';

export const curveClient = new ApolloClient({
    uri: 'https://api.thegraph.com/subgraphs/name/protofire/curve',
    cache: new InMemoryCache()
});

export class Api {
    constructor() {
        this.client = curveClient;
    }

    fetchPools({ pageSize, page, orderBy, orderDirection}) {
        return this.client.query({
            query: gql`
                query {
                    pools(first:${pageSize}, skip: ${(page - 1) * pageSize}, orderBy: ${orderBy || 'virtualPrice'}, orderDirection:${orderDirection || 'desc'}){
                        address
                        balances
                        poolToken{
                            id,
                            name
                            symbol
                            address
                        }
                        virtualPrice
                        fee
                        coins{
                            id,
                            name
                            symbol
                            address
                            decimals
                        }
                    }
                }

            `
        })
        .then(response => response.data.pools)
        .catch(error => error);
    }
}