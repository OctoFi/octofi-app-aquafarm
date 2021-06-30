import styled from "styled-components";
import { Link } from "react-router-dom";

export const Header = styled.div`
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

export const Title = styled.h2`
	font-size: 1.25rem;
	font-weight: 700;
	color: ${({ theme }) => theme.text1};
	margin: 0;

	@media (max-width: 767px) {
		margin-bottom: 30px;
	}
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

export const RowTitle = styled.span`
	font-size: 1rem;
	font-weight: 400;
	line-height: 19px;
	color: ${({ theme }) => theme.text1};

	@media (max-width: 991px) {
		font-size: 0.875rem;
	}
`;

export const CellText = styled.span`
	font-weight: 700;
	font-size: 0.875rem;
	color: ${({ theme }) => theme.text1};
	white-space: nowrap;

	@media (max-width: 991px) {
		font-weight: 400;
	}
`;

export const NewButton = styled(Link)`
	background-color: ${({ theme }) => theme.primaryLight};
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
		background-color: ${({ theme }) => theme.primary};
		color: ${({ theme }) => theme.text1};
		text-decoration: none;
		outline: none;
	}
`;

export const GradientButton = styled(Link)`
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

export const StatusText = styled.span`
	@media (max-width: 991px) {
		font-size: 0.875rem;
	}
`;

export const ProposalsTableWrap = styled.div`
	table {

		th {
			background-color: ${({ theme }) => theme.bg5};
			color: ${({ theme }) => theme.text1};
			font-size: 0.875rem;
			font-weight: 500;
			text-overflow: ellipsis;
			white-space: nowrap;
			padding: 1.25rem 0.75rem;
			min-height: 56px;
            border: 0;

			&:focus {
				outline: none;
			}

			&:first-child {
				border-top-left-radius: 18px;
				border-bottom-left-radius: 18px;
				padding: 1.25rem 1.375rem;
			}

			&:last-child {
				border-top-right-radius: 18px;
				border-bottom-right-radius: 18px;
				padding: 1.25rem 1.375rem 1.25rem 1.25rem;
			}
		}

		th,
		td {
            border-top: 0;
			vertical-align: middle !important;

			&:first-child {
				padding: 1.25rem 1.375rem;
			}

			&:last-child {
				padding: 1.25rem 1.375rem 1.25rem 1.25rem;
			}
		}

		td {
            border-bottom: 1px solid ${({ theme }) => theme.borderColor};
			cursor: pointer;
		}

        tr:last-child td {
            border-bottom: 0;
        }
	}
`;
