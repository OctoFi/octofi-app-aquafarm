import styled from "styled-components";
import { Link } from "react-router-dom";
import { Button, Nav } from "react-bootstrap";
import { InputGroup } from "../Form";

export const CustomNavItem = styled(Nav.Item)`
	margin-right: 0.5rem;
`;

export const CustomInputGroup = styled(InputGroup)`
	margin-bottom: 2rem;
`;

export const CustomNavLink = styled(Nav.Link)`
	border-radius: 18px !important;
	color: ${({ theme }) => theme.primary};
	background-color: ${({ theme }) => theme.primaryLight};
	white-space: nowrap;
	padding: 0.75rem 1.5rem;
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

export const LogoContainer = styled.div`
	max-width: 24px;
	max-height: 24px;
	height: 24px;
	width: 24px;
	min-width: 24px;
	margin-left: 1rem;

	@media (min-width: 992px) {
		max-width: 32px;
		max-height: 32px;
		height: 32px;
		width: 32px;
		min-width: 32px;
		margin-right: 1.5rem;
		margin-left: 0;
	}
`;

export const Title = styled.span`
	font-weight: bold;
	font-size: 1rem;
	color: ${({ theme }) => theme.text1};

	@media (max-width: 991px) {
		font-size: 0.875rem;
	}
`;

export const CustomText = styled.span`
	color: ${({ theme }) => theme.text1};
	font-weight: 400;
	font-size: 0.875rem;

	@media (max-width: 991px) {
		font-size: 0.75rem;
	}
`;

export const PoolsButton = styled(Button)`
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

export const TradeButton = styled(PoolsButton)<{ variant: string }>`
	color: ${({ theme, variant }) => (variant ? variant : theme.primary)} !important;
	margin-left: 8px;

	@media (max-width: 991px) {
		width: 100%;
		margin-bottom: 0.5rem;
	}

	&:not(:disabled):hover {
		color: ${({ theme }) => theme.bg1} !important;
		background-color: ${({ theme, variant }) => (variant ? variant : theme.primary)};
	}

	&:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
`;

export const StyledLink = styled(Link)`
	text-decoration: none;
	display: inline-flex;
	margin-right: 20px;

	&:last-child {
		margin-right: 0;
	}

	@media (max-width: 991px) {
		margin-right: 0;
		&:not(:last-child) {
			margin-bottom: 14px;
		}
	}

	&:hover,
	&:focus,
	&:active {
		text-decoration: none;
		outline: none;
		box-shadow: none;
	}
`;
