import styled from "styled-components";

export const PageWrap = styled.div`
	${({ theme }) => theme.flexColumnNoWrap};
	height: 100vh;
`;

export const PageContent = styled.div`
	${({ theme }) => theme.flexColumnNoWrap};
	flex: 1;
	overflow-y: auto;
	overflow-x: hidden;
	padding-top: 2rem;

	&::-webkit-scrollbar {
		width: 0.625rem;

		@media (min-width: 768px) {
			width: 0.875rem;
		}
	}

	&::-webkit-scrollbar-track {
		-webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
	}

	&::-webkit-scrollbar-thumb {
		background-color: ${({ theme }) => theme.scrollbar};
		border-radius: 2px;
	}
`;

export const PageContainer = styled.div`
	background-color: transparent;
	padding-bottom: 3rem;
	flex: 1;
`;

export const Title = styled.h1`
	font-size: 1.25rem;
	font-weight: 700;
	color: ${({ theme }) => theme.text1};
	margin-top: 0;

	@media (min-width: 768px) {
		font-size: 2.5rem;
	}
`;
