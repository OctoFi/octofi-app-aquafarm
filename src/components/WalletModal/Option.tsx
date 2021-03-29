import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { isMobile } from "react-device-detect";

import Loading from "../Loading";
import { ExternalLink } from "../../theme";
import ProviderIcon from "../ProvidersIcon";

const InfoCard = styled.button<{ active?: boolean; clickable?: boolean }>`
	background-color: ${({ theme }) => theme.bg2};
	padding: 1rem;
	outline: none;
	border: 1px solid;
	border-radius: 18px;
	width: 100% !important;
	&:focus {
		outline: none;
	}
	border-color: ${({ theme, active }) => (active ? "transparent" : theme.bg2)};
`;

const OptionCard = styled(InfoCard as any)`
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-top: 2rem;
	padding: 1rem;
	transition: all ease 0.4s;
	box-shadow: 0 0 0 rgba(0, 0, 0, 0);

	@media (max-width: 1199px) {
		max-height: 70px;
	}
`;

const OptionCardLeft = styled.div`
	${({ theme }) => theme.flexRowNoWrap};
	justify-content: space-between;
	align-items: center;
	flex: 1;
	height: 100%;
`;

const OptionCardClickable = styled(OptionCard as any)<{
	clickable?: boolean;
	isRow?: boolean;
	name?: string | number;
	selected?: string | undefined;
}>`
	margin-top: 0;
	opacity: ${({ selected, name }) => (selected === name || !selected ? "1 !important" : "0.5 !important")};
	margin-bottom: 0;
	flex-direction: row;
	&:hover {
		cursor: ${({ clickable }) => (clickable ? "pointer" : "")};
		transform: scale(1.02);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.07);
	}
	opacity: ${({ disabled }) => (disabled ? "0.5" : "1")};
`;

const HeaderText = styled.div`
	${({ theme }) => theme.flexRowNoWrap};
	color: ${(props) => (props.color === "blue" ? ({ theme }) => theme.primary1 : ({ theme }) => theme.text1)};
	font-size: 1rem;
	font-weight: 500;
`;

const IconWrapper = styled.div<{ size?: number | null }>`
	${({ theme }) => theme.flexColumnNoWrap};
	align-items: center;
	justify-content: center;
	width: 55px;
	height: 55px;
	border-radius: 12px;
	background-color: #fff;
	margin-right: 40px;

	& > img,
	span {
		height: ${({ size }) => (size ? size + "px" : "24px")};
		width: ${({ size }) => (size ? size + "px" : "24px")};
	}

	@media (max-width: 1199px) {
		width: 40px;
		height: 40px;
		margin-right: 15px;

		& > img,
		span {
			height: 24px;
			width: 24px;
		}
	}
`;

export default function Option({
	link = null,
	clickable = true,
	size,
	onClick = null,
	color,
	header,
	error = undefined,
	active = false,
	subheader = null,
	id,
	type,
	selected,
	name,
}: {
	link?: string | null;
	clickable?: boolean;
	size?: number | null;
	onClick?: null | (() => void);
	color: string;
	header: React.ReactNode;
	error: boolean | undefined;
	active?: boolean;
	subheader: string | null;
	id: string;
	type: string;
	direction?: string;
	selected?: string | undefined;
	name?: string;
}) {
	const [loadingColor, setLoadingColor] = useState("#a890fe");

	useEffect(() => {
		let tempColor = active
			? "#4AC8AA"
			: !selected || (!!selected && selected !== name)
			? "#a890fe"
			: error
			? "danger"
			: "success";
		setLoadingColor(tempColor);
	}, [selected, name, error]);

	const content = (
		<OptionCardClickable
			id={id}
			onClick={onClick}
			clickable={clickable && !active}
			active={active}
			selected={selected}
			name={name}
		>
			<IconWrapper size={36}>
				<ProviderIcon type={type} />
			</IconWrapper>
			<OptionCardLeft>
				<HeaderText color={color}>{header}</HeaderText>
				<Loading width={isMobile ? 24 : 40} height={isMobile ? 24 : 40} color={loadingColor} id={name} />
			</OptionCardLeft>
		</OptionCardClickable>
	);
	if (link) {
		return <ExternalLink href={link}>{content}</ExternalLink>;
	}

	return content;
}
