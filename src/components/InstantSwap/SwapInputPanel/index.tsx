import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "react-feather";
import { ETHER, Token } from "@uniswap/sdk";
import { useActiveWeb3React } from "../../../hooks";
import { useCurrencyBalance } from "../../../state/wallet/hooks";
import { Input as NumericalInput } from "../../NumericalInput";
import SwapSelectModal from "../../SwapSelectModal";
import * as Styled from "./styleds";
import { Button } from "react-bootstrap";

export type SwapInputPanelProps = {
	value?: any;
	label?: string;
	disabled?: boolean;
	selected: any;
	id: string;
	currencies: Array<any>;
	type: string;
	disableCurrencySelect?: boolean;
	onSelect: () => void;
	onUserInput?: (X: any, Y: any, Z: any) => void;
	onChangeBalance: (T: any) => void;
	onUseMax?: (X: any, Y: any) => void;
	showMaxButton?: boolean;
};

const SwapInputPanel = ({
	value,
	onUserInput,
	label = "Input",
	onSelect,
	disabled = false,
	selected,
	id,
	currencies,
	type,
	disableCurrencySelect = false,
	onChangeBalance = (balance) => balance,
	onUseMax,
	showMaxButton = false,
}: SwapInputPanelProps) => {
	const { t } = useTranslation();
	const { account } = useActiveWeb3React();
	const [modalOpen, setModalOpen] = useState(false);
	const [currency, setCurrency] = useState<Token | undefined>(undefined);
	const [selectedTokenName, setSelectedTokenName] = useState("");
	const selectedCurrencyBalance = useCurrencyBalance(
		account ?? undefined,
		selected && selected.symbol === "ETH" ? ETHER : currency
	);

	useEffect(() => {
		if (selected) {
			let token = new Token(
				selected.chainId,
				selected.address,
				selected.decimals,
				selected.symbol,
				selected.name
			);
			setCurrency(token);
			const name = formatTokenName(selected.symbol);
			setSelectedTokenName(name);
		}

		onChangeBalance(selectedCurrencyBalance);
	}, [selected]);

	const formatTokenName = (symbol: string) => {
		return symbol && symbol.length > 16
			? symbol.slice(0, 4) + "..." + symbol.slice(symbol.length - 5, symbol.length)
			: symbol;
	};

	const onDismissSearch = useCallback(() => {
		setModalOpen(false);
	}, [setModalOpen]);

	const onOpenCurrencySelect = () => {
		if (!disableCurrencySelect) {
			setModalOpen(true);
		}
	};

	return (
		<Styled.InputPanel id={id}>
			<Styled.InputRow selected={disabled}>
				<div>
					<Styled.CurrencySelect selected={selected} onClick={onOpenCurrencySelect}>
						<Styled.Aligner>
							{selected ? (
								<>
									<Styled.Logo src={selected.logoURI} alt={selected.symbol} />

									<Styled.TextWrap>
										<Styled.Label>{label}</Styled.Label>
										<Styled.TokenName>{selectedTokenName}</Styled.TokenName>
									</Styled.TextWrap>
								</>
							) : (
								<Styled.TokenName>{t("selectToken")}</Styled.TokenName>
							)}

							{!disableCurrencySelect && <ChevronDown size={18} />}
						</Styled.Aligner>
					</Styled.CurrencySelect>
				</div>

				{onUserInput && (
					<Styled.InputContainer>
						{account && currency && showMaxButton && onUseMax && (
							<div className="pr-1">
								<Button
									onClick={() => {
										onUseMax(type, selectedCurrencyBalance);
									}}
									variant={"outline-primary"}
									size={"sm"}
								>
									{t("max")}
								</Button>
							</div>
						)}

						<NumericalInput
							className="token-amount-input"
							value={value}
							onUserInput={(val) => {
								onUserInput(val, type, selectedCurrencyBalance);
							}}
						/>

						{account && (
							<Styled.Balance>
								{!!currency && selectedCurrencyBalance
									? t("balance", {
											balanceInput: selectedCurrencyBalance?.toSignificant(6),
									  })
									: " -"}
							</Styled.Balance>
						)}
					</Styled.InputContainer>
				)}
			</Styled.InputRow>

			{!disableCurrencySelect && onSelect && (
				<SwapSelectModal
					isOpen={modalOpen}
					onDismiss={onDismissSearch}
					onCurrencySelect={onSelect}
					selectedCurrency={selected}
					currencies={currencies}
					type={type}
				/>
			)}
		</Styled.InputPanel>
	);
};

export default SwapInputPanel;
