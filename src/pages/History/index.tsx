import { useTranslation } from "react-i18next";
import Page from "../../components/Page";
import TransactionHistory from "../../components/TransactionHistory";

const History = () => {
	const { t } = useTranslation();

	return (
		<Page title={t("transactionHistory")} networkSensitive={false}>
			<TransactionHistory />
		</Page>
	);
};

export default History;
