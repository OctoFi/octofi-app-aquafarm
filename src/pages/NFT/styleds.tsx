import styled from "styled-components";
import { Col } from "react-bootstrap";

export const FiltersCol = styled(Col)`
	min-width: 340px;

	@media (min-width: 767px) {
		max-width: 480px;
	}
`;

export const CardSection = styled.div`
	padding: 1rem 1rem 1.5rem;
	border-bottom: 1px solid ${({ theme }) => theme.borderColor};
`;

export const Title = styled.h4<{ marginBottom?: string }>`
	font-weight: bold;
	font-size: 1.25rem;
	color: ${({ theme }) => theme.text1};
	margin: ${({ marginBottom }) => `0 0 ${marginBottom || "20px"}`};

	@media (max-width: 991px) {
		font-size: 1.125rem;
	}
`;
