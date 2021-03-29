import { Row, Col } from "react-bootstrap";
import styled from "styled-components";

import Page from "../../components/Page";
import Card from "../../components/Card";
import "./style.scss";
import { BITREFILL_REF_TOKEN } from "../../constants";
import { useIsDarkMode } from "../../state/user/hooks";

const StyledCard = styled(Card)`
	margin-top: 86px;

	@media (max-width: 767px) {
		margin-top: 40px;
	}
`;

const FiatOff = (props) => {
	const darkMode = useIsDarkMode();
	return (
		<Page hasBg>
			<Row>
				<Col xs={12} md={{ offset: 1, span: 10 }} lg={{ offset: 3, span: 6 }}>
					<StyledCard className={"fiat__card"}>
						<iframe
							src={`https://embed.bitrefill.com/?theme=${
								darkMode ? "dark" : "light"
							}&ref=${BITREFILL_REF_TOKEN}`}
							frameborder="0"
							sandbox="allow-same-origin allow-popups allow-scripts allow-forms"
							className={"fiat__embed"}
						/>
					</StyledCard>
				</Col>
			</Row>
		</Page>
	);
};

export default FiatOff;
