import styled from "styled-components";

export const NoResultText = styled.span`
	color: ${({ theme }) => theme.text1};
	font-size: 1rem;
	font-weight: 700;
	text-align: center;
	margin-bottom: 14px;
`;

export const NoResultDescription = styled.span`
	color: ${({ theme }) => theme.text2};
	font-size: 0.875rem;
	font-weight: 400;
	text-align: center;
`;
