import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import { isMobile } from "react-device-detect";

import { RowBetween } from "../Row";
import { Input as NumericalInput } from "../NumericalInput";
import CurrencySelectModal from "../CurrencySelectModal";
import EUR from "../../assets/images/currencies/EU.svg";
import { useTranslation } from "react-i18next";
import dompurify from "dompurify";

const InputRow = styled.div`
	${({ theme }) => theme.flexRowNoWrap};
	align-items: center;
	padding: ${({ selected }) => (selected ? "0.75rem 0" : "0.75rem 0")};
`;

const Logo = styled.img`
	width: ${({ size }) => (size ? `${size}px` : "30px")};
	height: ${({ size }) => (size ? `${size}px` : "30px")};
	border-radius: ${({ size }) => (size ? `${size}px` : "30px")};
	border: 2px solid ${({ theme }) => theme.text1};
	box-shadow: 0 6px 10px rgba(0, 0, 0, 0.075);
	margin-right: ${({ margin }) => (margin ? "10px" : 0)};
	background-color: ${({ theme }) => theme.text1};
`;
const LogoDiv = styled.div`
	width: ${({ size }) => (size ? `${size}px` : "30px")};
	height: ${({ size }) => (size ? `${size}px` : "30px")};
	border-radius: ${({ size }) => (size ? `${size}px` : "30px")};
	border: 2px solid ${({ theme }) => theme.text1};
	box-shadow: 0 6px 10px rgba(0, 0, 0, 0.075);
	margin-right: ${({ margin }) => (margin ? "10px" : 0)};
	background-color: ${({ theme }) => theme.text1};
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;

	& svg {
		width: 30px;
		height: 30px;
		border-radius: 30px;
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

const Label = styled.span`
	color: ${({ theme }) => theme.text1};
	font-weight: 400;
	font-size: 0.875rem;
	padding: 0;

	@media (min-width: 768px) {
		padding: 0 1.5rem;
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
	z-index: 1;
`;

const StyledTokenName = styled.span`
	margin-right: auto;
	padding-left: ${({ active }) => (active ? "0.75rem" : "0")};
	font-size: 1rem;
`;

const CurrencySelect = styled.button`
	align-items: center;
	height: 56px;
	font-size: 1rem;
	font-weight: 700;
	background-color: ${({ theme }) => theme.bg1};
	color: ${({ theme }) => theme.text1};
	border-bottom-left-radius: ${({ reverse }) => (reverse ? "0" : `1.125rem`)};
	border-top-left-radius: ${({ reverse }) => (reverse ? "0" : `1.125rem`)};
	border-bottom-right-radius: ${({ reverse }) => (reverse ? "1.125rem" : `0`)};
	border-top-right-radius: ${({ reverse }) => (reverse ? "1.125rem" : `0`)};
	box-shadow: none;
	outline: none;
	cursor: pointer;
	user-select: none;
	border: none;
	padding: ${({ reverse }) => (reverse ? ".625rem 1.875rem .625rem 1.5rem" : `.625rem 0.625rem .625rem 1.5rem`)};

	:focus,
	:hover {
		outline: none;
	}
`;

export default function CryptoInput({
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
	reverse = false,
}) {
	const [modalOpen, setModalOpen] = useState(false);
	const { t } = useTranslation();

	const handleDismissSearch = useCallback(() => {
		setModalOpen(false);
	}, [setModalOpen]);

	const iconHTML = useMemo(() => {
		if ("icon" in selected) {
			return dompurify.sanitize(selected.icon);
		}
		return "";
	}, [selected]);

	return (
		<InputPanel id={id}>
			<div>
				{!hideInput && (
					<LabelRow>
						<RowBetween>
							<Label>{label}</Label>
						</RowBetween>
					</LabelRow>
				)}
				<InputRow style={hideInput ? { padding: "0", borderRadius: "0.42rem" } : {}} selected={disable}>
					{(!reverse || isMobile) && (
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
								{selected ? (
									selected.symbol === "EUR" ? (
										<Logo src={EUR} alt={selected.symbol} />
									) : selected.hasOwnProperty("image") ? (
										<Logo src={selected.image.small} alt={selected.symbol} />
									) : (
										<LogoDiv dangerouslySetInnerHTML={{ __html: iconHTML }} />
									)
								) : null}
								<StyledTokenName
									className="token-symbol-container"
									active={Boolean(selected && selected.symbol)}
								>
									{(selected && selected.symbol && selected.symbol.length > 20
										? selected.symbol.slice(0, 4) +
										  "..." +
										  selected.symbol.slice(selected.symbol.length - 5, selected.symbol.length)
										: selected?.symbol) || t("selectToken")}
								</StyledTokenName>
							</Aligner>
						</CurrencySelect>
					)}
					{!hideInput && (
						<NumericalInput
							noBorder={true}
							className="token-amount-input"
							value={value}
							onUserInput={(val) => {
								onUserInput(val, type);
							}}
							reverse={reverse && !isMobile}
						/>
					)}
					{reverse && !isMobile && (
						<CurrencySelect
							selected={!!selected}
							className="open-currency-select-button"
							reverse={reverse}
							onClick={() => {
								if (!disableCurrencySelect) {
									setModalOpen(true);
								}
							}}
						>
							<Aligner>
								{selected ? (
									selected.symbol === "EUR" ? (
										<Logo src={EUR} alt={selected.symbol} />
									) : selected.hasOwnProperty("image") ? (
										<Logo src={selected.image.small} alt={selected.symbol} />
									) : (
										<LogoDiv dangerouslySetInnerHTML={{ __html: iconHTML }} />
									)
								) : null}
								<StyledTokenName
									className="token-symbol-container"
									active={Boolean(selected && selected.symbol)}
								>
									{(selected && selected.symbol && selected.symbol.length > 20
										? selected.symbol.slice(0, 4) +
										  "..." +
										  selected.symbol.slice(selected.symbol.length - 5, selected.symbol.length)
										: selected?.symbol) || t("selectToken")}
								</StyledTokenName>
							</Aligner>
						</CurrencySelect>
					)}
				</InputRow>
			</div>

			{!disableCurrencySelect && onSelect && (
				<CurrencySelectModal
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
