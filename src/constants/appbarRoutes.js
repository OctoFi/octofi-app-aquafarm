import { PieChart, List, Star, TrendingUp } from "react-feather";
import SwapIcon from "../assets/images/icon/swap.svg";

export const routes = [
	{
		title: "dashboard",
		path: "/dashboard",
		icon: PieChart,
	},
	{
		title: "history",
		path: "/history",
		icon: List,
	},
	{
		title: "exchange",
		path: "/exchange",
		icon: null,
		image: SwapIcon,
	},
	{
		title: "favorites",
		path: "/favorites",
		icon: Star,
	},
	{
		title: "invest",
		path: "/invest",
		icon: TrendingUp,
	},
];
