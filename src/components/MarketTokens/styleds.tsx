import styled from "styled-components";
import { Nav } from "react-bootstrap";
import { InputGroup } from "../../components/Form";

export const CellText = styled.span`
	font-weight: 500;
	font-size: 0.875rem;
	color: ${({ theme }) => theme.text1};

	@media (max-width: 991px) {
		font-weight: 600;
	}
`;

export const NavItem = styled(Nav.Item)`
	margin-left: 0.625rem;
`;

export const NavLink = styled(Nav.Link)`
	background-color: ${({ theme }) => theme.primaryLight};
	border-radius: 12px !important;
	color: ${({ theme }) => theme.primary};
	white-space: nowrap;
	padding: 0.75rem 1.5rem;
	min-height: 56px;
	font-weight: 500;
	display: flex;
	align-items: center;
	justify-content: center;

	@media (max-width: 767px) {
		padding: 0.5rem 1rem;
		font-size: 1rem;
		min-height: 32px;
	}

	&:hover {
		color: ${({ theme }) => theme.primary};
	}

	&.active {
		color: ${({ theme }) => theme.text1};
		background-color: ${({ theme }) => theme.primary};
	}
`;

export const Header = styled.div`
	margin-bottom: 1.5rem;
`;

export const CustomInputGroup = styled(InputGroup)`
	margin-bottom: 1.5rem;
`;

export const MarketLink = styled.a`
	color: ${({ theme }) => theme.text1};

	@media (max-width: 991px) {
		flex-basis: 100px;
	}
`;

export const ExploreTableWrap = styled.div`
	.table {
		border-collapse: separate;
		border-spacing: 0 0;
		margin-bottom: 0 !important;

		thead th {
			background-color: ${({ theme }) => theme.bg5};
			color: ${({ theme }) => theme.text1};
			font-size: 0.875rem;
			font-weight: 500;
			text-overflow: ellipsis;
			white-space: nowrap;
			padding: 1.25rem 0.75rem;
			min-height: 56px;

			&:focus {
				outline: none;
			}

			&:first-child {
				border-top-left-radius: 12px;
				border-bottom-left-radius: 12px;
			}

			&:last-child {
				border-top-right-radius: 12px;
				border-bottom-right-radius: 12px;
				text-align: right;
			}
		}

		th,
		td {
			vertical-align: middle !important;

			&:first-child {
				padding: 1.25rem 1.375rem;
			}

			&:last-child {
				padding: 1.25rem 0.5rem;
			}
		}

		td {
			cursor: pointer;
			color: ${({ theme }) => theme.text1};

			&:last-child {
				text-align: right;
			}
		}

		tr:not(:last-child) td {
			border-bottom: 1px solid ${({ theme }) => theme.borderColor};
		}
	}
`;
