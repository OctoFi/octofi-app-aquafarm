import React from "react";

import MetaMask from "../../assets/images/wallet/metamask.svg";
import WalletConnect from "../../assets/images/wallet/walletConnect.svg";
import Ledger from "../../assets/images/wallet/ledger.svg";
import Trezor from "../../assets/images/wallet/trezor.svg";
import Portis from "../../assets/images/wallet/portis.svg";
import Torus from "../../assets/images/wallet/torus.svg";
import Coinbase from "../../assets/images/wallet/coinbase.svg";
import TrustWallet from "../../assets/images/wallet/trustWallet.svg";
import Blank from "../../assets/images/wallet/blank.svg";
import styled from "styled-components";

const StyledImage = styled.img`
	width: 24px;
	height: 24px;

	@media (min-width: 1200px) {
		width: 24px;
		height: 24px;
	}
`;

const icon = (props) => {
	let Icon = null;
	switch (props.type) {
		case "injected":
		case "metamask": {
			Icon = MetaMask;
			break;
		}
		case "walletConnect": {
			Icon = WalletConnect;
			break;
		}
		case "ledger": {
			Icon = Ledger;
			break;
		}
		case "trezor": {
			Icon = Trezor;
			break;
		}
		case "trustWallet": {
			Icon = TrustWallet;
			break;
		}
		case "portis": {
			Icon = Portis;
			break;
		}
		case "torus": {
			Icon = Torus;
			break;
		}
		case "coinbase": {
			Icon = Coinbase;
			break;
		}
		case "coinbase_mobile": {
			Icon = Coinbase;
			break;
		}
		case "blank": {
			Icon = Blank;
			break;
		}
		default: {
			Icon = MetaMask;
		}
	}

	return <StyledImage src={Icon} alt={props.type} className={"provider__icon"} />;
};

export default icon;
