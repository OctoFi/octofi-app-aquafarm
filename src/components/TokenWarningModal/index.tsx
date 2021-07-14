import { Token } from "@uniswap/sdk";
import { transparentize } from "polished";
import { Modal, Button, Form } from "react-bootstrap";
import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import { useActiveWeb3React } from "../../hooks";
import { useAllTokens } from "../../hooks/Tokens";
import { ExternalLink, TYPE } from "../../theme";
import { getEtherscanLink, shortenAddress } from "../../utils";
import CurrencyLogo from "../CurrencyLogo";
import { AutoRow } from "../Row";
import { AutoColumn } from "../Column";
import { AlertTriangle } from "react-feather";

const Wrapper = styled.div<{ error: boolean }>`
	background: ${({ theme }) => transparentize(0.6, theme.bg1)};
	padding: 0.75rem;
	border-radius: 0.42rem;
`;

const StyledWarningIcon = styled(AlertTriangle)`
	stroke: ${({ theme }) => theme.red1};
`;

const Title = styled.h3`
	font-size: 1.25rem;
	font-weight: 700;
`;

interface TokenWarningCardProps {
	token?: Token;
}

function TokenWarningCard({ token }: TokenWarningCardProps) {
	const { chainId } = useActiveWeb3React();

	const tokenSymbol = token?.symbol?.toLowerCase() ?? "";
	const tokenName = token?.name?.toLowerCase() ?? "";

	const allTokens = useAllTokens();

	const duplicateNameOrSymbol = useMemo(() => {
		if (!token || !chainId) return false;

		return Object.keys(allTokens).some((tokenAddress) => {
			const userToken = allTokens[tokenAddress];
			if (userToken.equals(token)) {
				return false;
			}
			return userToken.symbol?.toLowerCase() === tokenSymbol || userToken.name?.toLowerCase() === tokenName;
		});
	}, [token, chainId, allTokens, tokenSymbol, tokenName]);

	if (!token) return null;

	return (
		<Wrapper error={duplicateNameOrSymbol}>
			<AutoRow gap="6px">
				<AutoColumn gap="24px">
					<CurrencyLogo currency={token} size={16} />
					<div> </div>
				</AutoColumn>
				<AutoColumn gap="10px" justify="flex-start">
					<TYPE.Main>
						{token && token.name && token.symbol && token.name !== token.symbol
							? `${token.name} (${token.symbol})`
							: token.name || token.symbol}{" "}
					</TYPE.Main>
					{chainId && (
						<ExternalLink
							style={{ fontWeight: 400 }}
							href={getEtherscanLink(chainId, token.address, "token")}
						>
							<TYPE.Blue title={token.address}>
								{shortenAddress(token.address)} (View on Etherscan)
							</TYPE.Blue>
						</ExternalLink>
					)}
				</AutoColumn>
			</AutoRow>
		</Wrapper>
	);
}

export default function TokenWarningModal({
	isOpen,
	tokens,
	onConfirm,
}: {
	isOpen: boolean;
	tokens: Token[];
	onConfirm: () => void;
}) {
	const [understandChecked, setUnderstandChecked] = useState(false);
	const toggleUnderstand = useCallback(() => setUnderstandChecked((uc) => !uc), []);

	const handleDismiss = useCallback(() => null, []);
	return (
		<Modal show={isOpen} backdrop="static" centered={true} onHeight={handleDismiss}>
			<Modal.Header className={"px-5"}>
				<Modal.Title className={"d-flex align-items-center"}>
					<StyledWarningIcon />
					<Title className={"font-weight-bolder font-size-lg text-danger mb-0 ml-4"}>Token imported</Title>
				</Modal.Title>
			</Modal.Header>
			<Modal.Body className={"px-5"}>
				<p className={"text-danger font-weight-normal"}>
					Anyone can create an ERC20 token on Ethereum with <em>any</em> name, including creating fake
					versions of existing tokens and tokens that claim to represent projects that do not have a token.
				</p>
				<p className={"text-danger font-weight-normal"}>
					This interface can load arbitrary tokens by token addresses. Please take extra caution and do your
					research when interacting with arbitrary ERC20 tokens.
				</p>
				<p className={"text-danger font-weight-normal"}>
					If you purchase an arbitrary token, <strong>you may be unable to sell it back.</strong>
				</p>
				{tokens.map((token) => {
					return <TokenWarningCard key={token.address} token={token} />;
				})}

				<div className={"d-flex align-items-center justify-content-between pt-4 pb-2"}>
					<Form.Check
						custom
						type={"checkbox"}
						id={`understand-checkbox`}
						label={`I Understand`}
						checked={understandChecked}
						onChange={toggleUnderstand}
					/>
					<Button
						disabled={!understandChecked}
						className={"px-4 py-2 font-weight-bold"}
						onClick={onConfirm}
						variant={"danger"}
					>
						Continue
					</Button>
				</div>
			</Modal.Body>
		</Modal>
	);
}
