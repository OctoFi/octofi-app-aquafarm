import React, {useCallback, useEffect, useState, useMemo} from 'react';
import { useSelector, useDispatch } from "react-redux";
import SVG from "react-inlinesvg";
import { ETHER } from "@uniswap/sdk";
import {Button, Modal, Row, Col} from 'react-bootstrap';
import {useActiveWeb3React} from "../../hooks";
import {toAbsoluteUrl} from "../../lib/helper";
import PlatformLogo from "../PlatformLogo";
import styled from "styled-components";
import {getGasPrice} from "../../state/currency/actions";
import GasPrice from "../GasPrice";
import { usePoolApproveCallback } from '../../state/pools/hooks';
import { ApprovalState } from '../../constants';

import { TransactionResponse } from '@ethersproject/providers'
import { RouteComponentProps } from 'react-router-dom'
import { Text } from 'rebass'
import { AutoColumn } from '../Column'
import { ConfirmationModalContent, ConfirmationPendingContent, TransactionSubmittedContent } from '../../components/TransactionConfirmationModal'

import {RowBetween, RowFixed, RowFlat} from '../Row'
import { AppState } from '../../state';
import useTransactionDeadline from '../../hooks/useTransactionDeadline'

import { useTransactionAdder } from '../../state/transactions/hooks'
import {useDarkModeManager, useUserSlippageTolerance} from '../../state/user/hooks'
import { TYPE } from '../../theme'
import {getContract, isAddress, calculateGasMargin} from '../../utils'
import CurrencyLogo from "../CurrencyLogo";
import { REMOVE_CONTRACTS as CONTRACTS } from '../../constants';
import curvePipeABI from '../../constants/abis/removeLiquidity/curve.json';
import balancerPipeABI from '../../constants/abis/removeLiquidity/balancer.json';
import yVaultPipeABI from '../../constants/abis/removeLiquidity/yVault.json';
import uniswapPipeABI from '../../constants/abis/removeLiquidity/uniswap.json';
import {clearSelectedPool} from "../../state/pools/actions";
import PoolInput from '../PoolInput';
import {usePoolBalance} from "../../state/pools/hooks";
import ERC20_ABI from '../../constants/abis/erc20.json'
import { BigNumber } from 'ethers';


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


const BUTTON_STATES = {
    'not_started': 'Confirm Withdraw',
    'initializing': 'Initializing...',
    'allowance': 'Checking Allowance',
    'approving': 'Creating Approve Transaction',
    'validation': 'Validating...',
    'create_tx': 'Creating Transaction',
    'send_tx': 'Sending Transaction',
    'submitted': "Order Submitted",
    'pending': 'Pending...',
    'failed': "Transaction failed",
}


