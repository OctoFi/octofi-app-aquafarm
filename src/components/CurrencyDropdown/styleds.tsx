import styled from "styled-components";
import { Button } from "react-bootstrap";
import Img from "../UI/Img";

export const CurrencyWrapper = styled.div`
    padding: 0;
    position: relative;

    &:hover .header-dropdown {
        opacity: 1;
        visibility: visible;
        transform: rotateX(0deg) scale(1);
    }
`;

export const Item = styled.div`
    display: flex;
    align-items: center;
`;

export const DropDown = styled.div`
    position: absolute;
    top: 100%;
    right: 0;
    background-color: ${({ theme }) => theme.modalBG};
    border-radius: 0.75rem;
    box-shadow: -1px 11px 43px rgba(0, 0, 0, 0.12);
    width: auto;
    min-width: 250px;
    padding: 10px;

    opacity: 0;
    visibility: hidden;
    transform-style: preserve-3d;
    transform: rotateX(-40deg) scale(0.8);
    transform-origin: top center;
    transition: 0.4s ease all;
    z-index: 99999;
`;

export const DropDownItem = styled(Button)`
	display: flex;
	align-items: center;
	position: relative;
	outline: none;
	text-decoration: none;
	white-space: nowrap;
	color: ${({ theme }) => theme.text1};

	&:hover,
	&:focus,
	&:active ,
    &.active {
		color: ${({ theme }) => theme.primary};
		box-shadow: none;
		outline: none;
		text-decoration: none;
	}
`;

export const Title = styled.span`
	font-weight: 500;
	font-size: 1rem;
`;

export const IconButton = styled(Button)`
    color: ${({ theme }) => theme.text1};

    &:hover,
    &:focus {
        color: ${({ theme }) => theme.text1};
        text-decoration: none;
    }
`;

export const CurrencyLogo = styled(Img)`
	border-radius: 50%;
	height: 24px;
	min-width: 24px;
	width: 24px;
	margin-right: 0.5rem;
`;
