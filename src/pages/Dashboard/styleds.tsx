import styled from "styled-components";

export const LoadingWrap = styled.div`
	background-color: ${({ theme }) => theme.modalBG};
	border-radius: 20px;
	min-height: 550px;
`;

export const RowTitle = styled.h4`
	margin-top: 30px;
	margin-bottom: 20px;

	@media (min-width: 768px) {
		margin-top: 60px;
		margin-bottom: 30px;
	}
`;
