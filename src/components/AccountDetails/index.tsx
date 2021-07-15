import { Button } from "react-bootstrap";
import { SUPPORTED_WALLETS } from "../../connectors";
import { injected } from "../../connectors";
import { useActiveWeb3React } from "../../hooks";
import { shortenAddress } from "../../utils";
import Copy from "./Copy";
// import DisconnectAccount from "./DisconnectAccount";
import ViewOnExplorer from "./ViewOnExplorer";
import * as Styled from "./styleds";

interface AccountDetailsProps {
	ENSName?: string | null;
	onOpenOptions: () => void;
}

export default function AccountDetails({ ENSName, onOpenOptions }: AccountDetailsProps) {
	const { chainId, account, connector, deactivate } = useActiveWeb3React();

	// const onLogout = () => {
	// 	if (account) {
	// 		deactivate();
	// 	}
	// };

	function formatConnectorName() {
		const { ethereum } = window;
		const isMetaMask = !!(ethereum && ethereum.isMetaMask);
		const name = Object.keys(SUPPORTED_WALLETS)
			.filter(
				(k) =>
					SUPPORTED_WALLETS[k].connector === connector &&
					(connector !== injected || isMetaMask === (k === "metamask"))
			)
			.map((k) => SUPPORTED_WALLETS[k].name)[0];
		return <Styled.WalletName>Connected with {name}</Styled.WalletName>;
	}

	return (
		<Styled.UpperSection>
			<Styled.AccountSection>
				<Styled.AccountGroupingRow>{formatConnectorName()}</Styled.AccountGroupingRow>

				<Styled.AccountGroupingRow id="web3-account-identifier-row">
					<Styled.AccountControl>
						<Styled.AddressObject>
							<div className="symbol symbol-md mr-3">
								<Styled.ModifiedJazzicon address={account || ""} />
							</div>
							<Styled.WalletAddress>
								{ENSName || (account && shortenAddress(account))}
							</Styled.WalletAddress>
						</Styled.AddressObject>
					</Styled.AccountControl>
				</Styled.AccountGroupingRow>

				{account && (
					<Styled.AccountGroupingRow>
						<Styled.AccountControl>
							{chainId && <ViewOnExplorer address={ENSName ? ENSName : account} chainId={chainId} />}
							<Copy toCopy={account}>Copy Address</Copy>
							{/* <DisconnectAccount onLogout={onLogout} /> */}
						</Styled.AccountControl>
					</Styled.AccountGroupingRow>
				)}
			</Styled.AccountSection>

			<Styled.ChangeAccountContainer>
				<Button variant="outline-primary" className="d-block d-xl-none" onClick={onOpenOptions}>
					Change
				</Button>
			</Styled.ChangeAccountContainer>
		</Styled.UpperSection>
	);
}
