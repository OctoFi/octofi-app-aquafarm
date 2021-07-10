import { Trans } from "react-i18next";
import Socials from "../Socials";
import * as Styled from "./styleds";

const Footer = () => {
	return (
		<Styled.Footer className="d-flex flex-column align-items-center justify-content-center">
			<Socials />
			<Styled.CopyRight className="mt-3">
				<Trans i18nKey={"app.copyright"} values={{ company: "OctoFi" }}>
					Decentralized Finance Tentacles
				</Trans>
			</Styled.CopyRight>
		</Styled.Footer>
	);
};

export default Footer;
