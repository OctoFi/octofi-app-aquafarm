import styled from "styled-components";

export const PageContainer = styled.div<{ hasBg: boolean }>`
	background-color: ${({ hasBg, theme }) => (hasBg ? theme.modalBG : "transparent")};
	padding-top: 136px;

	@media (min-width: 768px) {
		background-color: transparent;
	}
`;

export const Title = styled.h1`
	font-size: 1.25rem;
	font-weight: 700;
	color: ${({ theme }) => theme.text1};
	margin-top: 0;

	@media (min-width: 768px) {
		font-size: 2.5rem;
	}
`;
