import styled from "styled-components";

export const Feature = styled.a`
	display: block;
	text-decoration: none;
	color: inherit;

	&:hover,
	&:focus,
	&:active {
		text-decoration: none;
		outline: none;
	}

	&:hover .feature__wrapper,
	&:hover .feature__icon {
		border-color: ${({ theme }) => theme.primary};
	}
`;

export const Wrapper = styled.div`
	position: relative;
	border-radius: 1.125rem;
	background-color: ${({ theme }) => theme.modalBG};
	padding: 60px 30px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	text-align: center;
	height: 100%;
	border: 1px solid ${({ theme }) => theme.borderColor2};
	transition: all ease 0.3s;

	@media (max-width: 991px) {
		height: auto;
	}
`;

export const Icon = styled.div`
	width: 100px;
	height: 100px;
	border-radius: 100px;
	margin-bottom: 30px;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: ${({ theme }) => theme.bg1};
	border: 1px solid ${({ theme }) => theme.borderColor2};
	color: ${({ theme }) => theme.text1};
	transition: all ease 0.3s;
`;

export const Title = styled.h3`
	font-weight: 700;
	font-size: 1.25rem;
	margin-bottom: 30px;
	color: ${({ theme }) => theme.text1};
`;

export const Desc = styled.p`
	font-size: 0.875rem;
	font-weight: 500;
	color: ${({ theme }) => theme.text1};
`;
