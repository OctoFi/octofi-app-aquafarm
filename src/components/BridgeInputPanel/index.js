import React, {useState, useCallback} from "react";
import styled from "styled-components";
import CurrencySearchModal from "../BridgeCurrencySelectModal";
import { RowBetween } from "../Row";
import { ReactComponent as DropDown } from "../../assets/images/cross/dropdown.svg";

import { useActiveWeb3React } from "../../hooks";
import { useTranslation } from "react-i18next";
import {useAllTokenDetails } from "../../contexts/Tokens";
import TokenLogo from "../CrossTokenLogo";

const InputRow = styled.div`
	${({ theme }) => theme.flexRowNoWrap};
	align-items: center;
	padding: 0.75rem 0;
  
	@media (min-width: 992px) {
      	padding: 3px 0;
	}
  
  	@media(max-width: 380px) {
	  	flex-direction: column;
	  	align-items: stretch;
	  	
    }
`;

const CurrencyLogoContainer = styled.div`
	width: 32px;
 	height: 32px;
  
	@media (max-width: 991px) {
		width: 24px;
		height: 24px;
	}
`

const Label = styled.span`
	color: ${({ theme }) => theme.text1};
	font-weight: 400;
	font-size: 0.875rem;
	padding: 0;

	@media (min-width: 768px) {
		padding: 0 1.25rem;
	}
`;

const CurrencySelect = styled.button`
	align-items: center;
	height: 56px;
	font-size: 0.875rem;
	font-weight: 500;
	background-color: ${({ theme }) => theme.primaryLight};
	color: ${({ theme }) => theme.primary};
	border-radius: 18px;
	box-shadow: none;
	outline: none;
	cursor: pointer;
	user-select: none;
	border: none;
	min-width: 116px;
	width: 116px;
  	transition: 0.3s ease all;

	@media (min-width: 768px) {
		height: 80px;
		min-width: 178px;
		width: 178px;
		padding: 0.25rem 0.625rem;
		font-size: 1rem;
		font-weight: 500;
	}
  
	@media (min-width: 992px) {
		min-width: 255px;
		width: 255px;
		padding: 4px 1.5rem;
		font-size: 1rem;
		font-weight: 500;
	}
  
  


  	@media(max-width: 380px) {
	    width: 100%;
	}

	:focus,
	:hover {
		background-color: ${({ theme }) => theme.primary};
	    color: #202020;
		outline: none;
	}
`;

const LabelRow = styled.div`
	${({ theme }) => theme.flexRowNoWrap};
	align-items: center;
	color: ${({ theme }) => theme.text1};
	font-size: 0.75rem;
	line-height: 1rem;
	padding: 0;
`;

const InputContainer = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	flex-wrap: nowrap;
	flex: 1;
`;

const Aligner = styled.span`
	display: flex;
	align-items: center;
	justify-content: space-between;
  	text-align: left;
`;

const StyledDropDown = styled(DropDown)`
  	margin-top: 4px;
  	margin-left: 4px;
  	height: 24px;
  	width: 24px;
  
	@media (max-width: 991px) {
	  	margin-top: 0;
	}
  
	@media (max-width: 576px) {
		margin-left: 4px;
      	height: 16px;
      	width: 16px;
	}
`;


const InputPanel = styled.div`
	${({ theme }) => theme.flexColumnNoWrap};
	position: relative;
	z-index: 1;
	margin-bottom: ${({ withoutMargin }) => (withoutMargin ? "0.5rem" : "1rem")};

	@media (min-width: 768px) {
		margin-bottom: ${({ withoutMargin }) => (withoutMargin ? "0.5rem" : "1.75rem")};
	}
`;

const StyledTokenSymbol = styled.span`
	margin-right: auto;
  	padding-left: 0.875rem;
	font-size: 0.875rem;
  	line-height: 18px;
  	display: block;
  	margin-bottom: 3px;

	@media (min-width: 768px) {
      	padding-left: 1rem;
      	font-size: 1rem;
      	line-height: 21px;
	}
`;

const StyledTokenName = styled.span`
	margin-right: auto;
	padding-left: 0.875rem;
	font-size: 0.75rem;
  	line-height: 15px;
  	margin-bottom: 3px;
  	display: none;

	@media (min-width: 768px) {
		padding-left: 1rem;
      	font-size: 0.875rem;
      	line-height: 18px;
      display: block;
	}
`;

const StyledBalanceMax = styled.button`
	background-color: ${({ theme }) => theme.primaryLight};
	border: none;
	border-radius: 10px;
	font-size: 1rem;
	padding: 0.25rem 0.625rem;
	height: 32px;
	max-height: 32px;
	font-weight: 500;
	cursor: pointer;
	color: ${({ theme }) => theme.primary};
	position: absolute;
	bottom: calc(100% + 10px);
	right: 0;
	transition: all ease 0.3s;

	@media (min-width: 768px) {
		height: 40px;
		max-height: 40px;
		padding: 0.5rem;
		top: 8px;
		right: 8px;
	}

	:hover {
		background-color: ${({ theme }) => theme.primary};
		color: ${({ theme }) => theme.bg1};
	}

	:focus {
		outline: none;
	}
