import { useMemo } from "react";
import { useAllTransactions } from "../../state/transactions/hooks";
import TransactionsList from "./index";

const PendingTransactionsList = () => {
	const transactions = useAllTransactions();

	const filteredTransactions = useMemo(() => {
		return Object.values(transactions)
			?.filter((txn) => !txn?.hasOwnProperty("confirmedTime"))
			?.slice(0, 3);
	}, [transactions]);

	return <TransactionsList transactions={filteredTransactions} />;
};

export default PendingTransactionsList;