export default function({
    history,
}: RouteComponentProps)  {
    
    const { account, chainId, library } = useActiveWeb3React()
    const dispatch = useDispatch();
    const [amount, setAmount] = useState('');
    const [buttonState, setButtonState] = useState(BUTTON_STATES.not_started)
    const {gasPrice, selectedGasPrice} = useSelector((state: AppState) => state.currency);
    const selectedPool = useSelector((state: AppState) => state.pools.selected)
    const pool = selectedPool.data;
    const type = selectedPool.type;
    const [darkMode] = useDarkModeManager();
    const selectedCurrencyBalance = usePoolBalance(account ?? undefined, pool.address ?? undefined)
    const getSpender = useMemo(() => {
        let spender,
            abi;
        if(type && type.toLowerCase() === 'curve') {
            spender = CONTRACTS.curve
            abi = curvePipeABI
        } else if(type && type.toLowerCase() === 'balancer') {
            spender = CONTRACTS.balancer
            abi = balancerPipeABI
        } else if(type && type.toLowerCase() === 'yearn') {
            spender = CONTRACTS.yVault
            abi = yVaultPipeABI
        }else if(type && type.toLowerCase() === 'uniswap') {
            spender = CONTRACTS.uniswap
            abi = uniswapPipeABI
        } else {
            return ['', undefined];
        }
        return [spender, abi];
    }, [type])

    const [spender] = getSpender;
    const [approve, approveCallback] = usePoolApproveCallback(pool, amount, spender);

    useEffect(() => {
        if(!pool || !isAddress(pool.address)) {
            dispatch(clearSelectedPool());
            history.push('/pools');
        }
    }, [pool, dispatch, history])

    // modal and loading
    const [showConfirm, setShowConfirm] = useState<boolean>(false)
    const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm

    // txn values
    const deadline = useTransactionDeadline() // custom from users settings
    const [allowedSlippage] = useUserSlippageTolerance() // custom from users
    const [txHash, setTxHash] = useState<string>('')

    const addTransaction = useTransactionAdder()

    const setFailedTxn = () => {
        setButtonState(BUTTON_STATES.failed);

        setTimeout(() => {
            setButtonState(BUTTON_STATES.not_started);
        }, 3000)
    }

    const getApprove = () => {
        if(approveCallback) {
            // @ts-ignore
            approveCallback();
        }
    }

    async function onRemove() {
        if (!chainId || !library || !account) return
        let router;
        let [spender, abi] = getSpender;
        if(!abi) {
            return;
        } else {
            // @ts-ignore
            router = getContract(spender, abi, library, account);
        }
        // if(type && type.toLowerCase() === 'curve') {
        //     spender = CONTRACTS.curve
        //     router = getContract(spender, curvePipeABI, library, account);
        // } else if(type && type.toLowerCase() === 'balancer') {
        //     spender = CONTRACTS.balancer
        //     router = getContract(spender, balancerPipeABI, library, account);
        // } else if(type && type.toLowerCase() === 'yearn') {
        //     spender = CONTRACTS.yVault
        //     router = getContract(spender, yVaultPipeABI, library, account);
        // }else if(type && type.toLowerCase() === 'uniswap') {
        //     spender = CONTRACTS.uniswap
        //     router = getContract(spender, uniswapPipeABI, library, account);
        // } else {
        //     return;
        // }
        setButtonState(BUTTON_STATES.initializing);
        const erc20_contract = getContract(pool.address, ERC20_ABI, library, account);
        
        setButtonState(BUTTON_STATES.allowance);
        const allowance = await erc20_contract.functions.allowance(account, spender);
        
        
        // @ts-ignore
        const parsedAmountA: string = `${amount * (10 ** 18)}`
        if (!parsedAmountA || !pool || !deadline) {
            return
        }
        let canTx = false;

        if(Number(allowance[0].toString()) < Number(parsedAmountA)) {
            setButtonState(BUTTON_STATES.approving);
            try {
                const tx = await erc20_contract.functions.approve(spender, parsedAmountA);
                if(tx) {
                    canTx = true;
                }
            } catch(e) {
                setFailedTxn();
            }
        } else {
            canTx = true;
        }
    
        if(!canTx) {
            return ;
        }
        
        setButtonState(BUTTON_STATES.create_tx);

        let method: (...args: any) => Promise<TransactionResponse>,
            args: Array<string | string[] | number>
        let estimate = type === 'Balancer' ? router.estimateGas.EasyZapOut : router.estimateGas.ZapOut
        method = type === 'Balancer' ? router.EasyZapOut : router.ZapOut
        args = []
        if(type && type.toLowerCase() === 'curve') {
            args = [
                account,
                pool.address,
                parsedAmountA,
                '0x0000000000000000000000000000000000000000',
                0,
            ]
        } else if(type && type.toLowerCase() === 'balancer') {
            args = [
                '0x0000000000000000000000000000000000000000',
                pool.address,
                parsedAmountA,
                0,
            ]
        } else if(type && type.toLowerCase() === 'yearn') {
            args = [
                account,
                '0x0000000000000000000000000000000000000000',
                pool.address,
                2,
                parsedAmountA,
                0,
            ]
        } else {
            args = [
                '0x0000000000000000000000000000000000000000',
                pool.address,
                parsedAmountA,
                0,
            ]
        }

        
        setAttemptingTxn(true)

        setButtonState(BUTTON_STATES.send_tx);
        const selectedGas = gasPrice.find(item => item[0] === selectedGasPrice);
        let gasEstimatedPrice = 0;
        if(selectedGas) {
            gasEstimatedPrice = selectedGas[1] * (10 ** 9);
        }

        const gas = await estimate(...args)
                            .catch(e => {
                                setFailedTxn()
                                setAttemptingTxn(false)
                            })
        await method(...args, {
                gasLimit: calculateGasMargin(gas || BigNumber.from(0)),
                gasPrice: gasEstimatedPrice,
            }).then(response => {
                
                setButtonState(BUTTON_STATES.submitted);
                setAttemptingTxn(false)

                addTransaction(response, {
                    summary:
                        'Withdraw ' +
                        parsedAmountA +
                        ' ' +
                        pool?.poolName,
                })

                setTimeout(() => {
                    setButtonState(BUTTON_STATES.not_started);
                }, 3000)
                setTxHash(response.hash)

            })
            .catch(error => {
                setAttemptingTxn(false)
                setFailedTxn()
                // we only care if the error is something _other_ than the user rejected the tx
                if (error?.code !== 4001) {
                    console.error(error)
                }
            })
    }

    useEffect(() => {
        dispatch(getGasPrice());
    }, [dispatch])

    const modalHeader = () => {
        return  (
            <AutoColumn gap="20px">
                <RowFlat style={{ marginTop: '20px' }}>
                    <Text fontSize="48px" fontWeight={500} lineHeight="42px" marginRight={10}>
                        {amount}
                    </Text>
                    <div className={'d-flex align-items-center'}>
                        <PlatformLogo platform={type} name={pool?.poolName} size={36}/>
                    </div>
                </RowFlat>
                <Row className={'px-5'}>
                    <Text fontSize="24px">
                        {pool?.poolName + ' Pool Tokens'}
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
                    <TYPE.body>{pool?.poolName} Pool Token</TYPE.body>
                    <RowFixed>
                        <PlatformLogo platform={type} name={pool?.poolName} size={24} style={{ marginRight: '8px' }} />
                    </RowFixed>
                </RowBetween>
                <RowBetween>
                    <TYPE.body>Ethereum Output</TYPE.body>
                    <RowFixed>
                        <CurrencyLogo currency={ETHER}/>
                    </RowFixed>
                </RowBetween>
                <Button variant={'primary'} className={'py-6 font-weight-bolder font-size-lg'} style={{ margin: '20px 0 0 0' }} onClick={onRemove}>
                    {buttonState}
                </Button>
            </>
        )
    }

    const hideModal = () => {
        dispatch(clearSelectedPool());
        history.push('/pools');
    }

    const pendingText = `Withdrawing ${amount} ${
        pool?.poolName
    }`

    const handleDismissConfirmation = useCallback(() => {
        setShowConfirm(false)
        setTxHash('')
    }, [txHash])

    const onFieldAInput = useCallback((value) => {
        setAmount(value);
    }, [amount])

    return (
        <>
            <Modal
                show={true}
                onHide={hideModal}
                size={'lg'}
                centered={true}>
                <Modal.Body>
                    
                {!showConfirm ? (
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
                                            <span className={`${darkMode ? 'text-muted' : 'text-dark-75'} font-size-sm font-weight-light`}>You're connected to <strong>{account}</strong></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Col>
                        <Col xs={12} className={'gutter-b'}>
                            <PoolInput
                                value={amount}
                                onUserInput={onFieldAInput}
                                onMax={() => {
                                    onFieldAInput(selectedCurrencyBalance ?? '')
                                }}
                                type={type}
                                disableCurrencySelect={true}
                                showMaxButton={true}
                                pool={pool}
                                id="pool-input"
                            />
                        </Col>
                        <Col xs={12} className={'gutter-b'}>
                            <Wrapper>
                                <Row className={'pt-3 px-4 d-flex align-items-center mb-4'}>
                                    <Col xs={12}>
                                        <span className="text-muted font-size-md font-weight-bold">You Will Receive</span>
                                    </Col>
                                </Row>
                                <Row className={'px-4 pb-3'}>
                                    <Col xs={12} className={'d-flex align-items-center'}>
                                        <CurrencyLogo currency={ETHER} size={'32px'} />
                                        <h5 className="font-size-lg text-dark font-weight-boldest ml-3 mb-0">Ethereum</h5>
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
                                        if(approve === ApprovalState.NOT_APPROVED || approve === ApprovalState.UNKNOWN) {
                                            getApprove();
                                        } else if(approve === ApprovalState.PENDING) {
                                            return ;
                                        } else {
                                            setShowConfirm(true)
                                        }                                       
                                    }}
                                    block
                                    disabled={!amount || Number(selectedCurrencyBalance) < Number(amount) || approve === ApprovalState.PENDING || Number(amount) === 0}
                                    variant={!amount || Number(selectedCurrencyBalance) < Number(amount)? 'light' : 'primary'}
                                    className={`${!!amount || Number(selectedCurrencyBalance) >= Number(amount) || Number(amount) === 0? 'light-primary' : ''} py-6`}
                                >
                                    <span className="font-weight-bold font-size-lg">
                                        {!amount || Number(amount) === 0 ? 'Please Enter Amount' :
                                           Number(selectedCurrencyBalance) < Number(amount) ? 'Insufficient balance' : 
                                           approve === ApprovalState.NOT_APPROVED || approve === ApprovalState.UNKNOWN ? `Approve` :
                                           approve === ApprovalState.PENDING ? 'Pending' : 'Withdraw'}
                                    </span>

                                </Button>
                            )}

                        </Col>
                    </Row>
                ) : attemptingTxn ? (
                    <ConfirmationPendingContent onDismiss={handleDismissConfirmation} pendingText={pendingText} />
                ) : txHash ? (
                    <TransactionSubmittedContent chainId={chainId} hash={txHash} onDismiss={handleDismissConfirmation} />
                ) : (
                    <ConfirmationModalContent
                        title={'You will Pay'}
                        onDismiss={handleDismissConfirmation}
                        topContent={modalHeader}
                        bottomContent={modalBottom}
                    />
                )}
                </Modal.Body>
            </Modal>
        </>
    )
};