`;

const NumericalInput = styled.input`

  color: ${({ error, theme }) => (error ? theme.red1 : theme.text1)};
  width: 0;
  position: relative;
  font-family: inherit;
  outline: none;
  flex: 1 1 auto;
  background-color: ${({ theme }) => theme.bg1};
  text-align: ${({ align }) => align && align};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-appearance: textfield;
  border-radius: 18px;
  height: 56px;
  font-size: 1rem;
  font-weight: 500;
  padding: 1rem 20px;
  border: none;
  margin-right: 40px;

  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }

  [type="number"] {
    -moz-appearance: textfield;
  }

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  ::placeholder {
    color: ${({ theme }) => theme.text3};
  }
  
  @media (min-width: 768px) {
    padding-right: 4.5625rem;
  }
  
  @media (max-width: 767px) {
    margin-right: 24px;
  }
  
  @media (max-width: 576px) {
    margin-right: 16px;
  }

  @media(max-width: 380px) {
    margin-right: 0;
    margin-bottom: 12px;
  }
`

export default function BridgeInputPanel({
	value,
	onUserInput,
	onMax,
	showMaxButton,
	label = "Input",
	onCurrencySelect,
	currency,
	disableCurrencySelect = false,
	pair = null, // used for double token logo
	hideInput = false,
	otherCurrency,
	id,
	showCommonBases,
	withoutMargin = false,
	onValueChange = () => {},
	allBalances,
	renderInput,
	description,
	extraText,
	extraTextClickHander = () => {},
	errorMessage,
	disableUnlock,
	disableTokenSelect,
	selectedTokenAddress = '',
	showUnlock,
	urlAddedTokens,
	hideETH = false,
	isSelfSymbol,
	isSelfLogo,
	isSelfName,
	selfUseAllToken = [],
	isRange = false,
	tokenBalance = 0
}) {
	const { t } = useTranslation();

	const [modalIsOpen, setModalIsOpen] = useState(false)
	const [modalIsOpenTime, setModalIsOpenTime] = useState(1)
	const { account } = useActiveWeb3React();


	let allTokens = useAllTokenDetails()

	const handleDismissSearch = useCallback(() => {
		setModalIsOpen(false);
	}, [setModalIsOpen]);

	return (
		<InputPanel id={id} withoutMargin={withoutMargin}>
			<div>
				{!hideInput && (
					<LabelRow>
						<RowBetween>
							<Label>{label}</Label>
						</RowBetween>
					</LabelRow>
				)}
				<InputRow
					style={hideInput ? { padding: "0", borderRadius: "0.42rem" } : {}}
					selected={disableCurrencySelect}
				>
					{!hideInput && (
						<InputContainer>
							<NumericalInput
								type="number"
								min="0"
								step="0.000000000000000001"
								error={!!errorMessage}
								placeholder="0.0"
								value={isNaN(value) ? '' : value}
								onChange={e => {
									onUserInput(e.target.value)
								}}

								onKeyPress={e => {
									const charCode = e.which ? e.which : e.keyCode

									// Prevent 'minus' character
									if (charCode === 45) {
										e.preventDefault()
										e.stopPropagation()
									}
								}}
							/>
							{account && currency && showMaxButton && label !== "To" && (
								<StyledBalanceMax onClick={onMax}>{t("max")}</StyledBalanceMax>
							)}
						</InputContainer>
					)}
					<CurrencySelect
						selected={!!selectedTokenAddress}
						className="open-currency-select-button"
						onClick={() => {
							if (!disableTokenSelect) {
								if (modalIsOpenTime) {
									setModalIsOpenTime(0)
									setTimeout(() => {
										setModalIsOpenTime(1)
									}, 2000)
									setModalIsOpen(true)
								}
							}
						}}
					>
						<Aligner>
							{
								isSelfSymbol ? (
									<>
										{selectedTokenAddress && (
											isSelfLogo ?
												<CurrencyLogoContainer>
													<TokenLogo address={isSelfLogo} size={'100%'} />
												</CurrencyLogoContainer>
												:
												<CurrencyLogoContainer>
													<TokenLogo address={allTokens[selectedTokenAddress].symbol} size={'100%'} />
												</CurrencyLogoContainer>
										)}
										{
											isSelfSymbol ? (
												<div className="d-flex align-items-stretch flex-column flex-grow-1 text-align-left">
													<StyledTokenSymbol>{isSelfSymbol}</StyledTokenSymbol>
													<StyledTokenName>{isSelfName ? isSelfName : allTokens[selectedTokenAddress].name}</StyledTokenName>
												</div>
											) : (
												t('selectToken')
											)
										}
									</>
								) :  (
									<>
										{selectedTokenAddress && (
											<CurrencyLogoContainer>
												<TokenLogo address={allTokens[selectedTokenAddress] && allTokens[selectedTokenAddress].symbol ? allTokens[selectedTokenAddress].symbol : ''} size={'100%'} />
											</CurrencyLogoContainer>
										)}
										{
											allTokens[selectedTokenAddress] && allTokens[selectedTokenAddress].symbol ? (
												<div className="d-flex align-items-stretch flex-column flex-grow-1 text-align-left">
													<StyledTokenSymbol>{allTokens[selectedTokenAddress].symbol}</StyledTokenSymbol>
													<StyledTokenName>{allTokens[selectedTokenAddress].name}</StyledTokenName>
												</div>
											) : (
												t('selectToken')
											)
										}
									</>
								)
							}
							{!disableCurrencySelect && <StyledDropDown selected={!!currency} />}
						</Aligner>
					</CurrencySelect>
				</InputRow>
			</div>
			{!disableCurrencySelect && onCurrencySelect && (
				<CurrencySearchModal
					isOpen={modalIsOpen}
					onDismiss={handleDismissSearch}
					onTokenSelect={onCurrencySelect}
					selectedCurrency={currency}
					selfUseAllToken={selfUseAllToken}
					isSelfSymbol={isSelfSymbol}
					otherSelectedCurrency={otherCurrency}
					showCommonBases={showCommonBases}
				/>
			)}
		</InputPanel>
	);
}

