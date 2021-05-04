import { useCallback, useEffect } from "react";
import toast from "react-hot-toast";

import { getEtherscanLink } from "../../utils";
import { useActiveWeb3React } from "../../hooks";
import { useActivePopups, useRemovePopup } from "../../state/application/hooks";

const TransactionHandler = (props) => {
	const { chainId } = useActiveWeb3React();
	const activePopups = useActivePopups();
	const removePopup = useRemovePopup();

	useEffect(() => {
		activePopups.map((item) => {
			confirmTransaction(item.content, item.key);
			return item;
		});
	}, [activePopups]);

	const confirmTransaction = useCallback((e, key) => {
		toast((t) => {
			return (
				<div className="d-flex flex-column">
					<span className={"d-block mb-3"}>{e?.txn?.summary}</span>
					<a
						href={getEtherscanLink(chainId, e?.txn?.hash, "transaction")}
						className={`btn btn-sm btn-light-${e?.txn?.success ? "primary" : "danger"} cursor-pointer`}
						target={"_blank"}
						rel={"noreferrer noopener"}
					>
						View on Etherscan 🡕
					</a>
				</div>
			);
		});
		setTimeout(() => {
			removePopup(key);
		}, 5000);
	}, []);

	return null;
};

export default TransactionHandler;
