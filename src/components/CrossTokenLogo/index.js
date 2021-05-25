import React from "react";
import styled from "styled-components";

const ImageBox = styled.div`
	width: ${({ size }) => size};
	height: ${({ size }) => size};
	min-width: ${({ size }) => size};
	min-height: ${({ size }) => size};
	max-width: 100%;
	max-height: 100%;
	background-color: white;
	border-radius: ${({ size }) => size};
	border: 2px solid ${({ theme }) => theme.text1};
	overflow: hidden;
	color: ${({ theme }) => theme.primary};

	img {
		width: 100%;
		height: 100%;
		display: block;
	}
`;

const initPath = require("../../assets/images/question-mark.svg").default;

function getSourcePath(symbol) {
	let path = "";

	try {
		path = require("../../assets/images/coin/source/" + symbol + ".svg").default;
	} catch (error) {
		try {
			path = require("../../assets/images/coin/source/" + symbol + ".png").default;
		} catch (error) {
			path = initPath;
		}
	}
	return path;
}

function getAnyPath(symbol) {
	let path = "";
	try {
		path = require("../../assets/images/coin/any/" + symbol + ".svg").default;
	} catch (error) {
		try {
			path = require("../../assets/images/coin/any/" + symbol + ".png").default;
		} catch (error) {
			path = initPath;
		}
	}
	return path;
}

export default function TokenLogo({ address, size = "1rem", isAny = true, ...rest }) {
	let path = "";
	if (address) {
		if (isAny) {
			if (
				address.indexOf("a") === 0 &&
				address.indexOf("any") === -1 &&
				address.indexOf("acBTC") === -1 &&
				address.indexOf("aaBLOCK") === -1
			) {
				address = address.replace("a", "any");
				path = getAnyPath(address);
			} else if (address.indexOf("any") !== -1) {
				path = getAnyPath(address);
			} else {
				path = getSourcePath(address);
			}
		} else {
			address = address.replace("any", "").replace("a", "");
			path = getSourcePath(address);
		}
	} else {
		path = initPath;
	}

	return (
		<ImageBox {...rest} size={size}>
			<img src={path} alt={address} />
		</ImageBox>
	);
}
