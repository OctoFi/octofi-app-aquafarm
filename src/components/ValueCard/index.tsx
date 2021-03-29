/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useContext } from "react";
import styled, { ThemeContext } from "styled-components";

import CurrencyText from "../CurrencyText";
import AssetIcon from "../../assets/images/assets/assets.svg";
import DebtIcon from "../../assets/images/assets/debts.svg";
import NetWorthIcon from "../../assets/images/assets/networth.svg";

const icons: any = {
	assets: AssetIcon,
	debts: DebtIcon,
	netWorth: NetWorthIcon,
};

const Card = styled.div`
	background-color: ${({ theme }) => theme.modalBG};
	color: ${({ theme }) => theme.text1};
	display: flex;
	align-items: center;
	border-radius: 20px;
	padding: 30px;
	margin-bottom: 10px;

	@media (min-width: 768px) {
		padding: 45px;
		margin-bottom: 20px;
	}
`;

const CardIcon = styled.div<{ color: string }>`
	width: 80px;
	height: 80px;
	border-radius: 80px;
	background-color: ${({ color }) => color};
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;

	@media (min-width: 768px) {
		width: 100px;
		height: 100px;
		border-radius: 100px;
	}
`;

const CardBody = styled.div`
	display: flex;
	align-items: center;
	padding: 0;
`;

const Img = styled.img`
	width: 32px;
	height: 32px;

	@media (min-width: 768px) {
		width: 40px;
		height: 40px;
	}
`;

const CardContent = styled.div`
	display: flex;
	flex-direction: column;
	flex-wrap: wrap;
	justify-content: center;
	padding-left: 20px;

	@media (min-width: 768px) {
		padding-left: 30px;
	}
`;

const Title = styled.span`
	font-weight: 500;
	font-size: 0.875rem;
	color: ${({ theme }) => theme.text1};
	display: block;
	margin-bottom: 0.625rem;

	@media (min-width: 768px) {
		font-size: 1rem;
		margin-bottom: 1rem;
	}
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

function ValueCard({ className, value, title, type, color = "primary" }: any) {
	const theme = useContext(ThemeContext);
	// @ts-ignore
	const themeColor = theme[color];
	return (
		<>
			<Card className={`value-card ${className}`}>
				{/* begin::Body */}
				<CardBody className="card-body">
					<CardIcon color={themeColor}>
						<Img src={icons[type] || icons["assets"]} alt={type} />
					</CardIcon>
					<CardContent>
						<Title>{title}</Title>
						<Value>
							<CurrencyText>{value}</CurrencyText>
						</Value>
					</CardContent>
				</CardBody>
				{/* end::Body */}
			</Card>
		</>
	);
}

export default ValueCard;
