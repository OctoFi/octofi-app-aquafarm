import { ArrowDown } from "react-feather";
import useTheme from "../../../hooks/useTheme";
import { ResponsiveCard } from "../../Card";
import AddRecipient from "../AddRecipient";
import ExchangeRate from "../ExchangeRate";
import InputPanel from "../InputPanel";
// import SwapHeader from "../SwapHeader";
import * as Styled from "./styleds";

export type SimpleSwapProps = {
	inputCurrencyList: any;
	inputCurrency: any;
	inputAmount: any;
	inputLabel?: string;
	outputCurrencyList: any;
	outputCurrency: any;
	outputAmount: any;
	outputLabel?: string;
	selected?: any;
	onUserInput: any;
	onSelect: any;
	onChangeBalance: any;
	onSwapTokens?: any;
	recipient?: any;
	onChangeRecipient?: any;
	exchangeRate?: any;
	buttonDisabled?: boolean;
	buttonLabel: string;
	onButtonClick?: any;
	onUseMax?: (X: any, Y: any) => void;
};

const SimpleSwap = ({
	inputCurrencyList,
	inputCurrency,
	inputAmount,
	inputLabel,
	outputCurrencyList,
	outputCurrency,
	outputAmount,
	outputLabel,
	onSelect,
	onChangeBalance,
	onUserInput,
	onSwapTokens,
	recipient,
	onChangeRecipient,
	exchangeRate,
	buttonDisabled,
	buttonLabel,
	onButtonClick,
	onUseMax,
}: SimpleSwapProps) => {
	const theme = useTheme();

	return (
		<ResponsiveCard>
			{/* <SwapHeader /> */}

			<InputPanel
				currencies={inputCurrencyList}
				selected={inputCurrency}
				value={inputAmount}
				onUserInput={onUserInput}
				label={inputLabel}
				onSelect={onSelect}
				type="deposit"
				id="deposit"
				onChangeBalance={onChangeBalance}
				onUseMax={onUseMax}
			/>

			{onSwapTokens !== undefined && (
				<Styled.SwitchCol clickable onClick={onSwapTokens}>
					<ArrowDown size={16} color={theme.text2} />
				</Styled.SwitchCol>
			)}

			<InputPanel
				currencies={outputCurrencyList}
				selected={outputCurrency}
				value={outputAmount}
				onUserInput={onUserInput}
				label={outputLabel}
				onSelect={onSelect}
				type="destination"
				id="destination"
				onChangeBalance={onChangeBalance}
			/>

			<AddRecipient recipient={recipient} onChangeRecipient={onChangeRecipient} />

			{!!exchangeRate && (
				<div className="my-2">
					<ExchangeRate inputToken={inputCurrency} outputToken={outputCurrency} rate={exchangeRate} />
				</div>
			)}

			<div className="d-flex flex-column align-items-stretch align-items-md-center justify-content-center mt-4">
				<Styled.SwapButton onClick={onButtonClick} variant={"primary"} disabled={buttonDisabled}>
					{buttonLabel}
				</Styled.SwapButton>
			</div>
		</ResponsiveCard>
	);
};

export default SimpleSwap;
