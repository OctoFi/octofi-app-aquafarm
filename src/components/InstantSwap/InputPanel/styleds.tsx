import styled from "styled-components";
import Img from "../../UI/Img";

export const InputPanel = styled.div`
	position: relative;
	z-index: 1;
`;

export const LabelRow = styled.div`
	${({ theme }) => theme.flexRowNoWrap};
	align-items: center;
	justify-content: space-between;
	margin-bottom: 0.5rem;
	padding-right: 0.5rem;
`;

export const Label = styled.div`
	color: ${({ theme }) => theme.text1};
	font-weight: 400;
	font-size: 0.875rem;
	line-height: 1;
`;

export const BalanceButton = styled.button`
	background: none;
	border: none;
	color: ${({ theme }) => theme.text1};
	font-weight: 500;
	font-size: 0.75rem;
	line-height: 1;
	padding: 0;

	&:hover,
	&:focus {
		outline: none;
	}
`;

export const Balance = styled.span`
	color: ${({ theme }) => theme.text1};
	font-weight: 500;
	font-size: 0.75rem;
	line-height: 1;
`;

export const InputRow = styled.div<{ selected?: boolean }>`
	${({ theme }) => theme.flexRowNoWrap};
	align-items: center;
`;

export const CurrencySelect = styled.button<{ selected?: boolean }>`
	background: none;
	border: none;
	color: ${({ theme }) => theme.text1};
	box-shadow: none;
	cursor: pointer;
	outline: none;
	user-select: none;
	height: 56px;
	min-width: 160px;
	width: 160px;
	padding: 0;
	margin-right: 0.5rem;
	align-items: center;
	text-align: left;
	line-height: 1;
	
	&:focus,
	&:hover {
		outline: none;
	}
`;

export const InputContainer = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	flex-wrap: nowrap;
	flex: 1;
	background: ${({ theme }) => theme.bg1};
	border-radius: 12px;
	padding: 0 0.5rem;
	overflow: hidden;
`;

export const Aligner = styled.div`
	display: flex;
	align-items: center;
	gap: 0.5rem;
`;

export const Logo = styled(Img)`
	border-radius: 50%;
	margin-right: 0.5rem;
	height: 24px;
	width: 24px;
	text-indent: 100%;
	white-space: nowrap;
	overflow: hidden;
`;

export const TextWrap = styled.div`
	margin-right: auto;
	position: relative;
`;

export const TokenName = styled.span`
	font-size: 0.875rem;
	font-weight: 500;
	margin-right: auto;
`;
