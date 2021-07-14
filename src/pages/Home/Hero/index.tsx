import { Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";

import Hero1 from "../../../assets/images/hero/hero_1.png";
import { useActiveWeb3React } from "../../../hooks";
import { useWalletModalToggle } from "../../../state/application/hooks";
import * as Styled from "./styleds";

const Hero = () => {
	const toggleConnectModal = useWalletModalToggle();
	const { t } = useTranslation();
	const { account } = useActiveWeb3React();

	return (
		<Styled.Hero className="row section d-flex">
			<Styled.ConceptCol xs={12}>
				<Styled.Image1 src={Hero1} alt={"OctoFi"} draggable={false} />
			</Styled.ConceptCol>

			<Col xs={12} className={"d-flex align-items-center justify-content-center flex-column text-center"}>
				<Styled.Title className={"h1 mt-0 text-center"}>{t("app.description")}</Styled.Title>
				<div className="align-items-center align-self-stretch align-self-sm-auto justify-content-center text-center">
					<Styled.CustomButton
						variant={"primary"}
						onClick={toggleConnectModal}
						size={"lg"}
						className={"w-100"}
					>
						{account ? t("wallet.viewOrChange") : t("wallet.connect")}
					</Styled.CustomButton>
				</div>
			</Col>
		</Styled.Hero>
	);
};

export default Hero;
