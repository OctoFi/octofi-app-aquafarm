import React, { useCallback } from "react";
import { FixedSizeList } from "react-window";
import { Text } from "rebass";
import styled from "styled-components";
import Column from "../Column";
import { RowBetween } from "../Row";

export const MenuItem = styled(RowBetween)`
	padding: 4px 20px;
	height: 56px;
	display: grid;
	grid-template-columns: auto minmax(auto, 1fr) auto;
	grid-gap: 16px;
	cursor: ${({ disabled }) => !disabled && "pointer"};
	pointer-events: ${({ disabled }) => disabled && "none"};
	:hover {
		background-color: ${({ theme, disabled }) => !disabled && theme.bg2};
	}
	opacity: ${({ disabled, selected }) => (disabled || selected ? 0.5 : 1)};
`;

const Logo = styled.img`
	width: ${({ size }) => (size ? `${size}px` : "24px")};
	height: ${({ size }) => (size ? `${size}px` : "24px")};
	border-radius: ${({ size }) => (size ? `${size}px` : "24px")};
	border: 2px solid ${({ theme }) => theme.text1};
	background-color: ${({ theme }) => theme.text1};
	margin-right: ${({ margin }) => (margin ? "8px" : 0)};

	@media (max-width: 1199px) {
		width: 24px;
		height: 24px;
	}
`;
const StyledBalanceText = styled(Text)`
	white-space: nowrap;
	overflow: hidden;
	max-width: 5rem;
	text-overflow: ellipsis;

	@media (max-width: 1199px) {
		font-size: 0.875rem;
		font-weight: 400;
	}
`;

const StyledText = styled(Text)`
	@media (max-width: 1199px) {
		font-size: 0.875rem;
		font-weight: 400;
	}
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
			<Logo src={currency.logoURI} size={24} alt={currency.symbol} />
			<Column>
				<StyledText title={currency.name} fontWeight={500}>
					{currency.symbol}
				</StyledText>
			</Column>

			<Column style={{ justifySelf: "flex-end" }}>
				<Symbol symbol={currency.name} />
			</Column>
		</MenuItem>
	);
}

export default function CurrencyList({ height, currencies, selectedCurrency, onCurrencySelect, fixedListRef }) {
	const Row = useCallback(
		({ data, index, style }) => {
			const currency = data[index];
			const handleSelect = () => onCurrencySelect(data[index]);
			const isSelected = selectedCurrency
				? selectedCurrency.address === currency.address && selectedCurrency.symbol === currency.symbol
				: false;
			return <CurrencyRow style={style} currency={currency} onSelect={handleSelect} isSelected={isSelected} />;
		},
		[onCurrencySelect, selectedCurrency]
	);

	const itemKey = useCallback((index, data) => {
		return data[index].address;
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
