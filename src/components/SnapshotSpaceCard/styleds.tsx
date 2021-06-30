import styled from "styled-components";
import { Link } from "react-router-dom";
import Img from "../UI/Img";

export const Wrapper = styled(Link)<{ loading: boolean }>`
	background-color: ${({ theme }) => theme.modalBG};
	border: 1px solid transparent;
	padding: 50px;
	border-radius: 1.25rem;
	position: relative;
	transition: 0.3s ease all;
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	margin-bottom: 1.25rem;

	@media (max-width: 991px) {
		padding: 20px 12px 10px;
		border-radius: 10px;
	}

	&:hover {
		background-color: ${({ theme, loading }) => !loading && theme.bg1};
		text-decoration: none;
		border-color: ${({ theme }) => theme.primary};
	}

	&:focus,
	&:active {
		outline: none;
	}
`;

export const Logo = styled(Img)`
	width: 100px;
	height: 100px;
	border-radius: 100px;
	margin-bottom: 1.25rem;
	background-color: ${({ theme }) => theme.text1};

	@media (max-width: 991px) {
		width: 60px;
		height: 60px;
		border-radius: 60px;
	}
`;

export const Title = styled.h3`
	font-size: 1.25rem;
	font-weight: 700;
	color: ${({ theme }) => theme.text1};
	margin-bottom: 1.125rem;
	white-space: pre-wrap;
	text-align: center;

	@media (max-width: 991px) {
		font-size: 1rem;
		margin-bottom: 0.875rem;
	}
`;
export const CurrencyName = styled.span`
	font-size: 1rem;
	font-weight: 500;
	color: ${({ theme }) => theme.text1};
	text-align: center;

	@media (max-width: 991px) {
		font-size: 0.875rem;
		margin-bottom: 0.875rem;
	}
`;

export const StarWrapper = styled.div`
	position: absolute;
	right: 20px;
	top: 20px;
	width: 16px;
	height: 16px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: ${({ theme }) => theme.primary};

	@media (max-width: 991px) {
		right: 10px;
		top: 10px;
		width: 10px;
		height: 10px;

		svg {
			width: 10px;
			height: 10px;
		}
	}
`;
