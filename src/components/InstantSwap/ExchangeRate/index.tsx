import { isMobile } from "react-device-detect";
import * as Styled from "./styleds";

export type ExchangeRateProps = {
	inputToken: any;
	outputToken: any;
	rate?: any;
};

const ExchangeRate = ({ inputToken, outputToken, rate }: ExchangeRateProps) => {
	return (
		<div className="d-flex justify-content-between align-items-center">
			<Styled.RateText fontWeight={400} fontSize={isMobile ? 12 : 14}>
				Exchange Rate
			</Styled.RateText>

			<Styled.RateText fontWeight={isMobile ? 400 : 500} fontSize={isMobile ? 12 : 16}>
				{`1 ${inputToken.symbol || inputToken.code} ≈ ${rate.rate.toFixed(4)} ${
					outputToken.symbol || outputToken.code
				}`}
			</Styled.RateText>
		</div>
	);
};

export default ExchangeRate;
