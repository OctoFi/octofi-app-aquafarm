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
	width: 240px;
	background-color: ${({ theme }) => theme.modalBG};
	transition: 0.5s ease all;
	transform: ${({ open }) => (open ? "translateX(0)" : "translateX(100%)")};
	z-index: 100001;
`;

export const Content = styled.div`
	display: flex;
	flex-direction: column;
	padding-bottom: 4rem;
`;

export const Header = styled.div`
	padding: 40px 30px;
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

export const CloseButton = styled.button`
	border: none;
	background-color: transparent;
	display: flex;
	align-items: center;
	justify-content: center;

	&:hover,
	&:focus,
	&:active {
		outline: none;
		text-decoration: none;
		box-shadow: none;
	}
`;

export const LogoContainer = styled.div`
	padding: 0.875rem 1.875rem 1.5rem;
	display: flex;
	align-items: center;
	border-bottom: 1px solid ${({ theme }) => theme.text3};
`;

export const LinkItem = styled(Link)`
	padding: 20px 24px 20px 30px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	background-color: ${({ theme }) => theme.modalBG};
	height: 64px;
	border-bottom: 1px solid ${({ theme }) => theme.text3};
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
