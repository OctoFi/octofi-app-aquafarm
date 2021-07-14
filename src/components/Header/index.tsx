import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import SVG from "react-inlinesvg";
import { Navbar, Button, Nav } from "react-bootstrap";

import { routes } from "../../constants/headerRoutes";
import { useActiveWeb3React } from "../../hooks";
import { emitter } from "../../lib/helper";
import { useWalletModalToggle } from "../../state/application/hooks";
import { shortenAddress } from "../../utils";
import HeaderDropdown from "../HeaderDropdown";
import Logo from "../Logo";
import SettingsDropdown from "../SettingsDropdown";
import SideDrawer from "../SideDrawer";
import * as Styled from "./styleds";

const Header = () => {
	const { account } = useActiveWeb3React();
	const toggleConnectModal = useWalletModalToggle();
	const [sidedrawer, setSidedrawer] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [scrollbarWidth, setScrollbarWidth] = useState(0);
	const { t } = useTranslation();
	const [callback, setCallback] = useState({
		action: undefined,
	});

	const _getScrollbarWidth = () => {
		const scrollDiv = document.createElement("div");
		scrollDiv.className = "modal-scrollbar-measure";
		document.body.appendChild(scrollDiv);
		const scrollbarWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth;
		document.body.removeChild(scrollDiv);
		return scrollbarWidth;
	};

	const dismissHandler = () => {
		setSidedrawer(false);
	};

	useEffect(() => {
		// @ts-ignore
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

		emitter.on("open-modal", setModalCallback);
		emitter.on("close-modal", removeModalCallback);

		return () => {
			emitter.off("open-modal", setModalCallback);
			emitter.off("close-modal", removeModalCallback);
		};
	}, []);

	useEffect(() => {
		// @ts-ignore
		const handleUserScroll = (e) => {
			const scroll = e.target.scrollTop;

			if (scroll > 50) {
				setScrolled(true);
			} else {
				setScrolled(false);
			}
		};

		document.body.addEventListener("scroll", handleUserScroll);

		return () => {
			document.body.removeEventListener("scroll", handleUserScroll);
		};
	}, []);

	useEffect(() => {
		const handleResize = () => {
			const PaddingWidth = _getScrollbarWidth();
			setScrollbarWidth(PaddingWidth);
		};

		window.addEventListener("resize", handleResize);
		handleResize();

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return (
		<>
			<SideDrawer open={sidedrawer} onDismiss={dismissHandler} />
			{/* @ts-ignore */}
			<Styled.Container scrolled={scrolled} right={scrollbarWidth} hasCallback={callback.action !== undefined}>
				<div className="container-xl">
					<Styled.HeadNavbar className={"px-0"} expand={"lg"} scrolled={scrolled}>
						<div className="back-button d-lg-none">
							<Styled.BackButton onClick={callback.action} hasCallback={callback.action !== undefined}>
								<SVG src={require("../../assets/images/global/arrow-left.svg").default} />
							</Styled.BackButton>
						</div>
						<Styled.HeaderInner scrolled={scrolled}>
							<Styled.NavbarBrand hasCallback={callback.action !== undefined}>
								<Logo hideOnMobile />
							</Styled.NavbarBrand>
							<Styled.MenuIcon className={"d-flex d-lg-none"}>
								<SVG
									src={require("../../assets/images/menu.svg").default}
									onClick={() => setSidedrawer(true)}
								/>
							</Styled.MenuIcon>
						</Styled.HeaderInner>
						<Navbar.Collapse id="basic-navbar-nav">
							<Nav className="mx-auto align-items-center">
								{Object.keys(routes).map((key, index) => {
									// @ts-ignore
									const r = routes[key];
									if (r.hasOwnProperty("path")) {
										return (
											<Styled.HeaderItem key={index} to={r.path} activeClassName={"active"} exact>
												{t(`menu.${r.title}`)}
											</Styled.HeaderItem>
										);
									} else {
										return <HeaderDropdown title={r.title} items={r.routes} key={index} />;
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
										<Styled.WalletLink onClick={toggleConnectModal}>
											{account && shortenAddress(account)}
										</Styled.WalletLink>
									</div>
								)}
								<SettingsDropdown />
							</div>
						</Navbar.Collapse>
					</Styled.HeadNavbar>
				</div>
			</Styled.Container>
		</>
	);
};

export default Header;
