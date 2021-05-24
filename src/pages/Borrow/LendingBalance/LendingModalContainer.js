import React from "react";
import { Row, Col } from "react-bootstrap";
import { BigNumber } from "@0x/utils";
import styled, { ThemeContext } from "styled-components";

import { Modal } from "../../../components/Modal/bootstrap";
import { TX_DEFAULTS_TRANSFER } from "../../../constants";
import { tokenAmountInUnits, tokenSymbolToDisplayString } from "../../../utils/spot/tokens";
import BorrowInputPanel from "../../../components/BorrowInputPanel";
import { AutoColumn } from "../../../components/Column";
import { RowFixed } from "../../../components/Row";
import { Field } from "../../../state/swap/actions";
import { TYPE } from "../../../theme";
import { toast } from "react-hot-toast";
import { withTranslation } from "react-i18next";

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

class LendingModalContainer extends React.Component {
	static contextType = ThemeContext;
	state = {
		amount: null,
		error: {
			btnMsg: null,
			cardMsg: null,
		},
	};

	componentDidMount = () => {
		const { ethBalance, t } = this.props;
		if (ethBalance.isLessThan(TX_DEFAULTS_TRANSFER.gasTransferToken)) {
			toast.error(t("errors.notEnoughGas"));
			this.setState({
				error: {
					btnMsg: "Error",
					cardMsg: t("errors.notEnoughGas"),
				},
			});
		}
	};

	render() {
		const theme = this.context;
		const {
			tokenBalance,
			closeModal,
			ethBalance,
			isEth,
			wethToken,
			aToken,
			isLending,
			show,
			t,
			...restProps
		} = this.props;
		const { error, amount } = this.state;
		const { liquidityRate } = aToken;
		let coinSymbol;
		let maxBalance;
		let decimals;
		let displayDecimals;

		if (isEth) {
			displayDecimals = wethToken.displayDecimals;
			decimals = 18;
			maxBalance = isLending ? ethBalance : aToken.balance || new BigNumber(0);
			coinSymbol = tokenSymbolToDisplayString("ETH");
		} else if (tokenBalance) {
			const { token, balance } = tokenBalance;
			displayDecimals = token.displayDecimals;
			decimals = token.decimals;
			maxBalance = isLending ? balance : aToken.balance || new BigNumber(0);
			coinSymbol = tokenSymbolToDisplayString(token.symbol);
		} else {
			return null;
		}

		const { token } = tokenBalance;
		const btnPrefix = isLending ? "Deposit " : "Withdraw ";
		const balanceInUnits = tokenAmountInUnits(maxBalance, decimals, displayDecimals);
		const btnText = error && error.btnMsg ? "Error" : btnPrefix + coinSymbol;
		const isSubmitAllowed = amount === null || (amount && amount.isGreaterThan(maxBalance));

		return (
			<Modal show={show} onHide={closeModal} centered>
				<Modal.Body style={{ padding: 30 }}>
					<Row>
						<Col xs={12}>
							<Title>
								{isLending ? t("Deposit") : t("withdraw")} {coinSymbol}
							</Title>
						</Col>
						<Col xs={12}>
							<BorrowInputPanel
								decimals={decimals}
								min={0}
								max={maxBalance}
								onUserInput={this.updateAmount}
								value={amount}
								token={token}
								selected={coinSymbol}
								showBalance={false}
								label={isLending ? t("wantToDeposit") : t("wantToWithdraw")}
								placeholder={new BigNumber(1).div(new BigNumber(10).pow(displayDecimals)).toString()}
								valueFixedDecimals={displayDecimals}
							/>
						</Col>
						<Col xs={12} style={{ marginBottom: 56 }}>
							<AutoColumn>
								<SummaryRow>
									<RowFixed>
										<CustomTypeBlack fontWeight={500} color={theme.text1}>
											{t("interestAPR")}
										</CustomTypeBlack>
									</RowFixed>
									<RowFixed>
										<CustomTypeBlack color={theme.text1} fontWeight={500}>
											{liquidityRate.div("1e27").multipliedBy(100).toFixed(5)} %
										</CustomTypeBlack>
									</RowFixed>
								</SummaryRow>
								<SummaryRow>
									<RowFixed>
										<CustomTypeBlack fontWeight={500} color={theme.text1}>
											{t("amount")}
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
								className={`btn btn-${isLending ? "primary" : "warning"}`}
								disabled={isSubmitAllowed}
								onClick={this.submit}
							>
								{btnText}
							</StyledButton>
						</Col>
					</Row>
				</Modal.Body>
			</Modal>
		);
	}

	submit = async () => {
		const { tokenBalance, isEth, wethToken, aToken, isLending } = this.props;
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
		const amount = this.state.amount || new BigNumber(0);
		this.props.onSubmit(amount, token, aToken, isEth, isLending);
	};

	_reset = () => {
		this.setState({
			amount: null,
		});
	};

	_closeModal = () => {
		this._reset();
	};

	setMax = () => {
		const { tokenBalance, isEth, ethBalance, isLending, aToken } = this.props;
		if (isEth) {
			const maxBalance = isLending ? ethBalance : aToken.balance || new BigNumber(0);
			this.setState({
				amount: maxBalance,
			});
		} else if (tokenBalance) {
			this.setState({
				amount: isLending ? tokenBalance.balance : aToken.balance || new BigNumber(0),
			});
		}
	};

	updateAmount = (newValue) => {
		this.setState({
			amount: newValue,
		});
	};
}

export default withTranslation()(LendingModalContainer);
