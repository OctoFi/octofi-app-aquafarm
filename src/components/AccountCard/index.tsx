/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { isMobile } from "react-device-detect";

import CurrencyText from "../CurrencyText";
import styled from "styled-components";
import WalletIcon from "../../assets/images/account/wallet.svg";
import DepositsIcon from "../../assets/images/account/deposits.svg";
import DebtIcon from "../../assets/images/account/debts.svg";
import WalletTable from "../AssetTable/wallet";
import AssetTable from "../AssetTable";
import SVG from "react-inlinesvg";
import { useTranslation } from "react-i18next";

const icons: any = {
	wallet: WalletIcon,
	debts: DebtIcon,
	deposits: DepositsIcon,
};
const Wrapper = styled.div`
	padding-bottom: 20px;
	height: 100%;
	display: block;
`;

const Card = styled.div`
	background-color: ${({ theme }) => theme.modalBG};
	color: ${({ theme }) => theme.text1};
	display: flex;
	flex-direction: column;
	border-radius: 20px;
	cursor: pointer;
	height: 100%;
`;

const TableContainer = styled.div`
	padding: 0 0.75rem;

	@media (min-width: 768px) {
		padding: 0;
	}
`;

const CardIcon = styled.div`
	width: 56px;
	height: 56px;
	border-radius: 56px;
	color: ${({ theme }) => theme.primary};
	background-color: ${({ theme }) => theme.primaryLight};
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;

	@media (min-width: 768px) {
		width: 74px;
		height: 74px;
		border-radius: 74px;
	}
`;

const CardBody = styled.div`
	display: flex;
	align-items: center;
	padding: 1.875rem 1.25rem;
	border-bottom: 1px solid ${({ theme }) => theme.text3};

	@media (min-width: 768px) {
		padding: 1.875rem;
	}
`;

const CardBottomBody = styled.div`
	display: flex;
	flex-direction: column;
	padding: 1.25rem 0.5rem 0.5rem;
	height: 100%;
`;

const CardContent = styled.div`
	display: flex;
	flex-direction: column;
	flex-wrap: wrap;
	justify-content: center;
	padding-left: 26px;

	@media (min-width: 768px) {
		padding-left: 30px;
	}
`;

const Title = styled.span`
	font-weight: 500;
	font-size: 1rem;
	color: ${({ theme }) => theme.text1};
	display: block;
	margin-bottom: 0.25rem;
`;

const Value = styled.span`
	font-weight: 700;
	font-size: 1.25rem;
	color: ${({ theme }) => theme.text1};
	display: block;
	margin: 0;

	@media (min-width: 768px) {
		font-size: 1.75rem;
	}
`;

function AccountCard({
	className,
	value,
	title,
	clickHandler,
	type = "wallet",
	balances,
}: {
	className: string | undefined;
	value: string | null;
	title: string;
	clickHandler?: any;
	type?: string;
	balances: any;
}) {
	const { t } = useTranslation();

	return (
		<Wrapper>
			<Card className={className} onClick={clickHandler}>
				{/* begin::Body */}
				<CardBody>
					<CardIcon>
						<SVG src={icons[type]} width={isMobile ? 24 : 32} height={isMobile ? 24 : 32} />
					</CardIcon>

					<CardContent>
						<Title>{title}</Title>
						<Value>
							<CurrencyText>{value}</CurrencyText>
						</Value>
					</CardContent>
				</CardBody>
				<CardBottomBody>
					<div className={"d-flex flex-column w-100 flex-grow-1"}>
						<TableContainer className={"flex-grow-1 align-self-stretch"}>
							{type === "wallet" ? (
								<WalletTable size={"sm"} balances={balances.balances?.slice(0, 5)} clickable={false} />
							) : (
								<AssetTable size={"sm"} balances={balances.balances?.slice(0, 5)} />
							)}
						</TableContainer>
						<div className={"d-flex align-items-center justify-content-end align-self-stretch"}>
							<button className="btn btn-link text-primary font-weight-medium">
								{t("more")}
								<SVG
									src={require("../../assets/images/global/arrow-right.svg").default}
									width={6}
									height={10}
									style={{ marginLeft: 18 }}
								/>
							</button>
						</div>
					</div>
				</CardBottomBody>
				{/* end::Body */}
			</Card>
		</Wrapper>
	);
}

export default AccountCard;
