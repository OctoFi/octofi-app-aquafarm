import React, { useEffect, useState } from "react";
import { Row, Col, Form } from "react-bootstrap";
import DatePicker from "react-modern-calendar-datepicker";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import moment from "moment";
import "react-modern-calendar-datepicker/lib/DatePicker.css";

import { ResponsiveCard } from "../../components/Card";
import { fetchSpaces } from "../../state/governance/actions";
import { useActiveWeb3React } from "../../hooks";
import Governance from "../../http/governance";
import Page from "../../components/Page";
import "./style.scss";
import Loading from "../../components/Loading";
import { toast } from "react-hot-toast";
import { useWalletModalToggle } from "../../state/application/hooks";
import { useTranslation } from "react-i18next";

const Header = styled.div`
	padding: 0;
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 40px;
	margin-top: 10px;
	border: none;
	background-color: transparent;
`;

const Title = styled.h2`
	font-size: 1.25rem;
	font-weight: 700;
	color: ${({ theme }) => theme.text1};
	margin: 0;
`;

const FormRow = styled(Form.Row)``;

const FormGroup = styled(Form.Group)`
	display: flex;
	flex-direction: column;
	margin-bottom: 30px;
`;

const FormLabel = styled(Form.Label)`
	font-size: 0.875rem;
	font-weight: 500;
	margin-bottom: 15px;

	@media (min-width: 768px) {
		font-size: 1rem;
	}
`;

const FormControl = styled(Form.Control)`
	border-radius: 18px;
	background-color: ${({ theme }) => theme.bg1};
	min-height: 56px;
	padding: 18px 20px;
	color: ${({ theme }) => theme.text1};
	resize: none;
	border: none;
	font-weight: 400;
	font-size: 0.875rem;

	@media (min-width: 768px) {
		font-size: 1rem;
	}

	::placeholder {
		color: ${({ theme }) => theme.text4};
	}

	&:focus,
	&:active {
		outline: none;
		background-color: ${({ theme }) => theme.bg1};
	}
`;

