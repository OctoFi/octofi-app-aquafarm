import { useTranslation } from "react-i18next";
import { Row, Col } from "react-bootstrap";
import Page from "../../components/Page";
import InstantSwap from "../../components/InstantSwap";
import Uniswap from "../../components/Uniswap";

const History = () => {
	const { t } = useTranslation();

	return (
		<Page title={t("exchange.title")} networkSensitive={false}>
			<Row>
				<Col xs={12} md={6}>
					<h3 className="mb-3">Uniswap</h3>
					<Uniswap />
				</Col>
				<Col xs={12} md={6}>
					<h3 className="mb-3">Aggregator</h3>
					<InstantSwap />
				</Col>
			</Row>
		</Page>
	);
};

export default History;
