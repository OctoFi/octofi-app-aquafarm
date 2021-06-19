import { useMemo } from "react";
import { useAllTransactions } from "../../state/transactions/hooks";
import TransactionsList from "./index";

const RecentTransactionsList = () => {
	const transactions = useAllTransactions();

	const filteredTransactions = useMemo(() => {
		return Object.values(transactions)?.slice(0, 8);
	}, [transactions]);

	return <TransactionsList transactions={filteredTransactions} />;
};

export default RecentTransactionsList;
