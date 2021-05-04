import { Currency, Percent, Price } from "@uniswap/sdk";
import React, { useContext } from "react";
import { Text } from "rebass";
import styled, { ThemeContext } from "styled-components";
import { ONE_BIPS } from "../../constants";
import { Field } from "../../state/mint/actions";
import { Separator } from "../SearchModal/styleds";

const Row = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-around;
	padding: 5px 30px;

	@media (max-width: 1199px) {
		padding: 0 15px;
	}
`;

const Col = styled.div<{ order: number }>`
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: ${({ order }) => (order === 0 ? "15px 0 10px" : "10px 0 15px")};

	@media (max-width: 1199px) {
		align-items: stretch;
		justify-content: flex-start;
		padding: ${({ order }) => (order === 0 ? "20px 8px 20px 0" : "10px 8px 24px 0")};
	}
`;

const HeaderText = styled(Text)`
	font-size: 1rem;

	@media (max-width: 991px) {
		font-size: 0.875rem;
	}
`;
const FooterText = styled(Text)`
	font-size: 1rem;

	@media (max-width: 991px) {
		font-size: 0.75rem;
	}
`;

export function PoolPriceBar({
	currencies,
	noLiquidity,
	poolTokenPercentage,
	price,
}: {
	currencies: { [field in Field]?: Currency };
	noLiquidity?: boolean;
	poolTokenPercentage?: Percent;
	price?: Price;
}) {
	const theme = useContext(ThemeContext);
	return (
		<div className={"d-flex flex-column"}>
			<Row>
				<Col order={0}>
					<HeaderText fontWeight={500} color={theme.text1}>
						{price?.toSignificant(6) ?? "-"}
					</HeaderText>
				</Col>
				<Col order={0}>
					<HeaderText fontWeight={500} color={theme.text1}>
						{price?.invert()?.toSignificant(6) ?? "-"}
					</HeaderText>
				</Col>
				<Col order={0}>
					<HeaderText fontWeight={500} color={theme.text1}>
						{noLiquidity && price
							? "100"
							: (poolTokenPercentage?.lessThan(ONE_BIPS) ? "<0.01" : poolTokenPercentage?.toFixed(2)) ??
							  "0"}
						%
					</HeaderText>
				</Col>
			</Row>

			<Separator />

			<Row>
				<Col order={1}>
					<FooterText fontWeight={500} color={theme.text1}>
						{currencies[Field.CURRENCY_B]?.symbol} per {currencies[Field.CURRENCY_A]?.symbol}
					</FooterText>
				</Col>
				<Col order={1}>
					<FooterText fontWeight={500} color={theme.text1}>
						{currencies[Field.CURRENCY_A]?.symbol} per {currencies[Field.CURRENCY_B]?.symbol}
					</FooterText>
				</Col>
				<Col order={1}>
					<FooterText fontWeight={500} color={theme.text1}>
						Share of Pool
					</FooterText>
				</Col>
			</Row>
		</div>
	);
}
