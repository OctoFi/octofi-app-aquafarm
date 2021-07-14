import { Row, Col } from "react-bootstrap";
import Page from "../../components/Page";
import FiatOnramp from "../../components/FiatOnramp";
import * as Styled from "./styleds";

const FiatOn = () => {
	return (
		<Page title={undefined} networkSensitive={false}>
			<Row>
				<Col xs={12} lg={6} className="mb-4 mb-lg-0">
					<h2 className="mb-4">
						Buy Crypto with <Styled.Company>Transak</Styled.Company>
					</h2>
					<Styled.List className="list-unstyled">
						<li className="mb-2">Use credit, debit, or bank transfer to purchase crypto.</li>
						<li className="mb-2">Receive it in your wallet.</li>
						<li className="mb-2">Start trading and investing instantly.</li>
					</Styled.List>
				</Col>
				<Col xs={12} lg={6}>
					<FiatOnramp />
				</Col>
			</Row>
		</Page>
	);
};

export default FiatOn;
