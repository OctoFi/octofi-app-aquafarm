import { useMemo } from "react";
import { useAllTransactions } from "../../state/transactions/hooks";
import TransactionsList from "./index";

const ConfirmedTransactionsList = () => {
	const transactions = useAllTransactions();

	const filteredTransactions = useMemo(() => {
		return Object.values(transactions)
			?.filter((txn) => txn?.hasOwnProperty("confirmedTime") && typeof txn.confirmedTime === "number")
			?.slice(0, 3);
	}, [transactions]);

	return <TransactionsList transactions={filteredTransactions} />;
};

export default ConfirmedTransactionsList;
