import styled from "styled-components";

export const Card = styled.div`
	background-color: ${({ theme }) => theme.modalBG};
	color: ${({ theme }) => theme.text1};
	display: flex;
	align-items: center;
	border-radius: 20px;
	padding: 1.875rem;
	margin-bottom: 20px;
	cursor: pointer;

	@media (min-width: 768px) {
		padding: 2rem;
	}
`;

export const CardIcon = styled.div`
	width: 56px;
	height: 56px;
	border-radius: 56px;
	flex-basis: 56px;
	border: 2px solid ${({ theme }) => theme.text1};
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;

	@media (min-width: 768px) {
		width: 66px;
		height: 66px;
		border-radius: 66px;
		flex-basis: 66px;
	}
`;

export const CardImage = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
`;

export const CardBody = styled.div`
	display: flex;
	align-items: center;
	padding: 0;
`;

export const CardContent = styled.div`
	display: flex;
	flex-direction: column;
	flex-wrap: wrap;
	justify-content: center;
	padding-left: 20px;

	@media (min-width: 768px) {
		padding-left: 30px;
	}
`;

export const Title = styled.span`
	font-weight: 500;
	font-size: 0.875rem;
	color: ${({ theme }) => theme.text1};
	display: block;
	margin-bottom: 0.25rem;

	@media (min-width: 768px) {
		font-size: 1rem;
	}
`;

export const Value = styled.span`
	font-weight: 700;
	font-size: 1.25rem;
	color: ${({ theme }) => theme.text1};
	display: block;
	margin: 0;

	@media (min-width: 768px) {
		font-size: 1.75rem;
	}
`;
