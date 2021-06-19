import { Navbar, Button, Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import SVG from "react-inlinesvg";

import Logo from "../Logo";
import "./styles.scss";
import { useWalletModalToggle } from "../../state/application/hooks";
import { useActiveWeb3React } from "../../hooks";
import { routes } from "../../constants/headerRoutes";
import HeaderDropdown from "../HeaderDropdown";
import SettingsDropdown from "../SettingsDropdown";
import SideDrawer from "../SideDrawer";
import { useEffect, useState } from "react";
import { emitter } from "../../lib/helper";
import { shortenAddress } from "../../utils";
import { useTranslation } from "react-i18next";

const Container = styled.div`
	transition: all ease 0.4s;
	position: fixed;
	top: 0;
	left: 0;
	right: ${({ right }) => (right ? `${right}px` : "0")};
	background-color: ${({ theme, scrolled }) => (scrolled ? theme.modalBG : "transparent")};
	box-shadow: ${({ scrolled }) => (scrolled ? "-1px 11px 43px rgba(0, 0, 0, 0.12)" : "0 0 0 rgba(0, 0, 0, 0)")};
	z-index: 800;

	& .navbar,
	& .header__inner {
		min-height: ${({ scrolled }) => (scrolled ? "80px" : "112px")};
		transition: 0.3s ease all;
	}

	@media (max-width: 1199px) {
		z-index: 1090;

		body.modal-open & {
			background-color: ${({ theme }) => theme.modalBG};
			box-shadow: 0 0 0 rgba(0, 0, 0, 0);
		}
	}
`;

const WalletLink = styled.div`
	color: ${({ theme }) => theme.text};
	background-color: ${({ theme }) => theme.bg5};
	border-radius: 12px;
	padding: 8px 16px;
	font-size: 1rem;
	font-weight: 500;
	cursor: pointer;
`;

const StyledNavbarBrand = styled(Navbar.Brand)`
	transition: 0.4s all ease;

	@media (max-width: 1199px) {
		body.modal-open & {
			transform: ${({ hasCallback }) => (hasCallback ? "translateX(52px)" : "translateX(0)")};
		}
	}
`;

const BackButton = styled.button`
	border: none;
	color: ${({ theme }) => theme.primary};
	background-color: ${({ theme }) => theme.primaryLight};
	border-radius: 300px;
	width: 32px;
	height: 32px;
	position: absolute;
	top: calc(50% - 16px);
	left: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all ease 0.4s;

	@media (max-width: 1199px) {
		transform: translateX(-50px) scale(0.9);
		opacity: 0;
		visibility: hidden;

		body.modal-open & {
			transform: ${({ hasCallback }) =>
				hasCallback ? "translateX(0) scale(1)" : "translateX(-50px) scale(0.9)"};
			opacity: ${({ hasCallback }) => (hasCallback ? "1" : "0")};
			visibility: ${({ hasCallback }) => (hasCallback ? "visible" : "hidden")};
		}
	}

	&:hover {
		background-color: ${({ theme }) => theme.primary};
		color: ${({ theme }) => theme.bg2};
	}

	&:hover,
	&:active,
	&:focus {
		outline: none;
		box-shadow: none;
		text-decoration: none;
	}
`;

const MenuIcon = styled.div`
	color: ${({ theme }) => theme.text1};
`;

const Header = (props) => {
	const { account } = useActiveWeb3React();
	const toggleConnectModal = useWalletModalToggle();
	const [sidedrawer, setSidedrawer] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [scrollbarWidth, setScrollbarWidth] = useState(0);
	const { t } = useTranslation();
	const [callback, setCallback] = useState({
		action: undefined,
	});

	const handleUserScroll = (e) => {
		const scroll = e.target.scrollTop;

		if (scroll > 50) {
			setScrolled(true);
		} else {
			setScrolled(false);
		}
	};

	const _getScrollbarWidth = () => {
		const scrollDiv = document.createElement("div");
		scrollDiv.className = "modal-scrollbar-measure";
		document.body.appendChild(scrollDiv);
		const scrollbarWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth;
		document.body.removeChild(scrollDiv);
		return scrollbarWidth;
	};

	const handleResize = () => {
		const PaddingWidth = _getScrollbarWidth();
		setScrollbarWidth(PaddingWidth);
	};

	const dismissHandler = () => {
		setSidedrawer(false);
	};

	const setModalCallback = (e) => {
		setCallback({
			action: e.action,
		});
	};

	const removeModalCallback = () => {
		setCallback({
			action: undefined,
		});
	};

	useEffect(() => {
		emitter.on("open-modal", setModalCallback);
		emitter.on("close-modal", removeModalCallback);

		return () => {
			emitter.off("open-modal", setModalCallback);
			emitter.off("close-modal", removeModalCallback);
		};
	}, []);

	useEffect(() => {
		document.body.addEventListener("scroll", handleUserScroll);

		return () => {
			document.body.removeEventListener("scroll", handleUserScroll);
		};
	}, [handleUserScroll]);

	useEffect(handleResize, []);

	useEffect(() => {
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return (
		<>
			<SideDrawer open={sidedrawer} onDismiss={dismissHandler} />
			<Container scrolled={scrolled} right={scrollbarWidth} hasCallback={callback.action !== undefined}>
				<div className="container-lg">
					<Navbar className={"header px-0"} expand={"lg"} variant={"dark"}>
						<div className="back-button d-lg-none">
							<BackButton onClick={callback.action} hasCallback={callback.action !== undefined}>
								<SVG src={require("../../assets/images/global/arrow-left.svg").default} />
							</BackButton>
						</div>
						<div className={"header__inner"}>
							<StyledNavbarBrand hasCallback={callback.action !== undefined}>
								<Logo hideOnMobile />
							</StyledNavbarBrand>
							<MenuIcon className={"d-flex d-lg-none"}>
								<SVG
									src={require("../../assets/images/menu.svg").default}
									onClick={() => setSidedrawer(true)}
								/>
							</MenuIcon>
						</div>
						<Navbar.Collapse id="basic-navbar-nav">
							<Nav className="mr-auto header__nav">
								{Object.keys(routes).map((key, index) => {
									const r = routes[key];
									if (r.hasOwnProperty("path")) {
										return (
											<NavLink
												key={index}
												to={r.path}
												className={"header__item"}
												activeClassName={"header__item--active"}
											>
												{t(`menu.${r.title}`)}
											</NavLink>
										);
									} else {
										return <HeaderDropdown title={r.title} items={r.routes} />;
									}
								})}
							</Nav>
							<div className={"d-flex align-items-stretch align-items-lg-center flex-column flex-lg-row"}>
								{!account ? (
									<Button variant={"primary"} onClick={toggleConnectModal}>
										{t("menu.connect")}
									</Button>
								) : (
									<div className={"d-flex align-items-center justify-content-center pt-3 pt-lg-0"}>
										<WalletLink onClick={toggleConnectModal}>
											{account && shortenAddress(account)}
										</WalletLink>
									</div>
								)}
								<SettingsDropdown />
							</div>
						</Navbar.Collapse>
					</Navbar>
				</div>
			</Container>
		</>
	);
};

export default Header;
