export const routes = {
	fiat: {
		title: "buy",
		routes: {
			on: {
				title: "crypto",
				path: "/fiat/on",
				state: "success",
			},
			off: {
				title: "giftCards",
				path: "/fiat/off-cards",
				state: "success",
			},
		},
	},
	swap: {
		title: "swap",
		routes: {
			instantSwap: {
				title: "aggregator",
				path: "/swap/all",
				state: "success",
			},
			swap: {
				title: "uniswap",
				path: "/swap/uni",
				state: "success",
			},
		},
	},
	trade: {
		title: "trade",
		routes: {
			markets: {
				title: "spotMarkets",
				path: "/trade/markets",
				state: "success",
			},
			spot: {
				title: "spot",
				path: "/trade/spot",
				state: "success",
			},
		},
	},
	invest: {
		title: "invest",
		routes: {
			pools: {
				title: "pools",
				path: "/invest/pools",
				state: "success",
			},
			tokenSets: {
				title: "tokenSets",
				path: "/invest/tokensets",
				state: "success",
			},
			loans: {
				title: "loans",
				path: "/invest/loans",
				state: "success",
			},
			nft: {
				title: "nft",
				path: "/invest/nft",
				state: "success",
			},
			launchpad: {
				title: "launchpad",
				path: "/invest/launchpad",
				state: "warning",
			}
		},
	},
	tools: {
		title: "tools",
		routes: {
			governance: {
				title: "governance",
				path: "/tools/governance",
				state: "success",
			},
			rankings: {
				title: "rankings",
				path: "/tools/explore/tokens",
				state: "success",
			},
			explore: {
				title: "explore",
				path: "/tools/explore",
				state: "success",
			},
		},
	},
};

export const accountRoutes = {
	dashboard: {
		title: "dashboard",
		path: "/dashboard",
		state: "success",
	},
	wallet: {
		title: "wallet",
		path: "/account/wallet",
		state: "success",
	},
	history: {
		title: "history",
		path: "/account/history",
		state: "success",
	},
};
