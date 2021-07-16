import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import SVG from "react-inlinesvg";
import { Navbar, Button, Nav } from "react-bootstrap";
import { Menu } from "react-feather";

import { routes } from "../../constants/headerRoutes";
import { useActiveWeb3React } from "../../hooks";
import { emitter } from "../../lib/helper";
import { useWalletModalToggle } from "../../state/application/hooks";
import { shortenAddress } from "../../utils";
import HeaderDropdown from "../HeaderDropdown";
import Logo from "../Logo";
import GasPricesDropdown from "../GasPricesDropdown";
import SettingsDropdown from "../SettingsDropdown";
import SideDrawer from "../SideDrawer";
import * as Styled from "./styleds";

const Header = () => {
	const { account } = useActiveWeb3React();
	const toggleConnectModal = useWalletModalToggle();
	const [sidedrawer, setSidedrawer] = useState(false);
	const { t } = useTranslation();
	const [callback, setCallback] = useState({
		action: undefined,
	});

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

	return (
		<>
			<SideDrawer open={sidedrawer} onDismiss={dismissHandler} />
			{/* @ts-ignore */}
			<Styled.Container hasCallback={callback.action !== undefined}>
				<div className="container-lg">
					<Styled.HeadNavbar expand={"lg"}>
						<div className="back-button d-lg-none">
							<Styled.BackButton onClick={callback.action} hasCallback={callback.action !== undefined}>
								<SVG src={require("../../assets/images/global/arrow-left.svg").default} />
							</Styled.BackButton>
						</div>

						<Styled.HeaderInner>
							<Styled.NavbarBrand hasCallback={callback.action !== undefined}>
								<Logo hideOnMobile />
							</Styled.NavbarBrand>
							<Styled.MenuButton
								variant="link"
								onClick={() => setSidedrawer(true)}
								className="d-flex d-lg-none"
							>
								{/* src={require("../../assets/images/menu.svg").default} */}
								<Menu size={24} />
							</Styled.MenuButton>
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

							<div className="d-flex align-items-stretch align-items-lg-center flex-column flex-lg-row ml-2">
								<GasPricesDropdown />
								<div className="ml-1 mr-3">
									<SettingsDropdown />
								</div>
								{!account ? (
									<Button variant={"primary"} onClick={toggleConnectModal}>
										{t("menu.connect")}
									</Button>
								) : (
									<Styled.WalletLink onClick={toggleConnectModal}>
										{account && shortenAddress(account)}
									</Styled.WalletLink>
								)}
							</div>
						</Navbar.Collapse>
					</Styled.HeadNavbar>
				</div>
			</Styled.Container>
		</>
	);
};

export default Header;
