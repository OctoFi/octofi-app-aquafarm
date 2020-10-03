import { CurrencyAmount, JSBI, Token, Trade } from '@uniswap/sdk'
import React, { useCallback, useEffect, useMemo, useState, useContext }from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { ArrowDown } from 'react-feather'
import ReactGA from 'react-ga'
import { ThemeContext } from 'styled-components'

import Column from '../../components/Column'
import ConfirmSwapModal from '../../components/swap/ConfirmSwapModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import AdvancedSwapDetailsDropdown from '../../components/swap/AdvancedSwapDetailsDropdown'
import BetterTradeLink, { DefaultVersionLink } from '../../components/swap/BetterTradeLink'
import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
import { ArrowWrapper, BottomGrouping, Wrapper } from '../../components/swap/styleds'
import TradePrice from '../../components/swap/TradePrice'
import Loader from '../../components/Loader'
import TokenWarningModal from '../../components/TokenWarningModal'
import ProgressSteps from '../../components/ProgressSteps'
import { ClickableText } from '../../components/ExternalLink'

import { BETTER_TRADE_LINK_THRESHOLD, INITIAL_ALLOWED_SLIPPAGE } from '../../constants'
import { getTradeVersion, isTradeBetter } from '../../data/V1'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import useENSAddress from '../../hooks/useENSAddress'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import useToggledVersion, { DEFAULT_VERSION, Version } from '../../hooks/useToggledVersion'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { useToggleSettingsMenu, useWalletModalToggle } from '../../state/application/hooks'
import { Field } from '../../state/swap/actions'
import {
    useDefaultsFromURLSearch,
    useDerivedSwapInfo,
    useSwapActionHandlers,
    useSwapState
} from '../../state/swap/hooks'
import { useExpertModeManager, useUserSlippageTolerance } from '../../state/user/hooks'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'

