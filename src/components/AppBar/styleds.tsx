import styled from "styled-components";
import { NavLink } from "react-router-dom";

export const AppNavbar = styled.div`
	${({ theme }) => theme.flexRowNoWrap};
	align-items: stretch;
	min-height: 80px;
	background-color: ${({ theme }) => theme.modalBG};
	border-top: 1px solid ${({ theme }) => theme.borderColor};
	transition: all ease 0.4s;
	z-index: 800;
`;

export const AppBarItem = styled(NavLink)`
	${({ theme }) => theme.flexColumnNoWrap};
	align-items: center;
	justify-content: center;
	gap: 6px;
	flex: 1;
	color: ${({ theme }) => theme.text1};
	text-decoration: none;
	font-weight: 500;
	font-size: 0.75rem;
	padding: 0.5rem;

	&:hover {
		color: ${({ theme }) => theme.text2};
	}

	&.active {
		color: ${({ theme }) => theme.primary};
	}
`;

export const RotateIcon = styled.span`
	transform: rotate(-45deg);
`;
