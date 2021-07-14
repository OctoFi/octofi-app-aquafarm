import styled from "styled-components";

export const Section = styled.div`
	margin-bottom: 3rem;
`;

export const SectionHeader = styled.div`
	margin-bottom: 1.25rem;
	display: flex;
	align-items: center;
	justify-content: space-between;

	@media (max-width: 767px) {
		align-items: flex-start;
	}
`;

export const SectionHeaderInner = styled.div`
	display: flex;
	flex-direction: column;
	flex: 1;
`;

export const SectionTitle = styled.h4`
	color: ${({ theme }) => theme.text1};
	font-size: 1.25rem;
	font-weight: 600;
	margin-bottom: 0.625rem;
`;

export const SectionSubTitle = styled.span`
	font-size: 0.875rem;
	color: ${({ theme }) => theme.text3};

	@media (min-width: 768px) {
		font-size: 1rem;
	}
`;

export const SectionBody = styled.div<{ direction: string }>`
	display: flex;
	flex-direction: ${({ direction }) => direction};
	margin-bottom: 0.5rem;
`;
