import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BigNumber } from "@0x/utils";
import styled from "styled-components";

import {
	getAaveCurrency,
	getAaveLoadingState,
	getAaveReservesGQLResponse,
	getAaveUserAccountData,
	getATokensData,
	getTokensPrice,
} from "../../../state/selectors";
import withBalance from "../../../components/hoc/withBalance";
import { useActiveWeb3React } from "../../../hooks";
import { setAaveCurrency } from "../../../state/aave/actions";
import { getKnownTokens, isWethToken } from "../../../utils/known_tokens";
import { formatTokenSymbol, tokenAmountInUnits } from "../../../utils/spot/tokens";
import { Protocol } from "../../../utils/aave/types";
import {
	startBorrowTokenSteps,
	startLendingTokenSteps,
	startRepayTokenSteps,
	startUnLendingTokenSteps,
} from "../../../state/spotUI/actions";
import CurrencyLogo from "../../../components/CurrencyLogo";
import Skeleton from "react-loading-skeleton";
import { StyledLink, TradeButton } from "../../../components/WalletCard/styleds";
import BootstrapTable from "react-bootstrap-table-next";
import ResponsiveTable from "../../../components/ResponsiveTable";
import BorrowTokenModal from "./BorrowTokenModal";
import RepayTokenModal from "./RepayTokenModal";
import { Token } from "@uniswap/sdk";
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
	font-weight: 500;
`;

const Name = styled.span`
	font-weight: 400;
	font-size: 0.875rem;
	color: ${({ theme }) => theme.text1};

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

