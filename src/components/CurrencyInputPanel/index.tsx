import { Currency, Pair } from "@uniswap/sdk";
import React, { useState, useCallback } from "react";
import styled from "styled-components";
import CurrencySearchModal from "../SearchModal/CurrencySearchModal";
import CurrencyLogo from "../CurrencyLogo";
import DoubleCurrencyLogo from "../DoubleLogo";
import { RowBetween } from "../Row";
import { Input as NumericalInput } from "../NumericalInput";
import { ReactComponent as DropDown } from "../../assets/images/dropdown.svg";

import { useActiveWeb3React } from "../../hooks";
import { useCurrencyBalance } from "../../state/wallet/hooks";
import { useTranslation } from "react-i18next";

const InputRow = styled.div<{ selected: boolean }>`
	${({ theme }) => theme.flexRowNoWrap};
	align-items: center;

	padding: 0.75rem 0;
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

const CurrencySelect = styled.button<{ selected: boolean }>`
	align-items: center;
	height: 56px;
	font-size: 0.875rem;
	font-weight: 500;
	background-color: ${({ theme }) => theme.bg3};
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
		padding: 0.625rem 1.5rem;
		font-size: 1rem;
		font-weight: 700;
	}

	:focus,
	:hover {
		background-color: ${({ theme }) => theme.bg4};
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

const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
	margin: 0 0.25rem 0 0.5rem;
	height: 35%;

	path {
		stroke: ${({ theme }) => theme.text1};
		stroke-width: 1.5px;
	}
`;

const InputPanel = styled.div<{ hideInput?: boolean; withoutMargin?: boolean }>`
	${({ theme }) => theme.flexColumnNoWrap};
	position: relative;
	z-index: 1;
	margin-bottom: ${({ withoutMargin }) => (withoutMargin ? "0.5rem" : "1rem")};

	@media (min-width: 768px) {
		margin-bottom: ${({ withoutMargin }) => (withoutMargin ? "0.5rem" : "1.75rem")};
	}
`;

const StyledTokenName = styled.span<{ active?: boolean }>`
	margin-right: auto;
	padding-left: ${({ active }) => (active ? "0.625rem" : "0")};
	font-size: 1rem;

	@media (min-width: 768px) {
		padding-left: ${({ active }) => (active ? "0.75rem" : "0")};
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
		color: ${({ theme }) => theme.bg2};
	}

	:focus {
		outline: none;
	}
`;

const Balance = styled.span<{ showBalance?: boolean }>`
	color: ${({ theme }) => theme.text1};
	font-weight: 500;
	font-size: 0.875rem;
	padding: 0;

	@media (max-width: 767px) {
		margin-right: ${({ showBalance }) => (showBalance ? "70px" : "0")};
		margin-top: ${({ showBalance }) => (showBalance ? "-10px" : "0")};
	}
`;

interface CurrencyInputPanelProps {
	value: string;
	onUserInput: (value: string) => void;
	onMax?: () => void;
	showMaxButton: boolean;
	label?: string;
	onCurrencySelect?: (currency: Currency) => void;
	currency?: Currency | null;
	disableCurrencySelect?: boolean;
	hideBalance?: boolean;
	pair?: Pair | null;
	hideInput?: boolean;
	otherCurrency?: Currency | null;
	id: string;
	showCommonBases?: boolean;
	customBalanceText?: string;
	withoutMargin?: boolean;
}

export default function CurrencyInputPanel({
	value,
	onUserInput,
	onMax,
	showMaxButton,
	label = "Input",
	onCurrencySelect,
	currency,
	disableCurrencySelect = false,
	hideBalance = false,
	pair = null, // used for double token logo
	hideInput = false,
	otherCurrency,
	id,
	showCommonBases,
	withoutMargin = false,
}: CurrencyInputPanelProps) {
	const { t } = useTranslation();
	const [modalOpen, setModalOpen] = useState(false);
	const { account } = useActiveWeb3React();
	const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined);

	const handleDismissSearch = useCallback(() => {
		setModalOpen(false);
	}, [setModalOpen]);

	return (
		<InputPanel id={id} withoutMargin={withoutMargin}>
			<div>
				{!hideInput && (
					<LabelRow>
						<RowBetween>
							<Label>{label}</Label>
							{account && (
								<Balance showBalance={showMaxButton}>
									{!!currency && selectedCurrencyBalance
										? t("balance", { balanceInput: selectedCurrencyBalance?.toSignificant(6) })
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
					<CurrencySelect
						selected={!!currency}
						className="open-currency-select-button"
						onClick={() => {
							if (!disableCurrencySelect) {
								setModalOpen(true);
							}
						}}
					>
						<Aligner>
							{pair ? (
								<DoubleCurrencyLogo
									currency0={pair.token0}
									currency1={pair.token1}
									size={24}
									margin={true}
								/>
							) : currency ? (
								<CurrencyLogo currency={currency} size={"24px"} />
							) : null}
							{pair ? (
								<StyledTokenName className="pair-name-container">
									{pair?.token0.symbol}:{pair?.token1.symbol}
								</StyledTokenName>
							) : (
								<StyledTokenName
									className="token-symbol-container"
									active={Boolean(currency && currency.symbol)}
								>
									{(currency && currency.symbol && currency.symbol.length > 20
										? currency.symbol.slice(0, 4) +
										  "..." +
										  currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
										: currency?.symbol) || t("selectToken")}
								</StyledTokenName>
							)}
							{!disableCurrencySelect && <StyledDropDown selected={!!currency} />}
						</Aligner>
					</CurrencySelect>
					{!hideInput && (
						<InputContainer>
							<NumericalInput
								value={value}
								onUserInput={(val) => {
									onUserInput(val);
								}}
							/>
							{account && currency && showMaxButton && label !== "To" && (
								<StyledBalanceMax onClick={onMax}>{t("max")}</StyledBalanceMax>
							)}
						</InputContainer>
					)}
				</InputRow>
			</div>
			{!disableCurrencySelect && onCurrencySelect && (
				<CurrencySearchModal
					isOpen={modalOpen}
					onDismiss={handleDismissSearch}
					onCurrencySelect={onCurrencySelect}
					selectedCurrency={currency}
					otherSelectedCurrency={otherCurrency}
					showCommonBases={showCommonBases}
				/>
			)}
		</InputPanel>
	);
}
