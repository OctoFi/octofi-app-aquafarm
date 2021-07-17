import Page from "../../components/Page";
import GraphQlProvider from "./Provider";
import GlobalOverall from "./GlobalOverall";
import BorrowCommon from "./Common";
import ModalProvider from "./ModalProvider";

const Borrow = () => {
	return (
		<Page title={"Loans"} networkSensitive={true}>
			<GraphQlProvider>
				<ModalProvider />
				<GlobalOverall />
				<BorrowCommon />
			</GraphQlProvider>
		</Page>
	);
};

export default Borrow;
