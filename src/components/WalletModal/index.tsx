import { AbstractConnector } from "@web3-react/abstract-connector";
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { Row, Col, Form } from "react-bootstrap";
import React, { useEffect, useMemo, useState } from "react";
import { isMobile } from "react-device-detect";
import styled from "styled-components";
import { injected } from "../../connectors";
import usePrevious from "../../hooks/usePrevious";
import { ApplicationModal } from "../../state/application/actions";
import { useModalOpen, useWalletModalToggle } from "../../state/application/hooks";
import AccountDetails from "../AccountDetails";
import { SUPPORTED_WALLETS } from "../../connectors";
import LedgerPaths from "../../constants/ledgerPaths";
import { NetworkContextName } from "../../constants";

import { Modal } from "../Modal/bootstrap";
import Button from "../UI/Button";
import Option from "./Option";
import useENSName from "../../hooks/useENSName";
import { isTransactionRecent, useAllTransactions } from "../../state/transactions/hooks";
import { TransactionDetails } from "../../state/transactions/reducer";
import LedgerAccount from './LedgerAccounts';
import "./style.scss";

const { Check } = Form;

const Wrapper = styled.div`
	${({ theme }) => theme.flexColumnNoWrap};
	margin: 0;
	padding: 0;
	width: 100%;
`;

const HeaderRow = styled.div<{ empty?: boolean | undefined }>`
	${({ theme }) => theme.flexRowNoWrap};
	align-items: center;
	padding: 0.5rem 0 1rem;
	font-weight: 500;
	color: ${(props) => (props.color === "blue" ? ({ theme }) => theme.primary1 : "inherit")};

	@media (max-width: 1199px) {
		display: ${({ empty }) => (empty ? "none" : "block")};
		padding: 0.625rem 0 1.25rem;
	}
`;

const ContentWrapper = styled.div`
	background-color: ${({ theme }) => theme.modalBG};
	padding-bottom: 2rem;
	border-bottom-left-radius: 0.42rem;
	border-bottom-right-radius: 0.42rem;
`;

const LedgerContentWrapper = styled(ContentWrapper)`
	@media (max-width: 1199px) {
		padding: 24px 20px 112px;
	}
`;

const UpperSection = styled.div`
	position: relative;

	h5 {
		margin: 0;
		margin-bottom: 0.5rem;
		font-size: 1rem;
		font-weight: 400;
	}

	h5:last-child {
		margin-bottom: 0px;
	}

	h4 {
		margin-top: 0;
		font-weight: 500;
	}
`;

const OptionGrid = styled.div`
	display: grid;
	grid-gap: 10px;
`;

const WALLET_VIEWS = {
	OPTIONS: "options",
	OPTIONS_SECONDARY: "options_secondary",
	ACCOUNT: "account",
	PENDING: "pending",
	LEDGER_PATH: "ledger_select_path",
	LEDGER_ACCOUNT: "ledger_select_account"
};

// we want the latest one to come first, so return negative if a is after b
function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
	return b.addedTime - a.addedTime;
}

