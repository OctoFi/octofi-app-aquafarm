import styled from "styled-components";

export const Card = styled.div`
	background-color: ${({ theme }) => theme.modalBG};
	color: ${({ theme }) => theme.text1};
	display: flex;
	align-items: center;
	border-radius: 18px;
	margin-bottom: 1rem;
	padding: 1.5rem;
`;

export const CardBody = styled.div`
	display: flex;
	align-items: center;
`;

export const CardIcon = styled.div<{ color: string }>`
	width: 60px;
	height: 60px;
	border-radius: 50%;
	background-color: ${({ color }) => color};
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;
`;

export const Img = styled.img`
    width: 50%;
    height: auto;
`;

export const CardContent = styled.div`
	margin-left: 1rem;
`;

export const Title = styled.p`
	font-weight: 500;
	font-size: 1rem;
	color: ${({ theme }) => theme.text1};
	margin-bottom: 0;
`;

export const Value = styled.p`
	font-weight: 600;
	font-size: 1.5rem;
	color: ${({ theme }) => theme.text1};
	margin: 0;
`;
