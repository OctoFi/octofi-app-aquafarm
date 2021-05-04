import React from 'react'
import styled from 'styled-components'
import { Button as BS } from 'react-bootstrap';

import {Modal} from '../Modal/bootstrap'
import TokenLogo from '../CrossTokenLogo'
import PathIcon from '../../assets/images/icon/path.svg'
import { useTranslation } from 'react-i18next'

const Button = styled(BS)`
	height: 48px;
  min-height: 48px;
  min-width: 125px;
`


const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  margin: 0;
  padding: 0;
  width: 100%;
  background-color: ${({ theme }) => theme.backgroundColor};
`

const HeaderRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  padding: 1.5rem 1.5rem;
  font-weight: 500;
  color: ${props => (props.color === 'blue' ? ({ theme }) => theme.primary : 'inherit')};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`
const HoverText = styled.div`
  :hover {
    cursor: pointer;
  }
`

const ContentWrapper = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.backgroundColor};
  padding: 2rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 1rem`};
`

const UpperSection = styled.div`
  position: relative;
  width: 100%;

  h5 {
    margin: 0 0 0.5rem;
    font-size: 1rem;
    font-weight: 400;
  }

  h5:last-child {
    margin-bottom: 0px;
  }

  h4 {
    margin-top: 0;
    font-weight: 500;
  }
`

const LogoBox = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  width: 46px;
  height: 46px;
  object-fit: contain;
  box-shadow: 0 0.125rem 0.25rem 0 rgba(0, 0, 0, 0.04);
  border: solid 0.5px rgba(0, 0, 0, 0.1);
  border-radius:100%;
  margin: auto;

  img{
    height: 24px;
    width: 24px;
    display:block;
  }
`

const ErrorTip = styled.div`
  text-align:center;
`

const ConfirmContent = styled.div`
  width: 100%;
`
const TxnsInfoText = styled.div`
  font-size: 22px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: -0.0625rem;
  text-align: center;
  color: ${({ theme }) => theme.text1};
  margin-top: 1rem;
`

const ConfirmText = styled.div`
  width: 100%;
  font-size: 0.75rem;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: normal;
  text-align: center;
  color: #734be2;
  padding: 1.25rem 0;
  border-top: 0.0625rem solid rgba(0, 0, 0, 0.08);
  margin-top:1.25rem
`

const ButtonConfirm = styled(Button)`
	max-width: 272px;
	height: 48px;
	line-height:1;
	margin:auto;
	font-size:1rem;
`

export default function HardwareTip({
    HardwareTipOpen,
    closeHardwareTip = () => {},
    error = false,
    txnsInfo,
    onSure = () => {},
    isSelfBtn = false,
    title,
    tipInfo,
    coin
}) {

	const { t } = useTranslation()

	return (
		<Modal
			show={HardwareTipOpen}
			onHide={closeHardwareTip}
			centered={true}
		>
			<Modal.Header>
				<Modal.Title>{
					error ? 'Error' : (title ? title : t('ConfirmTransaction'))
				}</Modal.Title>
			</Modal.Header>
			<Wrapper>
				<UpperSection>
					<HeaderRow>
						<HoverText>{
							error ? 'Error' : (title ? title : "Confirm Transaction")
						}</HoverText>
					</HeaderRow>
					<ContentWrapper>
						<LogoBox>
							{
								coin ? (
									<TokenLogo address={coin} size={'24px'}/>
								) : (
									<img src={PathIcon} alt={'logo'} />
								)
							}
						</LogoBox>
						{
							error ? (
								<ErrorTip>
									<h3>Sign Failed!</h3>
									<p>Please make sure your Ledger unlocked, open Ethereum app with contract data setting allowed</p>
								</ErrorTip>
							) : (
								<ConfirmContent>
									{txnsInfo ? (
										<TxnsInfoText>{txnsInfo}</TxnsInfoText>
									) : (<></>)}

									<ConfirmText size={'0.75rem'}>
										{tipInfo ? tipInfo : "Please confirm transaction on your Ledger"}
									</ConfirmText>
								</ConfirmContent>
							)
						}
						{isSelfBtn ? (
							<ButtonConfirm onClick={onSure} variant={'primary'}>
								Confirm
							</ButtonConfirm>
						) : ''}
					</ContentWrapper>
				</UpperSection>
			</Wrapper>
		</Modal>
	)
}