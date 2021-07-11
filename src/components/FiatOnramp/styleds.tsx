import styled from "styled-components";
import { Button } from "react-bootstrap";

export const PriceText = styled.div`
	color: ${({ theme }) => theme.text1};
	font-size: 0.875rem;
	padding: 0 0.5rem;
	text-align: right;
`;

export const BuyButton = styled(Button)`
	width: 100%;

	@media (min-width: 768px) {
		width: auto;
		min-width: 250px;
	}
`;
