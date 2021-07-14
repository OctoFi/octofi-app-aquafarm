import styled from "styled-components";
import { Link } from "react-router-dom";

export const Backdrop = styled.div<{ open: boolean }>`
	position: fixed;
	right: 0;
	left: 0;
	top: 0;
	bottom: 0;
	background-color: rgba(11, 15, 50, 0.8);
	opacity: ${({ open }) => (open ? "1" : "0")};
	visibility: ${({ open }) => (open ? "visible" : "hidden")};
	z-index: 100001;
	transition: 0.5s ease all;
`;

export const Wrapper = styled.div<{ open: boolean }>`
	position: fixed;
	right: 0;
	top: 0;
	bottom: 0;
	overflow: auto;
	width: 260px;
	background-color: ${({ theme }) => theme.modalBG};
	transition: 0.5s ease all;
	transform: ${({ open }) => (open ? "translateX(0)" : "translateX(100%)")};
	z-index: 100001;
`;

export const Content = styled.div`
	display: flex;
	flex-direction: column;
`;

export const Header = styled.div`
	padding: 1.5rem 1rem;
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1px solid ${({ theme }) => theme.borderColor2};
`;

export const LinkItem = styled(Link)`
	padding: 1.5rem 1.25rem;
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1px solid ${({ theme }) => theme.borderColor};
	color: ${({ theme }) => theme.text1};
	font-size: 0.875rem;
	font-weight: 400;

	&:hover,
	&:focus,
	&:active {
		outline: none;
		text-decoration: none;
		color: ${({ theme }) => theme.text2};
	}
`;
