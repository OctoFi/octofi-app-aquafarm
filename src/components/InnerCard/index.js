import React, {useContext} from 'react';
import styled, {ThemeContext} from 'styled-components';
import {Link} from "react-router-dom";

import CurrencyLogo from "../CurrencyLogo";
import CurrencyText from "../CurrencyText";
import ArrowRightIcon from "../Icons/ArrowRight";

const Wrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.bg3};
  background-color: ${({ theme }) => theme.bg1};
  box-shadow: 0 0 5px transparent;
  padding: 1.75rem 1.5rem;
  border-radius: .42rem;
  position: relative;
  transition: .3s ease all;
  margin-bottom: 0.5rem;
  width: 100%;
  
  &:not(:last-child) {
    margin-right: 1rem;
  }
  
  &:hover {
    background-color: ${({ theme }) => theme.bg2};
    border-color:  ${({ theme }) => theme.primary1};
    box-shadow: ${({theme}) => `0 5px 15px ${theme.primary1}20`};
}
`

const Logo = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 48px;
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.075);
`

const Title = styled.h4`
  color: ${({ theme }) => theme.text1};
  font-weight: 600;
  font-size: 1.25rem;
  margin-bottom: 0;
`

const Price = styled.span`
  font-weight: 700;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.text1};
`

const PriceDiff = styled.span`
  font-weight: 500;
  font-size: 1rem;
  color: ${({theme, type}) => type === 'asc' ? theme.green1 : theme.red1};
`

const InnerCard = props => {
    const theme = useContext(ThemeContext);
    return (
        <Wrapper>
            <div className="d-flex align-items-center justify-content-between">
                <div className={'d-flex align-items-center mb-10'}>
                    {props.imageComponent ? props.imageComponent : props.img ? (<Logo src={props.img} alt={props.name}/>) : <CurrencyLogo size={'48px'} currency={props.currency}/>}
                    <div className="d-flex flex-column justify-content-center ml-4">
                        <Title>{props.name}</Title>
                        {props.symbol && (<span className="text-muted font-size-sm font-weight-light mt-1">{props.symbol}</span>)}
                    </div>
                </div>
                {props.src && (
                    <Link className={'mb-10 py-2 d-flex align-items-center justify-content-end'} to={props.src}>
                        <span className="text-muted mr-1 font-size-sm font-weight-bold">Details</span>
                        <ArrowRightIcon size={24} fill={theme.primary1}/>
                    </Link>
                )}

            </div>
            <div>
                <span className="text-muted font-size-sm font-weight-bold mb-2 d-block">{props.title || 'Price'}</span>
                <div className="d-flex align-items-end justify-content-between">
                    <Price>
                        <CurrencyText type={'grey-dark'}>{props.price}</CurrencyText>
                    </Price>
                    {props.priceDiff && (
                        <PriceDiff type={props.priceDiff > 0 ? 'asc' : 'desc'}>{props.priceDiff < 0.01 ? props.priceDiff.toFixed(4) : props.priceDiff.toFixed(2)}%</PriceDiff>
                    )}
                </div>
            </div>
        </Wrapper>
    )
}

export default InnerCard;