const BorrowBalance = (props) => {
	const theme = useTheme();
	const [isEthState, setIsEthState] = useState(false);
	const [isHideZeroBalance, setIsHideZeroBalance] = useState(false);
	const [isStableCoin, setIsStableCoin] = useState(false);
	const { t } = useTranslation();
	const [isModalBorrowOpenState, setIsModalBorrowOpenState] = useState(false);
	const [isModalRepayOpenState, setIsModalRepayOpenState] = useState(false);
	const [isSubmittingState, setIsSubmittingState] = useState(false);
	const [aTokenDataState, setATokenDataState] = useState();
	const [isBorrowState, setIsBorrowState] = useState(true);
	const [tokenBalanceState, setTokenBalanceState] = useState();
	const [availableForBorrowState, setAvailableForBorrowState] = useState(new BigNumber(0));
	const [borrowBalanceState, setBorrowBalanceState] = useState(new BigNumber(0));
	const [sort, setSort] = useState({
		field: false,
		order: "desc",
	});

	const { account } = useActiveWeb3React();
	const reserves = useSelector(getAaveReservesGQLResponse);
	const userAccountData = useSelector(getAaveUserAccountData);
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

	const openBorrowModal = (...rest) => {
		const [tokenD, isEthToken, tokB, token, availableBalanceForBorrowToken] = rest;
		setATokenDataState(tokenD);
		setIsModalBorrowOpenState(true);
		if (isEthToken) {
			setIsEthState(true);
			setTokenBalanceState({ ...wethTokenBalance, balance: tokB });
		} else {
			setIsEthState(false);
			setTokenBalanceState(tokenBalances.find((tb) => tb.token === token));
		}
		setAvailableForBorrowState(availableBalanceForBorrowToken);
		setIsBorrowState(true);
	};

	const openRepayModal = (...rest) => {
		const [tokenD, isEthToken, tokB, token, borrowBalance] = rest;
		setATokenDataState(tokenD);
		if (isEthToken) {
			setIsEthState(true);
			setTokenBalanceState({ ...wethTokenBalance, balance: tokB });
		} else {
			setIsEthState(false);
			setTokenBalanceState(tokenBalances.find((tb) => tb.token === token));
		}
		setBorrowBalanceState(borrowBalance || new BigNumber(0));
		setIsModalRepayOpenState(true);
		setIsBorrowState(false);
	};

	const tokensRow = useMemo(() => {
		const data = aTokensData.map((tokenD) => {
			const { token, balance, borrowBalance } = tokenD;

			const { symbol } = token;
			const reserve = reserves.find((r) => r.aToken.id === tokenD.address);
			const isEthToken = isWethToken(token);
			const tokenBalance = tokenBalances.find((tb) => tb.token.symbol === symbol);
			if (isHideZeroBalance) {
				/* if ((isEthToken && ethTotalBalance.isEqualTo(0)) && (balance && balance.isEqualTo(0))) {
                     return null;
                 }*/

				if (borrowBalance && borrowBalance.isEqualTo(0)) {
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
			let displayAvailableForBorrowBalance;
			let displayBorrowedBalance;
			let availableForBorrow = new BigNumber(0);
			let availableBalanceForBorrowToken = new BigNumber(0);

			if (account && borrowBalance && reserve && userAccountData) {
				const priceInEth = reserve.price.priceInEth;
				const totalAvailableForBorrowETH = userAccountData.availableBorrowsETH;
				availableForBorrow = userAccountData.availableBorrowsETH;
				availableBalanceForBorrowToken = totalAvailableForBorrowETH
					.dividedBy(new BigNumber(priceInEth).div(new BigNumber(10).pow(token.decimals)))
					.integerValue(BigNumber.ROUND_DOWN);
				const formattedBorrowedBalance = tokenAmountInUnits(
					borrowBalance,
					token.decimals,
					token.displayDecimals
				);
				const formattedAvailableForBorrowBalance = tokenAmountInUnits(
					availableBalanceForBorrowToken,
					token.decimals,
					token.displayDecimals
				);
				const tokenPrice = tokensPrice && tokensPrice.find((t) => t.c_id === token.c_id);
				if (currencySelector === "NATIVE") {
					displayAvailableForBorrowBalance = Number(formattedAvailableForBorrowBalance);
					displayBorrowedBalance = Number(formattedBorrowedBalance);
				} else {
					displayAvailableForBorrowBalance = tokenPrice
						? tokenPrice.price_usd
								.multipliedBy(new BigNumber(formattedAvailableForBorrowBalance))
								.toNumber()
						: "-";
					displayBorrowedBalance = tokenPrice
						? tokenPrice.price_usd.multipliedBy(new BigNumber(formattedBorrowedBalance)).toNumber()
						: "-";
				}
			} else {
				displayAvailableForBorrowBalance = "-";
				displayBorrowedBalance = "-";
			}

			const apy = tokenD.variableBorrowRate.dividedBy("1e27").multipliedBy(100).toNumber();

			const tokenName = isEthToken ? "Ethereum" : token.name;
			const tokenSymbol = isEthToken ? "ETH" : token.symbol.toUpperCase();

			return {
				token,
				symbol,
				tokenSymbol,
				tokenName,
				displayAvailableForBorrowBalance,
				availableBalanceForBorrowToken,
				displayBorrowedBalance,
				availableForBorrow,
				borrowBalance,
				apy,
				balance,
				tokB,
				isEthToken,
				tokenD,
			};
		});

		return sortedData(data, sort);
	}, [aTokensData, sort]);


	const closeBorrowModal = () => {
		setIsModalBorrowOpenState(false);
	};
	const closeRepayModal = () => {
		setIsModalRepayOpenState(false);
	};

	const handleSubmit = async (amount, token, aToken, isEth) => {
		setIsSubmittingState(true);

		try {
			if (isBorrowState) {
				await dispatch(
					startBorrowTokenSteps(
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
				await dispatch(
					startRepayTokenSteps(
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
			}
		} finally {
			setIsSubmittingState(false);
			if (isBorrowState) {
				closeBorrowModal();
			} else {
				closeRepayModal();
			}
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
							<Symbol className={"font-weight-bold"}>{row.tokenSymbol}</Symbol>
							<Name className={"font-weight-bold"}>{row.tokenName}</Name>
						</div>
					</div>
				);
			},
			sort: true,
		},
		{
			dataField: "displayAvailableForBorrowBalance",
			text: t("borrow.available"),
			formatter: (cellContent, row, rowIndex) => {
				return <CellText>{typeof row.displayAvailableForBorrowBalance === 'number' ? `${row.displayAvailableForBorrowBalance} ${row.tokenSymbol}` : row.displayAvailableForBorrowBalance}</CellText>;
			},
			sort: true,
		},
		{
			dataField: "displayBorrowedBalance",
			text: t("borrow.borrowBalance"),
			formatter: (cellContent, row, rowIndex) => {
				return <CellText>{typeof row.displayBorrowedBalance === 'number' ? `${row.displayBorrowedBalance} ${row.tokenSymbol}` : row.displayBorrowedBalance}</CellText>;
			},
			sort: true,
		},
		{
			dataField: "apy",
			text: t("borrow.borrowRate"),
			formatter: (cellContent, row, rowIndex) => {
				return <CellText>{row.apy.toFixed(6)} %</CellText>;
			},
			sort: true,
		},
		{
			dataField: "actions",
			text: t("table.actions"),
			formatter: (cellContent, row, rowIndex, { openBorrowModal, openRepayModal }) => {
				const {
					tokB,
					tokenD,
					isEthToken,
					token,
					borrowBalance,
					availableBalanceForBorrowToken,
					availableForBorrow,
				} = row;
				return (
					<div
						className={
							"d-flex align-items-stretch justify-content-center flex-column flex-lg-row align-items-lg-center justify-content-lg-start w-100"
						}
					>
						<StyledLink>
							<TradeButton
								onClick={openBorrowModal.bind(
									this,
									tokenD,
									isEthToken,
									tokB,
									token,
									availableBalanceForBorrowToken
								)}
								disabled={availableForBorrow.isEqualTo(0) || !account}
							>
								{t("borrow.title")}
							</TradeButton>
						</StyledLink>

						<StyledLink>
							<TradeButton
								variant={theme.warning}
								onClick={openRepayModal.bind(this, tokenD, isEthToken, tokB, token, borrowBalance)}
								disabled={(borrowBalance && borrowBalance.isEqualTo(0)) || !account}
							>
								{t("repay")}
							</TradeButton>
						</StyledLink>
					</div>
				);
			},
			isAction: true,
			formatExtraData: {
				openBorrowModal,
				openRepayModal,
			},
		},
	];

	const modals = (
		<>
			{isModalBorrowOpenState && aTokenDataState && (
				<BorrowTokenModal
					show={isModalBorrowOpenState}
					tokenBalance={tokenBalanceState}
					isSubmitting={isSubmittingState}
					availableForBorrow={availableForBorrowState}
					onSubmit={handleSubmit}
					aToken={aTokenDataState}
					closeModal={closeBorrowModal}
					ethBalance={wethPlusEthBalance}
					isEth={isEthState}
					wethToken={wethToken}
				/>
			)}
			{isModalRepayOpenState && aTokenDataState && (
				<RepayTokenModal
					show={isModalRepayOpenState}
					tokenBalance={tokenBalanceState}
					isSubmitting={isSubmittingState}
					onSubmit={handleSubmit}
					borrowedBalance={borrowBalanceState}
					aToken={aTokenDataState}
					closeModal={closeRepayModal}
					ethBalance={wethPlusEthBalance}
					isEth={isEthState}
					wethToken={wethToken}
				/>
			)}
		</>
	);

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

			{modals}
		</div>
	);
};

export default withBalance(BorrowBalance);