const CreateProposals = (props) => {
	const { account, library } = useActiveWeb3React();
	const api = new Governance();

	const toggleWalletModal = useWalletModalToggle();
	const dispatch = useDispatch();
	const { spaces } = useSelector((state) => state.governance);
	const { t } = useTranslation();

	const [loading, setLoading] = useState(false);
	const [form, setForm] = useState({
		name: "",
		body: "",
		choices: ["", ""],
		snapshot: [],
		dateRange: {
			from: null,
			to: null,
		},
		metadata: {},
	});

	let id = props.match.params.space;

	const handleChange = (key, value) => {
		setForm((form) => {
			return {
				...form,
				[key]: value,
			};
		});
	};

	const isValid = () => {
		const date = {
			start: moment(`${form.dateRange.from.year}-${form.dateRange.from.month}-${form.dateRange.from.day}`).format(
				"X"
			),
			end: moment(`${form.dateRange.to.year}-${form.dateRange.to.month}-${form.dateRange.to.day}`).format("X"),
		};
		return (
			!loading &&
			account &&
			form.name &&
			form.body &&
			date.start &&
			date.end &&
			date.end > date.start &&
			form.snapshot &&
			form.choices.length >= 2 &&
			!form.choices.some((a) => a === "")
		);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!account) {
			toggleWalletModal();
			return false;
		}
		if (isValid()) {
			setLoading(true);
			const payload = {
				name: form.name,
				body: form.body,
				snapshot: form.snapshot,
				choices: form.choices,
				start: moment(
					`${form.dateRange.from.year}-${form.dateRange.from.month}-${form.dateRange.from.day}`
				).format("X"),
				end: moment(`${form.dateRange.to.year}-${form.dateRange.to.month}-${form.dateRange.to.day}`).format(
					"X"
				),
				metadata: {
					...form.metadata,
					strategies: spaces[id].strategies,
				},
			};

			const options = {
				token: spaces[id].token,
				type: "proposal",
				space: id,
				payload,
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
				msg.sig = await library.getSigner(account).signMessage(msg.msg);
				const res = await api.sendMessage(msg);
				setLoading(false);
				toast.success("Your Proposal is in!");
				if (res.hasOwnProperty("ipfsHash")) {
					props.history.push(`/governance/${id}`);
				}
			} catch (error) {
				toast.error("Something went wrong!");
				setLoading(false);
			}
		} else {
			toast.error("Please fill all Fields and your proposal choices should be more than 1");
		}
	};

	useEffect(() => {
		if (Object.keys(spaces).length === 0) {
			dispatch(fetchSpaces());
		} else {
			if (!spaces.hasOwnProperty(id)) {
				props.history.push("/governance");
			}
		}
	}, [spaces, id, dispatch, props.history]);

	useEffect(() => {
		handleChange("snapshot", library.blockNumber);
	}, [library.blockNumber]);

	const StartDayPicker = ({ ref }) => (
		<FormControl
			ref={ref} // necessary
			placeholder={"Select a Date"}
			value={
				form.dateRange.from
					? `${form.dateRange.from.year}/${form.dateRange.from.month}/${form.dateRange.from.day}`
					: ""
			}
		/>
	);

	const EndDayPicker = ({ ref }) => (
		<FormControl
			ref={ref} // necessary
			placeholder={"Select a Date"}
			value={
				form.dateRange.to ? `${form.dateRange.to.year}/${form.dateRange.to.month}/${form.dateRange.to.day}` : ""
			}
		/>
	);

	return (
		<Page title={t("governance.title")} networkSensitive={true}>
			<Row>
				<Col xs={12}>
					<ResponsiveCard>
						<Header>
							<Title className="card-title">{t("governance.createProposal")}</Title>
						</Header>
						<div>
							<Form>
								<FormRow className={"custom-row"}>
									<FormGroup as={Col} xs={12}>
										<FormLabel>{t("governance.question")}</FormLabel>
										<FormControl
											as={"input"}
											placeholder="Question"
											value={form.name}
											onChange={(e) => handleChange("name", e.target.value)}
										/>
									</FormGroup>
									<FormGroup as={Col} xs={12}>
										<FormLabel>{t("governance.whatIsYourProposal")}</FormLabel>
										<FormControl
											as={"textarea"}
											rows={"8"}
											style={{ resize: "vertical" }}
											placeholder={t("governance.whatIsYourProposal")}
											value={form.body}
											onChange={(e) => handleChange("body", e.target.value)}
										/>
									</FormGroup>
									<Col xs={12}>
										<Row>
											<FormGroup as={Col} xs={12} md={12} lg={4}>
												<FormLabel>Snapshot</FormLabel>
												<FormControl
													placeholder="Snapshot"
													value={form.snapshot}
													onChange={(e) => handleChange("snapshot", e.target.value)}
												/>
											</FormGroup>
											<Col xs={12} md={6} lg={8}>
												<Row>
													<FormGroup as={Col} xs={12} md={6}>
														<FormLabel>{t("startDate")}</FormLabel>
														<DatePicker
															wrapperClassName={"d-flex"}
															value={form.dateRange}
															onChange={(e) => handleChange("dateRange", e)}
															colorPrimary="#0891B2"
															colorPrimaryLight="rgba(6, 115, 141, 0.2)"
															renderInput={StartDayPicker}
															shouldHighlightWeekends
														/>
													</FormGroup>

													<FormGroup as={Col} xs={12} md={6}>
														<FormLabel>{t("endDate")}</FormLabel>
														<DatePicker
															wrapperClassName={"d-flex"}
															value={form.dateRange}
															onChange={(e) => handleChange("dateRange", e)}
															colorPrimary="#0891B2"
															colorPrimaryLight="rgba(6, 115, 141, 0.2)"
															renderInput={EndDayPicker}
															shouldHighlightWeekends
														/>
													</FormGroup>
												</Row>
											</Col>
										</Row>
									</Col>

									<FormGroup as={Col} xs={12} className={"d-flex flex-column"}>
										<FormLabel>{t("choices")}</FormLabel>
										{form.choices.map((item, index) => {
											return (
												<FormControl
													key={`choice-${index + 1}`}
													value={form.choices[index]}
													onChange={(e) => {
														const newChoices = [...form.choices];
														newChoices[index] = e.target.value;
														handleChange("choices", newChoices);
													}}
													placeholder={`${t("choice")} ${index + 1}`}
													className={"mb-3"}
												/>
											);
										})}
										<button
											className="btn btn-link align-self-center align-self-md-end p-0 d-flex align-items-center justify-content-center"
											onClick={(e) => {
												e.preventDefault();
												const newChoices = form.choices.concat("");
												handleChange("choices", newChoices);
											}}
										>
											<svg
												width="15px"
												height="15px"
												viewBox="0 0 16 16"
												className="bi bi-plus-circle"
												fill="currentColor"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													fillRule="evenodd"
													d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"
												/>
												<path
													fillRule="evenodd"
													d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"
												/>
											</svg>
											<span className="pl-2">{t("addChoice")}</span>
										</button>
									</FormGroup>

									<FormGroup
										as={Col}
										className={
											"d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-center mb-0"
										}
									>
										<button
											className="btn btn-primary py-3"
											onClick={handleSubmit}
											style={{ minWidth: 250, marginBottom: 60, marginTop: 30 }}
										>
											{!account ? (
												"Connect Wallet"
											) : loading ? (
												<div
													className={"d-flex align-items-center justify-content-center w-100"}
												>
													<Loading
														width={18}
														height={18}
														active={true}
														color={"#fff"}
														id={"create-proposal"}
													/>
												</div>
											) : (
												t("publish")
											)}
										</button>
									</FormGroup>
								</FormRow>
							</Form>
						</div>
					</ResponsiveCard>
				</Col>
			</Row>
		</Page>
	);
};

export default CreateProposals;
