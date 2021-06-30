import styled from "styled-components";
import { Link } from "react-router-dom";
import { Token } from "@uniswap/sdk";

import Presales from "../../constants/presales.json";
import React, { useEffect, useMemo, useState } from "react";
import { useActiveWeb3React } from "../../hooks";
import { getContract } from "../../utils";
import { ERC20_ABI } from "../../constants/abis/erc20";
import BigNumber from "bignumber.js";
import { LAUNCHPAD_WETH_ADDRESS, LAUNCHPAD_WETH_TOKEN, ZERO } from "../../constants";
import Img from "../UI/Img";

const Wrapper = styled(Link)`
	width: 100%;
	border-radius: 18px;
	border: 1px solid ${({ theme }) => theme.text4};
	background-color: ${({ theme }) => theme.bg1};
	padding: 24px;
	display: flex;
	flex-direction: column;
	align-items: stretch;
	transition: 0.3s ease border-color;

	&:not(:last-child) {
		margin-bottom: 20px;
	}

	&:hover {
		border-color: ${({ theme }) => theme.primary};
    border-color: ${({ theme }) => theme.primary};  
		border-color: ${({ theme }) => theme.primary};
	}

	&:hover,
	&:focus,
	&:active {
		text-decoration: none;
		outline: none;
	}
`;

const Row = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8px 0;

	&:first-child {
		padding-top: 0;
	}

	&:last-child {
		padding-bottom: 0;
	}
`;

// const CenterRow = styled(Row)`
// 	justify-content: center;
// `;

// const StartDateText = styled.span`
// 	font-weight: 700;
// 	font-size: 0.75rem;
// 	color: ${({ theme }) => theme.text1};
// `;

const TokenName = styled.span`
	font-size: 1rem;
	font-weight: 700;
	color: ${({ theme }) => theme.text1};
`;

const Pair = styled.span`
	font-weight: 400;
	font-size: 0.75rem;
	color: ${({ theme }) => theme.text3};
`;

const LockDuration = styled.span`
	font-weight: 400;
	font-size: 0.75rem;
	color: ${({ theme }) => theme.text3};
`;

const Label = styled.span`
	font-size: 0.75rem;
	font-weight: 400;
	color: ${({ theme }) => theme.text3};
	display: flex;
	text-align: ${({ align }) => align || "center"};
`;

const Value = styled.span`
	font-size: 1rem;
	font-weight: 500;
	color: ${({ theme }) => theme.text1};
	display: flex;
	text-align: ${({ align }) => align || "center"};
`;

const ResultProgress = styled.div`
	background-color: ${({ theme }) => theme.primaryLight};
	height: 5px;
	border: none;
	width: 100%;
	border-radius: 20px;
`;

const ResultProgressBar = styled.div`
	background-color: ${({ theme }) => theme.primary};
	border-radius: 20px;
`;

const LogoContainer = styled.div`
	width: 32px;
	height: 32px;
	min-width: 32px;
	border-radius: 32px;
	margin-right: 12px;
	position: relative;
	overflow: hidden;
`;

const Logo = styled(Img)`
	width: 100%;
	height: 100%;
	border: 1px solid ${({ theme }) => theme.text1};
	border-radius: 320px;
`;


export const lockDurationMap = {
    '2678400': '1 Month',
    "2592000": "1 Month",
    '5356800': '2 Months',
    '8035200': '3 Months',
    '15552000': '6 Months',
    '15897600': '6 Months',
    '31536000': '1 Year',
    '9999999999': 'Max: 266 Years',
}

