import styled from "styled-components";

export const SectionHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 2rem 30px;
`;

export const SectionTitle = styled.h4`
	color: ${({ theme }) => theme.text1};
	font-weight: 700;
	font-size: 1rem;
	margin: 0;

	@media (min-width: 768px) {
		font-size: 1.25rem;
	}
`;

export const SectionSubTitle = styled.p`
	color: ${({ theme }) => theme.text1};
	font-weight: 400;
	font-size: 1rem;
	margin: 0;
`;
