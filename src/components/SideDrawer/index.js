import styled, { ThemeContext } from "styled-components";
import SVG from "react-inlinesvg";

import Logo from "../Logo";
import { useActiveWeb3React } from "../../hooks";
import SideDrawerItem from "./Item";
import { routes, accountRoutes } from "../../constants/headerRoutes";
import { Link } from "react-router-dom";
import UserIcon from "../Icons/User";
import { useContext } from "react";
import { useTranslation } from "react-i18next";

const Wrapper = styled.div`
	position: fixed;
	right: 0;
	top: 0;
	bottom: 0;
	overflow: auto;
	width: 240px;
	background-color: ${({ theme }) => theme.modalBG};
	transition: 0.5s ease all;
	transform: ${({ open }) => (open ? "translateX(0)" : "translateX(100%)")};
	z-index: 100001;
`;

const Content = styled.div`
	display: flex;
	flex-direction: column;
	padding-bottom: 4rem;
`;

const Header = styled.div`
	padding: 40px 30px;
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

const CloseButton = styled.button`
	border: none;
	background-color: transparent;
	display: flex;
	align-items: center;
	justify-content: center;

	&:hover,
	&:focus,
	&:active {
		outline: none;
		text-decoration: none;
		box-shadow: none;
	}
`;

const Backdrop = styled.div`
	position: fixed;
	right: 0;
	left: 0;
	top: 0;
	bottom: 0;
	background-color: rgba(11, 15, 50, 0.8);
	opacity: ${({ open }) => (open ? "1" : "0")};
	visibility: ${({ open }) => (open ? "visible" : "hidden")};
	z-index: 100001;
	transition: 0.5s ease all;
`;

const LogoContainer = styled.div`
	padding: 0.875rem 1.875rem 1.5rem;
	display: flex;
	align-items: center;
	border-bottom: 1px solid ${({ theme }) => theme.text3};
`;

const LinkItem = styled(Link)`
	padding: 20px 24px 20px 30px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	background-color: ${({ theme }) => theme.modalBG};
	height: 64px;
	border-bottom: 1px solid ${({ theme }) => theme.text3};
	color: ${({ theme }) => theme.text1};
	font-size: 0.875rem;
	font-weight: 400;

	&:hover,
	&:focus,
	&:active {
		outline: none;
		text-decoration: none;
		color: ${({ theme }) => theme.text2};
	}
`;

const SideDrawer = ({ open, onDismiss, ...props }) => {
	const theme = useContext(ThemeContext);
	const { account } = useActiveWeb3React();
	const { t } = useTranslation();
	return (
		<>
			<Backdrop open={open} onClick={onDismiss} />
			<Wrapper open={open}>
				<Content>
					<Header>
						<CloseButton onClick={onDismiss}>
							<SVG src={require("../../assets/images/close.svg").default} />
						</CloseButton>

						<span className={"font-size-sm"}>{t("menu.menu")}</span>
					</Header>
					<LogoContainer>
						<Logo />
					</LogoContainer>
					{account && (
						<SideDrawerItem
							title={"Account"}
							items={accountRoutes}
							icon={<UserIcon size={"20px"} style={{ color: theme.primary }} />}
						/>
					)}

					{Object.keys(routes).map((key) => {
						const r = routes[key];
						if (r.hasOwnProperty("path")) {
							return <LinkItem to={r.path}>{r.title}</LinkItem>;
						} else {
							return <SideDrawerItem title={r.title} items={r.routes} />;
						}
					})}
				</Content>
			</Wrapper>
		</>
	);
};

export default SideDrawer;
