import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { RowBetween } from "../Row";
import { Input as NumericalInput } from "../NumericalInput";
import { tokenAmountInUnits, unitsInTokenAmount } from "../../utils/spot/tokens";
import { ZERO } from "../../constants";
import { ETHER, Token } from "@uniswap/sdk";
import { useCurrencyBalance } from "../../state/wallet/hooks";
import { useActiveWeb3React } from "../../hooks";

const InputRow = styled.div`
	${({ theme }) => theme.flexRowNoWrap};
	align-items: center;

	padding: 0.625rem 0 0;

	@media (min-width: 768px) {
		padding-top: 0.75rem;
	}
`;

const Container = styled.div`
	display: flex;
	flex-direction: column;
	margin-bottom: 34px;

	@media (min-width: 768px) {
		margin-bottom: 15px;
	}
`;

const Label = styled.span`
	color: ${({ theme }) => theme.text1};
	font-size: 0.875rem;
	font-weight: 400;
	padding: 0;

	@media (min-width: 768px) {
		padding: 0 1rem;
		font-weight: 700;
	}
`;

const InputContainer = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	flex-wrap: nowrap;
	flex: 1;
`;

const LabelRow = styled.div`
	${({ theme }) => theme.flexRowNoWrap};
	align-items: center;
	color: ${({ theme }) => theme.text1};
	font-size: 0.75rem;
	line-height: 1rem;
	padding: 0;
`;

const Aligner = styled.span`
	display: flex;
	align-items: center;
	justify-content: center;

	@media (min-width: 768px) {
		justify-content: space-between;
	}
`;

const InputPanel = styled.div`
	${({ theme }) => theme.flexColumnNoWrap};
	position: relative;
	border-radius: 0.42rem;
`;

const StyledTokenName = styled.span`
	font-size: 0.875rem;
	font-weight: 500;

	@media (min-width: 768px) {
		font-size: 1rem;
		margin-right: auto;
	}
`;

const CurrencySelect = styled.button`
	align-items: center;
	height: 48px;
	font-size: 0.875rem;
	font-weight: 500;
	background-color: ${({ theme }) => theme.bg1};
	color: ${({ theme }) => theme.text1};
	border-bottom-left-radius: 18px;
	border-top-left-radius: 18px;
	box-shadow: none;
	outline: none;
	cursor: pointer;
	user-select: none;
	border: none;
	padding: 0.875rem 0.625rem;
	min-width: 116px;
	width: 116px;
	text-align: center;

	@media (min-width: 768px) {
		min-width: 90px;
		width: 90px;
		padding: 0.625rem 1rem;
		font-size: 1rem;
		font-weight: 700;
		text-align: left;
	}

	:focus,
	:hover {
		background-color: ${({ theme }) => theme.bg1};
		outline: none;
	}
`;

let BalanceRow = styled.div`
	${({ theme }) => theme.flexRowNoWrap};
	align-items: center;
	margin-top: 10px;
	color: ${({ theme }) => theme.text1};
	opacity: 0.5;
	font-size: 0.75rem;
	font-weight: 400;
	line-height: 1rem;
	padding: 0;

	@media (min-width: 768px) {
		padding: 0 1rem;
	}
`;

export default class SpotInputPanel extends React.Component {
	state = {
		valueStr: this.props.value
			? tokenAmountInUnits(this.props.value, this.props.decimals, this.props.valueFixedDecimals)
			: "",
	};

	_updateValue = (value) => {
		const newValue = unitsInTokenAmount(value || "0", this.props.decimals);
		const invalidValue = this.props.min && newValue.isLessThan(this.props.min);
		if (invalidValue) {
			return;
		}

		this.props.onUserInput(newValue);
		this.setState({
			valueStr: value,
		});
	};

	static getDerivedStateFromProps = (props, state) => {
		const { decimals, value, valueFixedDecimals } = props;
		const { valueStr } = state;

		if (!value) {
			return {
				valueStr: "",
			};
		} else if (value && !unitsInTokenAmount(valueStr || "0", decimals).eq(value)) {
			return {
				valueStr: tokenAmountInUnits(value, decimals, valueFixedDecimals),
			};
		} else {
			return null;
		}
	};

	render() {
		const {
			label = "Input",
			disable = false,
			selected,
			hideInput = false,
			id,
			showBalance = true,
			balanceText,
		} = this.props;
		const { valueStr } = this.state;

		return (
			<InputPanel id={id}>
				<Container>
					{!hideInput && (
						<LabelRow>
							<RowBetween>
								<Label>{label}</Label>
							</RowBetween>
						</LabelRow>
					)}
					<InputRow style={hideInput ? { padding: "0", borderRadius: "0.42rem" } : {}} selected={disable}>
						<CurrencySelect selected={!!selected} className="open-currency-select-button">
							<Aligner>
								<StyledTokenName className="token-symbol-container" active={Boolean(selected)}>
									{(selected && selected?.length > 20
										? (
												selected?.slice(0, 4) +
												"..." +
												selected?.slice(selected?.length - 5, selected?.length)
										  ).toUpperCase()
										: selected.toUpperCase()) || `Select`}
								</StyledTokenName>
							</Aligner>
						</CurrencySelect>

						{!hideInput && (
							<InputContainer>
								<NumericalInput
									size={"sm"}
									className="token-amount-input pl-3 "
									value={valueStr}
									onUserInput={this._updateValue}
								/>
							</InputContainer>
						)}
					</InputRow>
					{selected && showBalance && <BalanceRow>{balanceText()}</BalanceRow>}
				</Container>
			</InputPanel>
		);
	}
}
