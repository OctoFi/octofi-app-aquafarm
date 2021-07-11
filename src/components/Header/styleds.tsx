import styled from "styled-components";
import { NavLink } from 'react-router-dom';
import { Navbar } from "react-bootstrap";

export const Container = styled.div<{ right: number; scrolled: boolean }>`
	transition: all ease 0.4s;
	position: fixed;
	top: 0;
	left: 0;
	right: ${({ right }) => (right ? `${right}px` : "0")};
	background-color: ${({ theme, scrolled }) => (scrolled ? theme.modalBG : "transparent")};
	box-shadow: ${({ scrolled }) => (scrolled ? "-1px 11px 43px rgba(0, 0, 0, 0.12)" : "0 0 0 rgba(0, 0, 0, 0)")};
	z-index: 800;

	@media (max-width: 1199px) {
		z-index: 1090;

		body.modal-open & {
			background-color: ${({ theme }) => theme.modalBG};
			box-shadow: 0 0 0 rgba(0, 0, 0, 0);
		}
	}
`;

export const WalletLink = styled.div`
	color: ${({ theme }) => theme.text1};
	background-color: ${({ theme }) => theme.bg5};
	border-radius: 12px;
	padding: 0.5rem 1rem;
	font-size: 1rem;
	font-weight: 500;
	cursor: pointer;
`;

export const NavbarBrand = styled(Navbar.Brand)<{ hasCallback: boolean }>`
	transition: 0.4s all ease;

	@media (max-width: 1199px) {
		body.modal-open & {
			transform: ${({ hasCallback }) => (hasCallback ? "translateX(52px)" : "translateX(0)")};
		}
	}
`;

export const BackButton = styled.button<{ hasCallback: boolean }>`
	border: none;
	color: ${({ theme }) => theme.primary};
	background-color: ${({ theme }) => theme.primaryLight};
	border-radius: 300px;
	width: 32px;
	height: 32px;
	position: absolute;
	top: calc(50% - 16px);
	left: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all ease 0.4s;

	@media (max-width: 1199px) {
		transform: translateX(-50px) scale(0.9);
		opacity: 0;
		visibility: hidden;

		body.modal-open & {
			transform: ${({ hasCallback }) =>
				hasCallback ? "translateX(0) scale(1)" : "translateX(-50px) scale(0.9)"};
			opacity: ${({ hasCallback }) => (hasCallback ? "1" : "0")};
			visibility: ${({ hasCallback }) => (hasCallback ? "visible" : "hidden")};
		}
	}

	&:hover {
		background-color: ${({ theme }) => theme.primary};
		color: ${({ theme }) => theme.bg2};
	}

	&:hover,
	&:active,
	&:focus {
		outline: none;
		box-shadow: none;
		text-decoration: none;
	}
`;

export const MenuIcon = styled.div`
	color: ${({ theme }) => theme.text1};
`;

export const HeadNavbar = styled(Navbar)<{ scrolled?: boolean }>`
	min-height: ${({ scrolled }) => (scrolled ? "80px" : "96px")};
	background-color: transparent;
	padding-top: 0;
	padding-bottom: 0;
`;

export const HeaderInner = styled.div<{ scrolled?: boolean }>`
	min-height: ${({ scrolled }) => (scrolled ? "80px" : "96px")};
	transition: 0.3s ease all;
	display: flex;
	align-items: center;
	justify-content: space-between;

	@media (max-width: 1200px) {
		width: 100%;
	}
`;

export const HeaderItem = styled(NavLink)`
	color: ${({ theme }) => theme.text1} !important;
	text-decoration: none !important;
	font-weight: 500;
	font-size: 1rem;
	padding: 1rem 1.625rem;
	position: relative;

	&:hover {
		color: ${({ theme }) => theme.text2} !important;
	}

	&::before {
		content: "";
		position: absolute;
		bottom: 0.625rem;
		left: 1.25rem;
		right: 1.25rem;
		height: 1px;
		background-color: ${({ theme }) => theme.primary} !important;
		transform: scaleX(0);
		transform-origin: left center;
		transition: 0.4s ease all;
		will-change: transform;
	}

	&.active::before {
		transform: scaleX(1);
		transform-origin: right center;
	}
`;
