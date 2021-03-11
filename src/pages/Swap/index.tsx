import { CurrencyAmount, JSBI, Token, Trade } from '@uniswap/sdk'
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import styled from 'styled-components'
import SVG from 'react-inlinesvg'
import { ArrowDown } from 'react-feather'

import Page from '../../components/Page';
import ConfirmSwapModal from '../../components/swap/ConfirmSwapModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import AdvancedSwapDetailsDropdown from '../../components/swap/AdvancedSwapDetailsDropdown'
import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
import { Wrapper, ArrowWrapper } from '../../components/swap/styleds'
import Loader from '../../components/Loader'
import TokenWarningModal from '../../components/TokenWarningModal'
import { ResponsiveCard } from '../../components/Card';

import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import useENSAddress from '../../hooks/useENSAddress'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import useToggledVersion, { Version } from '../../hooks/useToggledVersion'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { useWalletModalToggle } from '../../state/application/hooks'
import { Field } from '../../state/swap/actions'
import {
    useDefaultsFromURLSearch,
    useDerivedSwapInfo,
    useSwapActionHandlers,
    useSwapState
} from '../../state/swap/hooks'
import { useExpertModeManager, useUserSlippageTolerance} from '../../state/user/hooks'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import {ClickableText} from "../../components/ExternalLink";
import TradePrice from "../../components/swap/TradePrice";
import {LinkStyledButton} from "../../theme";
import AddressInputPanel from '../../components/AddressInputPanel';
import SwapHeader from './components/SwapHeader';
import {useTranslation} from "react-i18next";
import useTheme from "../../hooks/useTheme";


const StyledRow = styled(Row)`
  margin-top: 20px;
`

const CustomCard = styled(ResponsiveCard)`
`

const CardTitle = styled.h3`
  font-weight: 700;
  font-size: 1.25rem;
`

const HeadCol = styled(Col)`
  margin-bottom: 33px;
`

const ApproveArrow = styled.div`
  align-self: center;
  margin: 24px 0 20px;
  
  @media (min-width: 991px) {
    margin: 0 43px;   
  
  }
`

const StyledClickableText = styled(ClickableText)`
  color: ${({ theme }) => theme.text1};
`

const PriceCol = styled(Col)`
  margin-top: -1rem;
  margin-bottom: 1rem;
  
  @media (min-width: 768px) {
    margin-top: -1.75rem;
    margin-bottom: 1.75rem;
  }
`

const SwitchCol = styled(Col)`
  margin-bottom: 1.25rem;
  
`

