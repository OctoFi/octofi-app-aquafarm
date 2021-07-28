import { useTranslation } from "react-i18next";
import SVG from "react-inlinesvg";
import * as Styled from "./styleds";

interface AppBarProps {
	routes: Array<any>;
}

export const AppBar = ({ routes }: AppBarProps) => {
	const { t } = useTranslation();

	return (
		<Styled.AppNavbar>
			{routes.map((route, index) => {
				return (
					<Styled.AppBarItem key={index} to={route.path} activeClassName="active" exact>
						{route.icon ? <route.icon /> : <SVG src={route.image} width={40} height={40} />}
						<span className="sr-only">{t(`menu.${route.title}`)}</span>
					</Styled.AppBarItem>
				);
			})}
		</Styled.AppNavbar>
	);
};
