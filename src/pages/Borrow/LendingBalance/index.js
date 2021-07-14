import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BigNumber } from "@0x/utils";
import styled from "styled-components";
import { Token } from "@uniswap/sdk";

import { getAaveCurrency, getAaveLoadingState, getATokensData, getTokensPrice } from "../../../state/selectors";
import withBalance from "../../../components/hoc/withBalance";
import { useActiveWeb3React } from "../../../hooks";
import { setAaveCurrency } from "../../../state/aave/actions";
import { getKnownTokens, isWethToken } from "../../../utils/known_tokens";
import { tokenAmountInUnits } from "../../../utils/spot/tokens";
import { Protocol } from "../../../utils/aave/types";
import { startLendingTokenSteps, startUnLendingTokenSteps } from "../../../state/spotUI/actions";
import CurrencyLogo from "../../../components/CurrencyLogo";
import { StyledLink, TradeButton } from "../../../components/WalletCard/styleds";
import BootstrapTable from "react-bootstrap-table-next";
import ResponsiveTable from "../../../components/ResponsiveTable";
import LendingModalContainer from "./LendingModalContainer";
import { sortedData } from "../../../lib/helper";
import { useTranslation } from "react-i18next";
import useTheme from "../../../hooks/useTheme";

const LogoContainer = styled.div`
	width: 32px;
	height: 32px;
	border-radius: 32px;
	background-color: ${({ theme }) => theme.text1};

	@media (max-width: 991px) {
		width: 24px;
		height: 24px;
		border-radius: 24px;
	}
`;

const Symbol = styled.span`
	color: ${({ theme }) => theme.text1};
	font-size: 1rem;
	margin-right: 10px;
	font-weight: 700;
`;

const Name = styled.span`
	font-weight: 400;
	color: ${({ theme }) => theme.text1};
	font-size: 0.875rem;

	@media (max-width: 991px) {
		font-size: 0.875rem;
		font-weight: 400;
	}
`;

const CellText = styled.span`
	font-weight: 500;
	font-size: 0.875rem;
	color: ${({ theme }) => theme.text1};

	&.font-size-base {
		font-size: 1rem;
	}

	@media (max-width: 991px) {
		font-weight: 700;

		&.label {
			font-weight: 500;
		}
	}
`;

