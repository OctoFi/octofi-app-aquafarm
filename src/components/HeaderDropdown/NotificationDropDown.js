import SVG from "react-inlinesvg";
import { withRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BellIcon from "../../assets/images/bell.svg";
import PendingTransactionsList from "../TransactionsList/PendingTransactionsList";
import ConfirmedTransactionsList from "../TransactionsList/ConfirmedTransactionsList";
import { Wrapper, Item, DropDown, IconButton, Title, SeeAllButton } from "./styles";

const NotificationDropdown = () => {
	const { t } = useTranslation();

	return (
		<Wrapper>
			<Item>
				<IconButton variant={"link"} className={"py-0 px-0"}>
					<SVG src={BellIcon} />
				</IconButton>
			</Item>
			<DropDown className={"header-dropdown"}>
				<Title>{t("pendingTransactions")}</Title>
				<PendingTransactionsList />
				<Title>{t("confirmedTransactions")}</Title>
				<ConfirmedTransactionsList />
				<SeeAllButton to={"/history"}>{t("seeAllTransactions")}</SeeAllButton>
			</DropDown>
		</Wrapper>
	);
};

export default withRouter(NotificationDropdown);
