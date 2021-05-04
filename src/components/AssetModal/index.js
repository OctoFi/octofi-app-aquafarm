import React from "react";
import { Modal } from "../Modal/bootstrap";
import { useSelector } from "react-redux";
import styled from "styled-components";
import SVG from "react-inlinesvg";

import AssetTable from "../AssetTable";

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

const AssetModal = (props) => {
	const overview = useSelector((state) => state.balances.overview);
	const asset = props.match.params.asset;

	const onHide = () => {
		props.history.push("/dashboard");
	};

	if (overview[asset] === undefined) {
		onHide();
	}

	let data = overview[asset] ? overview[asset].balances : [];

	return (
		<Modal size={"lg"} show={true} centered={true} className={"assets"} onHide={onHide}>
			<Modal.Header className={"d-flex align-items-center justify-content-between"}>
				<Modal.Title className={"mb-0 font-size-base"}>
					<CustomTitle>{overview[asset].title || "Assets"}</CustomTitle>
				</Modal.Title>

				<CloseButton onClick={onHide}>
					<SVG src={require("../../assets/images/global/close.svg").default} />
				</CloseButton>
			</Modal.Header>
			<Modal.Body className={"py-3"}>
				<AssetTable balances={data} />
			</Modal.Body>
		</Modal>
	);
};

export default AssetModal;
