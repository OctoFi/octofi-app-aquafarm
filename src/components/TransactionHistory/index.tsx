import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { CSVLink } from "react-csv";
import moment from "moment";
import axios from "axios";

import { useActiveWeb3React } from "../../hooks";
import Collapse from "../Collapse";
import HistorySectionList from "../HistorySectionList";
import ExchangeIcon from "../Icons/Exchange";
import * as Styled from "./styleds";

const TransactionHistory = () => {
	const { t } = useTranslation();
	const { account } = useActiveWeb3React();
	const PAGE_SIZE = 30;
	const [loading, setLoading] = useState(false);
	const [blockNumber, setBlockNumber] = useState(9999999999);
	const [finished, setFinished] = useState(false);
	const [sections, setSections] = useState<Array<any>>([]);
	const [transactions, setTransactions] = useState([]);

	useEffect(() => {
		if (account) {
			setFinished(false);
			fetchTransactions();
		} else {
			setFinished(true);
			setLoading(false);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [account]);

	const fetchTransactions = async () => {
		if (finished) {
			return;
		}

		setLoading(true);
		let txnRes = await axios.get(
			`https://api.etherscan.io/api?module=account&action=txlist&address=${account}&startblock=0&endblock=${blockNumber}&page=1&offset=${PAGE_SIZE}&sort=desc&apikey=${process.env.REACT_APP_ETHERSCAN_API_KEY}`
		);
		let erc20Res = await axios.get(
			`https://api.etherscan.io/api?module=account&action=tokentx&address=${account}&startblock=0&endblock=${blockNumber}&page=1&offset=${PAGE_SIZE}&sort=desc&apikey=${process.env.REACT_APP_ETHERSCAN_API_KEY}`
		);

		let ethLastBlock =
			txnRes.data.status === "1" ? txnRes.data.result[txnRes.data.result.length - 1].blockNumber : 0;
		let ercLastBlock =
			erc20Res.data.status === "1" ? erc20Res.data.result[erc20Res.data.result.length - 1].blockNumber : 0;

		let lastBlock;
		let isFinished = false;

		if (txnRes.data.result.length < PAGE_SIZE && erc20Res.data.result.length < PAGE_SIZE) {
			lastBlock = ethLastBlock < ercLastBlock ? ethLastBlock : ercLastBlock;
			isFinished = true;
		} else {
			lastBlock = ethLastBlock > ercLastBlock ? ethLastBlock : ercLastBlock;
		}
		let mixed = [...txnRes.data.result, ...erc20Res.data.result];

		let result = {};
		for (let i in mixed) {
			const txn = mixed[i];
			if (txn.blockNumber >= lastBlock) {
				if (!result.hasOwnProperty(txn.timeStamp)) {
					// @ts-ignore
					result[txn.timeStamp] = {
						[txn.hash]: [txn],
					};
				} else {
					// @ts-ignore
					if (!result[txn.timeStamp].hasOwnProperty(txn.hash)) {
						// @ts-ignore
						result[txn.timeStamp][txn.hash] = [{ ...txn }];
					} else {
						// @ts-ignore
						result[txn.timeStamp][txn.hash].push({ ...txn });
					}
				}
			}
		}

		let newSections: Array<any> = [];
		for (let i in result) {
			const title = moment(i, "X").format("MMMM D, YYYY");
			let item = newSections.findIndex((item) => item.title === title);
			// @ts-ignore
			let newTransactions = Object.keys(result[i]);
			if (item > -1) {
				newSections[item].content.push(
					...newTransactions.map((t, ti) => {
						// @ts-ignore
						const txn = result[i][t];
						return <Collapse txn={txn} key={`${t}-${ti}`} />;
					})
				);
			} else {
				newSections.push({
					title,
					content: newTransactions.map((t, ti) => {
						// @ts-ignore
						const txn = result[i][t];
						return <Collapse txn={txn} key={t} />;
					}),
				});
			}
		}

		for (let i in newSections) {
			newSections[i].content.reverse();
		}
		newSections.reverse();

		setBlockNumber(lastBlock - 1);
		setFinished(isFinished);
		setSections((prevSections) => {
			return [...prevSections, ...newSections];
		});
		setTransactions(transactions.concat(txnRes.data.result, erc20Res.data.result));
		setLoading(false);
	};

	return (
		<Styled.CustomCard
			header={
				<Styled.Header className={"d-flex align-items-center justify-content-between"}>
					<Styled.Title>{t("history")}</Styled.Title>
					{account && transactions && (
						<CSVLink data={transactions} filename={`${account}_${blockNumber}__defi_dashboard.csv`}>
							<Button variant={"outline-primary"}>{t("download", { file: "CSV" })}</Button>
						</CSVLink>
					)}
				</Styled.Header>
			}
		>
			{account ? (
				<>
					{finished && sections.length === 0 && (
						<div className="d-flex flex-column align-items-center justify-content-center py-5 px-4">
							<ExchangeIcon size={48} fill={"#6993FF"} color={"#6993FF"} />
							<h5 className="text-primary font-weight-bolder mb-3 mt-5">{t("errors.noTransaction")}</h5>
							<span className="text-muted font-weight-light font-size-lg">
								{t("errors.noTransactionDesc")}
							</span>
						</div>
					)}

					{sections.length > 0 && <HistorySectionList sections={sections} />}

					{!finished && (
						<div className="d-flex flex-column align-items-center py-4">
							<Button onClick={fetchTransactions} disabled={loading}>
								{loading ? "Loading…" : "Load More"}
							</Button>
						</div>
					)}
				</>
			) : (
				<div className="d-flex flex-column align-items-center justify-content-center py-5 px-4">
					<ExchangeIcon size={48} fill={"#6993FF"} color={"#6993FF"} />
					<h5 className="text-primary font-weight-bolder mb-3 mt-5">{t("wallet.notConnected")}</h5>
					<span className="text-muted font-weight-light font-size-lg">{t("errors.walletConnect")}</span>
				</div>
			)}
		</Styled.CustomCard>
	);
};

export default TransactionHistory;
