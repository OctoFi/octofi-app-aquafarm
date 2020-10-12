import React, {useCallback, useEffect, useContext, useState} from 'react';
import { BigNumber } from '@ethersproject/bignumber'
import { useSelector, useDispatch } from "react-redux";
import SVG from "react-inlinesvg";
import {Button, Modal, Row, Col} from 'react-bootstrap';
import CurrencyInputPanel from "../CurrencyInputPanel";
import {useActiveWeb3React} from "../../hooks";
import {toAbsoluteUrl} from "../../lib/helper";
import {maxAmountSpend} from "../../utils/maxAmountSpend";
import styled from "styled-components";
import {getGasPrice} from "../../state/currency/actions";
import GasPrice from "../GasPrice";

import { TransactionResponse } from '@ethersproject/providers'
import { Currency, ETHER, TokenAmount } from '@uniswap/sdk'
import { Plus } from 'react-feather'
import ReactGA from 'react-ga'
import { RouteComponentProps } from 'react-router-dom'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { LightCard } from '../Card'
import { AutoColumn } from '../Column'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import { RowBetween, RowFlat } from '../Row'

import { ROUTER_ADDRESS } from '../../constants'
import { PairState } from '../../data/Reserves'
import { useCurrency } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from '../../state/mint/hooks'

import { useTransactionAdder } from '../../state/transactions/hooks'
import {useDarkModeManager, useUserSlippageTolerance} from '../../state/user/hooks'
import { TYPE } from '../../theme'
import { calculateGasMargin, calculateSlippageAmount, getRouterContract } from '../../utils'
import { wrappedCurrency } from '../../utils/wrappedCurrency'
import { ConfirmAddModalBottom } from '../ConfirmAddModalBottom'
import { currencyId } from '../../utils/currencyId'
import { PoolPriceBar } from '../PoolPriceBar'
import { Field } from '../../state/mint/actions'



const Wrapper = styled.div`
  border-radius: 0.42rem;
  border: 1px solid ${({ theme }) => theme.bg2};
  background-color: ${({ theme }) => theme.bg1};
`

export const Dots = styled.span`
  &::after {
    display: inline-block;
    animation: ellipsis 1.25s infinite;
    content: '.';
    width: 1em;
    text-align: left;
  }
  @keyframes ellipsis {
    0% {
      content: '.';
    }
    33% {
      content: '..';
    }
    66% {
      content: '...';
    }
  }
`


