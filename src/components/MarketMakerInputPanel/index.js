import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { RowBetween } from "../Row";
import { Input as NumericalInput } from "../NumericalInput";
import { tokenAmountInUnits, unitsInTokenAmount } from "../../utils/spot/tokens";
import { ZERO } from "../../constants";
import { ETHER, Token } from "@uniswap/sdk";
import { useCurrencyBalance } from "../../state/wallet/hooks";
import { useActiveWeb3React } from "../../hooks";
import { toAbsoluteUrl } from "../../lib/helper";

const InputRow = styled.div`
	${({ theme }) => theme.flexRowNoWrap};
	align-items: center;

	padding: 1rem 0 0;

	@media (min-width: 768px) {
		padding-top: 0.75rem;
	}
`;

const Container = styled.div`
	display: flex;
	flex-direction: column;
	margin-bottom: 40px;
`;

const Label = styled.span`
	color: ${({ theme }) => theme.text1};
	font-weight: 400;
	font-size: 0.875rem;
	padding: 0;

	@media (min-width: 768px) {
		padding: 0 1rem;
	}

	@media (max-width: 1400px) {
		font-weight: 400;
	}
`;

const InputContainer = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	flex-wrap: nowrap;
	flex: 1;
`;

const LabelRow = styled.div`
	${({ theme }) => theme.flexRowNoWrap};
	align-items: center;
	color: ${({ theme }) => theme.text1};
	font-size: 0.75rem;
	line-height: 1rem;
	padding: 0;
`;

const Aligner = styled.span`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

const InputPanel = styled.div`
	${({ theme }) => theme.flexColumnNoWrap};
	position: relative;
	border-radius: 0.42rem;
`;

const StyledTokenName = styled.span`
	margin-right: auto;
	font-size: 1rem;
	font-weight: 500;

	@media (max-width: 1400px) {
		font-size: 0.875rem;
	}
`;

const Logo = styled.img`
	width: 34px;
	height: 34px;
	min-width: 34px;
	border-radius: 200px;
	border: 2px solid ${({ theme }) => theme.text1};
	margin-right: 15px;

	@media (max-width: 1400px) {
		width: 24px;
		height: 24px;
		margin-right: 12px;
		min-width: 24px;
	}
`;

const CurrencySelect = styled.button`
	display: flex;
	align-items: center;
	height: 56px;
	font-size: 0.875rem;
	font-weight: 500;
	background-color: ${({ theme }) => theme.bg1};
	color: ${({ theme }) => theme.text1};
	border-bottom-left-radius: 18px;
	border-top-left-radius: 18px;
	box-shadow: none;
	outline: none;
	cursor: pointer;
	user-select: none;
	border: none;
	padding: 0.875rem 0.625rem;
	min-width: 116px;
	width: 116px;

	@media (min-width: 768px) {
		min-width: 178px;
		width: 178px;
		padding: 0.625rem 1rem;
		font-size: 1rem;
		font-weight: 700;
	}

	:focus,
	:hover {
		background-color: ${({ theme }) => theme.bg1};
		outline: none;
	}
`;

let BalanceRow = styled.div`
	${({ theme }) => theme.flexRowNoWrap};
	align-items: center;
	margin-top: 10px;
	color: ${({ theme }) => theme.text1};
	font-size: 0.75rem;
	font-weight: 400;
	line-height: 1rem;
	padding: 0 1rem;
`;

export default function MarketMakerInputPanel({
	value,
	onUserInput,
	label = "Input",
	disable = false,
	selected,
	hideInput = false,
	id,
	decimals,
	valueFixedDecimals,
	min = ZERO,
	showBalance = true,
	balanceText,
}) {
	const [valueStr, setValueStr] = useState(value ? tokenAmountInUnits(value, decimals, valueFixedDecimals) : "");

	const _updateValue = (value) => {
		const newValue = unitsInTokenAmount(value || "0", decimals);
		const invalidValue = min && newValue.isLessThan(min);
		if (invalidValue) {
			return;
		}

		onUserInput(newValue);
		setValueStr(value);
	};

	useEffect(() => {
		setValueStr(value ? tokenAmountInUnits(value, decimals, valueFixedDecimals) : "");
	}, [value]);

	return (
		<InputPanel id={id}>
			<Container>
				{!hideInput && (
					<LabelRow>
						<RowBetween>
							<Label>{label}</Label>
						</RowBetween>
					</LabelRow>
				)}
				<InputRow style={hideInput ? { padding: "0", borderRadius: "0.42rem" } : {}} selected={disable}>
					<CurrencySelect selected={!!selected} className="open-currency-select-button">
						{selected && <Logo src={toAbsoluteUrl(`/${selected.icon}`)} />}
						<Aligner>
							<StyledTokenName className="token-symbol-container" active={Boolean(selected)}>
								{(selected && selected?.symbol?.length > 20
									? selected?.symbol?.slice(0, 4) +
									  "..." +
									  selected?.symbol
											?.slice(selected?.symbol?.length - 5, selected?.symbol?.length)
											.toUpperCase()
									: selected.symbol?.toUpperCase()) || `Select`}
							</StyledTokenName>
						</Aligner>
					</CurrencySelect>

					{!hideInput && (
						<InputContainer>
							<NumericalInput
								className="token-amount-input pl-3"
								value={valueStr}
								onUserInput={_updateValue}
							/>
						</InputContainer>
					)}
				</InputRow>
				{selected && showBalance && <BalanceRow>{balanceText ? balanceText() : null}</BalanceRow>}
			</Container>
		</InputPanel>
	);
}
