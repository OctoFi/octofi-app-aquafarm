import React, { useCallback } from "react";
import styled from "styled-components";
import { AutoColumn } from "../Column";
import { RowBetween } from "../Row";

const InputPanel = styled.div`
	${({ theme }) => theme.flexColumnNoWrap}
	position: relative;
	z-index: 1;
	width: 100%;
	margin-bottom: ${({ withoutMargin }) => (withoutMargin ? ".5rem" : "2.75rem")};

	@media (max-width: 767px) {
		margin-bottom: ${({ withoutMargin }) => (withoutMargin ? ".5rem" : "1.5rem")};
	}
`;

const ContainerRow = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	border-radius: 1.25rem;
	border: 1px solid ${({ error, theme }) => (error ? theme.red1 : theme.bg1)};
	transition: border-color 300ms ${({ error }) => (error ? "step-end" : "step-start")},
		color 500ms ${({ error }) => (error ? "step-end" : "step-start")};
	background-color: ${({ theme }) => theme.bg1};
	padding: 1rem;
	height: 56px;
`;

const InputContainer = styled.div`
	flex: 1;
`;

const Input = styled.input`
	font-size: 1rem;
	outline: none;
	border: none;
	flex: 1 1 auto;
	background-color: ${({ theme }) => theme.bg1};
	transition: color 300ms ${({ error }) => (error ? "step-end" : "step-start")};
	color: ${({ error, theme }) => (error ? theme.red1 : theme.text1)};
	overflow: hidden;
	text-overflow: ellipsis;
	font-weight: 500;
	width: 100%;
	::placeholder {
		color: ${({ theme }) => theme.text1};
	}
	padding: 0px;
	-webkit-appearance: textfield;

	::-webkit-search-decoration {
		-webkit-appearance: none;
	}

	::-webkit-outer-spin-button,
	::-webkit-inner-spin-button {
		-webkit-appearance: none;
	}

	::placeholder {
		color: ${({ theme }) => theme.text1};
	}
`;

const Label = styled.span`
	color: ${({ theme }) => theme.text1};
	font-weight: 400;
	font-size: 0.875rem;
	padding: 0;

	@media (min-width: 768px) {
		padding: 0 1.5rem;
	}
`;

const PATTERN = /^(0x[a-fA-F0-9]{40})$/;

export default function TokenAddressInput({ id, value, onChange, withoutMargin = false }) {
	const handleInput = useCallback(
		(event) => {
			const input = event.target.value;
			const withoutSpaces = input.replace(/\s+/g, "");
			onChange(withoutSpaces);
		},
		[onChange]
	);

	const error = Boolean(value.length > 0 && !PATTERN.test(value));

	return (
		<InputPanel id={id} withoutMargin={withoutMargin}>
			<InputContainer>
				<AutoColumn gap="md">
					<RowBetween>
						<Label>Token Address</Label>
					</RowBetween>
					<ContainerRow error={error}>
						<Input
							className="recipient-address-input"
							type="text"
							autoComplete="off"
							autoCorrect="off"
							autoCapitalize="off"
							spellCheck="false"
							placeholder="Token Address..."
							error={error}
							pattern={PATTERN}
							onChange={handleInput}
							value={value}
						/>
					</ContainerRow>
				</AutoColumn>
			</InputContainer>
		</InputPanel>
	);
}
