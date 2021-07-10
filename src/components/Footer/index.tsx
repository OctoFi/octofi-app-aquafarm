import { Trans, useTranslation } from "react-i18next";
import { routes } from "../../constants/headerRoutes";
import DesktopImage from "../../assets/images/footer/footer-desktop.png";
import MobileImage from "../../assets/images/footer/footer-mobile.png";
import FooterBG from "../../assets/images/footer_1.svg";
import FooterSecondBG from "../../assets/images/footer_2.svg";
import Logo from "../Logo";
import Socials from "../Socials";
import * as Styled from "./styleds";

const Footer = () => {
	const { t } = useTranslation();

	return (
		<Styled.Footer desktop={DesktopImage} mobile={MobileImage}>
			<Styled.Background imageOne={FooterBG} imageTwo={FooterSecondBG} />
			<Styled.Content className="w-100 d-flex flex-column flex-lg-row">
				<Styled.About className={"d-flex flex-column"}>
					<Styled.LogoContainer>
						<Logo />
					</Styled.LogoContainer>
					<div className="d-none d-lg-flex flex-column">
						<Socials />
						<Styled.CopyRight>
							<Trans i18nKey={"app.copyright"} values={{ company: "OctoFi" }}>
								Decentralized Finance Tentacles
							</Trans>
						</Styled.CopyRight>
					</div>
				</Styled.About>

				<Styled.ListContainer>
					<Styled.ListWrap className="d-flex">
						{Object.keys(routes).map((key) => {
							// @ts-ignore
							const r = routes[key];
							return (
								<Styled.List key={key}>
									<li>
										<Styled.ParentLink to={r.hasOwnProperty("path") ? r.path : "#"}>
											{t(`menu.${r.title}`)}
										</Styled.ParentLink>
									</li>
									{r.hasOwnProperty("routes") &&
										Object.values(r.routes).map((item: any, index) => {
											return (
												<li key={`${key}-${index}`}>
													<Styled.NestedLink to={item.path}>
														{t(`menu.${item.title}`)}
													</Styled.NestedLink>
												</li>
											);
										})}
								</Styled.List>
							);
						})}
					</Styled.ListWrap>
				</Styled.ListContainer>

				<Styled.MobileSocials className="d-flex d-lg-none flex-column align-items-center justify-content-center footer__mobile-socials">
					<Socials />
					<Styled.CopyRight className="footer__copyright">
						<Trans i18nKey={"app.copyright"} values={{ company: "OctoFi" }}>
							Decentralized Finance Tentacles
						</Trans>
					</Styled.CopyRight>
				</Styled.MobileSocials>
			</Styled.Content>
		</Styled.Footer>
	);
};

export default Footer;
