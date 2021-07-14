import React from "react";
import { Text } from "rebass";
import { ChainId, Currency, currencyEquals, ETHER, Token } from "@uniswap/sdk";
import styled from "styled-components";

import { SUGGESTED_BASES } from "../../constants";
import { AutoColumn } from "../Column";
import QuestionHelper from "../QuestionHelper";
import { AutoRow } from "../Row";
import CurrencyLogo from "../CurrencyLogo";

const BaseWrapper = styled.div<{ disable?: boolean }>`
	background-color: ${({ theme, disable }) => (!disable ? theme.bg1 : theme.bg1)};
	border-radius: 12px;
	display: flex;
	padding: 6px 12px;
	opacity: ${({ disable }) => disable && "0.2"};
	align-items: center;
	color: ${({ theme, disable }) => (!disable ? theme.text2 : theme.text1)};

	:hover {
		cursor: ${({ disable }) => !disable && "pointer"};
		background-color: ${({ theme, disable }) => !disable && theme.bg1};
	}
`;

const CustomText = styled(Text)`
	display: flex;
	align-items: center;
`;

export default function CommonBases({
	chainId,
	onSelect,
	selectedCurrency,
}: {
	chainId?: ChainId;
	selectedCurrency?: Currency | null;
	onSelect: (currency: Currency) => void;
}) {
	return (
		<AutoColumn gap="md">
			<AutoRow>
				<CustomText fontWeight={500} fontSize={16}>
					<span className="pb-1">Common bases</span>
					<QuestionHelper text="These tokens are commonly paired with other tokens." />
				</CustomText>
			</AutoRow>
			<AutoRow gap="4px">
				<BaseWrapper
					onClick={() => {
						if (!selectedCurrency || !currencyEquals(selectedCurrency, ETHER)) {
							onSelect(ETHER);
						}
					}}
					disable={selectedCurrency === ETHER}
				>
					<CurrencyLogo currency={ETHER} style={{ marginRight: 8 }} size={24} />
					<Text fontWeight={500} fontSize={16}>
						ETH
					</Text>
				</BaseWrapper>
				{(chainId ? SUGGESTED_BASES[chainId] : []).map((token: Token) => {
					const selected = selectedCurrency instanceof Token && selectedCurrency.address === token.address;
					return (
						<BaseWrapper
							onClick={() => !selected && onSelect(token)}
							disable={selected}
							key={token.address}
						>
							<CurrencyLogo currency={token} style={{ marginRight: 12 }} size={24} />
							<Text fontWeight={500} fontSize={16}>
								{token.symbol}
							</Text>
						</BaseWrapper>
					);
				})}
			</AutoRow>
		</AutoColumn>
	);
}
