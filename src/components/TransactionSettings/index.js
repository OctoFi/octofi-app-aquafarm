import { useContext, useRef, useState } from "react";
import styled, { ThemeContext } from "styled-components";
import { darken } from "polished";
import { TYPE } from "../../theme";
import { AutoColumn } from "../Column";
import { RowBetween, RowFixed } from "../Row";
import QuestionHelper from "../QuestionHelper";

const FancyButton = styled.button`
	color: ${({ theme }) => theme.text1};
	align-items: center;
	height: 40px;
	border-radius: 12px;
	font-size: 1rem;
	width: auto;
	min-width: 3.5rem;
	border: 1px solid ${({ theme }) => theme.text4};
	outline: none;
	background: ${({ theme }) => theme.bg1};
	:hover {
		border: 1px solid ${({ theme }) => theme.text3};
	}
	:focus {
		border: 1px solid ${({ theme }) => theme.primary};
	}
`;

const Option = styled(FancyButton)`
	margin-right: 8px;
	:hover {
		cursor: pointer;
	}
	background-color: ${({ active, theme }) => active && theme.primary};
	color: ${({ active, theme }) => (active ? theme.bg1 : theme.text1)};
`;

const Input = styled.input`
	background: ${({ theme }) => theme.bg1};
	font-size: 16px;
	width: auto;
	outline: none;
	height: 40px;
	&::-webkit-outer-spin-button,
	&::-webkit-inner-spin-button {
		-webkit-appearance: none;
	}
	color: ${({ theme, color }) => (color === "red" ? theme.red1 : theme.text1)};
	text-align: right;
`;

const OptionCustom = styled(FancyButton)`
	height: 40px;
	position: relative;
	padding: 0 0.75rem;
	flex: 1;
	border: ${({ theme, active, warning }) => active && `1px solid ${warning ? theme.red1 : theme.primary}`};
	:hover {
		border: ${({ theme, active, warning }) =>
			active && `1px solid ${warning ? darken(0.1, theme.red1) : darken(0.1, theme.primary)}`};
	}

	input {
		width: 100%;
		height: 100%;
		border: 0px;
		border-radius: 2rem;
	}
`;

const CustomRowFixed = styled(RowFixed)`
	align-items: flex-start;
	margin-top: 0.5rem;
`;

const SlippageEmojiContainer = styled.span`
	color: ${({ theme }) => theme.warning};
	${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;  
  `}
