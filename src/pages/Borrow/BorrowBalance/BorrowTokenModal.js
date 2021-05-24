import { Row, Col } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { BigNumber } from "@0x/utils";

import { Modal } from "../../../components/Modal/bootstrap";
import { TX_DEFAULTS_TRANSFER } from "../../../constants";
import { tokenAmountInUnits, tokenSymbolToDisplayString } from "../../../utils/spot/tokens";
import styled from "styled-components";
import BorrowInputPanel from "../../../components/BorrowInputPanel";
import { AutoColumn } from "../../../components/Column";
import { RowFixed } from "../../../components/Row";
import { TYPE } from "../../../theme";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import useTheme from "../../../hooks/useTheme";

const Title = styled.h4`
	font-size: 1.25rem;
	font-weight: 500;
	margin-top: 0;
	margin-bottom: 2.25rem;
`;

export const SummaryRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 1rem 0;
	border-bottom: 1px solid ${({ theme }) => theme.text3};
	font-size: 1rem;
	font-weight: 500;
`;

const CustomTypeBlack = styled(TYPE.Black)`
	font-size: 0.75rem;

	@media (min-width: 768px) {
		font-size: 1rem;
	}
`;

const StyledButton = styled.button`
	height: 56px;
	min-height: 56px;
	min-width: 250px;
`;

const BorrowTokenModal = (props) => {
	const {
		tokenBalance,
		closeModal,
		ethBalance,
		isEth,
		wethToken,
		aToken,
		availableForBorrow,
		show,
		...restProps
	} = props;
	const [error, setError] = useState({
		btnMsg: null,
		cardMsg: null,
	});
	const [amount, setAmount] = useState(new BigNumber(0));
	const { t } = useTranslation();

	const theme = useTheme();

	useEffect(() => {
		if (ethBalance.isLessThan(TX_DEFAULTS_TRANSFER.gasTransferToken)) {
			toast.error(t("errors.notEnoughGas"));
			setError({
				btnMsg: "Error",
				cardMsg: t("errors.notEnoughGas"),
			});
		}
	}, [ethBalance]);

	const { variableBorrowRate } = aToken;
	const { token } = tokenBalance;
	let coinSymbol;
	let maxBalance = availableForBorrow;
	let decimals;
	let displayDecimals;

	if (isEth) {
		displayDecimals = wethToken.displayDecimals;
		decimals = 18;
		coinSymbol = tokenSymbolToDisplayString("ETH");
	} else if (tokenBalance) {
		displayDecimals = token.displayDecimals;
		decimals = token.decimals;
		maxBalance = availableForBorrow;
		coinSymbol = tokenSymbolToDisplayString(token.symbol);
	} else {
		return null;
	}

	const btnPrefix = "Borrow ";
	const balanceInUnits = tokenAmountInUnits(maxBalance, decimals, displayDecimals);
	const btnText = error && error.btnMsg ? "Error" : btnPrefix + coinSymbol;
	const isSubmitAllowed = amount === null || (amount && amount.isGreaterThan(maxBalance));
	const onUpdateAmount = (newValue) => {
		setAmount(newValue);
	};
	const onSetMax = () => {
		setAmount(availableForBorrow);
	};
	const onSubmit = () => {
		let token;
		if (isEth) {
			token = {
				...wethToken,
				symbol: "ETH",
			};
		} else if (tokenBalance) {
			token = tokenBalance.token;
		} else {
			return null;
		}

		props.onSubmit(amount, token, aToken, isEth);
	};

	return (
		<Modal show={show} onHide={closeModal} centered>
			<Modal.Body style={{ padding: 30 }}>
				<Row>
					<Col xs={12}>
						<Title>
							{t("borrow.title")} {coinSymbol}
						</Title>
					</Col>
					<Col xs={12}>
						<BorrowInputPanel
							decimals={decimals}
							min={0}
							max={maxBalance}
							onUserInput={onUpdateAmount}
							value={amount}
							token={token}
							selected={coinSymbol}
							showBalance={false}
							label={t("wantToBorrow")}
							placeholder={new BigNumber(1).div(new BigNumber(10).pow(displayDecimals)).toString()}
							valueFixedDecimals={displayDecimals}
						/>
					</Col>
					<Col xs={12} style={{ marginBottom: 56 }}>
						<AutoColumn>
							<SummaryRow>
								<RowFixed>
									<CustomTypeBlack fontWeight={500} color={theme.text1}>
										{t("borrow.borrowRate")}
									</CustomTypeBlack>
								</RowFixed>
								<RowFixed>
									<CustomTypeBlack color={theme.text1} fontWeight={500}>
										{variableBorrowRate.div("1e27").multipliedBy(100).toFixed(5)} %
									</CustomTypeBlack>
								</RowFixed>
							</SummaryRow>
							<SummaryRow>
								<RowFixed>
									<CustomTypeBlack fontWeight={500} color={theme.text1}>
										{t("borrow.available")}
									</CustomTypeBlack>
								</RowFixed>
								<RowFixed>
									<CustomTypeBlack color={theme.text1} fontWeight={500}>
										{balanceInUnits}
									</CustomTypeBlack>
								</RowFixed>
							</SummaryRow>
						</AutoColumn>
					</Col>

					<Col
						xs={12}
						className={
							"d-flex align-items-stretch align-items-lg-center justify-content-center flex-column"
						}
					>
						<StyledButton
							className={`btn btn-${error && error.btnMsg ? "danger" : "primary"}`}
							disabled={isSubmitAllowed}
							onClick={onSubmit}
						>
							{btnText}
						</StyledButton>
					</Col>
				</Row>
			</Modal.Body>
		</Modal>
	);
};

export default BorrowTokenModal;
