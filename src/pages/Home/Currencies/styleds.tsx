import styled from "styled-components";

export const Wrapper = styled.section`
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
	}

	.table tbody td {
		vertical-align: middle;
		border: 1px solid ${({ theme }) => theme.borderColor};
		border-left-width: 0;
		border-right-width: 0;
		color: white;
		cursor: pointer;
		padding: 1rem;
	}
`;

export const CoinPrice = styled.span`
	font-size: 0.875rem;
	font-weight: 500;
	color: ${({ theme }) => theme.text1};

	@media (min-width: 768px) {
		font-size: 1.125rem;
	}
`;

export const GotoMarketContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	padding-top: 0.5rem;
	padding-bottom: 1rem;
`;