`;

const SlippageError = {
	InvalidInput: "InvalidInput",
	RiskyLow: "RiskyLow",
	RiskyHigh: "RiskyHigh",
};
const DeadlineError = {
	InvalidInput: "InvalidInput",
};

const TransactionSettings = ({ rawSlippage, setRawSlippage, deadline, setDeadline }) => {
	const theme = useContext(ThemeContext);
	const inputRef = useRef();

	const [slippageInput, setSlippageInput] = useState("");
	const [deadlineInput, setDeadlineInput] = useState("");

	const slippageInputIsValid =
		slippageInput === "" || (rawSlippage / 100).toFixed(2) === Number.parseFloat(slippageInput).toFixed(2);
	const deadlineInputIsValid = deadlineInput === "" || (deadline / 60).toString() === deadlineInput;

	let slippageError;
	if (slippageInput !== "" && !slippageInputIsValid) {
		slippageError = SlippageError.InvalidInput;
	} else if (slippageInputIsValid && rawSlippage < 50) {
		slippageError = SlippageError.RiskyLow;
	} else if (slippageInputIsValid && rawSlippage > 500) {
		slippageError = SlippageError.RiskyHigh;
	} else {
		slippageError = undefined;
	}

	let deadlineError;
	if (deadlineInput !== "" && !deadlineInputIsValid) {
		deadlineError = DeadlineError.InvalidInput;
	} else {
		deadlineError = undefined;
	}

	function parseCustomSlippage(value) {
		setSlippageInput(value);

		try {
			const valueAsIntFromRoundedFloat = Number.parseInt((Number.parseFloat(value) * 100).toString());
			if (!Number.isNaN(valueAsIntFromRoundedFloat) && valueAsIntFromRoundedFloat < 5000) {
				setRawSlippage(valueAsIntFromRoundedFloat);
			}
		} catch {}
	}

	function parseCustomDeadline(value) {
		setDeadlineInput(value);

		try {
			const valueAsInt = Number.parseInt(value) * 60;
			if (!Number.isNaN(valueAsInt) && valueAsInt > 0) {
				setDeadline(valueAsInt);
			}
		} catch {}
	}

	return (
		<AutoColumn gap="md">
			<AutoColumn gap="sm">
				<CustomRowFixed>
					<TYPE.Black fontWeight={400} fontSize={14} color={theme.text1}>
						Slippage tolerance
					</TYPE.Black>
					<QuestionHelper text="Your transaction will revert if the price changes unfavorably by more than this percentage." />
				</CustomRowFixed>
				<RowBetween>
					<Option
						onClick={() => {
							setSlippageInput("");
							setRawSlippage(10);
						}}
						active={rawSlippage === 10}
					>
						0.1%
					</Option>
					<Option
						onClick={() => {
							setSlippageInput("");
							setRawSlippage(50);
						}}
						active={rawSlippage === 50}
					>
						0.5%
					</Option>
					<Option
						onClick={() => {
							setSlippageInput("");
							setRawSlippage(100);
						}}
						active={rawSlippage === 100}
					>
						1%
					</Option>
					<OptionCustom
						active={![10, 50, 100].includes(rawSlippage)}
						warning={!slippageInputIsValid}
						tabIndex={-1}
					>
						<RowBetween>
							{!!slippageInput &&
							(slippageError === SlippageError.RiskyLow || slippageError === SlippageError.RiskyHigh) ? (
								<SlippageEmojiContainer>
									<span role="img" aria-label="warning">
										⚠️
									</span>
								</SlippageEmojiContainer>
							) : null}
							<Input
								ref={inputRef}
								placeholder={(rawSlippage / 100).toFixed(2)}
								value={slippageInput}
								onBlur={() => {
									parseCustomSlippage((rawSlippage / 100).toFixed(2));
								}}
								onChange={(e) => parseCustomSlippage(e.target.value)}
								color={!slippageInputIsValid ? "red" : ""}
							/>
							%
						</RowBetween>
					</OptionCustom>
				</RowBetween>
				{!!slippageError && (
					<RowBetween
						style={{
							fontSize: "14px",
							paddingTop: "7px",
							color: slippageError === SlippageError.InvalidInput ? "red" : "#F3841E",
						}}
					>
						{slippageError === SlippageError.InvalidInput
							? "Enter a valid slippage percentage"
							: slippageError === SlippageError.RiskyLow
							? "Your transaction may fail"
							: "Your transaction may be frontrun"}
					</RowBetween>
				)}
			</AutoColumn>

			<AutoColumn gap="sm">
				<CustomRowFixed>
					<TYPE.Black fontSize={14} fontWeight={400} color={theme.text1}>
						Transaction deadline
					</TYPE.Black>
					<QuestionHelper text="Your transaction will revert if it is pending for more than this long." />
				</CustomRowFixed>
				<RowFixed>
					<OptionCustom style={{ width: "100px" }} tabIndex={-1}>
						<Input
							color={!!deadlineError ? "red" : undefined}
							onBlur={() => {
								parseCustomDeadline((deadline / 60).toString());
							}}
							placeholder={(deadline / 60).toString()}
							value={deadlineInput}
							onChange={(e) => parseCustomDeadline(e.target.value)}
						/>
					</OptionCustom>
					<TYPE.Body style={{ paddingLeft: "12px" }} fontSize={14}>
						minutes
					</TYPE.Body>
				</RowFixed>
			</AutoColumn>
		</AutoColumn>
	);
};

export default TransactionSettings;
