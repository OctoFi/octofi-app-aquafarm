import { ChainId } from "@uniswap/sdk";
import React, { useContext } from "react";
import styled, { ThemeContext } from "styled-components";
import Modal from "../Modal";
import { ExternalLink } from "../../theme";
import { Text } from "rebass";
import { CloseIcon } from "../../theme/components";
import { RowBetween } from "../Row";
import { AlertTriangle, ArrowUpCircle } from "react-feather";
import { ButtonPrimary } from "../Button";
import { AutoColumn, ColumnCenter } from "../Column";
import Loading from "../Loading";
import Button from "../UI/Button";

import { getEtherscanLink } from "../../utils";
import { useActiveWeb3React } from "../../hooks";
import useTheme from "../../hooks/useTheme";
import { useTranslation } from "react-i18next";

const Wrapper = styled.div`
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
`;
const Section = styled(AutoColumn)`
	padding: 30px;
`;

const BottomSection = styled(Section)`
	background-color: ${({ theme }) => theme.bg1};
	border-bottom-left-radius: 20px;
	border-bottom-right-radius: 20px;
	flex: 1;

	@media (max-width: 1199px) {
		border-radius: 0;
	}
`;

const ConfirmedIcon = styled(ColumnCenter)`
	padding: 60px 0;
`;

export function ConfirmationPendingContent({ onDismiss, pendingText }: { onDismiss: () => void; pendingText: string }) {
	const theme = useTheme();
	const { t } = useTranslation();
	return (
		<Wrapper>
			<Section>
				<RowBetween>
					<div />
					<CloseIcon onClick={onDismiss} />
				</RowBetween>
				<ConfirmedIcon>
					<Loading width={90} height={90} id={"confirmation_pending"} active />
				</ConfirmedIcon>
				<AutoColumn gap="12px" justify={"center"}>
					<Text fontWeight={500} fontSize={20}>
						{t("waitingForConfirmation")}
					</Text>
					<AutoColumn gap="12px" justify={"center"}>
						<Text fontWeight={600} fontSize={14} color="" textAlign="center">
							{pendingText}
						</Text>
					</AutoColumn>
					<Text fontSize={12} color={theme.text2} textAlign="center">
						{t("confirmMessage")}
					</Text>
				</AutoColumn>
			</Section>
		</Wrapper>
	);
}

export function TransactionSubmittedContent({
	onDismiss,
	chainId,
	hash,
}: {
	onDismiss: () => void;
	hash: string | undefined;
	chainId: ChainId | undefined;
}) {
	const theme = useContext(ThemeContext);
	const { t } = useTranslation();

	return (
		<Wrapper>
			<Section>
				<RowBetween>
					<div />
					<CloseIcon onClick={onDismiss} />
				</RowBetween>
				<ConfirmedIcon>
					<ArrowUpCircle strokeWidth={0.5} size={90} color={theme.primary} />
				</ConfirmedIcon>
				<AutoColumn gap="12px" justify={"center"}>
					<Text fontWeight={500} fontSize={20}>
						{t("txnSubmitted")}
					</Text>
					{chainId && hash && (
						<ExternalLink href={getEtherscanLink(chainId, hash, "transaction")}>
							<Text fontWeight={500} fontSize={14} color={theme.primary}>
								{t("viewOnEtherscan")}
							</Text>
						</ExternalLink>
					)}
					<Button onClick={onDismiss} style={{ margin: "20px 0 0 0" }} className={"btn-block"}>
						{t("close")}
					</Button>
				</AutoColumn>
			</Section>
		</Wrapper>
	);
}

export function ConfirmationModalContent({
	title,
	bottomContent,
	onDismiss,
	topContent,
}: {
	title: string;
	onDismiss: () => void;
	topContent: () => React.ReactNode;
	bottomContent: () => React.ReactNode;
}) {
	return (
		<Wrapper>
			<Section>
				<RowBetween>
					<Text fontWeight={500} fontSize={20}>
						{title}
					</Text>
					<CloseIcon onClick={onDismiss} className={"d-none d-xl-flex"} />
				</RowBetween>
				{topContent()}
			</Section>
			<BottomSection gap="12px">{bottomContent()}</BottomSection>
		</Wrapper>
	);
}

export function TransactionErrorContent({ message, onDismiss }: { message: string; onDismiss: () => void }) {
	const theme = useContext(ThemeContext);
	const { t } = useTranslation();
	return (
		<Wrapper>
			<Section>
				<RowBetween>
					<Text fontWeight={500} fontSize={20}>
						{t("error")}
					</Text>
					<CloseIcon onClick={onDismiss} />
				</RowBetween>
				<AutoColumn style={{ marginTop: 20, padding: "2rem 0" }} gap="24px" justify="center">
					<AlertTriangle color={theme.red1} style={{ strokeWidth: 1.5 }} size={64} />
					<Text
						fontWeight={500}
						fontSize={16}
						color={theme.red1}
						style={{ textAlign: "center", width: "85%" }}
					>
						{message}
					</Text>
				</AutoColumn>
			</Section>
			<BottomSection gap="12px">
				<ButtonPrimary onClick={onDismiss}>{t("dismiss")}</ButtonPrimary>
			</BottomSection>
		</Wrapper>
	);
}

interface ConfirmationModalProps {
	isOpen: boolean;
	onDismiss: () => void;
	hash: string | undefined;
	content: () => React.ReactNode;
	attemptingTxn: boolean;
	pendingText: string;
}

export default function TransactionConfirmationModal({
	isOpen,
	onDismiss,
	attemptingTxn,
	hash,
	pendingText,
	content,
}: ConfirmationModalProps) {
	const { chainId } = useActiveWeb3React();

	if (!chainId) return null;

	// confirmation screen
	return (
		<Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
			{attemptingTxn ? (
				<ConfirmationPendingContent onDismiss={onDismiss} pendingText={pendingText} />
			) : hash ? (
				<TransactionSubmittedContent chainId={chainId} hash={hash} onDismiss={onDismiss} />
			) : (
				content()
			)}
		</Modal>
	);
}
