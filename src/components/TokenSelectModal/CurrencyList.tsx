import { useCallback } from "react";
import { FixedSizeList } from "react-window";
import CoinDisplay from "../CoinDisplay";
import { RowBetween } from "../Row";
import styled from "styled-components";

export const MenuItem = styled(RowBetween)`
	padding: 0.5rem 1.5rem;
	cursor: ${({ disabled }) => !disabled && "pointer"};
	pointer-events: ${({ disabled }) => disabled && "none"};
	opacity: ${({ disabled, selected }) => (disabled || selected ? 0.5 : 1)};

	&:hover {
		background-color: ${({ theme, disabled }) => !disabled && theme.bg1};
	}
`;

export type CurrencyRowProps = {
	currency: any;
	onSelect: any;
	isSelected?: boolean;
	style: any;
};

export const CurrencyRow = ({ currency, onSelect, isSelected, style }: CurrencyRowProps) => {
	return (
		<MenuItem style={style} onClick={() => (isSelected ? null : onSelect())} disabled={isSelected}>
			<CoinDisplay name={currency.name} symbol={currency.symbol} image={currency.logoURI} />
		</MenuItem>
	);
};

export type CurrencyListProps = {
	height?: any;
	currencies?: any;
	selectedCurrency?: any;
	onCurrencySelect?: any;
	fixedListRef?: any;
};

const CurrencyList = ({ height, currencies, selectedCurrency, onCurrencySelect, fixedListRef }: CurrencyListProps) => {
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
};

export default CurrencyList;
