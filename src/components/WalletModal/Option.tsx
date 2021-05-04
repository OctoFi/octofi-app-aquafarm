import React, {useEffect, useMemo, useState} from "react";
import styled from "styled-components";
import { Check } from 'react-feather'

import Loading from "../Loading";
import { ExternalLink } from "../../theme";
import ProviderIcon from "../ProvidersIcon";
import useTheme from "../../hooks/useTheme";

const InfoCard = styled.button<{ active?: boolean; clickable?: boolean }>`
	background-color: transparent;
	padding: 1rem;
	outline: none;
	border: none;
	border-radius: 20px;
	width: 100% !important;

	&:focus {
		outline: none;
	}
`;

const OptionCard = styled(InfoCard as any)`
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 1rem 0.5rem;
	transition: all ease 0.4s;
`;

const OptionCardLeft = styled.div`
	${({ theme }) => theme.flexRowNoWrap};
	justify-content: space-between;
	align-items: center;
	flex: 1;
	height: 100%;
`;

const HeaderText = styled.div`
	${({ theme }) => theme.flexRowNoWrap};
	color: ${({ theme }) => theme.text3};
	font-size: 0.75rem;
	font-weight: 400;
	transition: all ease 0.3s;
`;

const OptionCardClickable = styled(OptionCard as any)<{
	clickable?: boolean;
	isRow?: boolean;
	supportedNetworks?: string[];
	name?: string | undefined;
}>`
	margin-top: 0;
	opacity: ${({ disabledItem }) => (disabledItem ? "1 !important" : "0.5 !important")};
	margin-bottom: 0;

	cursor: ${({ disabledItem }) => (disabledItem ? "pointer !important" : "not-allowed !important")};
	
	&:hover {
		cursor: ${({ clickable }) => (clickable ? "pointer" : "")};
		background-color: ${({ theme }) => theme.primaryLight};
		
		& .wallet-option__icon-wrapper {
			background-color: ${({ theme }) => theme.modalBG};
		}
		
		& ${HeaderText} {
			color: ${({ theme }) => theme.text1};
		}
	}
`;

const IconWrapper = styled.div<{ size?: number | null }>`
	${({ theme }) => theme.flexColumnNoWrap};
	align-items: center;
	justify-content: center;
	width: 60px;
	height: 60px;
	min-height: 60px;
	border-radius: 80px;
	background-color: ${({ theme }) => theme.primaryLight};
	margin-bottom: 12px;
	position: relative;
	transition: all ease 0.3s;

	& > img,
	span {
		height: ${({ size }) => (size ? size + "px" : "24px")};
		width: ${({ size }) => (size ? size + "px" : "24px")};
	}

	@media (max-width: 1199px) {
		width: 56px;
		height: 56px;
		min-height: 56px;

		& > img,
		span {
			height: 28px;
			width: 28px;
		}
	}
`;

const LoadingContainer = styled.div<{ color: string }>`
	width: 24px;
	height: 24px;
	border-radius: 40px;
	border: 4px solid ${({ theme }) => theme.modalBG};
	background-color: ${({ theme, color }) => color?.slice(0, 1) === '#' ? color : (theme as any)[color] };
	display: flex;
	align-items: center;
	justify-content: center;
	right: -4px;
	bottom: -8px;
	position: absolute;
`

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
    selectedNetwork,
	supportedNetworks = ["ETH"]
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
	selectedNetwork?: string | undefined;
	supportedNetworks?: string[] | undefined;
}) {
	// @ts-ignore
	const [loadingColor, setLoadingColor] = useState("#a890fe");
	const theme = useTheme();

	const disabled = useMemo(() => {
		return supportedNetworks?.includes(selectedNetwork || "")
	}, [supportedNetworks, selectedNetwork])

	useEffect(() => {
		let tempColor = active
			? "secondary"
			: !selected || (!!selected && selected !== name)
			? "modalBG"
			: error
			? "danger"
			: "success";
		setLoadingColor(tempColor);
	}, [selected, name, error]);

	const clickHandler = () => {
		if(disabled) {
			return onClick?.();
		}

		return null;
	}
	const content = (
		<OptionCardClickable
			id={id}
			onClick={clickHandler}
			clickable={clickable && !active}
			active={active}
			disabledItem={disabled}
		>
			<IconWrapper size={40} className={'wallet-option__icon-wrapper'}>
				<ProviderIcon type={type} />
				{disabled && (active || (selected && selected === name)) && (
					<LoadingContainer color={loadingColor}>
						{active ? (
							<Check size={12} color={theme.modalBG}/>
						) : selected && selected === name &&  (
							<Loading width={10} height={22} color={theme.modalBG} id={name} active={!active}  />
						)}
					</LoadingContainer>
				)}
			</IconWrapper>
			<OptionCardLeft>
				<HeaderText color={color}>{header}</HeaderText>
			</OptionCardLeft>
		</OptionCardClickable>
	);
	if (link) {
		return <ExternalLink href={link}>{content}</ExternalLink>;
	}

	return content;
}
