import React, { useMemo } from "react";
import { Currency, ETHER, Token } from "@uniswap/sdk";
import styled from "styled-components";

import EthereumLogo from "../../assets/images/ethereum-logo.png";
import useHttpLocations from "../../hooks/useHttpLocations";
import { WrappedTokenInfo } from "../../state/lists/hooks";
import Logo from "../TokenLogo";

const getTokenLogoURL = (address: string) =>
	`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`;

const StyledEthereumLogo = styled.img<{ size: number | string }>`
	border-radius: ${({ size }) => `${size}px` || "100%"};
	color: ${({ theme }) => theme.text1};
	width: ${({ size }) => `${size}px` || "100%"};
	height: ${({ size }) => `${size}px` || "100%"};
`;

const StyledTokenLogo = styled(Logo)<{ size: number | string }>`
	border-radius: ${({ size }) => `${size}px` || "100%"};
	color: ${({ theme }) => theme.text1};
	width: ${({ size }) => `${size}px` || "100%"};
	height: ${({ size }) => `${size}px` || "100%"};
`;

export type CurrencyLogoProps = {
	currency?: Currency;
	size?: number | string;
	style?: React.CSSProperties;
};

export default function CurrencyLogo({ currency, size = 32, style }: CurrencyLogoProps) {
	const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined);

	const srcs: string[] = useMemo(() => {
		if (currency === ETHER) return [];

		if (currency instanceof Token) {
			if (currency instanceof WrappedTokenInfo) {
				return [...uriLocations, getTokenLogoURL(currency.address)];
			}

			return [getTokenLogoURL(currency.address)];
		}
		return [];
	}, [currency, uriLocations]);

	if (currency === ETHER) {
		return <StyledEthereumLogo src={EthereumLogo} size={size} style={style} />;
	}

	return <StyledTokenLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? "token"} logo`} style={style} />;
}
