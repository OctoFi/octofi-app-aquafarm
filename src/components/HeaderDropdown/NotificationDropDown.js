import { withRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bell } from "react-feather";
import PendingTransactionsList from "../TransactionsList/PendingTransactionsList";
import ConfirmedTransactionsList from "../TransactionsList/ConfirmedTransactionsList";
import * as Styled from "./styles";

const NotificationDropdown = () => {
	const { t } = useTranslation();

	return (
		<Styled.Wrapper>
			<Styled.Item>
				<Styled.IconButton variant={"link"} className={"py-0 px-0"}>
					<Bell size={22} />
				</Styled.IconButton>
			</Styled.Item>
			<Styled.DropDown className={"header-dropdown"}>
				<Styled.Title>{t("pendingTransactions")}</Styled.Title>
				<PendingTransactionsList />
				<Styled.Title>{t("confirmedTransactions")}</Styled.Title>
				<ConfirmedTransactionsList />
				<Styled.SeeAllButton to={"/history"}>{t("seeAllTransactions")}</Styled.SeeAllButton>
			</Styled.DropDown>
		</Styled.Wrapper>
	);
};

export default withRouter(NotificationDropdown);
