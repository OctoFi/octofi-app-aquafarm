import styled from "styled-components";

export const Title = styled.h2`
	color: ${({ theme }) => theme.text1};
	font-weight: 700;
	font-size: 1.5rem;
	margin-bottom: 0;

	${({ theme }) => theme.mediaWidth.upToMedium`
		margin-bottom: 1.5rem;
	`};
`;
