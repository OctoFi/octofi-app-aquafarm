import { Currency, CurrencyAmount, Fraction, Percent } from "@uniswap/sdk";
import Button from "../UI/Button";
import { RowBetween, RowFixed } from "../Row";
import CurrencyLogo from "../../components/CurrencyLogo";
import { Field } from "../../state/mint/actions";
import { TYPE } from "../../theme";
import styled from "styled-components";

const Description = styled(TYPE.Body)`
	@media (max-width: 1199px) {
		font-size: 0.75rem;
	}
`;

const Value = styled(TYPE.Body)`
	@media (max-width: 1199px) {
		font-size: 0.875rem;
		font-weight: 700;
	}
`;

export function ConfirmAddModalBottom({
	noLiquidity,
	price,
	currencies,
	parsedAmounts,
	poolTokenPercentage,
	onAdd,
}: {
	noLiquidity?: boolean;
	price?: Fraction;
	currencies: { [field in Field]?: Currency };
	parsedAmounts: { [field in Field]?: CurrencyAmount };
	poolTokenPercentage?: Percent;
	onAdd: () => void;
}) {
	return (
		<>
			<RowBetween>
				<Description>{currencies[Field.CURRENCY_A]?.symbol} Deposited</Description>
				<RowFixed>
					<CurrencyLogo
						currency={currencies[Field.CURRENCY_A]}
						style={{ marginRight: "8px" }}
						size={24}
					/>
					<Value>{parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}</Value>
				</RowFixed>
			</RowBetween>
			<RowBetween>
				<Description>{currencies[Field.CURRENCY_B]?.symbol} Deposited</Description>
				<RowFixed>
					<CurrencyLogo
						currency={currencies[Field.CURRENCY_B]}
						style={{ marginRight: "8px" }}
						size={24}
					/>
					<Value>{parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}</Value>
				</RowFixed>
			</RowBetween>
			<RowBetween>
				<Description>Rates</Description>
				<Value>
					{`1 ${currencies[Field.CURRENCY_A]?.symbol} = ${price?.toSignificant(4)} ${
						currencies[Field.CURRENCY_B]?.symbol
					}`}
				</Value>
			</RowBetween>
			<RowBetween style={{ justifyContent: "flex-end" }}>
				<Value>
					{`1 ${currencies[Field.CURRENCY_B]?.symbol} = ${price?.invert().toSignificant(4)} ${
						currencies[Field.CURRENCY_A]?.symbol
					}`}
				</Value>
			</RowBetween>
			<RowBetween>
				<Description>Share of Pool:</Description>
				<Value>{noLiquidity ? "100" : poolTokenPercentage?.toSignificant(4)}%</Value>
			</RowBetween>
			<Button style={{ margin: "20px 0 0 0" }} onClick={onAdd} className={""}>
				{noLiquidity ? "Create Pool & Supply" : "Confirm Supply"}
			</Button>
		</>
	);
}
