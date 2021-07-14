import styled from "styled-components";

export const Wrap = styled.div`
	background-color: ${({ theme }) => theme.modalBG};
	color: ${({ theme }) => theme.text1};
	display: flex;
	align-items: center;
	border-radius: 18px;
	justify-content: center;
	flex-direction: column;
	padding: 2.5rem;
`;
