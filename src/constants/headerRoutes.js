export const routes = {
	fiat: {
		title: "buy",
		routes: {
			instantSwap: {
				title: "swap",
				path: "/swap/all",
				state: "success",
			},
			swap: {
				title: "uniswap",
				path: "/swap/uni",
				state: "success",
			},
			cross: {
				title: "cross",
				path: "/cross/anyswap",
				state: "success",
			},
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
	cross: {
		title: "cross",
		routes: {
			bridges: {
				title: "bridges",
				path: "/cross/bridges",
				state: "success",
			},
			anySwap: {
				title: "anySwap",
				path: "/cross/anyswap",
				state: "success",
			},
			crossBalance: {
				title: "crossBalance",
				path: "/cross/balance",
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
				state: "success",
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
	account: {
		title: "Account",
		routes: {
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
		}
	}
};
