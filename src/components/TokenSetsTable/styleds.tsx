import styled from "styled-components";
import { Col, Nav } from "react-bootstrap";
import { InputGroup } from "../Form";

export const CardTitle = styled.h2`
	font-size: 1rem;
	font-weight: 500;
	margin-top: 0;
	margin-bottom: 20px;

	@media (min-width: 768px) {
		font-size: 1.25rem;
	}
`;

export const Logo = styled.img`
	width: 32px;
	height: 32px;
	border-radius: 32px;
	background-color: ${({ theme }) => theme.text1};
	border: 2px solid ${({ theme }) => theme.text1};

	@media (max-width: 991px) {
		width: 24px;
		height: 24px;
		border-radius: 24px;
	}
`;

export const LogoContainer = styled.div`
	width: 32px;
	height: 32px;
	border-radius: 32px;

	@media (max-width: 991px) {
		width: 24px;
		height: 24px;
		border-radius: 24px;
	}
`;

export const CellText = styled.span`
	font-weight: 500;
	font-size: 0.875rem;
	color: ${({ theme }) => theme.text1};

	&.font-size-base {
		font-size: 1rem;
	}

	@media (max-width: 991px) {
		font-weight: 700;

		&.label {
			font-weight: 500;
		}
	}
`;

export const SymbolText = styled.span`
	font-weight: 500;
	font-size: 1rem;
	color: ${({ theme }) => theme.text1};

	@media (max-width: 991px) {
		font-size: 0.875rem;
		font-weight: 400;
	}
`;

export const CustomTitle = styled.h4`
	color: ${({ theme }) => theme.text1};
	font-size: 1.25rem;

	@media (max-width: 991px) {
		font-size: 0.875rem;
	}
`;

export const TokenSetCustomTitle = styled(CustomTitle)`
	font-size: 1rem;
`;

export const CustomNav = styled(Nav)`
	margin-left: -30px !important;
	margin-right: -30px !important;
	overflow: auto;

	@media (min-width: 768px) {
		margin-left: -10px !important;
		margin-right: -10px !important;
	}
`;

export const CustomNavItem = styled(Nav.Item)`
	flex-grow: initial !important;

	padding: 0 10px 10px;

	@media (max-width: 767px) {
		padding: 0 5px 10px;
	}

	&:first-child {
		@media (max-width: 767px) {
			padding-left: 30px;
		}
	}
	&:last-child {
		@media (max-width: 767px) {
			padding-right: 30px;
		}
	}
`;

export const CustomNavLink = styled(Nav.Link)`
	border-radius: 18px !important;
	color: ${({ theme }) => theme.primary};
	background-color: ${({ theme }) => theme.primaryLight};
	white-space: nowrap;
	padding: 14px 24px;
	min-height: 56px;
	font-weight: 500;
	display: flex;
	align-items: center;
	justify-content: center;

	@media (max-width: 767px) {
		padding: 6px 15px;
		font-size: 1rem;
		min-height: 32px;
		border-radius: 12px !important;
	}

	&:hover {
		color: ${({ theme }) => theme.primary};
	}

	&.active {
		color: ${({ theme }) => theme.text1};
		background-color: ${({ theme }) => theme.primary};
	}
`;

export const HeaderCol = styled(Col)`
	margin: -10px 0 20px;

	@media (min-width: 768px) {
		margin-bottom: 25px;
	}
`;

export const CustomInputGroup = styled(InputGroup)`
	margin-bottom: 30px;
`;

export const MarketLink = styled.a`
	color: ${({ theme }) => theme.text1};
	@media (max-width: 991px) {
		flex-basis: 100px;
	}
`;

export const ExploreTable = styled.div`
	.table {
		border-collapse: separate;
		border-spacing: 0 0;
		margin-bottom: 0 !important;

		thead th {
			background-color: rgba(#202020, 0.1);
			color: #202020;
			font-size: 0.875rem;
			font-weight: 500;
			text-overflow: ellipsis;
			white-space: nowrap;
			padding: 1.25rem 0.75rem;
			min-height: 56px;

			.dark-mode & {
				background-color: rgba(white, 0.1);
				color: white;
			}

			&:focus {
				outline: none;
			}

			&:first-child {
				border-top-left-radius: 18px;
				border-bottom-left-radius: 18px;
			}

			&:last-child {
				border-top-right-radius: 18px;
				border-bottom-right-radius: 18px;
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
			color: #202020;

			.dark-mode & {
				color: white;
			}
		}

		tr:not(:last-child) {
			td {
				border-bottom: 1px solid rgba(#202020, 0.5) !important;

				.dark-mode & {
					border-color: rgba(white, 0.5) !important;
				}
			}
		}
	}
`;
