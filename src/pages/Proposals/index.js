import React, { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import BootstrapTable from "react-bootstrap-table-next";
import moment from "moment";
import styled from "styled-components";

import { ResponsiveCard } from "../../components/Card";
import { fetchProposals, fetchSpaces } from "../../state/governance/actions";
import { shorten } from "../../state/governance/hooks";
import { Link } from "react-router-dom";
import { formatProposals, getScores } from "../../lib/utils";
import { useActiveWeb3React } from "../../hooks";
import Loading from "../../components/Loading";
import Page from "../../components/Page";
import "./style.scss";
import "../../components/UI/Button/style.scss";
import ResponsiveTable from "../../components/ResponsiveTable";
import { useTranslation } from "react-i18next";

const Header = styled.div`
	padding: 0;
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20px;
	border: none;
	background-color: transparent;

	@media (max-width: 767px) {
		flex-direction: column;
		align-items: stretch;
	}
`;

const Title = styled.h2`
	font-size: 1.25rem;
	font-weight: 700;
	color: ${({ theme }) => theme.text1};
	margin: 0;

	@media (max-width: 767px) {
		margin-bottom: 30px;
	}
`;

const PoolsButton = styled.button`
	border-radius: 12px;
	background-color: ${({ theme }) => theme.bg2};
	padding: 6px 20px;
	max-height: 40px;
	min-height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	white-space: nowrap;
	font-size: 1rem;
	font-family: inherit;
	font-weight: 500;
	border: none;
	outline: none;
	text-decoration: none;

	&:hover,
	&:focus,
	&:active {
		text-decoration: none;
		outline: none;
		box-shadow: none;
	}
`;

const TradeButton = styled(PoolsButton)`
	color: ${({ theme }) => theme.primary};
	width: 100%;

	&:hover {
		color: ${({ theme }) => theme.bg2};
		background-color: ${({ theme }) => theme.primary};
	}
`;

const StyledLink = styled(Link)`
	text-decoration: none;
	&:hover,
	&:focus,
	&:active {
		text-decoration: none;
		outline: none;
		box-shadow: none;
	}
`;

const RowTitle = styled.span`
	font-size: 1rem;
	font-weight: 400;
	line-height: 19px;
	color: ${({ theme }) => theme.text1};

	@media (max-width: 991px) {
		font-size: 0.875rem;
	}
`;

const CellText = styled.span`
	font-weight: 700;
	font-size: 0.875rem;
	color: ${({ theme }) => theme.text1};
	white-space: nowrap;

	@media (max-width: 991px) {
		font-weight: 400;
	}
`;

const NewButton = styled(Link)`
	background-color: rgba(135, 220, 225, 0.12);
	height: 56px;
	padding: 6px 20px;
	border-radius: 18px;
	color: ${({ theme }) => theme.primary};
	display: flex;
	align-items: center;
	transition: 0.3s ease all;
	justify-content: center;

	:hover,
	:focus,
	:active {
		background-color: rgba(135, 220, 225, 1);
		color: ${({ theme }) => theme.text1};
		text-decoration: none;
		outline: none;
	}
`;

const GradientButton = styled(Link)`
	height: 56px;
	padding: 6px 20px;
	border-radius: 18px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 20px;

	:hover,
	:focus,
	:active {
		text-decoration: none;
		outline: none;
	}
`;

const StatusText = styled.span`
	@media (max-width: 991px) {
		font-size: 0.875rem;
	}
`;

const Proposals = (props) => {
	const { library } = useActiveWeb3React();
	const [selectedProposal, setSelectedProposal] = useState({});
	const dispatch = useDispatch();
	const { t } = useTranslation();
	const { spaces, loading: governanceLoading, proposals } = useSelector((state) => state.governance);

	let id = props.match.params.space;
	let space = spaces[id];

	useEffect(() => {
		if (Object.keys(spaces).length === 0) {
			dispatch(fetchSpaces());
		} else {
			if (spaces.hasOwnProperty(id)) {
				dispatch(fetchProposals(id));
			} else {
				props.history.push("/tools/governance");
			}
		}
	}, [spaces, id, props.history, dispatch]);

	const transformProposals = async (proposals, id) => {
		if (proposals.hasOwnProperty(id)) {
			let result = {};
			const selected = proposals[id];
			const scores = await getScores(
				id,
				space.strategies,
				space.network,
				library,
				Object.values(selected).map((proposal) => proposal.address)
			);
			result = Object.fromEntries(
				Object.entries(selected).map((proposal) => {
					const transformed = [proposal[0], Object.assign({}, proposal[1])];
					transformed[1].score = scores.reduce((a, b) => a + (b[transformed[1].address] || 0), 0);
					return [transformed[0], transformed[1]];
				})
			);

			result = formatProposals(result);
			const transformedProposal = Object.fromEntries(
				Object.entries(result).sort((a, b) => b[1].msg.payload.end - a[1].msg.payload.end, 0)
			);
			setSelectedProposal(transformedProposal);
		} else {
			setSelectedProposal({});
		}
	};

	useEffect(() => {
		transformProposals(proposals, id);
	}, [proposals, id]);

	const rowEvents = {
		onClick: (e, row) => {
			props.history.push(`/tools/governance/${id}/proposal/${row[0]}`);
		},
	};

	const columns = [
		{
			dataField: "asset",
			text: t("description"),
			formatter: (cellContent, row, rowIndex) => <RowTitle>{shorten(row[1].msg.payload.name, "name")}</RowTitle>,
		},
		{
			dataField: "status",
			text: t("status"),
			formatter(cellContent, row) {
				const ts = (Date.now() / 1e3).toFixed();
				const { start, end } = row[1].msg.payload;
				let state =
					ts > end
						? { title: "Closed", className: "label-light-danger", responsiveClassName: "text-danger" }
						: ts > start
						? { title: "Active", className: "label-light-success", responsiveClassName: "text-success" }
						: { title: "Pending", className: "label-light-info", responsiveClassName: "text-info" };
				return (
					<>
						<span className={`label ${state.className} label-lg d-none d-lg-flex w-100 label-inline py-3`}>
							{state.title}
						</span>
						<StatusText className={`d-flex d-lg-none ${state.responsiveClassName}`}>
							{state.title}
						</StatusText>
					</>
				);
			},
		},
		{
			dataField: "start",
			text: t("startDate"),
			formatter(cellContent, row) {
				return <CellText>{moment(row[1].msg.payload.start * 1e3).format("YYYY/MM/DD HH:mm")}</CellText>;
			},
		},
		{
			dataField: "end",
			text: t("endDate"),
			formatter(cellContent, row) {
				return <CellText>{moment(row[1].msg.payload.end * 1e3).format("YYYY/MM/DD HH:mm")}</CellText>;
			},
		},
		{
			dataField: "author",
			text: t("author"),
			formatter(cellContent, row) {
				return (
					<CellText>
						{row[1].address.slice(0, 6)}...{row[1].address.slice(-4)}
					</CellText>
				);
			},
		},
	];

	const actions = {
		dataField: "actions",
		text: t("table.actions"),
		formatter(cellContent, row) {
			return (
				<div className="d-flex flex-column align-items-stretch align-items-lg-center justify-content-center w-100">
					<StyledLink to={`/tools/governance/${id}/proposal/${row[0]}`}>
						<TradeButton>{t("viewMore")}</TradeButton>
					</StyledLink>
				</div>
			);
		},
		isAction: true,
	};

	return (
		<Page title={t("governance.title")} morePadding>
			<Row>
				<Col xs={12}>
					<ResponsiveCard marginTop={-30} marginBottom={0}>
						<Header>
							<Title className="card-title">{t("governance.proposals")}</Title>
							<NewButton to={`${props.match.url}/create`} className="bg-light-primary d-none d-md-flex">
								{t("createNew")}
							</NewButton>
							<GradientButton
								to={`${props.match.url}/create`}
								className=" btn btn-primary btn-gradient-primary d-flex d-md-none"
							>
								{t("createNew")}
							</GradientButton>
						</Header>
						<div>
							{governanceLoading ? (
								<div className="d-flex align-items-center justify-content-center py-5 w-100">
									<Loading color={"primary"} width={40} height={40} active id={"proposals"} />
								</div>
							) : (
								<>
									<BootstrapTable
										wrapperClasses="table-responsive d-none d-lg-block"
										bordered={false}
										classes={`table table-head-custom table-borderless table-vertical-center overflow-hidden table-hover proposals__table`}
										bootstrap4
										remote
										keyField="id"
										columns={columns}
										data={Object.entries(selectedProposal)}
										rowEvents={rowEvents}
									/>
									<ResponsiveTable
										breakpoint={"lg"}
										direction={"rtl"}
										columns={columns.concat(actions)}
										data={Object.entries(selectedProposal)}
										headerIndex={0}
									/>
								</>
							)}
						</div>
					</ResponsiveCard>
				</Col>
			</Row>
		</Page>
	);
};

export default Proposals;
