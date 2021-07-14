import React, { useCallback } from "react";
import { FixedSizeList } from "react-window";
import { Text } from "rebass";
import styled from "styled-components";
import Column from "../Column";
import { RowBetween } from "../Row";
import CurrencyLogo from "../CurrencyLogo";

export const MenuItem = styled(RowBetween)`
	padding: 4px 20px;
	height: 56px;
	display: grid;
	grid-template-columns: auto minmax(auto, 1fr) auto;
	grid-gap: 16px;
	cursor: ${({ disabled }) => !disabled && "pointer"};
	pointer-events: ${({ disabled }) => disabled && "none"};
	:hover {
		background-color: ${({ theme, disabled }) => !disabled && theme.bg1};
	}
	opacity: ${({ disabled, selected }) => (disabled || selected ? 0.5 : 1)};
`;

const StyledBalanceText = styled(Text)`
	white-space: nowrap;
	overflow: hidden;
	max-width: 5rem;
	text-overflow: ellipsis;
`;

function Symbol({ symbol }) {
	return <StyledBalanceText>{symbol}</StyledBalanceText>;
}

function CurrencyRow({ currency, onSelect, isSelected, style }) {
	return (
		<MenuItem
			style={style}
			className={`token-item-${currency.symbol}`}
			onClick={() => (isSelected ? null : onSelect())}
			disabled={isSelected}
		>
			<CurrencyLogo currency={currency} size={24} />
			<Column>
				<Text title={currency.name} fontWeight={500}>
					{currency.symbol === "WETH" ? "Ethereum" : currency.name}
				</Text>
			</Column>

			<Column style={{ justifySelf: "flex-end" }}>
				<Symbol symbol={currency.symbol === "WETH" ? "ETH" : currency.symbol} />
			</Column>
		</MenuItem>
	);
}

export default function CurrencyList({ height, currencies, selectedCurrency, onCurrencySelect, fixedListRef }) {
	const Row = useCallback(
		({ data, index, style }) => {
			const currency = data[index];
			const isSelected = Boolean(selectedCurrency && selectedCurrency.symbol === currency.symbol);
			const handleSelect = () => onCurrencySelect(currency);
			return <CurrencyRow style={style} currency={currency} isSelected={isSelected} onSelect={handleSelect} />;
		},
		[onCurrencySelect, selectedCurrency]
	);

	const itemKey = useCallback((index, data) => {
		return data[index].id + "-" + index || data[index].symbol + "-" + index;
	}, []);

	return (
		<FixedSizeList
			height={height}
			ref={fixedListRef}
			width="100%"
			itemData={currencies}
			itemCount={currencies.length}
			itemSize={56}
			itemKey={itemKey}
		>
			{Row}
		</FixedSizeList>
	);
}
