import { useTranslation } from "react-i18next";
import Page from "../../components/Page";
import InstantSwap from "../../components/InstantSwap";

const History = () => {
	const { t } = useTranslation();

	return (
		<Page title={t("exchange.title")} networkSensitive={false}>
			<InstantSwap />
		</Page>
	);
};

export default History;