export default function({
    match: {
        params: { currencyIdA, currencyIdB },
    },
    history,
}: RouteComponentProps<{ currencyIdA?: string; currencyIdB?: string }>)  {
    const { account, chainId, library } = useActiveWeb3React()
    const theme = useContext(ThemeContext)
    const [darkMode] = useDarkModeManager();

    const currencyA = useCurrency(currencyIdA || 'ETH')
    const currencyB = useCurrency(currencyIdB);

    // mint state
    const { independentField, typedValue, otherTypedValue } = useMintState()
    const {
        dependentField,
        currencies,
        pairState,
        currencyBalances,
        parsedAmounts,
        price,
        noLiquidity,
        liquidityMinted,
        poolTokenPercentage,
        error
    } = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined)
    const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity)

    const isValid = !error


    // modal and loading
    const [showConfirm, setShowConfirm] = useState<boolean>(false)
    const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm

    // txn values
    const deadline = useTransactionDeadline() // custom from users settings
    const [allowedSlippage] = useUserSlippageTolerance() // custom from users
    const [txHash, setTxHash] = useState<string>('')


    // get formatted amounts
    const formattedAmounts = {
        [independentField]: typedValue,
        [dependentField]: noLiquidity ? otherTypedValue : parsedAmounts[dependentField]?.toSignificant(6) ?? ''
    }

    // get the max amounts user can add
    const maxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
        (accumulator, field) => {
            return {
                ...accumulator,
                [field]: maxAmountSpend(currencyBalances[field])
            }
        },
        {}
    )

    const atMaxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
        (accumulator, field) => {
            return {
                ...accumulator,
                [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? '0')
            }
        },
        {}
    )

    // check whether the user has approved the router on the tokens
    const [approvalA, approveACallback] = useApproveCallback(parsedAmounts[Field.CURRENCY_A], ROUTER_ADDRESS)
    const [approvalB, approveBCallback] = useApproveCallback(parsedAmounts[Field.CURRENCY_B], ROUTER_ADDRESS)

    const addTransaction = useTransactionAdder()

    async function onAdd() {
        if (!chainId || !library || !account) return
        const router = getRouterContract(chainId, library, account)

        const { [Field.CURRENCY_A]: parsedAmountA, [Field.CURRENCY_B]: parsedAmountB } = parsedAmounts
        if (!parsedAmountA || !parsedAmountB || !currencyA || !currencyB || !deadline) {
            return
        }

        const amountsMin = {
            [Field.CURRENCY_A]: calculateSlippageAmount(parsedAmountA, noLiquidity ? 0 : allowedSlippage)[0],
            [Field.CURRENCY_B]: calculateSlippageAmount(parsedAmountB, noLiquidity ? 0 : allowedSlippage)[0]
        }

        let estimate,
            method: (...args: any) => Promise<TransactionResponse>,
            args: Array<string | string[] | number>,
            value: BigNumber | null
        if (currencyA === ETHER || currencyB === ETHER) {
            const tokenBIsETH = currencyB === ETHER
            estimate = router.estimateGas.addLiquidityETH
            method = router.addLiquidityETH
            args = [
                wrappedCurrency(tokenBIsETH ? currencyA : currencyB, chainId)?.address ?? '', // token
                (tokenBIsETH ? parsedAmountA : parsedAmountB).raw.toString(), // token desired
                amountsMin[tokenBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(), // token min
                amountsMin[tokenBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(), // eth min
                account,
                deadline.toHexString()
            ]
            value = BigNumber.from((tokenBIsETH ? parsedAmountB : parsedAmountA).raw.toString())
        } else {
            estimate = router.estimateGas.addLiquidity
            method = router.addLiquidity
            args = [
                wrappedCurrency(currencyA, chainId)?.address ?? '',
                wrappedCurrency(currencyB, chainId)?.address ?? '',
                parsedAmountA.raw.toString(),
                parsedAmountB.raw.toString(),
                amountsMin[Field.CURRENCY_A].toString(),
                amountsMin[Field.CURRENCY_B].toString(),
                account,
                deadline.toHexString()
            ]
            value = null
        }

        setAttemptingTxn(true)
        await estimate(...args, value ? { value } : {})
            .then(estimatedGasLimit =>
                method(...args, {
                    ...(value ? { value } : {}),
                    gasLimit: calculateGasMargin(estimatedGasLimit)
                }).then(response => {
                    setAttemptingTxn(false)

                    addTransaction(response, {
                        summary:
                            'Add ' +
                            parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
                            ' ' +
                            currencies[Field.CURRENCY_A]?.symbol +
                            ' and ' +
                            parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
                            ' ' +
                            currencies[Field.CURRENCY_B]?.symbol
                    })

                    setTxHash(response.hash)

                    ReactGA.event({
                        category: 'Liquidity',
                        action: 'Add',
                        label: [currencies[Field.CURRENCY_A]?.symbol, currencies[Field.CURRENCY_B]?.symbol].join('/')
                    })
                })
            )
            .catch(error => {
                setAttemptingTxn(false)
                // we only care if the error is something _other_ than the user rejected the tx
                if (error?.code !== 4001) {
                    console.error(error)
                }
            })
    }

    const dispatch = useDispatch();

    // @ts-ignore
    const {gasPrice, selectedGasPrice} = useSelector(state => state.currency);

    useEffect(() => {
        dispatch(getGasPrice());
    }, [dispatch])

    const modalHeader = () => {
        return noLiquidity ? (
            <AutoColumn gap="20px">
                <LightCard mt="20px" borderRadius="20px">
                    <RowFlat>
                        <Text fontSize="48px" fontWeight={500} lineHeight="42px" marginRight={10}>
                            {currencies[Field.CURRENCY_A]?.symbol + '/' + currencies[Field.CURRENCY_B]?.symbol}
                        </Text>
                        <DoubleCurrencyLogo
                            currency0={currencies[Field.CURRENCY_A]}
                            currency1={currencies[Field.CURRENCY_B]}
                            size={30}
                        />
                    </RowFlat>
                </LightCard>
            </AutoColumn>
        ) : (
            <AutoColumn gap="20px">
                <RowFlat style={{ marginTop: '20px' }}>
                    <Text fontSize="48px" fontWeight={500} lineHeight="42px" marginRight={10}>
                        {liquidityMinted?.toSignificant(6)}
                    </Text>
                    <DoubleCurrencyLogo
                        currency0={currencies[Field.CURRENCY_A]}
                        currency1={currencies[Field.CURRENCY_B]}
                        size={30}
                    />
                </RowFlat>
                <Row>
                    <Text fontSize="24px">
                        {currencies[Field.CURRENCY_A]?.symbol + '/' + currencies[Field.CURRENCY_B]?.symbol + ' Pool Tokens'}
                    </Text>
                </Row>
                <TYPE.italic fontSize={12} textAlign="left" padding={'8px 0 0 0 '}>
                    {`Output is estimated. If the price changes by more than ${allowedSlippage /
                    100}% your transaction will revert.`}
                </TYPE.italic>
            </AutoColumn>
        )
    }

    const modalBottom = () => {
        return (
            <ConfirmAddModalBottom
                price={price}
                currencies={currencies}
                parsedAmounts={parsedAmounts}
                noLiquidity={noLiquidity}
                onAdd={onAdd}
                poolTokenPercentage={poolTokenPercentage}
            />
        )
    }

    const pendingText = `Supplying ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${
        currencies[Field.CURRENCY_A]?.symbol
    } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${currencies[Field.CURRENCY_B]?.symbol}`

    const handleCurrencyASelect = useCallback(
        (currencyA: Currency) => {
            const newCurrencyIdA = currencyId(currencyA)
            if (newCurrencyIdA === currencyIdB) {
                history.push(`/pools/${currencyIdB}/${currencyIdA}`, )
            } else {
                history.push(`/pools/${newCurrencyIdA}/${currencyIdB}`, )
            }
        },
        [currencyIdB, history, currencyIdA]
    )
    const handleCurrencyBSelect = useCallback(
        (currencyB: Currency) => {
            const newCurrencyIdB = currencyId(currencyB)
            if (currencyIdA === newCurrencyIdB) {
                if (currencyIdB) {
                    history.push(`/pools/${currencyIdB}/${newCurrencyIdB}`, )
                } else {
                    history.push(`/pools/${newCurrencyIdB}`, )
                }
            } else {
                history.push(`/pools/${currencyIdA ? currencyIdA : 'ETH'}/${newCurrencyIdB}`, )
            }
        },
        [currencyIdA, history, currencyIdB]
    )

    const handleDismissConfirmation = useCallback(() => {
        setShowConfirm(false)
        // if there was a tx hash, we want to clear the input
        if (txHash) {
            onFieldAInput('')
        }
        setTxHash('')
    }, [onFieldAInput, txHash])

    return (
        <>
            <TransactionConfirmationModal
                isOpen={showConfirm}
                onDismiss={handleDismissConfirmation}
                attemptingTxn={attemptingTxn}
                hash={txHash}
                content={() => (
                    <ConfirmationModalContent
                        title={noLiquidity ? 'You are creating a pool' : 'You will receive'}
                        onDismiss={handleDismissConfirmation}
                        topContent={modalHeader}
                        bottomContent={modalBottom}
                    />
                )}
                pendingText={pendingText}
            />
            <Modal
                show={true}
                onHide={() => history.push('/pools')}
                size={'lg'}
                centered={true}>
                <Modal.Body>
                    <Row>
                        <Col xs={12}>
                            {!account ? (
                                <div className="card card-custom bg-light-warning card-shadowless gutter-b">
                                    <div className="card-body svg-inner-warning font-size-lg d-flex align-items-center px-2 py-4">
                                        <SVG src={toAbsoluteUrl('/media/svg/icons/General/Shield-protected.svg')} width={36} height={36}/>
                                        <div className={'pl-4'}>
                                            <h3 className={'text-warning font-size-lg mb-2'}>Wallet Not Connected</h3>
                                            <span className={`${darkMode ? 'text-muted' : 'text-dark-75'} font-size-sm font-weight-light`}>Please first connect your wallet.</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="card card-custom bg-light-success card-shadowless gutter-b">
                                    <div className="card-body svg-inner-success font-size-lg d-flex align-items-center px-2 py-4">
                                        <SVG src={toAbsoluteUrl('/media/svg/icons/General/Shield-check.svg')} width={36} height={36}/>
                                        <div className={'pl-4'}>
                                            <h3 className={'text-success font-size-lg mb-2'}>Wallet Connected</h3>
                                            <span className={`${darkMode ? 'text-muted' : 'text-dark-75'} font-size-sm font-weight-light`}>You connected to <strong>{account}</strong></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Col>
                        <Col xs={12}>
                            <CurrencyInputPanel
                                value={formattedAmounts[Field.CURRENCY_A]}
                                onUserInput={onFieldAInput}
                                onMax={() => {
                                    onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
                                }}
                                onCurrencySelect={handleCurrencyASelect}
                                showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
                                currency={currencies[Field.CURRENCY_A]}
                                id="add-liquidity-input-tokena"
                                showCommonBases
                            />
                        </Col>
                        <Col className={'d-flex align-items-center justify-content-center py-5'}>
                            <Plus size="16" color={theme.text2} />
                        </Col>

                        <Col xs={12} className={'gutter-b'}>
                            <CurrencyInputPanel
                                value={formattedAmounts[Field.CURRENCY_B]}
                                onUserInput={onFieldBInput}
                                onCurrencySelect={handleCurrencyBSelect}
                                onMax={() => {
                                    onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')
                                }}
                                showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
                                currency={currencies[Field.CURRENCY_B]}
                                id="add-liquidity-input-tokenb"
                                showCommonBases
                            />
                        </Col>
                        {currencies[Field.CURRENCY_A] && currencies[Field.CURRENCY_B] && pairState !== PairState.INVALID && (
                            <Col xs={12} className={'gutter-b'}>
                                <LightCard padding="0px" borderRadius={'0.42rem'}>
                                    <RowBetween padding="1rem">
                                        <TYPE.subHeader fontWeight={500} fontSize={14}>
                                            {noLiquidity ? 'Initial prices' : 'Prices'} and pool share
                                        </TYPE.subHeader>
                                    </RowBetween>{' '}
                                    <div className={'px-4 py-4 rounded'}>
                                        <PoolPriceBar
                                            currencies={currencies}
                                            poolTokenPercentage={poolTokenPercentage}
                                            noLiquidity={noLiquidity}
                                            price={price}
                                        />
                                    </div>
                                </LightCard>
                            </Col>
                        )}
                        <Col xs={12} className={'gutter-b'}>
                            <Wrapper>
                                <Row className={'pt-3 px-4 d-flex align-items-center mb-4'}>
                                    <Col xs={12}>
                                        <span className="text-muted font-size-md font-weight-bold">Select Gas Setting</span>
                                    </Col>
                                </Row>
                                <GasPrice gasList={gasPrice} selected={selectedGasPrice}/>
                            </Wrapper>
                        </Col>
                        <Col xs={12}>
                            {!account && (
                                <Button block variant={'light'} disabled className={'py-6 font-size-lg font-weight-bolder'}>Connect to your wallet</Button>
                            )}
                            {(approvalA === ApprovalState.NOT_APPROVED ||
                                approvalA === ApprovalState.PENDING ||
                                approvalB === ApprovalState.NOT_APPROVED ||
                                approvalB === ApprovalState.PENDING) &&
                            isValid && account && (
                                <Row>
                                    {approvalA !== ApprovalState.APPROVED && (
                                        <Col xs={12} md={approvalB !== ApprovalState.APPROVED ? 6 : 12}>
                                            <Button
                                                block
                                                className={'w-100 py-6'}
                                                variant={'primary'}
                                                onClick={approveACallback}
                                                disabled={approvalA === ApprovalState.PENDING}
                                            >
                                                {approvalA === ApprovalState.PENDING ? (
                                                    <Dots>Approving {currencies[Field.CURRENCY_A]?.symbol}</Dots>
                                                ) : (
                                                    'Approve ' + currencies[Field.CURRENCY_A]?.symbol
                                                )}
                                            </Button>
                                        </Col>
                                    )}
                                    {approvalB !== ApprovalState.APPROVED && (
                                        <Col xs={12} md={approvalA !== ApprovalState.APPROVED ? 6 : 12}>
                                            <Button
                                                block
                                                className={'w-100 py-6'}
                                                variant={'primary'}
                                                onClick={approveBCallback}
                                                disabled={approvalB === ApprovalState.PENDING}
                                            >
                                                {approvalB === ApprovalState.PENDING ? (
                                                    <Dots>Approving {currencies[Field.CURRENCY_B]?.symbol}</Dots>
                                                ) : (
                                                    'Approve ' + currencies[Field.CURRENCY_B]?.symbol
                                                )}
                                            </Button>
                                        </Col>
                                    )}
                                </Row>
                            )}
                            <Button
                                onClick={() => {
                                    setShowConfirm(true)
                                }}
                                block
                                disabled={!isValid || approvalA !== ApprovalState.APPROVED || approvalB !== ApprovalState.APPROVED}
                                variant={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B] ? 'light' : 'primary'}
                                className={`${!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B] ? 'light-primary' : ''} py-6`}
                            >
                                <span className="font-weight-bold font-size-lg">
                                    {error ?? 'Supply'}
                                </span>

                            </Button>
                        </Col>
                    </Row>

                </Modal.Body>
            </Modal>
        </>
    )
};