import styled from 'styled-components';
import { ReactComponent as DropDown } from "../../assets/images/dropdown.svg";

export const InputPanel = styled.div<{ hideInput?: boolean; withoutMargin?: boolean }>`
	${({ theme }) => theme.flexColumnNoWrap};
	position: relative;
	z-index: 1;
	// background: ${({ theme }) => theme.bg5};
	// border-radius: 18px;
	// padding: 0.5rem;
`;

export const InputRow = styled.div<{ selected: boolean }>`
	${({ theme }) => theme.flexRowNoWrap};
	align-items: center;
`;

export const CurrencySelect = styled.button<{ selected?: boolean }>`
	background-color: ${({ theme }) => theme.bg1};
	color: ${({ theme }) => theme.text1};
	border-bottom-left-radius: 18px;
	border-top-left-radius: 18px;
	border: 1px solid ${({ theme }) => theme.bg1};
	box-shadow: none;
	cursor: pointer;
	outline: none;
	user-select: none;
	height: 56px;
	min-width: 160px;
	width: 160px;
	padding: 0 0.5rem;
	align-items: center;
	text-align: left;
	line-height: 1;

	&:focus,
	&:hover {
		background-color: ${({ theme }) => theme.primaryLight};
		outline: none;
		border-color: ${({ theme }) => theme.primary};
	}
`;

export const InputContainer = styled.div`	
	position: relative;
	display: flex;
	align-items: center;
	flex-wrap: nowrap;
	flex: 1;
	background: ${({ theme }) => theme.bg1};
	border-top-right-radius: 12px;
	border-bottom-right-radius: 12px;
	padding: 0 0.5rem;
`;

export const Aligner = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
`;

export const TextWrap = styled.div`
	margin-right: auto;
	position: relative;
`;

export const Label = styled.div`
	color: ${({ theme }) => theme.text1};
	line-height: 1;
	font-weight: 400;
	font-size: 0.625rem;
	margin-bottom: 4px;
`;

export const TokenName = styled.span`
	font-size: 0.875rem;
	font-weight: 500;
	margin-right: auto;
`;

export const Balance = styled.span<{ showBalance?: boolean }>`
	font-weight: 500;
	font-size: 0.75rem;
`;


// export const LabelRow = styled.div`
// 	color: ${({ theme }) => theme.text1};
// 	font-size: 0.65rem;
// 	line-height: 1rem;
// `;

// export const CustomDropDown = styled(DropDown) <{ selected: boolean }>`
// 	margin: 0 0.25rem 0 0.5rem;
// 	height: 35%;

// 	path {
// 		stroke: ${({ theme }) => theme.text1};
// 		stroke-width: 1.5px;
// 	}
// `;