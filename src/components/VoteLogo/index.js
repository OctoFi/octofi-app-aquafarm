import React from "react";
import styled from "styled-components";

import { useLogo } from "../../state/governance/hooks";

const Logo = styled.img`
	width: ${({ size }) => size}px;
	height: ${({ size }) => size}px;
	border-radius: ${({ size }) => size}px;
	box-shadow: 0 6px 10px rgba(0, 0, 0, 0.075);
	display: none;

	@media (min-width: 768px) {
		display: initial;
	}
`;

const VoteLogo = (props) => {
	const LogoURL = useLogo(props.id, props.symbolIndex);
	return <Logo src={LogoURL} size={props.size} />;
};

export default VoteLogo;
