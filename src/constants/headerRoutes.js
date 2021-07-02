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
		},
	},
	tools: {
		title: "tools",
		routes: {
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
			history: {
				title: "history",
				path: "/history",
				state: "success",
			},
		},
	},
};
