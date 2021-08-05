import { Percent } from "@uniswap/sdk";
import { ONE_BIPS } from "../../../constants";
import { warningSeverity } from "../../../utils/prices";
import styled from "styled-components";
import { ErrorText } from "./styleds";

export const CustomErrorText = styled(ErrorText)`
	font-size: 0.75rem;

	@media (min-width: 768px) {
		font-size: 1rem;
	}
`;
/**
 * Formatted version of price impact text with warning colors
 */
export default function FormattedPriceImpact({ priceImpact }: { priceImpact?: Percent }) {
	return (
		<CustomErrorText fontWeight={500} severity={warningSeverity(priceImpact)}>
			{priceImpact ? (priceImpact.lessThan(ONE_BIPS) ? "<0.01%" : `${priceImpact.toFixed(2)}%`) : "-"}
		</CustomErrorText>
	);
}
