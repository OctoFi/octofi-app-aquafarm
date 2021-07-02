import styled from "styled-components";
import SVG from "react-inlinesvg";

export const Card = styled.div`
	background-color: ${({ theme }) => theme.modalBG};
	color: ${({ theme }) => theme.text1};
	display: flex;
	flex-direction: column;
	border-radius: 18px;
	margin-bottom: 1rem;
`;

export const CardHeader = styled.div`
	display: flex;
	align-items: center;
	padding: 1.5rem;
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

export const CardImg = styled(SVG)`
	width: 50%;
	height: auto;
`;

export const CardBody = styled.div`
	display: flex;
	flex-direction: column;
	padding: 20px 0.5rem;
	height: 100%;
	border-top: 1px solid ${({ theme }) => theme.borderColor};
`;

export const CardHeaderContent = styled.div`
	margin-left: 20px;
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
