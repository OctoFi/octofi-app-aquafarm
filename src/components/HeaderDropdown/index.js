import styled, { ThemeContext } from "styled-components";
import { useState, useCallback, useContext } from "react";
import SVG from "react-inlinesvg";
import { Link } from "react-router-dom";

import ArrowDown from "../../assets/images/global/arrow-down.svg";
import { useTranslation } from "react-i18next";

const Wrapper = styled.div`
	position: relative;

	&:hover .header-dropdown {
		opacity: 1;
		visibility: visible;
		transform: rotateX(0deg) scale(1);
	}
`;

const Item = styled.div`
	text-decoration: none !important;
	color: ${({ theme }) => theme.text1};
	font-weight: 500;
	font-size: 1rem;
	padding: 1rem 1.625rem;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: space-between;
	cursor: pointer;
	perspective: 800px;

	&:hover {
		color: ${({ theme }) => theme.text2};
	}

	&::before {
		content: "";
		position: absolute;
		bottom: 0.625rem;
		left: 1.625rem;
		right: 1.625rem;
		height: 1px;
		background-color: ${({ theme }) => theme.primary};
		transform: scaleX(0);
		transform-origin: left center;
		transition: 0.4s ease all;
		will-change: transform;
	}
`;

const ItemInner = styled.span`
	display: flex;
	padding-right: 0.75rem;
	color: ${({ theme, active }) => (active ? theme.primary : theme.text1)};
	white-space: nowrap;
`;

const DropDown = styled.div`
	position: absolute;
	top: 100%;
	left: 1.625rem;
	background-color: ${({ theme }) => theme.modalBG};
	border-radius: 0.75rem;
	box-shadow: -1px 11px 43px rgba(0, 0, 0, 0.12);
	padding: 20px;

	opacity: 0;
	visibility: hidden;
	transform-style: preserve-3d;
	transform: rotateX(-40deg) scale(0.8);
	transform-origin: top center;
	transition: 0.4s ease all;
	z-index: 99999;
`;

const DropDownItem = styled(Link)`
	display: flex;
	align-items: center;
	position: relative;
	padding-left: 20px;
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

	&::before {
		content: "";
		position: absolute;
		left: 0;
		top: 6px;
		width: 10px;
		height: 10px;
		border-radius: 10px;
		background-color: ${({ theme, state }) => (state ? theme[state] : theme.primary)};
	}
`;

const HeaderDropdown = ({ items, title, ...props }) => {
	const theme = useContext(ThemeContext);
	const { t } = useTranslation();
	return (
		<Wrapper>
			<Item>
				<ItemInner>{t(`menu.${title}`)}</ItemInner>
				<SVG src={ArrowDown} style={{ color: theme.primary }} />
			</Item>
			<DropDown className={"header-dropdown"}>
				{Object.values(items).map((item, index) => {
					return (
						<DropDownItem to={item.path} key={`${title}-${index}`} state={item.state}>
							{t(`menu.${item.title}`)}
						</DropDownItem>
					);
				})}
			</DropDown>
		</Wrapper>
	);
};

export default HeaderDropdown;
