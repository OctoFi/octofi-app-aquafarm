import styled from "styled-components";
import { ResponsiveCard } from "../Card";
import { ClickableText } from "../ExternalLink";

export const CustomCard = styled(ResponsiveCard)``;

export const ApproveArrow = styled.div`
	align-self: center;
	margin: 24px 0 20px;

	@media (min-width: 991px) {
		margin: 0 43px;
	}
`;

export const StyledClickableText = styled(ClickableText)`
	color: ${({ theme }) => theme.text1};
`;

export const SwitchCol = styled.div`
	background: ${({ theme }) => theme.bg3};
	border: 4px solid ${({ theme }) => theme.modalBG};
	border-radius: 50%;
	margin-left: 1.75rem;
	margin-top: -8px;
	margin-bottom: -8px;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	height: 44px;
	width: 44px;
	text-align: center;
	z-index: 2;
`;
