import styled from "styled-components";

export const LogoContainer = styled.div`
	max-width: 32px;
	max-height: 32px;
	height: 32px;
	width: 32px;

	@media (max-width: 1199px) {
		max-width: 24px;
		max-height: 24px;
		height: 24px;
		width: 24px;
	}
`;

export const CustomText = styled.span<{ size: string }>`
	color: ${({ theme }) => theme.text1};
	font-weight: 500;
	font-size: ${({ size }) =>
		size === "sm" ? "0.75rem" : size === "md" ? ".875rem" : size === "lg" ? "1rem" : ".875rem"};

	@media (min-width: 1200px) {
		font-weight: 700;
		font-size: ${({ size }) =>
			size === "sm" ? "0.75rem" : size === "md" ? "1rem" : size === "lg" ? "1.25rem" : "1rem"};
	}
`;

export const Title = styled.span<{ size: string }>`
	color: ${({ theme }) => theme.text1};
	font-weight: 500;
	font-size: ${({ size }) =>
		size === "sm" ? "0.75rem" : size === "md" ? ".875rem" : size === "lg" ? "1rem" : ".875rem"};
	margin-left: 0.875rem;

	@media (min-width: 1200px) {
		font-weight: 700;
		font-size: ${({ size }) =>
			size === "sm" ? "0.75rem" : size === "md" ? "1rem" : size === "lg" ? "1.25rem" : "1rem"};
		margin-left: 1.25rem;
	}
`;
