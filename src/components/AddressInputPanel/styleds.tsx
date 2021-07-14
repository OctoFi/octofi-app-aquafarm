import styled from "styled-components";

export const InputPanel = styled.div`
	${({ theme }) => theme.flexColumnNoWrap}
	position: relative;
	z-index: 1;
	width: 100%;
`;

export const InputContainer = styled.div`
	flex: 1;
`;

export const ContainerRow = styled.div<{ error?: boolean }>`
	background-color: ${({ theme }) => theme.bg1};
	border: 1px solid ${({ error, theme }) => (error ? theme.red1 : theme.bg1)};
	border-radius: 18px;
	display: flex;
	justify-content: center;
	align-items: center;
	transition: border-color 300ms ${({ error }) => (error ? "step-end" : "step-start")},
		color 500ms ${({ error }) => (error ? "step-end" : "step-start")};
	overflow: hidden;
`;

export const Label = styled.label`
	color: ${({ theme }) => theme.text1};
    display: block;
	font-weight: 400;
	font-size: 0.875rem;
    margin: 0;
	padding: 0.875rem;
    min-width: 160px;
	width: 160px;
`;

export const Input = styled.input<{ error?: boolean }>`
	font-size: 1rem;
	outline: none;
	border: none;
	flex: 1 1 auto;
	background-color: ${({ theme }) => theme.bg1};
	transition: color 300ms ${({ error }) => (error ? "step-end" : "step-start")};
	color: ${({ error, theme }) => (error ? theme.red1 : theme.text1)};
	overflow: hidden;
	text-overflow: ellipsis;
	height: 56px;
	font-weight: 500;
	width: 100%;
	padding: 0 10px;
	-webkit-appearance: textfield;

	::-webkit-search-decoration {
		-webkit-appearance: none;
	}

	::-webkit-outer-spin-button,
	::-webkit-inner-spin-button {
		-webkit-appearance: none;
	}

	::placeholder {
		color: ${({ theme }) => theme.text3};
		font-weight: 400;
	}
`;
