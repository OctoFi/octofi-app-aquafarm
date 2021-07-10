export const routes = {
	account: {
		title: "Account",
		routes: {
			dashboard: {
				title: "dashboard",
				path: "/dashboard",
				state: "success",
			},
			history: {
				title: "history",
				path: "/history",
				state: "success",
			},
		},
	},
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
			on: {
				title: "crypto",
				path: "/onramp",
				state: "success",
			},
			off: {
				title: "giftCards",
				path: "/offramp",
				state: "success",
			},
		},
	},
	invest: {
		title: "invest",
		routes: {
			explore: {
				title: "explore",
				path: "/invest",
				state: "success",
			},
			pools: {
				title: "pools",
				path: "/invest/pools",
				state: "success",
			},
			tokens: {
				title: "tokens",
				path: "/invest/tokens",
				state: "success",
			},
			tokensets: {
				title: "tokenSets",
				path: "/invest/tokensets",
				state: "success",
			},
			loans: {
				title: "loans",
				path: "/invest/loans",
				state: "success",
			},
		},
	},
	more: {
		title: "more",
		routes: {
			nft: {
				title: "nft",
				path: "/nft",
				state: "success",
			},
			governance: {
				title: "governance",
				path: "/governance",
				state: "success",
			},
			launchpad: {
				title: "launchpad",
				path: "/launchpad",
				state: "success",
			},
			cross: {
				title: "cross",
				path: "/cross/anyswap",
				state: "success",
			},
		},
	},
	cross: {
		title: "cross",
		routes: {
			anySwap: {
				title: "anySwap",
				path: "/cross/anyswap",
				state: "success",
			},
			bridges: {
				title: "bridges",
				path: "/cross/bridges",
				state: "success",
			},
			crossBalance: {
				title: "crossBalance",
				path: "/cross/balance",
				state: "success",
			},
		},
	},
};
