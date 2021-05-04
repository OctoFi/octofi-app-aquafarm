import { ApolloClient, gql, InMemoryCache } from "@apollo/client";

export const yearnClient = new ApolloClient({
	uri: "https://api.thegraph.com/subgraphs/name/graham-u/yearnfinancedev",
	cache: new InMemoryCache(),
});

export class Api {
	constructor() {
		this.client = yearnClient;
	}

	fetchPools({ pageSize, page, orderBy, orderDirection }) {
		return this.client
			.query({
				query: gql`
                query {
                    vaults(first:${pageSize}, skip: ${(page - 1) * pageSize}, orderBy: ${
					orderBy || "vaultBalance"
				}, orderDirection:${orderDirection || "desc"}){
                        id
                        pricePerFullShare
                        totalSupply
                        vaultBalance
                        available
                        shareToken{
                            id,
                            address
                            decimals
                            name
                            symbol
                        }
                        underlyingToken{
                            id,
                            address
                            decimals
                            name
                            symbol
                        }
                    }
                }

            `,
			})
			.then((response) =>
				response.data.vaults.map((item) => {
					return {
						...item,
						pricePerFullShare: Number(item.pricePerFullShare),
						totalSupply: Number(item.totalSupply),
						vaultBalance: Number(item.vaultBalance),
						available: Number(item.available),
					};
				})
			)
			.catch((error) => error);
	}
}
