import styled from "styled-components";
import { Nav } from "react-bootstrap";

export const StyledNav = styled(Nav)`
	padding: 0 1rem;
	margin-bottom: 1rem;
`;

export const StyledNavItem = styled(Nav.Item)`
	margin-right: 12px;
`;

export const StyledNavLink = styled(Nav.Link)`
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
