import styled from "styled-components";

export const LoadingContainer = styled.div`
	padding: 0.5rem;
	background-color: ${({ theme }) => theme.bg1};
	border: 1px solid ${({ theme }) => theme.borderColor};
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: border-color 0.3s ease;

	&:hover {
		border-color: ${({ theme }) => theme.primary};
	}
`;

export const LoadingText = styled.span`
	font-size: 0.75rem;
	font-weight: 500;
	color: ${({ theme }) => theme.text3};
	margin-right: 0.75rem;
`;
