import styled from "styled-components";
import Img from "../UI/Img";

export const Icon = styled(Img)`
	margin-right: 1rem;
	width: 1.5rem;
	height: 1.5rem;

	@media (min-width: 992px) {
		width: 2rem;
		height: 2rem;
	}
`;

export const Title = styled.span`
	color: ${({ theme }) => theme.text1};
	font-size: 0.875rem;
	font-weight: 600;
	text-transform: capitalize;

	@media (min-width: 768px) {
		font-size: 1rem;
	}
`;

export const Subtitle = styled.span`
	color: ${({ theme }) => theme.text3};
	font-size: 0.75rem;
	font-weight: 500;
	text-transform: uppercase;

	@media (min-width: 768px) {
		font-size: 0.875rem;
	}
`;
