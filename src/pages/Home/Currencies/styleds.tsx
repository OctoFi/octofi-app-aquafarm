import styled from "styled-components";
import { Link } from "react-router-dom";

export const GotoMarketContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	padding-top: 0.5rem;
	padding-bottom: 1rem;
`;

export const PoolsButton = styled.button`
	border-radius: 12px;
	background-color: ${({ theme }) => theme.bg1};
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

export const TradeButton = styled(PoolsButton)`
	color: ${({ theme }) => theme.primary};
	width: 100%;

	&:hover {
		color: ${({ theme }) => theme.bg1};
		background-color: ${({ theme }) => theme.primary};
	}
`;

export const StyledLink = styled(Link)`
	text-decoration: none;

	&:hover,
	&:focus,
	&:active {
		text-decoration: none;
		outline: none;
		box-shadow: none;
	}
`;

export const CurrencySection = styled.section`
	margin-top: 1.5rem;
	margin-bottom: 1.25rem;

	@media (min-width: 576px) {
		margin-top: 3.5rem;
		margin-bottom: 2rem;
	}

	@media (max-width: 576px) {
		h2 {
			font-size: 1.75rem;
			margin-bottom: 1.25rem;
		}
	}
`;

export const CurrenciesTable = styled.div`
	.table {
		position: relative;
		width: 100%;
		border-collapse: collapse;
		color: ${({ theme }) => theme.text1};
		margin-bottom: 0.5rem;
	}

	.table thead th {
		border-bottom: 0;
		border-top: 0;
		font-weight: 400;
		padding: 1.5rem 1rem;
		color: ${({ theme }) => theme.text1};

		&:focus {
			outline: none;
		}

		&:first-child {
			padding-left: 2rem;
		}
	}

	.table tbody td {
		vertical-align: middle;
		border: 1px solid ${({ theme }) => theme.borderColor};
		border-left-width: 0;
		border-right-width: 0;
		color: white;
		cursor: pointer;
		padding: 1rem;

		&:first-child {
			padding-left: 2rem;
		}
	}
`;

export const CoinIcon = styled.div`
	margin-right: 10px;
	width: 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: white;
	border-radius: 6px;
	flex-basis: 24px;

	@media (min-width: 992px) {
		border-radius: 12px;
		margin-right: 24px;
		width: 48px;
		height: 48px;
		flex-basis: 48px;
	}

	img {
		width: 18px;
		height: 18px;
		object-fit: contain;

		@media (min-width: 992px) {
			width: 36px;
			height: 36px;
		}
	}
`;

export const CoinSymbol = styled.span`
	margin-right: 0.625rem;
	font-size: 1rem;
	font-weight: 700;
	color: ${({ theme }) => theme.text1};

	@media (min-width: 992px) {
		margin-right: 2.25rem;
		font-size: 1.125rem;
	}
`;

export const CoinName = styled.span`
	font-weight: 500;
	font-size: 0.75rem;
	color: ${({ theme }) => theme.text1};

	@media (min-width: 992px) {
		font-size: 1rem;
	}
`;

export const CoinPrice = styled.span`
	font-size: 1rem;
	font-weight: 700;
	color: ${({ theme }) => theme.text1};

	@media (min-width: 992px) {
		font-size: 1.25rem;
		font-weight: 500;
	}
`;
