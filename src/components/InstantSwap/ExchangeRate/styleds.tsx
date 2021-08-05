import styled from "styled-components";
import { Text } from "rebass";

export const RateText = styled(Text)`
	color: ${({ theme }) => theme.text1};

	@media (max-width: 767px) {
		font-size: 0.75rem;
	}
`;
