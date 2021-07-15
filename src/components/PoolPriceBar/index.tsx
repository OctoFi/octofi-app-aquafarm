import { useContext } from "react";
import { Currency, Percent, Price } from "@uniswap/sdk";
import { Text } from "rebass";
import { ONE_BIPS } from "../../constants";
import { Field } from "../../state/mint/actions";
import styled, { ThemeContext } from "styled-components";

const PriceRow = styled.div`
	${({ theme }) => theme.flexRowNoWrap};
	align-items: center;
	justify-content: space-between;
	gap: 0.5rem;
	margin-bottom: 0.5rem;

	&:last-child {
		margin-bottom: 0;
	}
`;

const Label = styled(Text)`
	font-size: 0.875rem;
`;

const Content = styled(Text)`
	font-size: 0.875rem;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export type PoolPriceBarProps = {
	currencies: { [field in Field]?: Currency };
	noLiquidity?: boolean;
	poolTokenPercentage?: Percent;
	price?: Price;
};

export function PoolPriceBar({ currencies, noLiquidity, poolTokenPercentage, price }: PoolPriceBarProps) {
	const theme = useContext(ThemeContext);
	return (
		<>
			<PriceRow>
				<Label fontWeight={500} color={theme.text1}>
					{currencies[Field.CURRENCY_B]?.symbol} per {currencies[Field.CURRENCY_A]?.symbol}
				</Label>
				<Content fontWeight={500} color={theme.text1}>
					{price?.toSignificant(6) ?? "-"}
				</Content>
			</PriceRow>
			<PriceRow>
				<Label fontWeight={500} color={theme.text1}>
					{currencies[Field.CURRENCY_A]?.symbol} per {currencies[Field.CURRENCY_B]?.symbol}
				</Label>
				<Content fontWeight={500} color={theme.text1}>
					{price?.invert()?.toSignificant(6) ?? "-"}
				</Content>
			</PriceRow>
			<PriceRow>
				<Label fontWeight={500} color={theme.text1}>
					Share of Pool
				</Label>
				<Content fontWeight={500} color={theme.text1}>
					{noLiquidity && price
						? "100"
						: (poolTokenPercentage?.lessThan(ONE_BIPS) ? "<0.01" : poolTokenPercentage?.toFixed(2)) ?? "0"}
					%
				</Content>
			</PriceRow>
		</>
	);
}
