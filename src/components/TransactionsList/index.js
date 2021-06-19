import { useTranslation } from "react-i18next";
import { getEtherscanLink } from "../../utils";
import { StyledBox, TxnBox, EmptyText } from "./styles";

const TransactionsList = ({ transactions }) => {
	const { t } = useTranslation();

	return (
		<StyledBox>
			{transactions && transactions?.length > 0 ? (
				transactions.map((txn) => {
					return (
						<TxnBox
							href={txn?.hash ? getEtherscanLink(1, txn?.hash, "transaction") : "#"}
							target={"_blank"}
							rel={"noreferrer noopener"}
						>
							{txn?.hash ? txn?.hash?.slice(0, 6) + "..." + txn?.hash?.slice(-4) : "-"} 🡕
						</TxnBox>
					);
				})
			) : (
				<EmptyText>{t("errors.noRecentTransaction")}</EmptyText>
			)}
		</StyledBox>
	);
};

export default TransactionsList;
