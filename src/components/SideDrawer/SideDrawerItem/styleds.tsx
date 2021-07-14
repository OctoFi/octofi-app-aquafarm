import styled from "styled-components";
import { Link } from "react-router-dom";

export const Wrapper = styled.div`
	background-color: ${({ theme }) => theme.bg1};
	position: relative;
`;

export const Header = styled.div`
	padding: 1.5rem 1.25rem;
	display: flex;
	align-items: center;
	justify-content: space-between;
	background-color: ${({ theme }) => theme.modalBG};
	border-bottom: 1px solid ${({ theme }) => theme.borderColor2};
	cursor: pointer;
`;

export const IconContainer = styled.div<{ open: boolean }>`
	transition: all ease 0.3s;
	transform: ${({ open }) => (open ? "rotate(180deg)" : "rotate(0deg)")};
`;

export const TitleContainer = styled.div`
	display: flex;
	align-items: center;
`;

export const Title = styled.span`
	color: ${({ theme }) => theme.text1};
	font-size: 0.875rem;
	font-weight: 400;
	padding-right: 0.5rem;
`;

export const Icon = styled.div`
	color: ${({ theme }) => theme.primary};
	padding-right: 1.5rem;
`;

export const Collapse = styled.div<{ height: number }>`
	overflow: hidden;
	max-height: ${({ height }) => (height ? `${height}px` : 0)};
	transition: all ease 0.3s;
`;

export const Body = styled.div`
	border-bottom: 1px solid ${({ theme }) => theme.borderColor2};
	display: flex;
	flex-direction: column;
`;

export const BodyItem = styled(Link)`
	font-size: 0.875rem;
	font-weight: 400;
	color: ${({ theme }) => theme.text1};
	padding: 1rem 2rem;

	&:hover,
	&:focus,
	&:active {
		outline: none;
		text-decoration: none;
		color: ${({ theme }) => theme.text2};
	}
`;
