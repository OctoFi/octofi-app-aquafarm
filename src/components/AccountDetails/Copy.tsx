import React from "react";
import styled from "styled-components";
import useCopyClipboard from "../../hooks/useCopyClipboard";

import { LinkStyledButton } from "../../theme";
import { CheckCircle } from "react-feather";
import SVG from "react-inlinesvg";

const CopyIcon = styled(LinkStyledButton)`
	color: ${({ theme }) => theme.text3};
	flex-shrink: 0;
	display: flex;
	text-decoration: none;
	font-size: 0.825rem;
	align-items: center;
	:hover,
	:active,
	:focus {
		text-decoration: none;
		color: ${({ theme }) => theme.text3};
	}

	@media (max-width: 1199px) {
		padding: 0;
	}
`;
const TransactionStatusText = styled.span<{ hasMargin?: boolean }>`
	font-size: 1rem;
	${({ theme }) => theme.flexRowNoWrap};
	align-items: center;
	padding-left: ${({ hasMargin }) => (hasMargin ? "10px" : "0")};

	@media (min-width: 1200px) {
		margin-left: 0.25rem;
	}
`;

export default function CopyHelper(props: { toCopy: string; children?: React.ReactNode }) {
	const [isCopied, setCopied] = useCopyClipboard();

	return (
		<CopyIcon onClick={() => setCopied(props.toCopy)}>
			{isCopied ? (
				<TransactionStatusText>
					<CheckCircle size={"24"} />
					<TransactionStatusText hasMargin>Copied</TransactionStatusText>
				</TransactionStatusText>
			) : (
				<TransactionStatusText>
					<SVG src={require("../../assets/images/account/copy.svg").default} />
				</TransactionStatusText>
			)}
			{isCopied ? "" : props.children}
		</CopyIcon>
	);
}
