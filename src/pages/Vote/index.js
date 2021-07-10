import React, { useEffect, useState, useCallback } from "react";
import { Row, Col, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { useWeb3React } from "@web3-react/core";

import { formatProposal, getScores } from "../../lib/utils";
import Governance from "../../http/governance";
import { useWalletModalToggle } from "../../state/application/hooks";
import { fetchProposals, fetchSpaces } from "../../state/governance/actions";
import { Modal } from "../../components/Modal/bootstrap";
import Card from "../../components/Card";
import Loading from "../../components/Loading";
import Page from "../../components/Page";
import VoteCast from "./VoteCast";
import ProposalContent from "./ProposalContent";
import ProposalVotes from "./ProposalVotes";
import VoteInformation from "./VoteInformation";
import VoteResults from "./VoteResults";

const Vote = (props) => {
	const { account, library } = useWeb3React();
	const [selectedProposal, setSelectedProposal] = useState(false);
	const [selectedVote, setSelectedVote] = useState(null);
	const [showModal, setShowModal] = useState(false);
	const [votes, setVotes] = useState({});
	const [result, setResult] = useState({});
	const [status, setStatus] = useState({});
	const dispatch = useDispatch();
	const toggleWalletModal = useWalletModalToggle();
	const { spaces, loading: governanceLoading, proposals } = useSelector((state) => state.governance);
	const { t } = useTranslation();
	const api = new Governance();

	let id = props.match.params.space;
	let address = props.match.params.id;
	let space = spaces[id];

	useEffect(() => {
		if (Object.keys(spaces).length === 0) {
			dispatch(fetchSpaces());
		} else {
			if (spaces.hasOwnProperty(id)) {
				dispatch(fetchProposals(id));
				api.get("votes", { id, address })
					.then((response) => {
						setVotes(response);
					})
					.catch((error) => {
						toast.error("Cannot get votes, Please try again in a minute");
					});
			} else {
				props.history.push("/governance");
			}
		}
	}, [spaces, id, address, dispatch, props.history]);

	const getVotes = () => {
		api.get("votes", { id, address })
			.then((response) => {
				setVotes(response);
			})
			.catch((error) => {
				toast.error("Cannot get votes, Please try again in a minute");
			});
	};

	const transformVotes = async (votes, proposals) => {
		let result = {};
		if (Object.keys(votes).length > 0) {
			const selectedProposals =
				proposals.hasOwnProperty(id) && proposals[id].hasOwnProperty(address)
					? formatProposal(Object.assign({}, proposals[id][address]))
					: formatProposal({});
			const scores = await getScores(id, space.strategies, space.network, library, Object.keys(votes));
			result.votes = Object.fromEntries(
				Object.entries(votes)
					.map((vote) => {
						let transformed = [vote[0], Object.assign({}, vote[1])];
						transformed[1].scores = space.strategies.map(
							(strategy, i) => scores[i][transformed[1].address] || 0
						);
						transformed[1].balance = transformed[1].scores.reduce((a, b) => a + b, 0);
						return transformed;
					})
					.sort((a, b) => b[1].balance - a[1].balance)
			);
			result.results = {
				totalVotes: selectedProposals.msg?.payload?.choices?.map(
					(choice, i) =>
						Object.values(result.votes).filter((vote) => vote.msg.payload.choice === i + 1).length
				),
				totalBalances: selectedProposals.msg?.payload?.choices?.map((choice, i) =>
					Object.values(result.votes)
						.filter((vote) => vote.msg.payload.choice === i + 1)
						.reduce((a, b) => a + b.balance, 0)
				),
				totalScores: selectedProposals.msg?.payload?.choices?.map((choice, i) =>
					space.strategies.map((strategy, sI) =>
						Object.values(result.votes)
							.filter((vote) => vote.msg.payload.choice === i + 1)
							.reduce((a, b) => a + b.scores[sI], 0)
					)
				),
				totalVotesBalances: Object.values(result.votes).reduce((a, b) => a + b.balance, 0),
			};
			setResult(result);
		}
	};

	useEffect(() => {
		transformVotes(votes, proposals);
	}, [proposals, votes]);

	useEffect(() => {
		if (proposals.hasOwnProperty(id)) {
			if (proposals[id].hasOwnProperty(address)) {
				setSelectedProposal(proposals[id][address]);
				const ts = (Date.now() / 1e3).toFixed();
				const { start, end } = proposals[id][address].msg.payload;
				let state =
					ts > end
						? { title: "Closed", className: "label-light-danger" }
						: ts > start
						? { title: "Active", className: "label-light-success" }
						: { title: "Pending", className: "label-light-info" };
				setStatus(state);
			} else {
				props.history.push(`/governance/${id}`);
			}
		} else {
			setSelectedProposal(false);
		}
	}, [proposals, id, address, props.history]);

	const handleSubmit = useCallback(async () => {
		if (!account) {
			toggleWalletModal();
			return false;
		}
		const options = {
			token: spaces[id].token,
			type: "vote",
			space: id,
			payload: {
				proposal: address,
				choice: selectedVote,
				metadata: {},
			},
		};
		const msg = {
			address: account,
			msg: JSON.stringify({
				version: "0.1.3",
				timestamp: (Date.now() / 1e3).toFixed(),
				...options,
			}),
		};
		try {
			toast("Sending ...", {
				icon: "💡",
			});
			const signer = library.getSigner(account);
			msg.sig = await signer.signMessage(msg.msg);
			const res = await api.sendMessage(msg);
			toast.success("Your Vote is in!");
			if (res.hasOwnProperty("ipfsHash")) {
				getVotes();
			}
			setShowModal(false);
		} catch (error) {
			toast.error("Something went wrong!");
		}
	}, [selectedProposal, selectedVote, account, address, api, id, library, spaces]);

	return (
		<Page title={t("governance.title")} networkSensitive={true}>
			{governanceLoading && !selectedProposal ? (
				<Card>
					<div className="d-flex align-items-center justify-content-center py-5 w-100">
						<Loading color={"primary"} width={40} height={40} active id={"vote-loading"} />
					</div>
				</Card>
			) : (
				selectedProposal && (
					<Row className={"custom-row"}>
						<Col className={"order-2 order-md-1"} xs={12} md={8}>
							<Row>
								<Col xs={12} className={"gutter-b"}>
									<ProposalContent proposal={selectedProposal} status={status} />
								</Col>
								{status.title === "Active" && (
									<Col xs={12} className={"gutter-b"}>
										{selectedProposal && (
											<VoteCast
												proposal={selectedProposal}
												selected={selectedVote}
												onSelectOption={setSelectedVote}
												onVote={() => {
													!account ? toggleWalletModal() : setShowModal(true);
												}}
											/>
										)}
									</Col>
								)}
								<Col xs={12} className={"gutter-b"}>
									{votes && result && selectedProposal && (
										<ProposalVotes
											votes={votes}
											result={result}
											proposal={selectedProposal}
											space={space}
										/>
									)}
								</Col>
							</Row>
						</Col>
						<Col className={"order-1 order-md-2"} xs={12} md={4}>
							{selectedProposal && (
								<VoteInformation proposal={selectedProposal} space={spaces[id]} id={id} />
							)}

							{result?.results && (
								<VoteResults
									result={result.results}
									choices={selectedProposal?.msg?.payload?.choices}
									symbol={space?.symbol}
								/>
							)}
						</Col>
					</Row>
				)
			)}

			{selectedProposal && (
				<Modal show={showModal} centered onHide={() => setShowModal(false)}>
					<Modal.Header closeButton>
						<Modal.Title>Confirm Vote</Modal.Title>
					</Modal.Header>

					<Modal.Body>
						<p>
							{t("governance.voteConfirmation")} "{selectedProposal.msg.payload.choices[selectedVote - 1]}
							"? <br />
							{t("governance.voteWarning")}
						</p>
						<div className="pt-4 d-flex align-items-center justify-content-end">
							<Button variant="outline-danger" onClick={() => setShowModal(false)}>
								{t("close")}
							</Button>
							<Button variant="primary" onClick={handleSubmit} className={"ml-3"}>
								{t("governance.vote")}
							</Button>
						</div>
					</Modal.Body>
				</Modal>
			)}
		</Page>
	);
};

export default Vote;
