import styled from "styled-components";
import { Box } from "rebass/styled-components";
import { lighten } from "polished";
import { CardProps, Text } from "rebass";

const StyledCard = styled(Box)<{ padding?: string; border?: string; borderRadius?: string }>`
	width: 100%;
	border-radius: 16px;
	padding: 1.25rem;
	padding: ${({ padding }) => padding};
	border: ${({ border }) => border};
	border-radius: ${({ borderRadius }) => borderRadius};
`;

export default StyledCard;

export const LightCard = styled(StyledCard)`
	border: 1px solid ${({ theme }) => theme.text3};
	background-color: ${({ theme }) => theme.modalBG};
`;

export const LightGreyCard = styled(StyledCard)`
	background-color: ${({ theme }) => lighten(0.1, theme.modalBG)};
`;

export const GreyCard = styled(StyledCard)`
	background-color: ${({ theme }) => theme.bg1};
`;

export const OutlineCard = styled(StyledCard)`
	border: 1px solid ${({ theme }) => theme.bg1};
`;

export const YellowCard = styled(StyledCard)`
	background-color: rgba(243, 132, 30, 0.05);
	color: ${({ theme }) => theme.warning};
	font-weight: 500;
`;

export const PinkCard = styled(StyledCard)`
	background-color: rgba(255, 0, 122, 0.03);
	color: ${({ theme }) => theme.primary};
	font-weight: 500;
`;

const BlueCardStyled = styled(StyledCard)`
	background-color: ${({ theme }) => theme.primary};
	color: ${({ theme }) => theme.primary};
	border-radius: 12px;
	width: fit-content;
`;

export const BlueCard = ({ children, ...rest }: CardProps) => {
	return (
		<BlueCardStyled {...rest}>
			<Text fontWeight={500} color="#2172E5">
				{children}
			</Text>
		</BlueCardStyled>
	);
};
