import styled from "styled-components";
import { Text } from "rebass";

export const PlatformCard = styled.div<{ selected: boolean }>`
	background-color: ${({ selected, theme }) => (selected ? theme.bg1 : theme.primaryLight)};
	border: 1px solid ${({ theme, selected }) => (selected ? theme.primary : theme.primaryLight)};
	border-radius: 0.75rem;
	cursor: pointer;
	margin-bottom: 0.75rem;
	padding: 0.5rem 0.75rem;
	transition: all ease 0.3s;

	&:hover {
		background-color: ${({ theme }) => theme.bg1};
		border-color: ${({ theme }) => theme.primary};
	}

	@media (min-width: 768px) {
		padding: 0.65rem 1rem;
	}
`;

export const Logo = styled.img<{ size: number }>`
	border-radius: 50%;
	width: ${({ size }) => (size ? `${size}px` : "1.5rem")};
	height: ${({ size }) => (size ? `${size}px` : "1.5rem")};
	margin-right: 1rem;
`;

export const RateText = styled(Text)`
	color: ${({ theme }) => theme.text1};
	font-size: 0.75rem;

	@media (min-width: 768px) {
		font-size: 0.85rem;
		font-weight: 500;
	}
`;
