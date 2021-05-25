import { useMemo } from "react";
import styled from "styled-components";
import { Button as BootstrapButton, Row, Col } from "react-bootstrap";
import SVG from "react-inlinesvg";
import { Link, withRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAllTransactions } from "../../state/transactions/hooks";
import { getEtherscanLink } from "../../utils";
import BellIcon from "../../assets/images/header/bell.svg";

const Wrapper = styled.div`
	position: relative;
	padding: 14px 0;

	&:hover .header-dropdown {
		opacity: 1;
		visibility: visible;
		transform: rotateX(0deg) scale(1);
	}
`;

const Item = styled.div`
	display: flex;
	align-items: center;
`;

const DropDown = styled.div`
	position: absolute;
	top: 100%;
	right: 0;
	background-color: ${({ theme }) => theme.modalBG};
	border-radius: 0.75rem;
	box-shadow: -1px 11px 43px rgba(0, 0, 0, 0.12);
	padding: 12px;
	width: auto;
	min-width: 260px;

	opacity: 0;
	visibility: hidden;
	transform-style: preserve-3d;
	transform: rotateX(-40deg) scale(0.8);
	transform-origin: top center;
	transition: 0.4s ease all;
	z-index: 99999;
`;

const BellButton = styled(BootstrapButton)`
	color: ${({ theme }) => theme.primary};
	margin-right: 20px;
`;

const Title = styled.span`
	font-weight: 500;
	font-size: 0.75rem;
	color: ${({ theme }) => theme.text3};
	margin-bottom: 8px;
	display: block;
`;

const StyledBox = styled.div`
	border-radius: 18px;
	background-color: ${({ theme }) => theme.bg1};
	display: flex;
	align-items: stretch;
	flex-direction: column;
	margin-bottom: 16px;
`;

const TxnBox = styled.a`
	padding: 8px 12px;
	border-radius: 12px;
	font-size: 0.875rem;
	color: ${({ theme }) => theme.text1};
	font-weight: 500;
	text-decoration: none;
	outline: none;

	&:focus,
	&:active,
	&:hover {
		text-decoration: none;
		color: ${({ theme }) => theme.text2};
		outline: none;
	}
`;

const EmptyText = styled.span`
	padding: 30px 20px;
	color: ${({ theme }) => theme.text3};
	font-size: 0.75rem;
	font-weight: 400;
	text-align: center;
`;

const SeeAllButton = styled(Link)`
	text-decoration: none;
	padding-top: 12px;
	font-weight: 500;
	font-size: 0.75rem;
	color: ${({ theme }) => theme.primary};
	display: block;
	text-align: center;
`;

const NotificationDropdown = (props) => {
	const { t } = useTranslation();
	const transactions = useAllTransactions();

	const pendingTransactions = useMemo(() => {
		return Object.values(transactions)
			?.filter((txn) => !txn?.hasOwnProperty("confirmedTime"))
			?.slice(0, 3);
	}, [transactions]);

	const confirmedTransactions = useMemo(() => {
		return Object.values(transactions)
			?.filter((txn) => txn?.hasOwnProperty("confirmedTime") && typeof txn.confirmedTime === "number")
			?.slice(0, 3);
	}, [transactions]);

	return (
		<Wrapper>
			<Item>
				<BellButton variant={"link"} className={"py-0 px-0"}>
					<SVG src={BellIcon} />
				</BellButton>
			</Item>
			<DropDown className={"header-dropdown"}>
				<Row>
					<Col xs={12}>
						<Title>{t("pendingTransactions")}</Title>
					</Col>
					<Col xs={12}>
						<StyledBox>
							{pendingTransactions && pendingTransactions?.length > 0 ? (
								pendingTransactions.map((txn) => {
									return (
										<TxnBox
											href={txn?.hash ? getEtherscanLink(1, txn?.hash, "transaction") : "#"}
											target={"_blank"}
											rel={"noreferrer noopener"}
										>
											{txn?.hash ? txn?.hash?.slice(0, 6) + "..." + txn?.hash?.slice(-4) : "-"} 🡕
										</TxnBox>
									);
								})
							) : (
								<EmptyText>{t("errors.noTransaction")}</EmptyText>
							)}
						</StyledBox>
					</Col>
				</Row>
				<Row>
					<Col xs={12}>
						<Title>{t("confirmedTransactions")}</Title>
					</Col>
					<Col xs={12}>
						<StyledBox style={{ marginBottom: 0 }}>
							{confirmedTransactions && confirmedTransactions?.length > 0 ? (
								confirmedTransactions.map((txn) => {
									return (
										<TxnBox
											href={txn?.hash ? getEtherscanLink(1, txn?.hash, "transaction") : "#"}
											target={"_blank"}
											rel={"noreferrer noopener"}
										>
											{txn?.hash ? txn?.hash?.slice(0, 6) + "..." + txn?.hash?.slice(-4) : "-"} 🡕
										</TxnBox>
									);
								})
							) : (
								<EmptyText>{t("errors.noTransaction")}</EmptyText>
							)}
						</StyledBox>
					</Col>

					<Col xs={12}>
						<SeeAllButton to={"/account/history"}>{t("seeAllTransactions")}</SeeAllButton>
					</Col>
				</Row>
			</DropDown>
		</Wrapper>
	);
};

export default withRouter(NotificationDropdown);
