import React from "react";

import Ethereum from "../../assets/images/networks/ethereumMainnet.svg";
import Avalanche from "../../assets/images/networks/avalanche.svg";
import BSC from "../../assets/images/networks/binanceSmartChain.svg";
import Fantom from "../../assets/images/networks/fantom.svg";
import Fusion from "../../assets/images/networks/fusion.svg";
import Huobi from "../../assets/images/networks/Huobi.svg";
import Optimism from "../../assets/images/networks/optimism.svg";
import Polygon from "../../assets/images/networks/polygonMainnet.svg";
import XDai from "../../assets/images/networks/xDai.svg";

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
		case "AVAX": {
			Icon = Avalanche;
			break;
		}
		case "xDAI": {
			Icon = XDai;
			break;
		}
		case "ETH": {
			Icon = Ethereum;
			break;
		}
		case "BNB": {
			Icon = BSC;
			break;
		}
		case "HT": {
			Icon = Huobi;
			break;
		}
		case "FTM": {
			Icon = Fantom;
			break;
		}
		case "FSN": {
			Icon = Fusion;
			break;
		}
		case "MATIC": {
			Icon = Polygon;
			break;
		}
		case "Optimism": {
			Icon = Optimism;
			break;
		}
		default: {
			Icon = Ethereum;
		}
	}

	return <StyledImage src={Icon} alt={props.type} className={"provider__icon"} />;
};

export default icon;
