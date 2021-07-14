import styled from "styled-components";
import { Nav } from "react-bootstrap";

export const CustomNav = styled(Nav)`
	padding: 0 1rem;
	margin-bottom: 1rem;
`;

export const NavItem = styled(Nav.Item)`
	margin-right: 12px;
`;

export const NavLink = styled(Nav.Link)`
	background-color: ${({ theme }) => theme.primaryLight};
	border-radius: 18px !important;
	color: ${({ theme }) => theme.primary};
	font-weight: 500;
	padding: 12px 24px;
	display: flex;
	align-items: center;
	justify-content: center;
	white-space: nowrap;

	&:hover,
	&:focus {
		color: ${({ theme }) => theme.primary};
	}

	&.active {
		background-color: ${({ theme }) => theme.primary};
		color: ${({ theme }) => theme.text1};
	}
`;

export const TokenSetsTableWrap = styled.div`
	.table {
		position: relative;
		width: 100%;
		border-collapse: collapse;
		color: white;

		th,
		td {
			border: 0;
			border-bottom: 1px solid ${({ theme }) => theme.borderColor};
			color: ${({ theme }) => theme.text1};
		}

		th {
			font-weight: 500;
			font-size: 0.875rem;

			&:focus {
				outline: none;
			}
		}

		td {
			cursor: pointer;
			padding: 1rem 0.75rem;
			vertical-align: middle;
		}

		tr:last-child td {
			border-bottom-width: 0;
		}
	}
`;

export const Title = styled.span`
	font-size: 1.125rem;
	font-weight: bold;
	margin-left: 20px;
	line-height: 1.35;
	display: block;

	@media (max-width: 991px) {
		margin-left: 0;
		margin-right: 12px;
		font-size: 0.875rem;
	}
`;

export const LogoContainer = styled.div`
	max-width: 40px;
	max-height: 40px;
	min-width: 40px;
	min-height: 40px;
	height: 40px;
	width: 40px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;

	& img {
		width: 40px;
		height: auto;
	}
`;

export const CellText = styled.span`
	font-size: 0.875rem;
	font-weight: 500;
	line-height: 1;

	@media (max-width: 991px) {
		font-size: 0.75rem;
	}
`;

export const CellBoldText = styled(CellText)`
	font-weight: 700;
`;
