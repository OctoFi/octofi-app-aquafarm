export const routes = {
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
	instantSwap: {
		title: "exchange",
		path: "/exchange",
		state: "success",
	},
	invest: {
		title: "invest",
		path: "/invest",
		state: "success",
	},
	pools: {
		title: "pools",
		path: "/invest/pools",
		state: "success",
	},
	more: {
		title: "more",
		routes: {
			governance: {
				title: "governance",
				path: "/governance",
				state: "success",
			},
			nft: {
				title: "nft",
				path: "/nft",
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
			loans: {
				title: "loans",
				path: "/invest/loans",
				state: "success",
			},
			launchpad: {
				title: "launchpad",
				path: "/launchpad",
				state: "success",
			},
			swap: {
				title: "uniswap",
				path: "/uniswap",
				state: "success",
			},
			cross: {
				title: "cross",
				path: "/cross/anyswap",
				state: "success",
			},
		},
	},
};
