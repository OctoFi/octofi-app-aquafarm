import React, { CSSProperties } from "react";
import { Token } from "@uniswap/sdk";
import { AutoRow, RowFixed } from "../Row";
import { AutoColumn } from "../Column";
import CurrencyLogo from "../CurrencyLogo";
import { TYPE } from "../../theme";
import ListLogo from "../ListLogo";
import { useActiveWeb3React } from "../../hooks";
import { useCombinedInactiveList } from "../../state/lists/hooks";
import useTheme from "../../hooks/useTheme";
import { Button } from "react-bootstrap";
import styled from "styled-components";
import { useIsUserAddedToken, useIsTokenActive } from "../../hooks/Tokens";
import { CheckCircle } from "react-feather";

const TokenSection = styled.div<{ dim?: boolean }>`
	padding: 4px 20px;
	height: 56px;
	display: grid;
	grid-template-columns: auto minmax(auto, 1fr) auto;
	grid-gap: 16px;
	align-items: center;

	opacity: ${({ dim }) => (dim ? "0.6" : "1")};
`;

const CheckIcon = styled(CheckCircle)`
	height: 16px;
	width: 16px;
	margin-right: 6px;
	stroke: ${({ theme }) => theme.green1};
`;

const NameOverflow = styled.div`
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 140px;
	font-size: 12px;
`;

export default function ImportRow({
	token,
	style,
	dim,
	showImportView,
	setImportToken,
}: {
	token: Token;
	style?: CSSProperties;
	dim?: boolean;
	showImportView: () => void;
	setImportToken: (token: Token) => void;
}) {
	// gloabls
	const { chainId } = useActiveWeb3React();
	const theme = useTheme();

	// check if token comes from list
	const inactiveTokenList = useCombinedInactiveList();
	const list = chainId && inactiveTokenList?.[chainId]?.[token.address]?.list;

	// check if already active on list or local storage tokens
	const isAdded = useIsUserAddedToken(token);
	const isActive = useIsTokenActive(token);

	return (
		<TokenSection style={style}>
			<CurrencyLogo currency={token} size={24} style={{ opacity: dim ? "0.6" : "1" }} />
			<AutoColumn gap="4px" style={{ opacity: dim ? "0.6" : "1" }}>
				<AutoRow>
					<TYPE.Body fontWeight={500}>{token.symbol}</TYPE.Body>
					<TYPE.DarkGray ml="8px" fontWeight={300}>
						<NameOverflow title={token.name}>{token.name}</NameOverflow>
					</TYPE.DarkGray>
				</AutoRow>
				{list && list.logoURI && (
					<RowFixed>
						<TYPE.Small mr="4px" color={theme.text2}>
							via {list.name}
						</TYPE.Small>
						<ListLogo logoURI={list.logoURI} size="12px" />
					</RowFixed>
				)}
			</AutoColumn>
			{!isActive && !isAdded ? (
				<Button
					variant={"light-primary"}
					size={"sm"}
					onClick={() => {
						setImportToken && setImportToken(token);
						showImportView();
					}}
				>
					Import
				</Button>
			) : (
				<RowFixed style={{ minWidth: "fit-content" }}>
					<CheckIcon />
					<TYPE.Main color={theme.green1}>Active</TYPE.Main>
				</RowFixed>
			)}
			{/* </RowBetween> */}
		</TokenSection>
	);
}