const Exchange = () => {
    const loadedUrlParams = useDefaultsFromURLSearch()

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
    const theme = useContext(ThemeContext)

    // toggle wallet when disconnected
    const toggleWalletModal = useWalletModalToggle()

    // for expert mode
    const toggleSettings = useToggleSettingsMenu()
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
    const defaultTrade = showWrap ? undefined : tradesByVersion[DEFAULT_VERSION]

    const betterTradeLinkVersion: Version | undefined =
        toggledVersion === Version.v2 && isTradeBetter(v2Trade, v1Trade, BETTER_TRADE_LINK_THRESHOLD)
            ? Version.v1
            : toggledVersion === Version.v1 && isTradeBetter(v1Trade, v2Trade)
            ? Version.v2
            : undefined

    const parsedAmounts = showWrap
        ? {
            [Field.INPUT]: parsedAmount,
            [Field.OUTPUT]: parsedAmount
        }
        : {
            [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
            [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount
        }

    const { onSwitchTokens, onCurrencySelection, onUserInput } = useSwapActionHandlers()
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

                ReactGA.event({
                    category: 'Swap',
                    action:
                        recipient === null
                            ? 'Swap w/o Send'
                            : (recipientAddress ?? recipient) === account
                            ? 'Swap w/o Send + recipient'
                            : 'Swap w/ Send',
                    label: [
                        trade?.inputAmount?.currency?.symbol,
                        trade?.outputAmount?.currency?.symbol,
                        getTradeVersion(trade)
                    ].join('/')
                })
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

    // errors
    const [showInverted, setShowInverted] = useState<boolean>(false)

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
        <>
            <Row>
                <Col xs={{ span: 12, offset: 0}} md={{ span: 6, offset: 3}}>
                    <TokenWarningModal
                        isOpen={urlLoadedTokens.length > 0 && !dismissTokenWarning}
                        tokens={urlLoadedTokens}
                        onConfirm={handleConfirmTokenWarning}
                    />
                    <div className="card card-custom" style={{ zIndex: 2}}>
                        <div className="card-body">
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
                                    <Col xs={12}>
                                        <CurrencyInputPanel
                                            label={independentField === Field.OUTPUT && !showWrap && trade ? 'From (estimated)' : 'From'}
                                            value={formattedAmounts[Field.INPUT]}
                                            showMaxButton={!atMaxAmountInput}
                                            currency={currencies[Field.INPUT]}
                                            onUserInput={handleTypeInput}
                                            onMax={handleMaxInput}
                                            onCurrencySelect={handleInputSelect}
                                            otherCurrency={currencies[Field.OUTPUT]}
                                            id="swap-currency-input"
                                        />
                                    </Col>
                                    <Col xs={12} className={'py-5 d-flex align-items-center justify-content-center'}>
                                        <ArrowWrapper clickable>
                                            <ArrowDown
                                                size="16"
                                                onClick={() => {
                                                    setApprovalSubmitted(false) // reset 2 step UI for approvals
                                                    onSwitchTokens()
                                                }}
                                                color={currencies[Field.INPUT] && currencies[Field.OUTPUT] ? theme.primary1 : theme.text2}
                                            />
                                        </ArrowWrapper>
                                    </Col>
                                    <Col xs={12}>
                                        <CurrencyInputPanel
                                            value={formattedAmounts[Field.OUTPUT]}
                                            onUserInput={handleTypeOutput}
                                            label={independentField === Field.INPUT && !showWrap && trade ? 'To (estimated)' : 'To'}
                                            showMaxButton={false}
                                            currency={currencies[Field.OUTPUT]}
                                            onCurrencySelect={handleOutputSelect}
                                            otherCurrency={currencies[Field.INPUT]}
                                            id="swap-currency-output"
                                        />
                                    </Col>

                                    {showWrap ? null : (
                                        <>
                                            {Boolean(trade) && (
                                                <Col xs={12} className={'d-flex justify-content-between align-items-center pt-4 pb-2'}>
                                                    <span className="font-weight-medium text-dark-75">Price</span>
                                                    <TradePrice
                                                        price={trade?.executionPrice}
                                                        showInverted={showInverted}
                                                        setShowInverted={setShowInverted}
                                                    />
                                                </Col>
                                            )}

                                            {(allowedSlippage !== INITIAL_ALLOWED_SLIPPAGE) && (
                                                <Col xs={12} className={'d-flex justify-content-between align-items-center pt-2 pb-4'}>
                                                    <ClickableText fontWeight={500} fontSize={14} color={theme.text2} onClick={toggleSettings}>
                                                        Slippage Tolerance
                                                    </ClickableText>
                                                    <ClickableText fontWeight={500} fontSize={14} color={theme.text2} onClick={toggleSettings}>
                                                        {allowedSlippage / 100}%
                                                    </ClickableText>
                                                </Col>
                                            )}
                                        </>
                                    )}

                                    <Col xs={12} className={'d-flex justify-content-between align-items-center py-5'}>
                                        {!account ? (
                                            <Button block size={'lg'} variant={'light'} onClick={toggleWalletModal}>Connect Wallet</Button>
                                        ) : showWrap ? (
                                            <Button block size={'lg'} variant={'primary'} disabled={Boolean(wrapInputError)} onClick={onWrap}>
                                                {wrapInputError ??
                                                (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
                                            </Button>
                                        ) : noRoute && userHasSpecifiedInputOutput ? (
                                            <Button block size={'lg'} variant={'light'} disabled={true} className={'mb-2 font-weight-bold'}>
                                                Insufficient liquidity for this trade.
                                            </Button>
                                        ) : showApproveFlow ? (
                                            <Row>
                                                <Col>
                                                    <Button block size={'lg'}
                                                        onClick={approveCallback}
                                                        disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                                                        className={`btn ${approval === ApprovalState.PENDING ? "btn-light" : approval === ApprovalState.APPROVED ? 'btn-light-primary' : 'btn-primary'}`}
                                                    >
                                                        {approval === ApprovalState.PENDING ? (
                                                            <div className={'d-flex justify-content-center align-items-center'}>
                                                                Approving <Loader stroke="white" />
                                                            </div>
                                                        ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                                                            'Approved'
                                                        ) : (
                                                            'Approve ' + currencies[Field.INPUT]?.symbol
                                                        )}
                                                    </Button>
                                                </Col>
                                                <Col>
                                                    <Button block size={'lg'}
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
                                                        variant={'danger'}
                                                    >
                                                        <span className={'font-weight-bold'}>
                                                            {priceImpactSeverity > 3 && !isExpertMode
                                                                ? `Price Impact High`
                                                                : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                                                        </span>
                                                    </Button>
                                                </Col>
                                            </Row>
                                        ) : (
                                            <Button block size={'lg'}
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
                                                disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
                                                variant={'light'}
                                            >
                                                <span className={'font-weight-bold'}>
                                                    {swapInputError
                                                        ? swapInputError
                                                        : priceImpactSeverity > 3 && !isExpertMode
                                                            ? `Price Impact Too High`
                                                            : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                                                </span>
                                            </Button>
                                        )}
                                    </Col>
                                </Row>
                                <BottomGrouping>

                                    {showApproveFlow && (
                                        <Column style={{ marginTop: '1rem' }}>
                                            <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />
                                        </Column>
                                    )}
                                    {betterTradeLinkVersion ? (
                                        <BetterTradeLink version={betterTradeLinkVersion} />
                                    ) : toggledVersion !== DEFAULT_VERSION && defaultTrade ? (
                                        <DefaultVersionLink />
                                    ) : null}
                                </BottomGrouping>
                            </Wrapper>
                        </div>
                    </div>
                    <AdvancedSwapDetailsDropdown trade={trade} />
                </Col>
            </Row>
        </>
    )
}

export default Exchange;