import styled from "styled-components";
import { Text } from "rebass";

export const RateText = styled(Text)`
	color: ${({ theme }) => theme.text1};
`;

export const ProgressContainer = styled.div`
	background: ${({ theme }) => theme.primaryLight};
	border-radius: 12px;
	padding: 1rem;

	.progress {
		height: 0.75rem;
		background-color: ${({ theme }) => theme.primaryLight};
	}
`;
