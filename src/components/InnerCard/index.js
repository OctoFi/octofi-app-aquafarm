import React, { useContext } from "react";
import styled, { ThemeContext } from "styled-components";
import { Link } from "react-router-dom";

import CurrencyLogo from "../CurrencyLogo";
import CurrencyText from "../CurrencyText";
import ArrowRightIcon from "../Icons/ArrowRight";

const Container = styled.div`
	padding-right: 1.5rem;
	height: 100%;
`;

const Wrapper = styled.div`
	border: 1px solid ${({ theme }) => theme.bg1};
	background-color: ${({ theme }) => theme.modalBG};
	box-shadow: 0 0 5px transparent;
	padding: 1.25rem;
	border-radius: 20px;
	position: relative;
	transition: 0.3s ease all;
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: space-between;

	@media (min-width: 768px) {
		padding: 1.875rem;
	}

	&:hover {
		background-color: ${({ theme }) => theme.bg1};
		border-color: ${({ theme }) => theme.primary};
		box-shadow: ${({ theme }) => `0 5px 15px ${theme.primary}20`};
	}
`;

const Header = styled.div`
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	margin-bottom: 1.5rem;
`;

const HeaderContent = styled.div`
	margin-left: 15px;

	@media (min-width: 768px) {
		margin-left: 20px;
	}
`;

const LogoContainer = styled.div`
	width: 24px;
	height: 24px;
	min-width: 24px;
	border-radius: 32px;

	@media (min-width: 768px) {
		width: 32px;
		height: 32px;
		min-width: 32px;
	}
`;

const Logo = styled.img`
	width: 100%;
	height: 100%;
	border-radius: 32px;
	border: 2px solid ${({ theme }) => theme.text1};
	color: ${({ theme }) => theme.text1};
	background-color: ${({ theme }) => theme.text1};
`;

const Title = styled.h4`
	color: ${({ theme }) => theme.text1};
	font-weight: 700;
	font-size: 1rem;
	margin-bottom: 0.625rem;

	@media (min-width: 768px) {
		font-size: 1.25rem;
	}
`;

const Symbol = styled.span`
	font-size: 0.875rem;
	font-weight: 400;
	color: ${({ theme }) => theme.text1};

	@media (min-width: 768px) {
		font-size: 1rem;
	}
`;

const Details = styled.span`
	text-decoration: underline;
	color: ${({ theme }) => theme.primary};
	font-weight: 700;
	font-size: 1rem;
	margin-right: 0.75rem;
`;

const Price = styled.span`
	font-weight: 400;
	font-size: 0.875rem;
	color: ${({ theme }) => theme.text3};
	margin-bottom: 0.375rem;
	display: block;

	@media (min-width: 768px) {
		color: ${({ theme }) => theme.text1};
		margin-bottom: 0.625rem;
	}
`;

const CurrentPrice = styled.span`
	font-weight: 700;
	font-size: 1.25rem;
	color: ${({ theme }) => theme.text1};

	@media (min-width: 768px) {
		font-size: 1.375rem;
	}
`;

const PriceDiff = styled.span`
	font-weight: 700;
	font-size: 0.875rem;
	color: ${({ theme, type }) => (type === "asc" ? theme.green1 : theme.tertiary)};

	@media (min-width: 768px) {
		font-size: 1rem;
	}
`;

const DetailsButton = styled.button`
	border-radius: 12px;
	background-color: ${({ theme }) => theme.bg1};
	padding: 6px 18px;
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
	width: 100%;

	color: ${({ theme }) => theme.primary};
	transition: 0.4s ease all;

	&:hover {
		color: ${({ theme }) => theme.bg1};
		background-color: ${({ theme }) => theme.primary};
	}

	&:hover,
	&:focus,
	&:active {
		outline: none;
		box-shadow: none;
	}
`;

const InnerCard = (props) => {
	const theme = useContext(ThemeContext);
	return (
		<Container>
			<Wrapper>
				<Header className="d-flex align-items-start justify-content-between">
					<div className={"d-flex align-items-start mb-10"}>
						<LogoContainer>
							{props.imageComponent ? (
								props.imageComponent
							) : props.img ? (
								<Logo src={props.img} alt={props.name} />
							) : (
								<CurrencyLogo currency={props.currency} />
							)}
						</LogoContainer>
						<HeaderContent className="d-flex flex-column justify-content-center">
							<Title>{props.name}</Title>
							{props.symbol && <Symbol>{props.symbol}</Symbol>}
						</HeaderContent>
					</div>
					{props.src && (
						<Link className={"d-none d-md-flex align-items-center justify-content-end"} to={props.src}>
							<Details>Details</Details>
							<ArrowRightIcon size={14} fill={theme.primary} />
						</Link>
					)}
				</Header>
				<div>
					<Price>{props.title || "Price"}</Price>
					<div className="d-flex align-items-center justify-content-between">
						<CurrentPrice>
							<CurrencyText type={"grey-dark"}>{props.price}</CurrencyText>
						</CurrentPrice>
						{props.priceDiff && (
							<PriceDiff type={props.priceDiff > 0 ? "asc" : "desc"}>
								{props.priceDiff < 0.01 ? props.priceDiff.toFixed(4) : props.priceDiff.toFixed(2)}%
							</PriceDiff>
						)}
					</div>
				</div>
				{props.src && (
					<div
						className="d-flex d-md-none flex-column align-items-stretch justify-content-center"
						style={{ marginTop: 24 }}
					>
						<Link to={props.src} className={"d-flex w-100"}>
							<DetailsButton>Details</DetailsButton>
						</Link>
					</div>
				)}
			</Wrapper>
		</Container>
	);
};

export default InnerCard;
