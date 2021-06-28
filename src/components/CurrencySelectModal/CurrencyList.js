import React, {useCallback, useMemo} from "react";
import { FixedSizeList } from "react-window";
import { Text } from "rebass";
import styled from "styled-components";
import Column from "../Column";
import { RowBetween } from "../Row";
import EUR from "../../assets/images/currencies/EU.svg";
import dompurify from "dompurify";

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

const Logo = styled.img`
	width: ${({ size }) => (size ? `${size}px` : "24px")};
	height: ${({ size }) => (size ? `${size}px` : "24px")};
	border-radius: ${({ size }) => (size ? `${size}px` : "24px")};
	box-shadow: 0 6px 10px rgba(0, 0, 0, 0.075);
	margin-right: ${({ margin }) => (margin ? "8px" : 0)};
`;
const LogoDiv = styled.div`
	width: ${({ size }) => (size ? `${size}px` : "24px")};
	height: ${({ size }) => (size ? `${size}px` : "24px")};
	border-radius: ${({ size }) => (size ? `${size}px` : "24px")};
	box-shadow: 0 6px 10px rgba(0, 0, 0, 0.075);
	margin-right: ${({ margin }) => (margin ? "8px" : 0)};
	display: flex;
	align-items: center;
	justify-content: center;

	& svg {
		width: 24px;
		height: 24px;
		border-radius: 24px;
	}
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

	const iconHTML = useMemo(() => {
		if('icon' in currency) {
			return dompurify.sanitize(currency.icon.replace(/linearGradient-/gi, `linearGradient-${currency.symbol}-`));
		}

		return '';
	}, [currency])

	return (
		<MenuItem
			style={style}
			className={`token-item-${currency.symbol}`}
			onClick={() => (isSelected ? null : onSelect())}
			disabled={isSelected}
		>
			{currency.symbol === "EUR" ? (
				<Logo src={EUR} alt={currency.symbol} />
			) : currency.hasOwnProperty("image") ? (
				<Logo src={currency.image.small} alt={currency.symbol} />
			) : (
				<LogoDiv
					dangerouslySetInnerHTML={{
						__html: iconHTML,
					}}
				/>
			)}
			<Column>
				<Text title={currency.name} fontWeight={500}>
					{currency.name}
				</Text>
			</Column>

			<Column style={{ justifySelf: "flex-end" }}>
				<Symbol symbol={currency.symbol} />
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
