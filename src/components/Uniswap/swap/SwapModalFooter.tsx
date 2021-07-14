import { useContext, useMemo, useState } from "react";
import { Repeat } from "react-feather";
import { Text } from "rebass";
import { Trade, TradeType } from "@uniswap/sdk";
import { ThemeContext } from "styled-components";
import { Field } from "../../../state/swap/actions";
import { TYPE } from "../../../theme";
import {
	computeSlippageAdjustedAmounts,
	computeTradePriceBreakdown,
	formatExecutionPrice,
	warningSeverity,
} from "../../../utils/prices";
import { AutoColumn } from "../../Column";
import QuestionHelper from "../../QuestionHelper";
import { AutoRow, RowBetween, RowFixed } from "../../Row";
import GradientButton from "../../UI/Button";
import FormattedPriceImpact from "./FormattedPriceImpact";
import { StyledBalanceMaxMini, SwapCallbackError } from "./styleds";

export default function SwapModalFooter({
	trade,
	onConfirm,
	allowedSlippage,
	swapErrorMessage,
	disabledConfirm,
}: {
	trade: Trade;
	allowedSlippage: number;
	onConfirm: () => void;
	swapErrorMessage: string | undefined;
	disabledConfirm: boolean;
}) {
	const [showInverted, setShowInverted] = useState<boolean>(false);
	const theme = useContext(ThemeContext);
	const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
		allowedSlippage,
		trade,
	]);
	const { priceImpactWithoutFee, realizedLPFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade]);
	const severity = warningSeverity(priceImpactWithoutFee);

	return (
		<>
			<AutoColumn gap="0px">
				<RowBetween align="center">
					<Text fontWeight={400} fontSize={14} color={theme.text2}>
						Price
					</Text>
					<Text
						fontWeight={500}
						fontSize={14}
						color={theme.text1}
						style={{
							justifyContent: "center",
							alignItems: "center",
							display: "flex",
							textAlign: "right",
							paddingLeft: "10px",
						}}
					>
						{formatExecutionPrice(trade, showInverted)}
						<StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)}>
							<Repeat size={14} />
						</StyledBalanceMaxMini>
					</Text>
				</RowBetween>

				<RowBetween>
					<RowFixed>
						<TYPE.Black fontSize={14} fontWeight={400} color={theme.text2}>
							{trade.tradeType === TradeType.EXACT_INPUT ? "Minimum received" : "Maximum sold"}
						</TYPE.Black>
						<QuestionHelper text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed." />
					</RowFixed>
					<RowFixed>
						<TYPE.Black fontSize={14}>
							{trade.tradeType === TradeType.EXACT_INPUT
								? slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4) ?? "-"
								: slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4) ?? "-"}
						</TYPE.Black>
						<TYPE.Black fontSize={14} marginLeft={"4px"}>
							{trade.tradeType === TradeType.EXACT_INPUT
								? trade.outputAmount.currency.symbol
								: trade.inputAmount.currency.symbol}
						</TYPE.Black>
					</RowFixed>
				</RowBetween>
				<RowBetween>
					<RowFixed>
						<TYPE.Black color={theme.text2} fontSize={14} fontWeight={400}>
							Price Impact
						</TYPE.Black>
						<QuestionHelper text="The difference between the market price and your price due to trade size." />
					</RowFixed>
					<FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
				</RowBetween>
				<RowBetween>
					<RowFixed>
						<TYPE.Black fontSize={14} fontWeight={400} color={theme.text2}>
							Liquidity Provider Fee
						</TYPE.Black>
						<QuestionHelper text="A portion of each trade (0.30%) goes to liquidity providers as a protocol incentive." />
					</RowFixed>
					<TYPE.Black fontSize={14}>
						{realizedLPFee
							? realizedLPFee?.toSignificant(6) + " " + trade.inputAmount.currency.symbol
							: "-"}
					</TYPE.Black>
				</RowBetween>
			</AutoColumn>

			<AutoRow>
				<GradientButton
					onClick={onConfirm}
					disabled={disabledConfirm}
					error={severity > 2}
					style={{ margin: "10px 0 0 0" }}
					className={"btn-lg btn-block"}
					id="confirm-swap-or-send"
				>
					{severity > 2 ? "Swap Anyway" : "Confirm Swap"}
				</GradientButton>

				{swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
			</AutoRow>
		</>
	);
}
