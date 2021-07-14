import styled from "styled-components";
import { Button, Col } from "react-bootstrap";

export const Hero = styled.section`
	padding: 20px 0 40px;

	@media (min-width: 768px) {
		padding: 100px 0 80px;
	}
`;

export const Title = styled.h1`
	margin-bottom: 3.75rem;

	@media (max-width: 767px) {
		margin-top: 0;
		font-size: 1.875rem;
		margin-bottom: 2rem;
	}
`;

export const ConceptCol = styled(Col)`
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
`;

export const Image = styled.img`
	position: absolute;
	z-index: 2;
`;

export const Image1 = styled(Image)`
	z-index: 10;
	position: relative;
	width: 320px;
	height: auto;
`;

export const CustomButton = styled(Button)`
	padding: 1rem 1.5rem;
	font-weight: 500;
`;
