import { ETHER, Token } from "@uniswap/sdk";
import React, { useCallback } from "react";
import { FixedSizeList } from "react-window";
import { Text } from "rebass";
import styled from "styled-components";
import { useActiveWeb3React } from "../../hooks";
import { TYPE } from "../../theme";
import Column from "../Column";
import { RowBetween, RowFixed } from "../Row";
import Loader from "../Loader";
import useTheme from "../../hooks/useTheme";
import TokenLogo from "../CrossTokenLogo";
import getNetConfig from "../../config";
import { INITIAL_TOKENS_CONTEXT } from "../../contexts/Tokens";

const config = getNetConfig();

function currencyKey(currency) {
	return currency instanceof Token ? currency.address : currency === ETHER ? "ETHER" : "";
}

const StyledBalanceText = styled(Text)`
	white-space: nowrap;
	overflow: hidden;
	max-width: 5rem;
	text-overflow: ellipsis;
`;

function Balance({ balance }) {
	return <StyledBalanceText>{balance}</StyledBalanceText>;
}

const MenuItem = styled(RowBetween)`
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

function CurrencyRow({ currency, onSelect, urlAdded, userAdded, style }) {
	const { account } = useActiveWeb3React();
	return (
		<MenuItem style={style} className={`cross-token-item-${currency.symbol}`} onClick={onSelect}>
			<TokenLogo address={currency.symbol} size={"24px"} />
			<Column>
				<Text title={currency.name} fontWeight={500}>
					{currency.symbol}
				</Text>
				<TYPE.DarkGray ml="0px" fontSize={"12px"} fontWeight={300}>
					{currency.name} {userAdded && "• Added by user"}
					{urlAdded && "• Added by url"}
				</TYPE.DarkGray>
			</Column>
			<RowFixed style={{ justifySelf: "flex-end" }}>
				{currency.balance ? <Balance balance={currency.balance} /> : account ? <Loader /> : "-"}
			</RowFixed>
		</MenuItem>
	);
}

export default function CurrencyList({
	height,
	currencies,
	onCurrencySelect,
	showETH,
	urlAddedTokens,
	fixedListRef
}) {
	const { chainId } = useActiveWeb3React();
	const theme = useTheme();


	const Row = useCallback(
		({ data, index, style }) => {
			const currency = data[index];
			const address = currency.address;

			const urlAdded = urlAddedTokens && urlAddedTokens.hasOwnProperty(address);
			const customAdded =
				address !== config.symbol &&
				INITIAL_TOKENS_CONTEXT[chainId] &&
				!INITIAL_TOKENS_CONTEXT[chainId].hasOwnProperty(address) &&
				!urlAdded;

			if (!showETH && address === config.symbol) {
				return null;
			}

			const handleSelect = () => onCurrencySelect(address);

			return (
				<CurrencyRow
					style={style}
					currency={currency}
					urlAdded={urlAdded}
					userAdded={customAdded}
					onSelect={handleSelect}
				/>
			);
		},
		[
			chainId,
			onCurrencySelect,
			theme.text1,
		]
	);

	const itemKey = useCallback((index, data) => currencyKey(data[index]), []);

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
