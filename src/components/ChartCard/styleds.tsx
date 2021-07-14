import styled from "styled-components";

export const LoadingDiv = styled.div`
	background-color: ${({ theme }) => theme.modalBG};
	border-radius: 20px;
	min-height: 400px;
	margin-top: 10px;
`;

export const CustomTitle = styled.span`
	font-weight: 700;
	font-size: 1.25rem;
	color: ${({ theme }) => theme.text1};
	margin-bottom: 0.75rem;

	@media (min-width: 991px) {
		margin-right: 1rem;
		margin-bottom: 0;
	}
`;

export const Wrapper = styled.div`
	background-color: ${({ theme }) => theme.modalBG};
	color: ${({ theme }) => theme.text1};
	border-radius: 18px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	padding: 0 1.25rem;
	border: 1px solid ${({ theme }) => theme.borderColor};
`;

export const ToolbarButton = styled.button<{ selected: boolean }>`
	font-size: 0.875rem;
	padding: 0.75rem;
	color: ${({ theme, selected }) => (selected ? theme.success : theme.text1)};

	&:focus,
	&:hover,
	&:active {
		text-decoration: none;
		outline: none;
		box-shadow: none;
	}
`;

export const CardHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	background-color: transparent;

	padding: 20px;

	@media (min-width: 768px) {
		padding: 0;
	}
`;
