import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "react-feather";
import { ETHER, Token } from "@uniswap/sdk";
import { useActiveWeb3React } from "../../../hooks";
import { useCurrencyBalance } from "../../../state/wallet/hooks";
import { Input as NumericalInput } from "../../NumericalInput";
import TokenSelectModal from "../../TokenSelectModal";
import * as Styled from "./styleds";

export type InputPanelProps = {
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
};

const InputPanel = ({
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
}: InputPanelProps) => {
	const { t } = useTranslation();
	const { account } = useActiveWeb3React();
	const [modalOpen, setModalOpen] = useState(false);
	const [balanceText, setBalanceText] = useState("-");
	const [currency, setCurrency] = useState<Token | undefined>(undefined);
	const [selectedTokenName, setSelectedTokenName] = useState("");
	const selectedCurrencyBalance = useCurrencyBalance(
		account ?? undefined,
		selected && selected.symbol === "ETH" ? ETHER : currency
	);

	useEffect(() => {
		if (!!currency && selectedCurrencyBalance) {
			setBalanceText(
				t("balance", {
					balanceInput: selectedCurrencyBalance.toSignificant(6),
				})
			);
		} else {
			setBalanceText("-");
		}
	}, [currency, selectedCurrencyBalance]);

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
			<Styled.LabelRow>
				<Styled.Label>{label}</Styled.Label>

				{account &&
					currency &&
					(onUseMax ? (
						<Styled.BalanceButton
							onClick={() => {
								onUseMax(type, selectedCurrencyBalance);
							}}
						>
							{balanceText}
						</Styled.BalanceButton>
					) : (
						<Styled.Balance>{balanceText}</Styled.Balance>
					))}
			</Styled.LabelRow>

			<Styled.InputRow selected={disabled}>
				<Styled.CurrencySelect selected={selected} onClick={onOpenCurrencySelect}>
					<Styled.Aligner>
						{selected ? (
							<>
								<Styled.Logo src={selected.logoURI} alt={selected.symbol} />

								<Styled.TextWrap>
									<Styled.TokenName>{selectedTokenName}</Styled.TokenName>
								</Styled.TextWrap>
							</>
						) : (
							<Styled.TokenName>{t("selectToken")}</Styled.TokenName>
						)}

						{!disableCurrencySelect && <ChevronDown size={18} />}
					</Styled.Aligner>
				</Styled.CurrencySelect>

				{onUserInput && (
					<Styled.InputContainer>
						<NumericalInput
							className="token-amount-input"
							value={value}
							onUserInput={(val) => {
								onUserInput(val, type, selectedCurrencyBalance);
							}}
						/>
					</Styled.InputContainer>
				)}
			</Styled.InputRow>

			{!disableCurrencySelect && onSelect && (
				<TokenSelectModal
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

export default InputPanel;
