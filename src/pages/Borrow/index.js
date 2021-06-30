import GraphQlProvider from "./Provider";
import Page from "../../components/Page";
import GlobalOverall from "./GlobalOverall";
import BorrowCommon from "./Common";
import "./style.scss";
import ModalProvider from "./ModalProvider";

const Borrow = (props) => {
	return (
		<Page title={"Loans"} notNetworkSensitive={false}>
			<GraphQlProvider>
				<ModalProvider />
				<GlobalOverall />
				<BorrowCommon />
			</GraphQlProvider>
		</Page>
	);
};

export default Borrow;
