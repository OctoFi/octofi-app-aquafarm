import React from "react";
import { Modal } from "../Modal/bootstrap";
import { useSelector } from "react-redux";

import styled from "styled-components";
import WalletTable from "../AssetTable/WalletTable";
import SVG from "react-inlinesvg";

const CustomTitle = styled.h4`
	color: ${({ theme }) => theme.text2};
	margin-bottom: 0;
	font-weight: 500;
	font-size: 1rem;

	@media (max-width: 1199px) {
		font-weight: 700;
	}
`;

const CloseButton = styled.button`
	width: 16px;
	height: 16px;
	border: none;
	background-color: transparent;
	color: ${({ theme }) => theme.text1};

	@media (max-width: 1199px) {
		display: none;
	}

	&:hover,
	&:active,
	&:focus {
		text-decoration: none;
		outline: none;
		border: none;
		box-shadow: none;
	}
`;

const WalletModal = (props) => {
	const overview = useSelector((state) => state.balances.overview);

	const onHide = () => {
		props.history.push("/dashboard");
	};

	if (overview.wallet === undefined) {
		onHide();
	}

	const onClickToken = (token) => {
		if (token.metadata.symbol === "ETH") {
			props.history.push("/coins/ethereum");
		} else {
			props.history.push(`/coins/${token.metadata.address}`);
		}
	};
	let data = overview.wallet.balances || [];

	return (
		<Modal size={"lg"} show={true} centered={true} className={"assets"} onHide={onHide}>
			<Modal.Header className={"d-flex align-items-center justify-content-between"}>
				<Modal.Title className={"mb-0 font-size-base"}>
					<CustomTitle>Wallet assets</CustomTitle>
				</Modal.Title>

				<CloseButton onClick={onHide}>
					<SVG src={require("../../assets/images/global/close.svg").default} />
				</CloseButton>
			</Modal.Header>
			<Modal.Body className={"py-3"}>
				<WalletTable balances={data} onClickToken={onClickToken} />
			</Modal.Body>
		</Modal>
	);
};

export default WalletModal;