const Swap = (props: any) => {
    const loadedUrlParams = useDefaultsFromURLSearch()
    const { t } = useTranslation();
    const theme = useTheme();

    // token warning stuff
    const [loadedInputCurrency, loadedOutputCurrency] = [
        useCurrency(loadedUrlParams?.inputCurrencyId),
        useCurrency(loadedUrlParams?.outputCurrencyId)
    ]
    const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
    const urlLoadedTokens: Token[] = useMemo(
        () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c instanceof Token) ?? [],
        [loadedInputCurrency, loadedOutputCurrency]
    )
    const handleConfirmTokenWarning = useCallback(() => {
        setDismissTokenWarning(true)
    }, [])

    const { account } = useActiveWeb3React()

    const [showInverted, setShowInverted] = useState<boolean>(false)

    // toggle wallet when disconnected
    const toggleWalletModal = useWalletModalToggle()

    // for expert mode
    const [isExpertMode] = useExpertModeManager()

    // get custom setting values for user
    const [allowedSlippage] = useUserSlippageTolerance()

    // swap state
    const { independentField, typedValue, recipient } = useSwapState()
    const {
        v1Trade,
        v2Trade,
        currencyBalances,
        parsedAmount,
        currencies,
        inputError: swapInputError
    } = useDerivedSwapInfo()
    const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
        currencies[Field.INPUT],
        currencies[Field.OUTPUT],
        typedValue
    )
    const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
    const { address: recipientAddress } = useENSAddress(recipient)
    const toggledVersion = useToggledVersion()
    const tradesByVersion = {
        [Version.v1]: v1Trade,
        [Version.v2]: v2Trade
    }
    const trade = showWrap ? undefined : tradesByVersion[toggledVersion]

    const parsedAmounts = showWrap
        ? {
            [Field.INPUT]: parsedAmount,
            [Field.OUTPUT]: parsedAmount
        }
        : {
            [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
            [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount
        }

    const { onCurrencySelection, onUserInput, onSwitchTokens, onChangeRecipient } = useSwapActionHandlers()
    const isValid = !swapInputError
    const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

    const handleTypeInput = useCallback(
        (value: string) => {
            onUserInput(Field.INPUT, value)
        },
        [onUserInput]
    )
    const handleTypeOutput = useCallback(
        (value: string) => {
            onUserInput(Field.OUTPUT, value)
        },
        [onUserInput]
    )

    // modal and loading
    const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
        showConfirm: boolean
        tradeToConfirm: Trade | undefined
        attemptingTxn: boolean
        swapErrorMessage: string | undefined
        txHash: string | undefined
    }>({
        showConfirm: false,
        tradeToConfirm: undefined,
        attemptingTxn: false,
        swapErrorMessage: undefined,
        txHash: undefined
    })

    const formattedAmounts = {
        [independentField]: typedValue,
        [dependentField]: showWrap
            ? parsedAmounts[independentField]?.toExact() ?? ''
            : parsedAmounts[dependentField]?.toSignificant(6) ?? ''
    }

    const route = trade?.route
    const userHasSpecifiedInputOutput = Boolean(
        currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
    )
    const noRoute = !route

    // check whether the user has approved the router on the input token
    const [approval, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage)

    // check if user has gone through approval process, used to show two step buttons, reset on token change
    const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

    // mark when a user has submitted an approval, reset onTokenSelection for input field
    useEffect(() => {
        if (approval === ApprovalState.PENDING) {
            setApprovalSubmitted(true)
        }
    }, [approval, approvalSubmitted])

    const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
    const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

    // the callback to execute the swap
    const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(trade, allowedSlippage, recipient)

    const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)

    const handleSwap = useCallback(() => {
        if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
            return
        }
        if (!swapCallback) {
            return
        }
        setSwapState({ attemptingTxn: true, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined })
        swapCallback()
            .then(hash => {
                setSwapState({ attemptingTxn: false, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: hash })
            })
            .catch(error => {
                setSwapState({
                    attemptingTxn: false,
                    tradeToConfirm,
                    showConfirm,
                    swapErrorMessage: error.message,
                    txHash: undefined
                })
            })
    }, [tradeToConfirm, account, priceImpactWithoutFee, recipient, recipientAddress, showConfirm, swapCallback, trade])


    // warnings on slippage
    const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

    // show approve flow when: no error on inputs, not approved or pending, or approved in current session
    // never show if price impact is above threshold in non expert mode
    const showApproveFlow =
        !swapInputError &&
        (approval === ApprovalState.NOT_APPROVED ||
            approval === ApprovalState.PENDING ||
            (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
        !(priceImpactSeverity > 3 && !isExpertMode)

    const handleConfirmDismiss = useCallback(() => {
        setSwapState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
        // if there was a tx hash, we want to clear the input
        if (txHash) {
            onUserInput(Field.INPUT, '')
        }
    }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

    const handleAcceptChanges = useCallback(() => {
        setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn, showConfirm })
    }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash])

    const handleInputSelect = useCallback(
        inputCurrency => {
            setApprovalSubmitted(false) // reset 2 step UI for approvals
            onCurrencySelection(Field.INPUT, inputCurrency)
        },
        [onCurrencySelection]
    )

    const handleMaxInput = useCallback(() => {
        maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact())
    }, [maxAmountInput, onUserInput])

    const handleOutputSelect = useCallback(outputCurrency => onCurrencySelection(Field.OUTPUT, outputCurrency), [
        onCurrencySelection
    ])


    return (
        <Page>
            <StyledRow>
                <Col xs={{ span: 12, offset: 0}} md={{ span: 6, offset: 3}}>
                    <TokenWarningModal
                        isOpen={urlLoadedTokens.length > 0 && !dismissTokenWarning}
                        tokens={urlLoadedTokens}
                        onConfirm={handleConfirmTokenWarning}
                    />
                    <CustomCard className='' style={{ zIndex: 1 }} marginTop={20}>
                        <Wrapper id="swap-page">
                            <ConfirmSwapModal
                                isOpen={showConfirm}
                                trade={trade}
                                originalTrade={tradeToConfirm}
                                onAcceptChanges={handleAcceptChanges}
                                attemptingTxn={attemptingTxn}
                                txHash={txHash}
                                recipient={recipient}
                                allowedSlippage={allowedSlippage}
                                onConfirm={handleSwap}
                                swapErrorMessage={swapErrorMessage}
                                onDismiss={handleConfirmDismiss}
                            />
                            <Row>
                                <HeadCol xs={12} className={'d-flex align-items-center justify-content-between'}>
                                    <CardTitle>{t('convert')}</CardTitle>
                                    <SwapHeader/>
                                </HeadCol>
                                <Col xs={12}>
                                    <CurrencyInputPanel
                                        label={independentField === Field.OUTPUT && !showWrap && trade ? `${t('from')} (${t('estimated')})` : t('from')}
                                        value={formattedAmounts[Field.INPUT]}
                                        showMaxButton={!atMaxAmountInput}
                                        currency={currencies[Field.INPUT]}
                                        onUserInput={handleTypeInput}
                                        onMax={handleMaxInput}
                                        onCurrencySelect={handleInputSelect}
                                        otherCurrency={currencies[Field.OUTPUT]}
                                        id="swap-currency-input"
                                        withoutMargin={true}
                                    />
                                </Col>

                                <SwitchCol xs={12} className={'d-flex align-items-center justify-content-between'}>
                                    <ArrowWrapper clickable style={{ padding: '2px 16px'}}>
                                        <ArrowDown
                                            size="16"
                                            onClick={() => {
                                                setApprovalSubmitted(false) // reset 2 step UI for approvals
                                                onSwitchTokens()
                                            }}
                                            color={theme.text2}
                                        />
                                    </ArrowWrapper>
                                    {recipient === null && (
                                        <LinkStyledButton id="add-recipient-button" onClick={() => onChangeRecipient('')}>
                                            + {t('addSend')} ({t('optional')})
                                        </LinkStyledButton>
                                    )}
                                </SwitchCol>
                                <Col xs={12}>
                                    <CurrencyInputPanel
                                        value={formattedAmounts[Field.OUTPUT]}
                                        onUserInput={handleTypeOutput}
                                        label={independentField === Field.INPUT && !showWrap && trade ? `${t('to')} (${t('estimated')})` : t('to')}
                                        showMaxButton={false}
                                        currency={currencies[Field.OUTPUT]}
                                        onCurrencySelect={handleOutputSelect}
                                        otherCurrency={currencies[Field.INPUT]}
                                        id="swap-currency-output"
                                        withoutMargin={true}
                                    />
                                </Col>
                                {recipient !== null && (
                                    <>
                                        <SwitchCol xs={12} className={'d-flex align-items-center justify-content-between'}>

                                            <ArrowWrapper clickable style={{ padding: '2px 16px'}}>
                                                <ArrowDown
                                                    size="16"
                                                    onClick={() => {
                                                        setApprovalSubmitted(false) // reset 2 step UI for approvals
                                                        onSwitchTokens()
                                                    }}
                                                    color={theme.text2}
                                                />
                                            </ArrowWrapper>
                                            <LinkStyledButton id="add-recipient-button" onClick={() => onChangeRecipient(null)}>
                                                - {t('removeSend')}
                                            </LinkStyledButton>
                                        </SwitchCol>
                                        <Col xs={12}>
                                            <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
                                        </Col>
                                    </>
                                )}
                                {showWrap ? null : (
                                    <>
                                        {Boolean(trade) && (
                                            <PriceCol xs={12} className={'d-flex justify-content-between align-items-center'}>
                                                <StyledClickableText fontWeight={500} fontSize={14}>
                                                    {t('price')}
                                                </StyledClickableText>
                                                <TradePrice
                                                    price={trade?.executionPrice}
                                                    showInverted={showInverted}
                                                    setShowInverted={setShowInverted}
                                                />
                                            </PriceCol>
                                        )}
                                    </>
                                )}
                                {trade && (
                                    <AdvancedSwapDetailsDropdown trade={trade} />
                                )}
                                <Col xs={12} className={'d-flex flex-column align-items-stretch align-items-lg-center justify-content-center  mb-lg-0'} style={{ marginBottom: !trade ? '50px' : '0'}}>
                                    {!account ? (
                                        <Button className={'py-3'} variant={'outline-primary'} onClick={toggleWalletModal}>{t('wallet.connect')}</Button>
                                    ) : showWrap ? (
                                        <Button className={'py-3'} variant={Boolean(wrapInputError) ? 'outline-primary' : 'primary'} disabled={Boolean(wrapInputError)} onClick={onWrap}>
                                            {wrapInputError ??
                                            (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
                                        </Button>
                                    ) : noRoute && userHasSpecifiedInputOutput ? (
                                        <Button
                                                variant={'outline-primary'}
                                                disabled={true} className={'mb-2 py-3 font-weight-bold'}>
                                            {t('insufficientLiquidity')}
                                        </Button>
                                    ) : showApproveFlow ? (
                                        <Row className={'flex-grow-1'}>
                                            <Col xs={12} className={'d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center justify-content-between'}>
                                                <Button
                                                    onClick={approveCallback}
                                                    disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                                                    className={`py-3 flex-grow-1 btn ${approval === ApprovalState.PENDING ? "btn-light-secondary" : 'btn-secondary-light'}`}
                                                >
                                                    {approval === ApprovalState.PENDING ? (
                                                        <div className={'d-flex justify-content-center align-items-center'}>
                                                            {t('approving')} <Loader stroke="white" />
                                                        </div>
                                                    ) : approvalSubmitted && approval === ApprovalState.APPROVED ? t('approved') : (
                                                        t('approve') + currencies[Field.INPUT]?.symbol
                                                    )}
                                                </Button>
                                                <ApproveArrow className={'d-none d-lg-block'}>
                                                    <SVG src={require('../../assets/images/global/arrow-right-long.svg').default}/>
                                                </ApproveArrow>
                                                <ApproveArrow className={'d-block d-lg-none'}>
                                                    <SVG src={require('../../assets/images/global/arrow-down-long.svg').default}/>
                                                </ApproveArrow>
                                                <Button
                                                    onClick={() => {
                                                        if (isExpertMode) {
                                                            handleSwap()
                                                        } else {
                                                            setSwapState({
                                                                tradeToConfirm: trade,
                                                                attemptingTxn: false,
                                                                swapErrorMessage: undefined,
                                                                showConfirm: true,
                                                                txHash: undefined
                                                            })
                                                        }
                                                    }}

                                                    id="swap-button"
                                                    disabled={
                                                        !isValid || approval !== ApprovalState.APPROVED || (priceImpactSeverity > 3 && !isExpertMode)
                                                    }
                                                    variant={'outline-secondary-light'}
                                                    className={'py-3 flex-grow-1'}
                                                >
                                                    <span className={'font-weight-medium'}>
                                                        {priceImpactSeverity > 3 && !isExpertMode
                                                            ? t('impactHigh')
                                                            : priceImpactSeverity > 2 ? t('swapAnyway') : t('swap')
                                                        }
                                                    </span>
                                                </Button>
                                            </Col>
                                        </Row>
                                    ) : (
                                        <Button
                                            block={!(!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError)}
                                            onClick={() => {
                                                if (isExpertMode) {
                                                    handleSwap()
                                                } else {
                                                    setSwapState({
                                                        tradeToConfirm: trade,
                                                        attemptingTxn: false,
                                                        swapErrorMessage: undefined,
                                                        showConfirm: true,
                                                        txHash: undefined
                                                    })
                                                }
                                            }}
                                            className={'py-3'}
                                            id="swap-button"
                                            disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
                                            variant={'primary'}
                                        >
                                            <span className={'font-weight-medium'}>
                                                {swapInputError
                                                    ? swapInputError
                                                    : priceImpactSeverity > 3 && !isExpertMode
                                                        ? t('impactHigh')
                                                        : priceImpactSeverity > 2 ? t('swapAnyway') : t('swap')}
                                            </span>
                                        </Button>
                                    )}

                                </Col>
                            </Row>
                            <Row>
                                {trade && (
                                    <Col xs={12} className={'d-flex flex-column align-items-stretch align-items-lg-center justify-content-center'}>
                                        <a href={'https://uniswap.info/pair/' + trade.route.pairs[0].liquidityToken.address} target="_blank" rel={'noopener noreferrer'} className={'btn btn-outline-primary mb-lg-0'} style={{ padding: '1rem 2.75rem', marginTop: '3.25rem', marginBottom: 50 }}>
                                            {t('viewPairAnalytics')} ↗
                                        </a>
                                    </Col>
                                )}
                            </Row>
                        </Wrapper>
                    </CustomCard>
                </Col>
            </StyledRow>
        </Page>
    )
}

export default Swap;
