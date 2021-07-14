import styled from "styled-components";
import { Col, Nav } from "react-bootstrap";
import { InputGroup } from "../../components/Form";

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
