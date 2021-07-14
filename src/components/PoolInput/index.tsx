import { Currency, Pair } from "@uniswap/sdk";
import React from "react";
import styled from "styled-components";
import { RowBetween } from "../Row";
import { Input as NumericalInput } from "../NumericalInput";

import { useActiveWeb3React } from "../../hooks";
import PlatformLogo from "../PlatformLogo";
import { usePoolBalance } from "../../state/pools/hooks";

const InputRow = styled.div<{ selected: boolean }>`
	${({ theme }) => theme.flexRowNoWrap};
	align-items: center;
	padding: 0.75rem 0;

	@media (max-width: 1199px) {
		padding: 1rem 0 0.75rem;
	}
`;

const CurrencySelect = styled.button<{ selected: boolean }>`
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
	padding: 0.5rem 0.625rem;
	min-width: 116px;
	width: 116px;
	text-align: left;

	@media (min-width: 768px) {
		min-width: 178px;
		width: 178px;
		padding: 0.625rem 1.5rem;
		font-size: 1rem;
		font-weight: 700;
	}

	:focus,
	:hover {
		background-color: ${({ theme }) => theme.bg1};
		outline: none;
	}
`;

const LabelRow = styled.div`
	${({ theme }) => theme.flexRowNoWrap};
	align-items: center;
	color: ${({ theme }) => theme.text1};
	font-size: 0.75rem;
	line-height: 1rem;
	padding: 0;
`;
const InputContainer = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	flex-wrap: nowrap;
	flex: 1;
`;

const Aligner = styled.span`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

const InputPanel = styled.div<{ hideInput?: boolean }>`
	${({ theme }) => theme.flexColumnNoWrap};
	position: relative;
	z-index: 1;
	margin-bottom: 1rem;

	@media (min-width: 768px) {
		margin-bottom: 1.75rem;
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
const StyledTokenName = styled.span`
	margin-right: auto;
	padding-left: 0.625rem;
	font-size: 1rem;

	text-align: left;

	@media (min-width: 768px) {
		padding-left: 0.75rem;
	}
`;

const StyledBalanceMax = styled.button`
	background-color: ${({ theme }) => theme.primaryLight};
	border: none;
	border-radius: 10px;
	font-size: 1rem;
	padding: 0.25rem 0.625rem;
	height: 32px;
	max-height: 32px;
	font-weight: 500;
	cursor: pointer;
	color: ${({ theme }) => theme.primary};
	position: absolute;
	bottom: calc(100% + 10px);
	right: 0;
	transition: all ease 0.3s;

	@media (min-width: 768px) {
		height: 40px;
		max-height: 40px;
		padding: 0.5rem;
		top: 8px;
		right: 8px;
	}

	:hover {
		background-color: ${({ theme }) => theme.primary};
		color: ${({ theme }) => theme.bg1};
	}

	:focus {
		outline: none;
	}

	${({ theme }) => theme.mediaWidth.upToExtraSmall`
    margin-right: 0.5rem;
  `};
`;

const Balance = styled.span`
	color: ${({ theme }) => theme.text1};
	font-weight: 500;
	font-size: 0.875rem;
	padding: 0;
`;

interface CurrencyInputPanelProps {
	value: string;
	onUserInput: (value: string) => void;
	onMax?: () => void;
	showMaxButton: boolean;
	label?: string;
	onCurrencySelect?: (currency: Currency) => void;
	disableCurrencySelect?: boolean;
	hideBalance?: boolean;
	pair?: Pair | null;
	hideInput?: boolean;
	otherCurrency?: Currency | null;
	id: string;
	showCommonBases?: boolean;
	customBalanceText?: string;
	pool: any;
	type: string;
}

export default function PoolInput({
	value,
	onUserInput,
	onMax,
	showMaxButton,
	label = "Input",
	pool,
	disableCurrencySelect = false,
	hideBalance = false,
	hideInput = false,
	id,
	customBalanceText,
	type,
}: CurrencyInputPanelProps) {
	const { account } = useActiveWeb3React();
	const selectedCurrencyBalance = usePoolBalance(account ?? undefined, pool.address ?? undefined);

	return (
		<InputPanel id={id}>
			<div>
				{!hideInput && (
					<LabelRow>
						<RowBetween>
							<Label>{label}</Label>

							{account && (
								<Balance className={"d-none d-md-flex"}>
									{!hideBalance && !!pool && selectedCurrencyBalance
										? (customBalanceText ?? "Balance: ") + selectedCurrencyBalance
										: " -"}
								</Balance>
							)}
						</RowBetween>
					</LabelRow>
				)}
				<InputRow
					style={hideInput ? { padding: "0", borderRadius: "0.42rem" } : {}}
					selected={disableCurrencySelect}
				>
					<CurrencySelect selected={!!pool} className="open-currency-select-button">
						<Aligner>
							<PlatformLogo size={24} platform={type.toLowerCase()} name={pool?.poolName} />
							<StyledTokenName>{pool?.poolName}</StyledTokenName>
						</Aligner>
					</CurrencySelect>
					{!hideInput && (
						<InputContainer>
							<NumericalInput
								className="token-amount-input"
								value={value}
								onUserInput={(val) => {
									onUserInput(val);
								}}
							/>
							{account && pool && showMaxButton && label !== "To" && (
								<StyledBalanceMax onClick={onMax}>MAX</StyledBalanceMax>
							)}
						</InputContainer>
					)}
				</InputRow>
			</div>
		</InputPanel>
	);
}
