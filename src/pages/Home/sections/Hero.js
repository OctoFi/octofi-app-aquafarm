import { Col, Button } from "react-bootstrap";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

import { useWalletModalToggle } from "../../../state/application/hooks";
import Hero1 from "../../../assets/images/hero/hero_1.png";
import "./hero.scss";
import { useActiveWeb3React } from "../../../hooks";
import { useIsDarkMode } from "../../../state/user/hooks";

const StyleButton = styled(Button)`
	height: 56px;

	&.btn-lg {
		height: 70px;
		padding: 20px 32px;
	}
`;

const Hero = (props) => {
	const toggleConnectModal = useWalletModalToggle();
	const { t } = useTranslation();
	const { account } = useActiveWeb3React();
	const darkMode = useIsDarkMode();

	return (
		<section className="row hero section d-flex">
			<Col xs={12} className={"hero__concept"}>
				<img src={Hero1} alt={"OctoFi"} draggable={false} className={"hero__image hero__image--one"} />
			</Col>
			<Col xs={12} className={"d-flex align-items-center justify-content-center flex-column text-center"}>
				<h1 className={"h1 mt-0 hero__title text-center"}>{t("app.description")}</h1>
				<div className="align-items-center align-self-stretch align-self-lg-auto justify-content-center text-center">
					<StyleButton
						variant={darkMode ? "outline-primary" : "primary"}
						onClick={toggleConnectModal}
						className={"btn-lg w-100 w-lg-auto"}
					>
						{account ? t("wallet.viewOrChange") : t("wallet.connect")}
					</StyleButton>
				</div>
			</Col>
		</section>
	);
};

export default Hero;
