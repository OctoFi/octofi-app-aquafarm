import styled from "styled-components";
import Card from "../Card";

export const CustomCard = styled(Card)`
	border: 1px solid ${({ theme }) => theme.borderColor2};
	overflow: hidden;
	
	.card-header {
		border-bottom: 1px solid ${({ theme }) => theme.borderColor2};
	}
	.card-body {
		padding: 0;
	}
`;

export const Title = styled.h2`
	font-weight: 700;
	font-size: 1.25rem;
	margin-top: 0;
	margin-bottom: 0;
`;

export const Header = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;
