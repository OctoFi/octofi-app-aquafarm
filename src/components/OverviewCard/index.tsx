/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";

import CurrencyText from "../CurrencyText";
import styled from "styled-components";

const Card = styled.div`
	background-color: ${({ theme }) => theme.modalBG};
	color: ${({ theme }) => theme.text1};
	display: flex;
	align-items: center;
	border-radius: 20px;
	padding: 1.875rem;
	margin-bottom: 20px;
	cursor: pointer;

	@media (min-width: 768px) {
		padding: 2rem;
	}
`;

const CardIcon = styled.div`
	width: 56px;
	height: 56px;
	border-radius: 56px;
	flex-basis: 56px;
	border: 2px solid ${({ theme }) => theme.text1};
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;

	@media (min-width: 768px) {
		width: 66px;
		height: 66px;
		border-radius: 66px;
		flex-basis: 66px;
	}
`;

const CardImage = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
`;

const CardBody = styled.div`
	display: flex;
	align-items: center;
	padding: 0;
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
	margin-bottom: 0.25rem;

	@media (min-width: 768px) {
		font-size: 1rem;
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

function OverviewCard({
	className,
	value,
	title,
	icon,
	image,
	theme,
	clickHandler,
	description,
}: {
	className: string | undefined;
	value: string | null;
	title: string;
	icon?: any;
	image?: any;
	theme?: string;
	clickHandler?: any;
	description?: string;
}) {
	return (
		<>
			<Card className={className} onClick={clickHandler}>
				{/* begin::Body */}
				<CardBody>
					<CardIcon>
						<CardImage src={image} alt={title} />
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

export default OverviewCard;
