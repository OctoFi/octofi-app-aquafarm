import styled from "styled-components";
import { Button } from "react-bootstrap";
import { Text } from "rebass";

export const SwapButton = styled(Button)`
	height: 56px;
	min-width: 250px;
	align-self: center;

	@media (max-width: 767px) {
		width: 100%;
	}
`;

export const RateText = styled(Text)`
	color: ${({ theme }) => theme.text1};

	@media (max-width: 767px) {
		font-size: 12px;
	}
`;

export const ProgressContainer = styled.div`
	background: ${({ theme }) => theme.primaryLight};
	border-radius: 18px;
	padding: 26px 20px;
	margin-top: 10px;

	.progress {
		height: 5px;
		background-color: ${({ theme }) => theme.primaryLight};
		border-radius: 15px;
	}

	.progress-bar {
		border-radius: 15px;
	}
`;

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
