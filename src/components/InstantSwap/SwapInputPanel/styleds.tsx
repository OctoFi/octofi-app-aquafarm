import styled from "styled-components";

export const InputPanel = styled.div`
	position: relative;
	z-index: 1;
	// border-radius: 18px;
	// background: ${({ theme }) => theme.bg5};
	// padding: 0.75rem;
`;

export const InputRow = styled.div<{ selected?: boolean }>`
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
`;

export const Logo = styled.img`
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
