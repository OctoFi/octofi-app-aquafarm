import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

export const uniswapClient = new ApolloClient({
	uri: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
	cache: new InMemoryCache(),
});

export class Api {
	constructor() {
		this.client = uniswapClient;
	}

	fetchPools({ pageSize, page, orderBy, orderDirection }) {
		return this.client
			.query({
				query: gql`
                query {
                    pairs(first:${pageSize}, skip: ${(page - 1) * pageSize}, orderBy: ${
					orderBy || "volumeUSD"
				}, orderDirection:${orderDirection || "desc"}){
                        id,
                        token0{
                            id,
                            symbol,
                            name,
                            decimals,
                            totalLiquidity
                        }
                        token1{
                            id,
                            symbol,
                            name,
                            decimals,
                            totalLiquidity,
                        }
                        totalSupply
                        volumeUSD
                        volumeToken0
                        volumeToken1
                        txCount
                    }
                }

            `,
			})
			.then((response) =>
				response.data.pairs.map((item) => {
					return {
						...item,
						totalSupply: Number(item.totalSupply),
						txCount: Number(item.txCount),
						volumeUSD: Number(item.volumeUSD),
					};
				})
			)
			.catch((error) => error);
	}
}