const LendingBalance = (props) => {
	const theme = useTheme();
	const [isEthState, setIsEthState] = useState(false);
	const [isHideZeroBalance, setIsHideZeroBalance] = useState(false);
	const [isStableCoin, setIsStableCoin] = useState(false);
	const [isModalOpenState, setIsModalOpenState] = useState(false);
	const [isSubmittingState, setIsSubmittingState] = useState(false);
	const [aTokenDataState, setATokenDataState] = useState();
	const [isLendingState, setIsLendingState] = useState(true);
	const [tokenBalanceState, setTokenBalanceState] = useState();
	const [sort, setSort] = useState({
		field: false,
		order: "desc",
	});
	const { t } = useTranslation();

	const { account } = useActiveWeb3React();
	const dispatch = useDispatch();
	const aTokensData = useSelector(getATokensData);
	const tokensPrice = useSelector(getTokensPrice);
	const tokenBalances = props.tokensBalance;
	const ethBalance = props.ethBalance;
	const ethTotalBalance = props.totalEthBalance;
	const wethTokenBalance = props.wethBalance;
	const aaveLoadingState = useSelector(getAaveLoadingState);
	const currencySelector = useSelector(getAaveCurrency);

	const innerTabs = [
		{
			active: currencySelector === "NATIVE",
			onClick: () => dispatch(setAaveCurrency("NATIVE")),
			text: "Native",
		},
		{
			active: currencySelector === "USD",
			onClick: () => dispatch(setAaveCurrency("USD")),
			text: "USD",
		},
	];

	const openLendingModal = (...rest) => {
		const [tokenD, isEthToken, tokB, token] = rest;
		setATokenDataState(tokenD);
		setIsModalOpenState(true);
		if (isEthToken) {
			setIsEthState(true);
			setTokenBalanceState({ ...wethTokenBalance, balance: tokB });
		} else {
			setIsEthState(false);
			setTokenBalanceState(tokenBalances.find((tb) => tb.token === token));
		}
		setIsLendingState(true);
	};

	const openUnLendingModal = (...rest) => {
		const [tokenD, isEthToken, tokB, token] = rest;
		setATokenDataState(tokenD);
		if (isEthToken) {
			setIsEthState(true);
			setTokenBalanceState({ ...wethTokenBalance, balance: tokB });
		} else {
			setIsEthState(false);
			setTokenBalanceState(tokenBalances.find((tb) => tb.token === token));
		}
		setIsModalOpenState(true);
		setIsLendingState(false);
	};

	const tokensRow = useMemo(() => {
		const data = aTokensData.map((tokenD) => {
			const { token, balance } = tokenD;

			const { symbol } = token;
			const isEthToken = isWethToken(token);
			const tokenBalance = tokenBalances.find((tb) => tb.token.symbol === symbol);
			if (isHideZeroBalance) {
				if (isEthToken && ethTotalBalance.isEqualTo(0) && balance && balance.isEqualTo(0)) {
					return null;
				}

				if (tokenBalance && tokenBalance.balance.isEqualTo(0) && balance && balance.isEqualTo(0)) {
					return null;
				}
			}
			if (isStableCoin) {
				if (!token.isStableCoin) {
					return null;
				}
			}

			const tokB = isEthToken
				? ethTotalBalance || new BigNumber(0)
				: (tokenBalance && tokenBalance.balance) || new BigNumber(0);
			let displayBalance;
			let displayDepositBalance;

			if (account && balance) {
				const formattedLendBalance = tokenAmountInUnits(balance, token.decimals, token.displayDecimals);
				const formattedBalance = tokenAmountInUnits(tokB, token.decimals, token.displayDecimals);
				const tokenPrice = tokensPrice && tokensPrice.find((t) => t.c_id === token.c_id);
				if (currencySelector === "NATIVE") {
					displayBalance = Number(formattedBalance);
					displayDepositBalance = Number(formattedLendBalance);
				} else {
					displayBalance = tokenPrice
						? tokenPrice.price_usd.multipliedBy(new BigNumber(formattedBalance)).toNumber()
						: "-";
					displayDepositBalance = tokenPrice
						? tokenPrice.price_usd.multipliedBy(new BigNumber(formattedLendBalance)).toNumber()
						: "-";
				}
			} else {
				displayBalance = "-";
				displayDepositBalance = "-";
			}

			const apy = tokenD.liquidityRate.dividedBy("1e27").multipliedBy(100).toNumber();

			const tokenName = isEthToken ? "Ethereum" : token.name;
			const tokenSymbol = isEthToken ? "ETH" : token.symbol.toUpperCase();

			return {
				token,
				symbol,
				tokenSymbol,
				tokenName,
				displayBalance,
				displayDepositBalance,
				apy,
				balance,
				tokB,
				isEthToken,
				tokenD,
			};
		});

		return sortedData(data, sort);
	}, [aTokensData, sort]);

	const closeModal = () => {
		setIsModalOpenState(false);
	};

	const handleSubmit = async (amount, token, aToken, isEth, isLending) => {
		setIsSubmittingState(true);

		try {
			if (isLending) {
				await dispatch(
					startLendingTokenSteps(
						amount,
						token,
						aToken,
						isEth,
						Protocol.Aave,
						ethBalance,
						wethTokenBalance,
						ethTotalBalance
					)
				);
			} else {
				await dispatch(startUnLendingTokenSteps(amount, token, aToken, isEth));
			}
		} finally {
			setIsSubmittingState(false);
			closeModal();
		}
	};

	const wethToken = getKnownTokens().getWethToken();
	const onHideZeroBalance = () => {
		setIsHideZeroBalance(!isHideZeroBalance);
	};
	const onIsStableCoin = () => {
		setIsStableCoin(!isStableCoin);
	};

	const wethPlusEthBalance = wethTokenBalance ? wethTokenBalance.balance.plus(ethBalance) : new BigNumber(0);

	const onTableChange = (type, context) => {
		if (type === "sort") {
			setSort({
				field: context.sortField,
				order: context.sortOrder,
			});
		}
	};

	const columns = [
		{
			dataField: "tokenName",
			text: t("token"),
			formatter: (cellContent, row, rowIndex) => {
				const currency = new Token(1, row.token.address, row.token.decimals, row.token.symbol, row.token.name);
				return (
					<div
						key={rowIndex}
						className="d-flex flex-row-reverse flex-lg-row align-items-start align-items-lg-center py-lg-2 pr-lg-4"
					>
						<LogoContainer>
							<CurrencyLogo currency={currency} />
						</LogoContainer>
						<div className="d-flex flex-column justify-content-center ml-lg-3 mr-3 mr-lg-0">
							<Symbol>{row.tokenSymbol}</Symbol>
							<Name>{row.tokenName}</Name>
						</div>
					</div>
				);
			},
			sort: true,
		},
		{
			dataField: "displayBalance",
			text: t("borrow.balance"),
			formatter: (cellContent, row, rowIndex) => {
				return (
					<CellText>
						{typeof row.displayBalance === "number"
							? `${row.displayBalance} ${row.tokenSymbol}`
							: row.displayBalance}
					</CellText>
				);
			},
			sort: true,
		},
		{
			dataField: "displayDepositBalance",
			text: t("borrow.depositBalance"),
			formatter: (cellContent, row, rowIndex) => {
				return (
					<CellText>
						{typeof row.displayDepositBalance === "number"
							? `${row.displayDepositBalance} ${row.tokenSymbol}`
							: row.displayDepositBalance}
					</CellText>
				);
			},
			sort: true,
		},
		{
			dataField: "apy",
			text: "APY",
			formatter: (cellContent, row, rowIndex) => {
				return <CellText>{row.apy.toFixed(6)} %</CellText>;
			},
			sort: true,
		},
		{
			dataField: "actions",
			text: t("table.actions"),
			formatter: (cellContent, row, rowIndex, { openLendingModal, openUnLendingModal }) => {
				const { balance, tokB, tokenD, isEthToken, token } = row;
				return (
					<div
						className={
							"d-flex align-items-stretch justify-content-center flex-column flex-lg-row align-items-lg-center justify-content-lg-start w-100"
						}
					>
						<StyledLink>
							<TradeButton
								onClick={openLendingModal.bind(this, tokenD, isEthToken, tokB, token)}
								disabled={tokB.isEqualTo(0)}
							>
								{t("deposit")}
							</TradeButton>
						</StyledLink>

						<StyledLink>
							<TradeButton
								variant={theme.warning}
								onClick={openUnLendingModal.bind(this, tokenD, isEthToken, tokB, token)}
								disabled={balance && balance.isEqualTo(0)}
							>
								{t("withdraw")}
							</TradeButton>
						</StyledLink>
					</div>
				);
			},
			isAction: true,
			formatExtraData: {
				openLendingModal,
				openUnLendingModal,
			},
		},
	];

	return (
		<div className="d-flex flex-column">
			<BootstrapTable
				wrapperClasses="table-responsive d-none d-lg-block"
				bordered={false}
				classes="table table-head-custom table-borderless table-vertical-center overflow-hidden borrow__table"
				bootstrap4
				remote
				keyField="id"
				data={tokensRow}
				columns={columns}
				onTableChange={onTableChange}
			></BootstrapTable>
			<ResponsiveTable breakpoint={"lg"} columns={columns} data={tokensRow} direction={"rtl"} />

			{isModalOpenState && aTokenDataState && (
				<LendingModalContainer
					show={isModalOpenState}
					tokenBalance={tokenBalanceState}
					isSubmitting={isSubmittingState}
					onSubmit={handleSubmit}
					aToken={aTokenDataState}
					closeModal={closeModal}
					ethBalance={wethPlusEthBalance}
					isEth={isEthState}
					wethToken={wethToken}
					isLending={isLendingState}
				/>
			)}
		</div>
	);
};

export default withBalance(LendingBalance);