export default function WalletModal() {
	// important that these are destructed from the account-specific web3-react context
	const { active, account, connector, activate, error } = useWeb3React();
	const [selectedPath, setSelectedPath] = useState<string>(LedgerPaths[0].path);
	const [customPath, setCustomPath] = useState<string>("");
	const [selected, setSelected] = useState<string | undefined>(undefined);

	const { ENSName } = useENSName(account ?? undefined);

	const allTransactions = useAllTransactions();

	const contextNetwork = useWeb3React(NetworkContextName);

	const sortedRecentTransactions = useMemo(() => {
		const txs = Object.values(allTransactions);
		return txs.filter(isTransactionRecent).sort(newTransactionsFirst);
	}, [allTransactions]);

	const pendingTransactions = sortedRecentTransactions.filter((tx) => !tx.receipt).map((tx) => tx.hash);
	const confirmedTransactions = sortedRecentTransactions.filter((tx) => tx.receipt).map((tx) => tx.hash);

	const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT);

	const [pendingWallet, setPendingWallet] = useState<AbstractConnector | undefined>();
	const [isLedger, setIsLedger] = useState<boolean>(false);

	const [pendingError, setPendingError] = useState<boolean>();

	const walletModalOpen = useModalOpen(ApplicationModal.WALLET);
	const toggleWalletModal = useWalletModalToggle();

	const previousAccount = usePrevious(account);

	// close on connection, when logged out before
	useEffect(() => {
		if (account && !previousAccount && walletModalOpen && !isLedger) {
			toggleWalletModal();
		}
	}, [account, previousAccount, toggleWalletModal, walletModalOpen, isLedger]);

	// always reset to account view
	useEffect(() => {
		if (walletModalOpen) {
			setPendingError(false);
			setWalletView(WALLET_VIEWS.ACCOUNT);
		}
	}, [walletModalOpen]);

	// close modal when a connection is successful
	const activePrevious = usePrevious(active);
	const connectorPrevious = usePrevious(connector);
	useEffect(() => {
		if (
			walletModalOpen &&
			((active && !activePrevious) || (connector && connector !== connectorPrevious && !error))
		) {
			setWalletView(WALLET_VIEWS.ACCOUNT);
		}
	}, [setWalletView, active, error, connector, walletModalOpen, activePrevious, connectorPrevious]);

	if (!contextNetwork.active && !active) {
		return null;
	}

	const handleConnectLedger = () => {
		let path = selectedPath;
		if (path === "custom") {
			path = customPath;
		}

		const ledger = SUPPORTED_WALLETS.ledger;
		tryActivation(ledger.connector(path), true);
	};
	const tryActivation = async (connector: AbstractConnector | undefined, ledgerConnect = false) => {
		setIsLedger(ledgerConnect);
		Object.keys(SUPPORTED_WALLETS).map((key) => {
			if (connector === SUPPORTED_WALLETS[key].connector) {
				return SUPPORTED_WALLETS[key].name;
			}
			return true;
		});

		setPendingWallet(connector); // set wallet for pending view
		setWalletView(WALLET_VIEWS.PENDING);

		// if the connector is walletconnect and the user has already tried to connect, manually reset the connector
		if (connector instanceof WalletConnectConnector && connector.walletConnectProvider?.wc?.uri) {
			connector.walletConnectProvider = undefined;
		}

		connector &&
			activate(connector, undefined, true).then(res => {
				// if(ledgerConnect) {
					setWalletView(WALLET_VIEWS.LEDGER_ACCOUNT);
				// }
			}).catch((error) => {
				if (error instanceof UnsupportedChainIdError) {
					activate(connector); // a little janky...can't use setError because the connector isn't set
				} else {
					setPendingError(true);
				}
			});
	};

	// get wallets user can switch too, depending on device/browser
	function getOptions() {
		const isMetamask = window.ethereum && window.ethereum.isMetaMask;
		return Object.keys(SUPPORTED_WALLETS).map((key) => {
			const option = SUPPORTED_WALLETS[key];

			// check for mobile options
			if (isMobile) {
				if (!window.web3 && !window.ethereum && option.mobile) {
					return (
						<Option
							onClick={() => {
								setSelected(key);
								setPendingError(undefined);
								option.connector !== connector && !option.href && tryActivation(option.connector);
							}}
							id={`connect-${key}`}
							selected={selected}
							name={key}
							key={key}
							error={pendingError}
							active={option.connector && option.connector === connector}
							color={option.color}
							link={option.href}
							header={option.name}
							subheader={null}
							type={key}
						/>
					);
				}
				return null;
			}

			// overwrite injected when needed
			if (option.connector === injected) {
				// don't show injected if there's no injected provider
				if (!(window.web3 || window.ethereum)) {
					if (option.name === "MetaMask") {
						return (
							<Option
								id={`connect-${key}`}
								key={key}
								selected={selected}
								name={key}
								error={pendingError}
								color={"#E8831D"}
								header={"Install Metamask"}
								subheader={null}
								link={"https://metamask.io/"}
								type={"metamask"}
							/>
						);
					} else {
						return null; //dont want to return install twice
					}
				}
				// don't return metamask if injected provider isn't metamask
				else if (option.name === "MetaMask" && !isMetamask) {
					return null;
				}
				// likewise for generic
				else if (option.name === "Injected" && isMetamask) {
					return null;
				}
			}

			// return rest of options
			return (
				!isMobile &&
				!option.mobileOnly && (
					<Option
						id={`connect-${key}`}
						onClick={() => {
							setSelected(key);
							setPendingError(undefined);
							option.connector === connector
								? setWalletView(WALLET_VIEWS.ACCOUNT)
								: key === "ledger"
								? setWalletView(WALLET_VIEWS.LEDGER_PATH)
								: !option.href && tryActivation(option.connector);
						}}
						key={key}
						name={key}
						error={pendingError}
						selected={selected}
						active={option.connector === connector}
						color={option.color}
						link={option.href}
						header={option.name}
						subheader={null} //use option.descriptio to bring back multi-line
						type={key}
					/>
				)
			);
		});
	}

	function getModalContent() {
		if (error) {
			return (
				<UpperSection>
					<ContentWrapper>
						{error instanceof UnsupportedChainIdError ? (
							<h5>Please connect to the appropriate Ethereum network.</h5>
						) : (
							"Error connecting. Try refreshing the page."
						)}
					</ContentWrapper>
				</UpperSection>
			);
		}
		if (account && walletView === WALLET_VIEWS.ACCOUNT) {
			return (
				<AccountDetails
					toggleWalletModal={toggleWalletModal}
					pendingTransactions={pendingTransactions}
					confirmedTransactions={confirmedTransactions}
					ENSName={ENSName}
					openOptions={() => setWalletView(WALLET_VIEWS.OPTIONS)}
				/>
			);
		}
		if(walletView === WALLET_VIEWS.LEDGER_ACCOUNT) {
			return (
				<LedgerAccount
					onDone={() => {
						setWalletView(WALLET_VIEWS.ACCOUNT);
					}}
				/>
			)
		}

		if (walletView === WALLET_VIEWS.LEDGER_PATH) {
			return (
				<UpperSection>
					<LedgerContentWrapper>
						<Row className={"row-paddingless"}>
							{LedgerPaths.map((item, index) => {
								return (
									<Col xs={12} lg={4} md={6} key={`hd-path-${index}`}>
										<Check
											type={"radio"}
											id={`hd-path-${index}`}
											className={"d-flex align-items-center py-3"}
											custom
										>
											<Check.Input
												type={"radio"}
												name={"hd-path"}
												checked={item.path === selectedPath}
												onChange={() => setSelectedPath(item.path)}
											/>
											<Check.Label className={"d-flex flex-column pl-2 wallet-modal__label"}>
												<div className={"font-weight-bold mb-1"}>{item.path}</div>
												<div className={"font-size-sm"}>{item.label}</div>
											</Check.Label>
										</Check>
									</Col>
								);
							})}

							<Col xs={12} lg={4} md={6} key={`hd-path-custom`}>
								<Check
									type={"radio"}
									id={`hd-path-custom`}
									className={"d-flex align-items-center mb-3 pt-3 pt-xl-0"}
									custom
								>
									<Check.Input
										type={"radio"}
										name={"hd-path"}
										checked={selectedPath === "custom"}
										onChange={() => setSelectedPath("custom")}
									/>
									<Check.Label className={"d-flex flex-column pl-2 pt-1 wallet-modal__label"}>
										<div className={"font-weight-bold"}>Or Add Custom path</div>
									</Check.Label>
								</Check>
							</Col>
							{selectedPath === "custom" && (
								<Col xs={12}>
									<Form.Control
										placeholder={"m/44'/60'/0'/0"}
										onChange={(e) => setCustomPath(e.target.value)}
										value={customPath}
										className={"mb-3"}
									/>
								</Col>
							)}

							<Col xs={12} className={"d-flex flex-column flex-lg-row-reverse mt-5 mt-xl-4"}>
								<Button className={"ml-2"} onClick={handleConnectLedger}>
									Connect to Wallet
								</Button>
								<button
									className={"btn btn-link"}
									onClick={() => {
										setPendingError(false);
										setWalletView(WALLET_VIEWS.ACCOUNT);
										setSelected(undefined);
									}}
								>
									Cancel
								</button>
							</Col>
						</Row>
					</LedgerContentWrapper>
				</UpperSection>
			);
		}
		return (
			<UpperSection>
				{walletView === WALLET_VIEWS.ACCOUNT ? (
					<HeaderRow empty>&nbsp;</HeaderRow>
				) : pendingError ? (
					<HeaderRow>
						<span
							className={"text-danger wallet-modal__header"}
							onClick={() => {
								setPendingError(false);
								pendingWallet && tryActivation(pendingWallet, isLedger);
							}}
						>
							Try again
						</span>
					</HeaderRow>
				) : (
					<HeaderRow>
						<span
							className={"text-primary wallet-modal__header"}
							onClick={() => {
								setSelected(undefined);
								setPendingError(false);
								setWalletView(WALLET_VIEWS.ACCOUNT);
							}}
						>
							Cancel
						</span>
					</HeaderRow>
				)}
				<ContentWrapper>
					<OptionGrid>{getOptions()}</OptionGrid>
				</ContentWrapper>
			</UpperSection>
		);
	}

	return (
		<Modal
			show={walletModalOpen}
			onHide={() => {
				setPendingError(undefined);
				setPendingWallet(undefined);
				toggleWalletModal();
			}}
			dialogClassName={walletView !== WALLET_VIEWS.LEDGER_PATH ? "wallet-modal" : "wallet-modal--ledger"}
			backdropClassName={"backdrop"}
			size={"lg"}
			centered
		>
			<Modal.Header closeButton>
				{walletView === WALLET_VIEWS.LEDGER_PATH && (
					<button
						className={"btn btn-light-primary mr-4 d-none d-xl-block"}
						onClick={() => {
							setPendingError(false);
							setWalletView(WALLET_VIEWS.ACCOUNT);
							setSelected(undefined);
						}}
					>
						Back
					</button>
				)}
				<Modal.Title>
					{walletView === WALLET_VIEWS.LEDGER_PATH
						? "Select HD Derivation path"
						: walletView === WALLET_VIEWS.LEDGER_ACCOUNT
						? "Select Account"
						: account && walletView === WALLET_VIEWS.ACCOUNT
						? "Account"
						: "Connect to Wallet"}
				</Modal.Title>
				{account && walletView === WALLET_VIEWS.ACCOUNT && (
					<button
						className={"btn btn-outline-primary ml-auto mr-2 d-none d-xl-block"}
						onClick={() => {
							setWalletView(WALLET_VIEWS.OPTIONS);
						}}
					>
						Change
					</button>
				)}
			</Modal.Header>
			<Modal.Body>
				<Wrapper>{getModalContent()}</Wrapper>
			</Modal.Body>
		</Modal>
	);
}
