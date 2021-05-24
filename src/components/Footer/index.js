import { Link } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import styled from "styled-components";
import Logo from "../Logo";
import "./styles.scss";
import Socials from "../Socials";
import { routes } from "../../constants/headerRoutes";
import DesktopImage from "../../assets/images/footer/footer-desktop.png";
import MobileImage from "../../assets/images/footer/footer-mobile.png";
import FooterBG from "../../assets/images/footer_1.svg";
import FooterSecondBG from "../../assets/images/footer_2.svg";

const Container = styled.footer`
	background-color: ${({ theme }) => theme.modalBG};
	border: 1px solid ${({ theme }) => theme.text4};
	border-bottom-width: 0;
	border-radius: 18px;
	padding: 74px 70px 115px;
	margin: 113px -86px -1px;
	position: relative;

	@media (max-width: 991px) {
		margin: 82px 0 0;

		padding: 21px 24px 40px;
	}

	&::before {
		content: "";
		width: 270px;
		height: 290px;
		position: absolute;
		right: 32px;
		top: -102px;
		background-image: url(${({ desktop }) => desktop});
		background-repeat: no-repeat;
		background-size: contain;

		@media (max-width: 991px) {
			background-image: url(${({ mobile }) => mobile});
			width: 149px;
			height: 158px;
			right: 0;
			top: -72px;
		}
	}
`;

const Content = styled.div`
	z-index: 10;
	position: relative;
`;

const FooterAbout = styled.div`
	width: 275px;
`;

const BG = styled.div`
	position: absolute;
	z-index: 1;
	width: 100%;
	height: 100%;
	border-radius: 18px;
	top: 0;
	left: 0;
	overflow: hidden;

	&::before {
		content: "";
		position: absolute;
		top: -46px;
		left: 0;
		background-image: url(${({ imageOne }) => imageOne});
		background-size: 876px 331px;
		background-repeat: no-repeat;
		width: 876px;
		height: 331px;

		@media (max-width: 991px) {
			bottom: -9px;
			left: -130px;
			right: auto;
			background-size: 705px 267px;
			width: 705px;
			height: 267px;
		}
	}

	&::after {
		content: "";
		position: absolute;
		bottom: -9px;
		right: 42px;
		background-image: url(${({ imageTwo }) => imageTwo});
		background-size: 810px 282px;
		background-repeat: no-repeat;
		width: 810px;
		height: 282px;
		z-index: 1;

		@media (max-width: 991px) {
			bottom: -197px;
			left: -369px;
			right: auto;
			background-size: 827px 288px;
			width: 827px;
			height: 288px;
		}
	}
`;

const MobileSocials = styled.div`
	padding-top: 60px;
`;

const LogoContainer = styled.div`
	margin-bottom: 67px;

	@media (max-width: 991px) {
		margin-bottom: 0;
	}
`;

const CopyRight = styled.div`
	font-size: 0.875rem;

	&.link {
		color: inherit;
		text-decoration: none;

		&:hover {
			text-decoration: none;
			color: ${({ theme }) => theme.text2};
		}
	}
`;

const List = styled.div`
	padding-top: 96px;

	@media (max-width: 991px) {
		padding-top: 47px;
		flex-wrap: wrap;
	}
`;

const ListContainer = styled.div`
	flex: 1;
`;

const Links = styled.ul`
	list-style: none;
	margin: 0;
	padding: 0 45px 0 0;

	@media (max-width: 991px) {
		padding-right: 16px;
		flex-basis: 50%;
	}
`;

const StyledLink = styled(Link)`
	text-decoration: none;
	font-weight: 400;
	display: block;
	color: ${({ theme }) => theme.text1};
	margin-bottom: 22px;
	white-space: nowrap;
	font-size: 0.875rem;

	&.footer__link--primary {
		color: ${({ theme }) => theme.primary};
		margin-bottom: 24px;
		font-weight: 500;
	}

	&:hover {
		text-decoration: none;
		outline: none;
		color: ${({ theme }) => theme.text2};
	}
`;

const Footer = (props) => {
	const { t } = useTranslation();

	return (
		<Container className="footer" desktop={DesktopImage} mobile={MobileImage}>
			<BG className="footer__bg" imageOne={FooterBG} imageTwo={FooterSecondBG} />
			<Content className="footer__content w-100 d-flex flex-column flex-lg-row">
				<FooterAbout className={"d-flex flex-column footer__about"}>
					<LogoContainer className="footer__logo">
						<Logo />
					</LogoContainer>
					<div className="d-none d-lg-flex flex-column">
						<Socials />
						<CopyRight className="footer__copyright">
							<Trans i18nKey={"app.copyright"} values={{ company: "OctoFi" }}>
								Decentralized Finance Tentacles {" "}
								<a href="#none" className={"link"}>
								</a>
							</Trans>
						</CopyRight>
					</div>
				</FooterAbout>
				<ListContainer className={"footer__list-container"}>
					<List className="d-flex footer__list">
						{Object.keys(routes).map((key) => {
							const r = routes[key];
							return (
								<Links className="footer__links" key={key}>
									<li className={"footer__item"}>
										<StyledLink
											to={r.hasOwnProperty("path") ? r.path : "#"}
											className={"footer__link footer__link--primary"}
										>
											{t(`menu.${r.title}`)}
										</StyledLink>
									</li>
									{r.hasOwnProperty("routes") &&
										Object.values(r.routes).map((item, index) => {
											return (
												<li className={"footer__item"} key={`${key}-${index}`}>
													<StyledLink to={item.path} className={"footer__link"}>
														{t(`menu.${item.title}`)}
													</StyledLink>
												</li>
											);
										})}
								</Links>
							);
						})}
					</List>
				</ListContainer>

				<MobileSocials className="d-flex d-lg-none flex-column align-items-center justify-content-center footer__mobile-socials">
					<Socials />
					<CopyRight className="footer__copyright">
						<Trans i18nKey={"app.copyright"} values={{ company: "OctoFi" }}>
							Decentralized Finance Tentacles {" "}
							<a href="#none" className={"link"}>
							</a>
						</Trans>
					</CopyRight>
				</MobileSocials>
			</Content>
		</Container>
	);
};

export default Footer;
