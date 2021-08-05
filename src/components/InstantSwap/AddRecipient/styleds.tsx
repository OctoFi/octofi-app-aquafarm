import styled from "styled-components";

export const SwitchCol = styled.div<{ clickable?: boolean }>`
	background: ${({ theme }) => theme.bg1};
	border: 4px solid ${({ theme }) => theme.modalBG};
	border-radius: 50%;
	margin-left: 1.75rem;
	margin-top: -8px;
	margin-bottom: -8px;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	height: 44px;
	width: 44px;
	text-align: center;
	z-index: 2;

	&:hover {
		background: ${({ theme, clickable }) => (clickable ? theme.primary : theme.bg1)};
		cursor: ${({ clickable }) => (clickable ? "pointer" : "auto")};
	}
`;
