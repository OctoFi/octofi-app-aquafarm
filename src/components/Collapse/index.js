import React, {useContext, useRef, useState, useCallback, useMemo} from 'react';
import { ETHER, Token } from "@uniswap/sdk";
import moment from 'moment';

import CurrencyLogo from "../CurrencyLogo";
import FileIcon from "../Icons/File";
import ArrowRightIcon from "../Icons/ArrowRight";
import ArrowRightLongIcon from "../Icons/ArrowRightLong";
import ExchangeIcon from "../Icons/Exchange";
import ArrowDownIcon from "../Icons/ArrowDown";
import ArrowUpIcon from "../Icons/ArrowUp";
import styled, {ThemeContext} from "styled-components";
import {useActiveWeb3React} from "../../hooks";

const Wrapper = styled.div`
  border: 1px solid ${({theme, show}) => show ? theme.primary1 : theme.bg3};
  box-shadow: ${({theme, show}) => show ? `0 5px 15px ${theme.primary1}20` : '0 0 5px transparent'};
  border-radius: .42rem;
  margin-bottom: 1rem;
  overflow: hidden;
  height: ${({height}) => `${height}px`};
  transition: all .6s ease;
  will-change: transform, height, border-color, box-shadow;
`

const Header = styled.div`
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: .3s ease background-color;
  position: relative;
  background-color: ${({theme, show}) => show ? theme.bg2 : theme.bg1};
  
  &:hover{
    background-color: ${({ theme }) => theme.bg2};
  }
`

const HeaderSection = styled.div`
  flex: 1;
`

const Body = styled.div`
  padding: 0.5rem 1.5rem;
  position: relative;
`

const TypeIcon = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${({ theme }) => theme.bg3};
`

const Separator = styled.div`
  height: 0;
  margin-bottom: 1rem;
  width: 100%;
  border-bottom: 1px solid ${({theme}) => theme.bg3};
`

const VerticalSeparator = styled.div`
    width: 0;
    margin: 0 ${({margin}) => `${margin}rem`};
    align-self: stretch;
    border-right: 1px solid ${({theme}) => theme.bg3};
    position: relative;
`

const GreenCircle = styled.div`
  width: 28px;
  height: 28px;
  border: 1px solid ${({theme}) => theme.green1};
  background-color: ${({theme}) => theme.bg1};
  border-radius: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`

const Details = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  
`

const DescTitle = styled.span`
  font-weight: bold;
  font-size: 1rem;
  margin-bottom: .25rem;
  color: ${({theme}) => theme.text1};
`

const DescValue = styled.span`
  font-weight: 400;
  font-size: .875rem;
  color: ${({ theme }) => theme.text3};
`
const DescAnchor = styled.a`
  font-weight: 400;
  font-size: .875rem;
  color: ${({ theme }) => theme.text3};
`

const TradeSide = styled.div`
  min-width: 172px;
`

const hashText = (hash) => {
    return hash.slice(0, 6) + '...' + hash.slice(-4);
}

