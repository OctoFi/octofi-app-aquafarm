import { Row, Col } from "react-bootstrap";

import GraphQlProvider from "./Provider";
import Page from "../../components/Page";
import GlobalOverall from "./GlobalOverall";
import BorrowCommon from "./Common";
import "./style.scss";
import ModalProvider from "./ModalProvider";
import styled from "styled-components";

const StyledRow = styled(Row)`
	margin-top: 40px;

	@media (max-width: 767px) {
		margin-top: 20px;
	}
`;

const Borrow = (props) => {
	return (
		<Page>
			<GraphQlProvider>
				<ModalProvider />
				<StyledRow>
					<Col xs={12}>
						<GlobalOverall />
					</Col>
					<Col xs={12}>
						<BorrowCommon />
					</Col>
				</StyledRow>
			</GraphQlProvider>
		</Page>
	);
};

export default Borrow;
