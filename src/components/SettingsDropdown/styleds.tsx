import styled from "styled-components";

export const StyledMenu = styled.div`
	margin-left: 0.5rem;
	display: flex;
	justify-content: center;
	align-items: center;
	position: relative;
	border: none;
	text-align: left;
`;

export const MenuFlyout = styled.span`
	min-width: 20.125rem;
	background-color: ${({ theme }) => theme.bg1};
	box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04), 0px 24px 32px rgba(0, 0, 0, 0.01);
	border: 1px solid ${({ theme }) => theme.text4};
	border-radius: 12px;
	display: flex;
	flex-direction: column;
	font-size: 1rem;
	position: absolute;
	top: 3rem;
	right: 0rem;
	z-index: 100;

	${({ theme }) => theme.mediaWidth.upToMedium`
        min-width: 18.125rem;
    `};
`;

export const StyledMenuButton = styled.button`
	position: relative;
	width: 100%;
	height: 100%;
	border: none;
	background-color: transparent;
	margin: 0;
	padding: 0;
	height: 35px;

	padding: 0.15rem 0.5rem;
	border-radius: 0.5rem;

	:hover,
	:focus {
		cursor: pointer;
		outline: none;
	}

	svg {
		margin-top: 2px;
	}
`;

export const ThemeContainer = styled.div`
	margin-right: 18px;
`;

export const ItemWrap = styled.div`
    display: flex;
    align-items: center;
`;