const Collapse = (props) => {
    const { chainId, account } = useActiveWeb3React();
    const [show, setShow] = useState(false);
    const [height, setHeight] = useState(74);

    const theme = useContext(ThemeContext);

    const header = useRef(null)
    const content = useRef(null)

    const showCollapse = useCallback(() => {
        const headerRect = header.current.getBoundingClientRect();
        const contentRect = content.current.getBoundingClientRect();

        if(show) {
            setHeight(headerRect.height);
        } else {
            setHeight(headerRect.height + contentRect.height);
        }

        setShow(!show);
    }, [show]);


    let tokens = useMemo(() => {
        let from = [],
            to = [],
            ref = null;
        props.txn.forEach(txnPart => {
            if(txnPart.from === account.toLowerCase()) {
                from.push(txnPart);
            } else if(txnPart.to === account.toLowerCase()) {
                to.push(txnPart);
            }
            ref = txnPart;
        })
        return {
            from,
            to,
            ref
        }
    }, [props.txn, account])



    return (
        <Wrapper height={height} show={show}>
            <Header className="d-flex align-items-center justify-content-between" ref={header} onClick={showCollapse} show={show} >
                <HeaderSection className="d-flex align-items-center">
                    <TypeIcon>
                        {
                            tokens.ref.value === '0' && props.txn.length === 1 ?
                                <FileIcon size={28} fill={theme.text1}/>
                            : tokens.from.length === 1 && tokens.to.length === 1 ?
                                <ExchangeIcon size={28} fill={theme.text1}/>
                            : (tokens.from.length > 1 && tokens.to.length === 1) || (tokens.from.length === 1 && tokens.to.length > 1) ?
                                <ArrowUpIcon size={28} fill={theme.text1}/>
                            : <ArrowDownIcon size={28} fill={theme.text1}/>
                        }
                    </TypeIcon>
                    <div className=" d-flex justify-content-center flex-column ml-3">
                        <span className="font-size-lg font-weight-bold">{
                            tokens.ref.value === '0' && props.txn.length === 1 ?
                                'Contracts / Approval'
                            : tokens.from.length === 1 && tokens.to.length === 1 ?
                                'Trade'
                            : (tokens.from.length > 1 && tokens.to.length === 1) || (tokens.from.length === 1 && tokens.to.length > 1) ?
                                'Add Liquidity'
                            : (tokens.from.length > 1) || tokens.to.length > 1 ?
                                'Swap'
                            : 'Receive'
                        }</span>
                        <span className="font-size-sm font-weight-light text-muted">{moment(tokens.ref.timeStamp ,'X').format('hh:MM A')}</span>
                    </div>
                </HeaderSection>
                <HeaderSection className="d-lg-flex d-none align-items-center justify-content-start" style={{ minWidth: 400 }}>
                    {tokens.from.length > 0 && (
                        <TradeSide className="d-flex align-items-center">
                            {tokens.from.map(token => {
                                if(token.contractAddress && token.tokenDecimal) {
                                    const currency = new Token(chainId, token.contractAddress, Number(token.tokenDecimal) || 18, token.tokenSymbol, token.tokenName);
                                    return (
                                        <div className={'mr-2'}>
                                            <CurrencyLogo currency={currency} size={'36px'}/>
                                        </div>
                                    )
                                } else {
                                    return (
                                        <div className={'mr-2'}>
                                            <CurrencyLogo currency={ETHER} size={'36px'}/>
                                        </div>
                                    )
                                }
                            })}
                            <div className="d-flex justify-content-center flex-column ml-1">
                                <span className="font-size-lg font-weight-bold">{
                                    tokens.from.length !== 1 ? `${tokens.from.length} Assets` : `-${tokens.from[0].tokenDecimal ? (Number(tokens.from[0].value) / 10 ** Number(tokens.from[0].tokenDecimal || 18)).toFixed(4) : (Number(tokens.from[0].value) / 10 ** 18).toFixed(4)} ${tokens.from[0].tokenSymbol || 'ETH'}`
                                }</span>
                                {tokens.from.length === 1 && (
                                    <span className={'text-muted'}>{tokens.from[0].contractAddress ? hashText(tokens.from[0].contractAddress) : 'Ethereum'}</span>
                                )}

                            </div>
                        </TradeSide>

                    )}

                    {tokens.from.length > 0 && tokens.to.length > 0 && (
                        <div className="px-5">
                            <ArrowRightIcon size={24} fill={theme.text1}/>
                        </div>
                    )}

                    {tokens.to.length > 0 && (
                        <TradeSide className="d-flex align-items-center">
                            {tokens.to.map(token => {
                                if(token.contractAddress && token.tokenDecimal) {
                                    const currency = new Token(chainId, token.contractAddress, Number(token.tokenDecimal) || 18, token.tokenSymbol, token.tokenName);

                                    return (
                                        <div className={'mr-2'}>
                                            <CurrencyLogo currency={currency} size={'36px'}/>
                                        </div>
                                    )
                                } else {
                                    return (
                                        <div className={'mr-2'}>
                                            <CurrencyLogo currency={ETHER} size={'36px'}/>
                                        </div>
                                    )
                                }
                            })}
                            <div className="d-flex justify-content-center flex-column ml-3">
                                <span className="font-size-lg text-success font-weight-bold">{
                                    tokens.to.length !== 1 ? `${tokens.to.length} Assets` : `+${tokens.to[0].tokenDecimal ? (Number(tokens.to[0].value) / 10 ** Number(tokens.to[0].tokenDecimal || 18)).toFixed(4) : (Number(tokens.to[0].value) / 10 ** 18).toFixed(4)} ${tokens.to[0].tokenSymbol || 'ETH'}`
                                }</span>
                                {tokens.to.length === 1 && (
                                    <span className={'text-muted'}>{tokens.to[0].contractAddress ? hashText(tokens.to[0].contractAddress) : 'Ethereum'}</span>
                                )}

                            </div>
                        </TradeSide>

                    )}


                </HeaderSection>
                <HeaderSection className="d-flex flex-column justify-content-center align-items-end">
                    <span className="text-muted font-size-sm font-weight-light mb-1">{tokens.from.length > 0 ? 'Application' : 'From'}</span>
                    <span className="label label-inline label-light-primary label-lg">{tokens.from.length > 0 ? hashText(tokens.from[0].to || tokens.from[0].contractAddress) : tokens.to.length > 0 ? hashText(tokens.to[0].from || tokens.to[0].contractAddress) : ''}</span>
                </HeaderSection>
            </Header>
            <div ref={content}>
                {tokens.from.length > 0 && tokens.to.length > 0 && (
                    <>
                        <Separator/>
                        <Body className="d-flex align-items-center pb-4">
                            <div className="d-flex flex-column justify-content-center">
                                {tokens.from.map(token => {
                                        const currency = token.contractAddress && token.tokenDecimal ? new Token(chainId, token.contractAddress, Number(token.tokenDecimal) || 18, token.tokenSymbol, token.tokenName) : ETHER;
                                        return (
                                            <div className="d-flex align-items-center py-2">
                                                <CurrencyLogo currency={currency} size={'36px'}/>
                                                <div className="d-flex justify-content-center flex-column ml-3">
                                                    <span className="font-size-lg font-weight-bold">{`-${token.contractAddress ? (Number(token.value) / 10 ** Number(token.tokenDecimal || 18)).toFixed(4) : (Number(token.value) / 10 ** 18).toFixed(4)} ${token.tokenSymbol || 'ETH'}`}</span>
                                                    <span className={'text-muted'}>{token.contractAddress ? hashText(token.contractAddress) : 'Ethereum'}</span>
                                                </div>
                                            </div>
                                        )
                                })}
                            </div>
                            <VerticalSeparator margin={3.5}>
                                <GreenCircle>
                                    <ArrowRightLongIcon size={20} fill={theme.green1}/>
                                </GreenCircle>
                            </VerticalSeparator>
                            <div className="d-flex flex-column justify-content-center">
                                {tokens.to.map(token => {
                                    const currency = token.contractAddress && token.tokenDecimal ? new Token(chainId, token.contractAddress, Number(token.tokenDecimal) || 18, token.tokenSymbol, token.tokenName) : ETHER;
                                    return (
                                        <div className="d-flex align-items-center py-2">
                                            <CurrencyLogo currency={currency} size={'36px'}/>
                                            <div className="d-flex justify-content-center flex-column ml-3">
                                                <span className="font-size-lg text-success font-weight-bold">{`+${token.contractAddress ? (Number(token.value) / 10 ** Number(token.tokenDecimal || 18)).toFixed(4) : (Number(token.value) / 10 ** 18).toFixed(4)} ${token.tokenSymbol || 'ETH'}`}</span>
                                                <span className={'text-muted'}>{token.contractAddress ? hashText(token.contractAddress) : 'Ethereum'}</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </Body>
                    </>
                )}

                <Separator/>

                <Body className="d-flex align-items-center pb-4">
                    <Details>
                        <DescTitle>Fee</DescTitle>
                        <DescValue>{(tokens.ref.gasUsed * tokens.ref.gasPrice / 10 ** 18).toFixed(6)} ETH</DescValue>
                    </Details>
                    <VerticalSeparator margin={1.5}/>
                    <Details>
                        <DescTitle>Block Number</DescTitle>
                        <DescValue>{tokens.ref.blockNumber}</DescValue>
                    </Details>
                    <VerticalSeparator margin={1.5}/>
                    <Details>
                        <DescTitle>Transaction Hash</DescTitle>
                        <DescAnchor href={`https://etherscan.io/tx/${tokens.ref.hash}`} target={'_blank'} rel={'noopener noreferrer'}>{tokens.ref.hash.slice(0, 10)}...{tokens.ref.hash.slice(-8)} ↗</DescAnchor>
                    </Details>
                </Body>
            </div>
        </Wrapper>
    )
}

export default Collapse;