const LaunchpadCard = ({ address, presale }) => {
	const { chainId, library, account } = useActiveWeb3React();
	const [selectedToken, setSelectedToken] = useState(undefined);
	const [baseToken, setBaseToken] = useState(undefined);

	useEffect(() => {
		const getTokenInfo = async (address, contract) => {
			try {
				const decimals = await contract.decimals();
				const name = await contract.name();
				const symbol = await contract.symbol();

				return new Token(chainId, address, decimals, symbol, name);
			} catch (e) {
				return Promise.reject(e);
			}
		};

		if (presale?.token) {
			const tokenContract = getContract(presale?.token, ERC20_ABI, library, account);
			getTokenInfo(presale?.token, tokenContract)
				.then((res) => {
					setSelectedToken(res);
				})
				.catch((e) => {
					console.log(e);
				});
		}
		if (presale?.baseToken) {
			if (presale?.baseToken === LAUNCHPAD_WETH_ADDRESS) {
				setBaseToken(LAUNCHPAD_WETH_TOKEN);
			} else {
				const tokenContract = getContract(presale?.baseToken, ERC20_ABI, library, account);
				getTokenInfo(presale?.baseToken, tokenContract)
					.then((res) => {
						setBaseToken(res);
					})
					.catch((e) => {
						console.log(e);
					});
			}
		}
	}, [presale]);

	const maxSpend = useMemo(() => {
		if (presale?.spendLimit) {
			return new BigNumber(presale?.spendLimit?.toString() || 0).dividedBy(10 ** baseToken?.decimals).toString();
		}
		return 0;
	}, [presale, baseToken]);

	const softCap = useMemo(() => {
		if (presale?.softCap) {
			return new BigNumber(presale?.softCap?.toString() || 0).dividedBy(10 ** baseToken?.decimals).toString();
		}
		return 0;
	}, [presale, baseToken]);

	const lockDuration = useMemo(() => {
		if (presale?.lockPeriod) {
			return presale?.lockPeriod?.toString() || 0;
		}
		return 0;
	}, [presale]);

	const filledPercent = useMemo(() => {
		if (presale?.hardCap && presale?.status?.totalBaseCollected) {
			const hardCap = new BigNumber(presale?.hardCap?.toString() || 0).dividedBy(10 ** baseToken?.decimals);
			const totalBaseCollected = new BigNumber(presale?.status?.totalBaseCollected?.toString() || 0).dividedBy(
				10 ** baseToken?.decimals
			);

			if (hardCap.isEqualTo(ZERO)) {
				return 0;
			}

			return totalBaseCollected.dividedBy(hardCap).times(100).toFixed(0);
		}
		return 0;
	}, [presale, baseToken]);

	return (
		<Wrapper to={`/launchpad/${address}`}>
			<Row>
				<div className="d-flex align-items-center">
					<LogoContainer>
						<Logo src={Presales?.[address]?.iconURL} alt={selectedToken?.name} />
					</LogoContainer>
					<TokenName>{selectedToken?.name || "-"}</TokenName>
				</div>
				<span
					className={`label label-inline label-sm label-light-${
						presale?.state === 1
							? "primary"
							: presale?.state === 3
							? "danger"
							: presale?.state === 2
							? "success"
							: "warning"
					}`}
				>
					{presale?.state === 1
						? "Live"
						: presale?.state === 3
						? "Failed"
						: presale?.state === 2
						? "Success"
						: "Upcoming"}
				</span>
			</Row>
			<Row>
				<Pair>
					{baseToken?.symbol} / {selectedToken?.symbol}
				</Pair>
				<LockDuration>{lockDurationMap?.[lockDuration] || "-"} lock</LockDuration>
			</Row>
			<Row>
				<div className="d-flex flex-column align-items-start">
					<Label align={"left"}>Liquidity lock</Label>
					<Value align={"left"}>{Math.floor(Number(presale?.liquidityPercent?.toString() || 0) / 10)}%</Value>
				</div>
				<div className="d-flex flex-column align-items-center">
					<Label>Max spend</Label>
					<Value>
						{isNaN(maxSpend) ? "-" : maxSpend} {baseToken?.symbol || ""}
					</Value>
				</div>
				<div className="d-flex flex-column align-items-end">
					<Label align={"right"}>Soft cap</Label>
					<Value align={"right"}>
						{isNaN(softCap) ? "-" : softCap} {baseToken?.symbol || ""}
					</Value>
				</div>
			</Row>
			<Row>
				<ResultProgress className={`progress progress-xs w-100`}>
					<ResultProgressBar
						role="progressbar"
						aria-valuenow={filledPercent}
						aria-valuemin="0"
						aria-valuemax="100"
						style={{
							width: `${filledPercent}%`,
						}}
					/>
				</ResultProgress>
			</Row>
		</Wrapper>
	);
};

export default LaunchpadCard;
