import { ApolloClient, gql, InMemoryCache } from "@apollo/client";

export const balancerClient = new ApolloClient({
	uri: "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer",
	cache: new InMemoryCache(),
});

export class Api {
	constructor() {
		this.client = balancerClient;
	}

	fetchPools({ pageSize, page, orderBy, orderDirection }) {
		return this.client
			.query({
				query: gql`
                query {
                    pools(first:${pageSize}, skip: ${(page - 1) * pageSize}, orderBy: ${
					orderBy || "liquidity"
				}, orderDirection:${orderDirection || "desc"}, where: {publicSwap: true}){
                        id
                        name
                        symbol
                        totalSwapVolume
                        liquidity
                        finalized
                        publicSwap
                        swapFee
                        totalWeight
                        tokensList
                        active
                        tokens {
                            id
                            address
                            balance
                            name
                            decimals
                            symbol
                            denormWeight
                        }
                    }
                }
            `,
			})
			.then((response) =>
				response.data.pools.map((item) => {
					return {
						...item,
						liquidity: Number(item.liquidity),
						totalWeight: Number(item.totalWeight),
						totalSwapVolume: Number(item.totalSwapVolume),
						swapFee: Number(item.swapFee),
					};
				})
			)
			.catch((error) => error);
	}
}
