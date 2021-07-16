import styled from "styled-components";

export const StyledMenu = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	position: relative;
	border: none;
	text-align: left;
`;

export const MenuFlyout = styled.span`
	min-width: 22rem;
	background-color: ${({ theme }) => theme.bg1};
	box-shadow: none;
	border: 1px solid ${({ theme }) => theme.text4};
	border-radius: 12px;
	display: flex;
	flex-direction: column;
	font-size: 1rem;
	position: absolute;
	top: 3rem;
	right: 0rem;
	z-index: 100;
`;

export const StyledMenuButton = styled.button`
	${({ theme }) => theme.flexRowNoWrap};
	align-items: center;
	gap: 0.25rem;
	background-color: transparent;
	border-radius: 0.5rem;
	border: 1px solid transparent;
	color: ${({ theme }) => theme.text1};
	position: relative;
	width: 100%;
	height: 100%;
	margin: 0;
	padding: 0;
	height: 35px;
	padding: 0.15rem 0.5rem;

	&:hover,
	&:focus {
		border-color: ${({ theme }) => theme.primary};
		cursor: pointer;
		outline: none;
	}
`;
