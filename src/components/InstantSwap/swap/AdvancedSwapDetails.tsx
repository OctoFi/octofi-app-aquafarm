import { Trade, TradeType } from "@uniswap/sdk";
import styled from "styled-components";
import { Field } from "../../../state/swap/actions";
import { useUserSlippageTolerance } from "../../../state/user/hooks";
import { TYPE, ExternalLink } from "../../../theme";
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown } from "../../../utils/prices";
import { AutoColumn } from "../../Column";
import { RowFixed } from "../../Row";
import FormattedPriceImpact from "./FormattedPriceImpact";
import SwapRoute from "./SwapRoute";

export const SummaryRow = styled.div`
	border-top: 1px solid ${({ theme }) => theme.borderColor2};
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.75rem 0;
	font-size: 0.75rem;

	@media (min-width: 768px) {
		font-size: 0.875rem;
	}
`;

export const InfoLink = styled(ExternalLink)`
	width: 100%;
	border: 1px solid ${({ theme }) => theme.bg1};
	padding: 6px 6px;
	border-radius: 8px;
	text-align: center;
	font-size: 14px;
	color: ${({ theme }) => theme.text1};
`;

function TradeSummary({ trade, allowedSlippage }: { trade: Trade; allowedSlippage: number }) {
	const { priceImpactWithoutFee, realizedLPFee } = computeTradePriceBreakdown(trade);
	const isExactIn = trade.tradeType === TradeType.EXACT_INPUT;
	const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(trade, allowedSlippage);

	return (
		<AutoColumn style={{ padding: "0 15px" }}>
			<SummaryRow>
				<RowFixed>
					<TYPE.Black>{isExactIn ? "Minimum received" : "Maximum sold"}</TYPE.Black>
				</RowFixed>
				<RowFixed>
					<TYPE.Black>
						{isExactIn
							? `${slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4)} ${
									trade.outputAmount.currency.symbol
							  }` ?? "-"
							: `${slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4)} ${
									trade.inputAmount.currency.symbol
							  }` ?? "-"}
					</TYPE.Black>
				</RowFixed>
			</SummaryRow>

			<SummaryRow>
				<RowFixed>
					<TYPE.Black>Price Impact</TYPE.Black>
				</RowFixed>
				<FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
			</SummaryRow>

			<SummaryRow>
				<RowFixed>
					<TYPE.Black>Liquidity Provider Fee</TYPE.Black>
				</RowFixed>
				<TYPE.Black>
					{realizedLPFee ? `${realizedLPFee.toSignificant(4)} ${trade.inputAmount.currency.symbol}` : "-"}
				</TYPE.Black>
			</SummaryRow>
		</AutoColumn>
	);
}

export interface AdvancedSwapDetailsProps {
	trade?: Trade;
}

export function AdvancedSwapDetails({ trade }: AdvancedSwapDetailsProps) {
	const [allowedSlippage] = useUserSlippageTolerance();
	const showRoute = Boolean(trade && trade.route.path.length > 2);

	return (
		<AutoColumn gap="15px">
			{trade && (
				<>
					<TradeSummary trade={trade} allowedSlippage={allowedSlippage} />
					{showRoute && (
						<div className={"d-flex flex-column"}>
							<AutoColumn style={{ padding: "0 15px" }} gap={"7px"}>
								<TYPE.Black fontSize={16} className={"d-none d-lg-block"}>
									Route
								</TYPE.Black>
								<SwapRoute trade={trade} />
							</AutoColumn>
						</div>
					)}
				</>
			)}
		</AutoColumn>
	);
}
