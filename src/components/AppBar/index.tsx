import React from "react";
import { useTranslation } from "react-i18next";
import { Activity, List, Maximize2, TrendingUp, PieChart } from "react-feather";
import { routes } from "../../constants/appbarRoutes";
import * as Styled from "./styleds";

const Icons = {
	activity: Activity,
	list: List,
	"maximize-2": Maximize2,
	"trending-up": TrendingUp,
	"pie-chart": PieChart,
};

const AppBar = () => {
	const { t } = useTranslation();

	return (
		<Styled.AppNavbar>
			{Object.keys(routes).map((key, index) => {
				// @ts-ignore
				const r = routes[key];
				if (typeof Icons[r.icon] !== "undefined") {
					return (
						<Styled.AppBarItem key={index} to={r.path} activeClassName={"active"} exact>
							{React.createElement(Icons[r.icon])}
							<span className="sr-only">{t(`menu.${r.title}`)}</span>
						</Styled.AppBarItem>
					);
				}
			})}
		</Styled.AppNavbar>
	);
};

export default AppBar;
