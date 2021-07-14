import styled from "styled-components";
import { Button } from "react-bootstrap";
import Img from "../UI/Img";

export const InnerCard = styled.div`
	display: flex;
	flex-direction: column;
	border-radius: 12px;
	background-color: ${({ theme }) => theme.modalBG};
	padding: 10px;
	align-items: stretch;
	border: 1px solid ${({ theme }) => theme.borderColor};
	margin-bottom: 20px;
`;

export const ItemImageContainer = styled.div`
	position: relative;
	width: 100%;
	padding-top: 100%;
	border-radius: 12px;
	overflow: hidden;
	background-color: ${({ theme }) => theme.modalBG};
`;

export const ItemImage = styled(Img)`
	width: 100%;
	height: 100%;
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	object-fit: cover;
`;

export const ItemContent = styled.div`
	display: flex;
	align-items: stretch;
	flex-direction: column;
`;

export const ItemList = styled.div`
	flex: 1;
	padding: 18px 4px;
`;

export const ItemTrait = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 8px;
`;

export const CustomButton = styled(Button)`
	border-radius: 10px;
	height: 48px;
	min-height: 48px;
`;

export const ListIcon = styled.span`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 35px;
	height: 32px;
	color: ${({ theme }) => theme.primary};
`;

export const ListTitle = styled.span`
	font-weight: 500;
	color: ${({ theme }) => theme.text1};
	font-size: 0.875rem;
	line-height: 1.125rem;
`;
