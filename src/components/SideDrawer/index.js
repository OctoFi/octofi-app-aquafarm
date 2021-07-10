import SVG from "react-inlinesvg";
import { useTranslation } from "react-i18next";

import { routes } from "../../constants/headerRoutes";
import Logo from "../Logo";
import SideDrawerItem from "./Item";
import * as Styled from "./styleds";

const SideDrawer = ({ open, onDismiss, ...props }) => {
	const { t } = useTranslation();

	return (
		<>
			<Styled.Backdrop open={open} onClick={onDismiss} />
			<Styled.Wrapper open={open}>
				<Styled.Content>
					<Styled.Header>
						<Styled.CloseButton onClick={onDismiss}>
							<SVG src={require("../../assets/images/close.svg").default} />
						</Styled.CloseButton>

						<span className={"font-size-sm"}>{t("menu.menu")}</span>
					</Styled.Header>
					<Styled.LogoContainer>
						<Logo />
					</Styled.LogoContainer>

					{Object.keys(routes).map((key, index) => {
						const r = routes[key];
						if (r.hasOwnProperty("path")) {
							return (
								<Styled.LinkItem to={r.path} key={index}>
									{t(`menu.${r.title}`)}
								</Styled.LinkItem>
							);
						} else {
							return <SideDrawerItem title={r.title} items={r.routes} key={index} />;
						}
					})}
				</Styled.Content>
			</Styled.Wrapper>
		</>
	);
};

export default SideDrawer;
