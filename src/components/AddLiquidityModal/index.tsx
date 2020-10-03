import React, {useCallback, useEffect, useState} from 'react';
import { BigNumber } from '@ethersproject/bignumber'
import { useSelector, useDispatch } from "react-redux";
import SVG from "react-inlinesvg";
import {Button, Modal, Row, Col} from 'react-bootstrap';
import CurrencyInputPanel from "../CurrencyInputPanel";
import {useActiveWeb3React} from "../../hooks";
import {toAbsoluteUrl} from "../../lib/helper";
import {maxAmountSpend} from "../../utils/maxAmountSpend";
import PlatformLogo from "../PlatformLogo";
import styled from "styled-components";
import {getGasPrice} from "../../state/currency/actions";
import GasPrice from "../GasPrice";

import { TransactionResponse } from '@ethersproject/providers'
import { TokenAmount } from '@uniswap/sdk'
import ReactGA from 'react-ga'
import { RouteComponentProps } from 'react-router-dom'
import { Text } from 'rebass'
import { AutoColumn } from '../Column'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal'

import {RowBetween, RowFixed, RowFlat} from '../Row'

import { useCurrency } from '../../hooks/Tokens'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from '../../state/mint/hooks'

import { useTransactionAdder } from '../../state/transactions/hooks'
import { useUserSlippageTolerance } from '../../state/user/hooks'
import { TYPE } from '../../theme'
import { calculateGasMargin, calculateSlippageAmount, getContract } from '../../utils'
import { wrappedCurrency } from '../../utils/wrappedCurrency'
import { Field } from '../../state/mint/actions'
import CurrencyLogo from "../CurrencyLogo";
import { CONTRACTS } from '../../constants';
import curvePipeABI from '../../constants/abis/curve.json';
import balancerPipeABI from '../../constants/abis/balancer.json';
import yVaultPipeABI from '../../constants/abis/yVault.json';


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
    history,
    location
}: RouteComponentProps)  {
    const { account, chainId, library } = useActiveWeb3React()

    const currencyA = useCurrency('ETH')

    // mint state
    const { independentField, typedValue, otherTypedValue } = useMintState()
    const {
        dependentField,
        currencies,
        currencyBalances,
        parsedAmounts,
        noLiquidity,
        liquidityMinted,
        error
    } = useDerivedMintInfo(currencyA ?? undefined, undefined)
    const { onFieldAInput } = useMintActionHandlers(noLiquidity)

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


    const addTransaction = useTransactionAdder()

    async function onAdd() {
        if (!chainId || !library || !account) return
        let router;
        if(pool.platform.toLowerCase() === 'curve') {
            router = getContract(CONTRACTS.curve, curvePipeABI, library, account);
        } else if(pool.platform.toLowerCase() === 'balancer') {
            router = getContract(CONTRACTS.balancer, balancerPipeABI, library, account);
        } else if(pool.platform.toLowerCase() === 'yvault') {
            router = getContract(CONTRACTS.yVault, yVaultPipeABI, library, account);
        } else {
            return;
        }

        const { [Field.CURRENCY_A]: parsedAmountA } = parsedAmounts
        if (!parsedAmountA || !currencyA || !deadline) {
            return
        }

        const amountsMin = {
            [Field.CURRENCY_A]: calculateSlippageAmount(parsedAmountA, noLiquidity ? 0 : allowedSlippage)[0],
        }

        let estimate,
            method: (...args: any) => Promise<TransactionResponse>,
            args: Array<string | string[] | number>,
            value: BigNumber | null
        const tokenBIsETH = false;
            estimate = router.estimateGas.addLiquidityETH
            method = router.addLiquidityETH
            args = [
                wrappedCurrency(tokenBIsETH ? currencyA : undefined, chainId)?.address ?? '', // token
                parsedAmountA.raw.toString(), // token desired
                amountsMin[Field.CURRENCY_A].toString(), // eth min
                account,
                deadline.toHexString()
            ]
            value = BigNumber.from(parsedAmountA.raw.toString())

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
                            currencies[Field.CURRENCY_A]?.symbol
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
    }, [])

    // @ts-ignore
    const pool = location.state.pool;

    const modalHeader = () => {
        return  (
            <AutoColumn gap="20px">
                <RowFlat style={{ marginTop: '20px' }}>
                    <Text fontSize="48px" fontWeight={500} lineHeight="42px" marginRight={10}>
                        {liquidityMinted?.toSignificant(6)}
                    </Text>
                    <div className={'d-flex align-items-center'}>
                        <PlatformLogo platform={pool.platform} name={pool.poolName} size={36}/>
                    </div>
                </RowFlat>
                <Row className={'px-5'}>
                    <Text fontSize="24px">
                        {pool.poolName + ' Pool Tokens'}
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
            <>
                <RowBetween>
                    <TYPE.body>{currencies[Field.CURRENCY_A]?.symbol} Input</TYPE.body>
                    <RowFixed>
                        <CurrencyLogo currency={currencies[Field.CURRENCY_A]} style={{ marginRight: '8px' }} />
                    </RowFixed>
                </RowBetween>
                <RowBetween>
                    <TYPE.body>{pool.poolName} Output</TYPE.body>
                    <RowFixed>
                        <PlatformLogo platform={pool.platform} name={pool.poolName} size={24}/>
                    </RowFixed>
                </RowBetween>
                <Button variant={'primary'} className={'py-6 font-weight-bolder font-size-lg'} style={{ margin: '20px 0 0 0' }} onClick={onAdd}>
                    {noLiquidity ? 'Create Pool & Supply' : 'Confirm Supply'}
                </Button>
            </>
        )
    }

    const pendingText = `Supplying ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${
        currencies[Field.CURRENCY_A]?.symbol
    } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${currencies[Field.CURRENCY_B]?.symbol}`

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
                onHide={() => history.push('/invest')}
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
                                            <span className={'text-dark-75 font-size-sm font-weight-light'}>Please first connect your wallet.</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="card card-custom bg-light-success card-shadowless gutter-b">
                                    <div className="card-body svg-inner-success font-size-lg d-flex align-items-center px-2 py-4">
                                        <SVG src={toAbsoluteUrl('/media/svg/icons/General/Shield-check.svg')} width={36} height={36}/>
                                        <div className={'pl-4'}>
                                            <h3 className={'text-success font-size-lg mb-2'}>Wallet Connected</h3>
                                            <span className={'text-dark-75 font-size-sm font-weight-light'}>You connected to <strong>{account}</strong></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Col>
                        <Col xs={12} className={'gutter-b'}>
                            <CurrencyInputPanel
                                value={formattedAmounts[Field.CURRENCY_A]}
                                onUserInput={onFieldAInput}
                                onMax={() => {
                                    onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
                                }}
                                disableCurrencySelect={true}
                                showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
                                currency={currencyA}
                                id="add-liquidity-input-tokena"
                                showCommonBases
                            />
                        </Col>
                        <Col xs={12} className={'gutter-b'}>
                            <Wrapper>
                                <Row className={'pt-3 px-4 d-flex align-items-center mb-4'}>
                                    <Col xs={12}>
                                        <span className="text-muted font-size-md font-weight-bold">Selected Pool</span>
                                    </Col>
                                </Row>
                                <Row className={'px-4 pb-3'}>
                                    <Col xs={12} className={'d-flex align-items-center'}>
                                        <PlatformLogo size={48} platform={pool.platform} name={pool.poolName} />
                                        <h5 className="font-size-lg text-dark font-weight-boldest ml-3 mb-0">{pool.poolName}</h5>
                                    </Col>
                                </Row>
                            </Wrapper>
                        </Col>

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
                            {!account ? (
                                <Button block variant={'light'} disabled className={'py-6 font-size-lg font-weight-bolder'}>Connect to your wallet</Button>
                            ) : (
                                <Button
                                    onClick={() => {
                                        setShowConfirm(true)
                                    }}
                                    block
                                    disabled={!isValid}
                                    variant={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B] ? 'light' : 'primary'}
                                    className={`${!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B] ? 'light-primary' : ''} py-6`}
                                >
                                    <span className="font-weight-bold font-size-lg">
                                        {error ?? 'Supply'}
                                    </span>

                                </Button>
                            )}

                        </Col>
                    </Row>

                </Modal.Body>
            </Modal>
        </>
    )
};