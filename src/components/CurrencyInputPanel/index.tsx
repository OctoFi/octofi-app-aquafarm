import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "react-bootstrap";
import { Currency, Pair } from "@uniswap/sdk";
import CurrencySearchModal from "../SearchModal/CurrencySearchModal";
import CurrencyLogo from "../CurrencyLogo";
import DoubleCurrencyLogo from "../DoubleLogo";
import { RowBetween } from "../Row";
import { Input as NumericalInput } from "../NumericalInput";

import { useActiveWeb3React } from "../../hooks";
import { useCurrencyBalance } from "../../state/wallet/hooks";
import * as Styled from "./styles";
import { ChevronDown } from "react-feather";

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

	const onOpenCurrencySelect = () => {
		if (!disableCurrencySelect) {
			setModalOpen(true);
		}
	};

	return (
		<Styled.InputPanel id={id} withoutMargin={withoutMargin}>
			<Styled.InputRow selected={disableCurrencySelect}>
				<div>
					<Styled.CurrencySelect selected={!!currency} onClick={onOpenCurrencySelect}>
						<Styled.Aligner>
							{pair ? (
								<DoubleCurrencyLogo
									currency0={pair.token0}
									currency1={pair.token1}
									size={24}
									margin={true}
								/>
							) : currency ? (
								<CurrencyLogo currency={currency} size={24} />
							) : null}

							{pair ? (
								<Styled.TextWrap>
									<Styled.Label>{label}</Styled.Label>

									<Styled.TokenName>
										{pair?.token0.symbol}:{pair?.token1.symbol}
									</Styled.TokenName>
								</Styled.TextWrap>
							) : currency ? (
								<Styled.TextWrap>
									<Styled.Label>{label}</Styled.Label>

									<Styled.TokenName>
										{currency.symbol && currency.symbol.length > 16
											? currency.symbol.slice(0, 4) +
											  "..." +
											  currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
											: currency?.symbol}
									</Styled.TokenName>
								</Styled.TextWrap>
							) : (
								<Styled.TokenName>{t("selectToken")}</Styled.TokenName>
							)}

							{!disableCurrencySelect && <ChevronDown size={18} />}
						</Styled.Aligner>
					</Styled.CurrencySelect>
				</div>
				<Styled.InputContainer>
					{account && currency && showMaxButton && label !== "To" && (
						<Button onClick={onMax} variant={"outline-primary"} size={"sm"}>
							{t("max")}
						</Button>
					)}

					<NumericalInput
						value={value}
						onUserInput={(val) => {
							onUserInput(val);
						}}
					/>

					{account && (
						<Styled.Balance showBalance={showMaxButton}>
							{!!currency && selectedCurrencyBalance
								? t("balance", { balanceInput: selectedCurrencyBalance?.toSignificant(6) })
								: " -"}
						</Styled.Balance>
					)}
				</Styled.InputContainer>
			</Styled.InputRow>
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
		</Styled.InputPanel>
	);
}
