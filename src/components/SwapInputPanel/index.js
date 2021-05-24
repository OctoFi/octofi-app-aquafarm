import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { RowBetween } from "../Row";
import { Input as NumericalInput } from "../NumericalInput";
import { ReactComponent as DropDown } from "../../assets/images/dropdown.svg";
import SwapSelectModal from "../SwapSelectModal";
import { ETHER, Token } from "@uniswap/sdk";
import { useActiveWeb3React } from "../../hooks";
import { useCurrencyBalance } from "../../state/wallet/hooks";
import { useTranslation } from "react-i18next";

const InputRow = styled.div`
	${({ theme }) => theme.flexRowNoWrap};
	align-items: center;

	padding: 1rem 0 1.25rem;

	@media (min-width: 768px) {
		padding-top: 0.75rem;
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

const Balance = styled.span`
	color: ${({ theme }) => theme.text1};
	font-weight: 400;
	font-size: 0.75rem;
	padding: 0;
	margin-bottom: -6px;

	@media (min-width: 768px) {
		font-size: 0.875rem;
		font-weight: 500;
		margin-bottom: 0;
	}
`;

const InputContainer = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	flex-wrap: nowrap;
	flex: 1;
`;

const Logo = styled.img`
	width: ${({ size }) => size || "100%"};
	height: ${({ size }) => size || "100%"};
	border-radius: ${({ size }) => size || "100%"};
	border: 2px solid ${({ theme }) => theme.text1};
	color: ${({ theme }) => theme.text1};
	margin-right: ${({ margin }) => (margin ? "8px" : 0)};
`;

const LabelRow = styled.div`
	${({ theme }) => theme.flexRowNoWrap};
	align-items: center;
	color: ${({ theme }) => theme.text1};
	font-size: 0.75rem;
	line-height: 1rem;
	padding: 0;
`;

const StyledDropDown = styled(DropDown)`
	margin: 0 0.25rem 0 0.5rem;
	height: 35%;

	path {
		stroke: ${({ selected, theme }) => theme.text1};
		stroke-width: 1.5px;
	}
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
	padding-left: ${({ active }) => (active ? "0.625rem" : "0")};
	font-size: 1rem;

	@media (min-width: 768px) {
		padding-left: ${({ active }) => (active ? "0.75rem" : "0")};
	}
`;

const CurrencySelect = styled.button`
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

export default function SwapInputPanel({
	value,
	onUserInput,
	label = "Input",
	onSelect,
	disable = false,
	selected,
	hideInput = false,
	id,
	currencies,
	type,
	disableCurrencySelect = false,
	onChangeBalance = (balance) => balance,
}) {
	let currency = undefined;
	const { t } = useTranslation();
	if (selected) {
		currency = new Token(selected.chainId, selected.address, selected.decimals, selected.symbol, selected.name);
	}
	const [modalOpen, setModalOpen] = useState(false);
	const { account } = useActiveWeb3React();
	const selectedCurrencyBalance = useCurrencyBalance(
		account ?? undefined,
		selected && selected.symbol === "ETH" ? ETHER : currency
	);

	useEffect(() => {
		onChangeBalance(selectedCurrencyBalance);
	}, [selected]);

	const handleDismissSearch = useCallback(() => {
		setModalOpen(false);
	}, [setModalOpen]);

	return (
		<InputPanel id={id}>
			<div>
				{!hideInput && (
					<LabelRow>
						<RowBetween>
							<Label>{label}</Label>

							{account && (
								<Balance>
									{!!currency && selectedCurrencyBalance
										? t("balance", { balanceInput: selectedCurrencyBalance?.toSignificant(6) })
										: " -"}
								</Balance>
							)}
						</RowBetween>
					</LabelRow>
				)}
				<InputRow style={hideInput ? { padding: "0", borderRadius: "0.42rem" } : {}} selected={disable}>
					<CurrencySelect
						selected={!!selected}
						className="open-currency-select-button"
						onClick={() => {
							if (!disableCurrencySelect) {
								setModalOpen(true);
							}
						}}
					>
						<Aligner>
							{selected ? <Logo src={selected.logoURI} size={`24px`} alt={selected.symbol} /> : null}
							<StyledTokenName
								className="token-symbol-container"
								active={Boolean(selected && selected?.symbol)}
							>
								{(selected && selected?.symbol && selected?.symbol.length > 20
									? selected?.symbol.slice(0, 4) +
									  "..." +
									  selected?.symbol.slice(selected?.symbol.length - 5, selected?.symbol.length)
									: selected?.symbol) || t("selectToken")}
							</StyledTokenName>
							{!disableCurrencySelect && <StyledDropDown selected={!!selected} />}
						</Aligner>
					</CurrencySelect>

					{!hideInput && (
						<InputContainer>
							<NumericalInput
								className="token-amount-input"
								value={value}
								onUserInput={(val) => {
									onUserInput(val, type, selectedCurrencyBalance);
								}}
							/>
						</InputContainer>
					)}
				</InputRow>
			</div>

			{!disableCurrencySelect && onSelect && (
				<SwapSelectModal
					isOpen={modalOpen}
					onDismiss={handleDismissSearch}
					onCurrencySelect={onSelect}
					selectedCurrency={selected}
					currencies={currencies}
					type={type}
				/>
			)}
		</InputPanel>
	);
}
