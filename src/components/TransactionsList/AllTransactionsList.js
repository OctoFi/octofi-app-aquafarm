import { useAllTransactions } from "../../state/transactions/hooks";
import TransactionsList from "./index";

const AllTransactionsList = () => {
	const transactions = useAllTransactions();

	return <TransactionsList transactions={transactions} />;
};

export default AllTransactionsList;
