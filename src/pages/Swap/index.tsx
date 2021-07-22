import { Row, Col } from "react-bootstrap";
import Page from "../../components/Page";
import Uniswap from "../../components/Uniswap";

const Swap = () => {
	return (
		<Page title={"Uniswap"} networkSensitive={true}>
			<Row>
				<Col xs={12} sm={10} lg={8} xl={6}>
					<Uniswap />
				</Col>
			</Row>
		</Page>
	);
};

export default Swap;
