import React from "react";
import styled from "styled-components";
import { escapeRegExp } from "../../utils";

const StyledInput = styled.input<{
	error?: boolean;
	fontSize?: string;
	align?: string;
	noBorder?: boolean;
	reverse?: boolean;
	size?: string;
}>`
	color: ${({ error, theme }) => (error ? theme.red1 : theme.text1)};
	width: 0;
	position: relative;
	font-weight: 500;
	font-family: inherit;
	outline: none;
	border: none;
	flex: 1 1 auto;
	background-color: ${({ theme }) => theme.bg1};
	font-size: 1rem;
	text-align: ${({ align }) => align && align};
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	height: ${({ size }) => (size === "sm" ? "48px" : "56px")};
	border-bottom-right-radius: ${({ reverse }) => (reverse ? "0" : `1.125rem`)};
	border-top-right-radius: ${({ reverse }) => (reverse ? "0" : `1.125rem`)};
	border-bottom-left-radius: ${({ reverse }) => (reverse ? "1.125rem" : `0`)};
	border-top-left-radius: ${({ reverse }) => (reverse ? "1.125rem" : `0`)};
	padding-right: 0.625rem;
	padding-left: 0.625rem;
	// padding-left: ${({ noBorder, reverse }) => (reverse ? "1.375rem" : noBorder ? "0.625rem" : `1.5rem`)};
	-webkit-appearance: textfield;
	// border-left: ${({ theme, noBorder }) => (noBorder ? "none" : `3px solid ${theme.modalBG}`)};

	::-webkit-search-decoration {
		-webkit-appearance: none;
	}

	[type="number"] {
		-moz-appearance: textfield;
	}

	::-webkit-outer-spin-button,
	::-webkit-inner-spin-button {
		-webkit-appearance: none;
	}

	::placeholder {
		color: ${({ theme }) => theme.text3};
	}
`;

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`); // match escaped "." characters via in a non-capturing group

export const Input = React.memo(function InnerInput({
	value,
	onUserInput,
	placeholder,
	size,
	...rest
}: {
	value: string | number;
	onUserInput: (input: string) => void;
	error?: boolean;
	fontSize?: string;
	size?: string;
	align?: "right" | "left";
} & Omit<React.HTMLProps<HTMLInputElement>, "ref" | "onChange" | "as">) {
	const enforcer = (nextUserInput: string) => {
		if (nextUserInput === "" || inputRegex.test(escapeRegExp(nextUserInput))) {
			onUserInput(nextUserInput);
		}
	};

	return (
		<StyledInput
			{...rest}
			value={value}
			onChange={(event) => {
				// replace commas with periods, because uniswap exclusively uses period as the decimal separator
				enforcer(event.target.value.replace(/,/g, "."));
			}}
			// universal input options
			inputMode="decimal"
			title="Token Amount"
			autoComplete="off"
			autoCorrect="off"
			size={size}
			// text-specific options
			type="text"
			pattern="^[0-9]*[.,]?[0-9]*$"
			placeholder={placeholder || "0.0"}
			minLength={1}
			maxLength={79}
			spellCheck="false"
		/>
	);
});

export default Input;

// const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group
