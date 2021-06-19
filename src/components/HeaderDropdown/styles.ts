import styled from "styled-components";
import { Button as BootstrapButton } from "react-bootstrap";
import { Link } from "react-router-dom";
import Img from "../UI/Img";

export const Wrapper = styled.div`
    position: relative;
    padding: 14px 0;

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
    padding: 20px;
    width: auto;
    min-width: 260px;

    opacity: 0;
    visibility: hidden;
    transform-style: preserve-3d;
    transform: rotateX(-40deg) scale(0.8);
    transform-origin: top center;
    transition: 0.4s ease all;
    z-index: 99999;
`;

export const DropDownItem = styled(Link)`
	display: flex;
	align-items: center;
	position: relative;
	outline: none;
	text-decoration: none;
	white-space: nowrap;
	color: ${({ theme }) => theme.text1};

	&:not(:last-child) {
		margin-bottom: 20px;
	}

	&:hover,
	&:focus,
	&:active {
		color: ${({ theme }) => theme.text2};
		box-shadow: none;
		outline: none;
		text-decoration: none;
	}
`;

export const Title = styled.span`
    font-weight: 500;
    font-size: 0.75rem;
    color: ${({ theme }) => theme.text3};
    margin-bottom: 8px;
    display: block;
`;

export const Title2 = styled.span`
	font-weight: 500;
	font-size: 1rem;
	color: ${({ theme }) => theme.text2};
`;

export const IconButton = styled(BootstrapButton)`
    color: ${({ theme }) => theme.primary};
    margin-right: 20px;
`;

export const SeeAllButton = styled(Link)`
    text-decoration: none;
    padding-top: 12px;
    font-weight: 500;
    font-size: 0.75rem;
    color: ${({ theme }) => theme.primary};
    display: block;
    text-align: center;
`;

export const CurrencyLogo = styled(Img)`
	width: 24px;
	height: 24px;
	margin-right: 20px;
	border-radius: 24px;
	border: 1px solid #a890fe;
	min-width: 24px;
`;
