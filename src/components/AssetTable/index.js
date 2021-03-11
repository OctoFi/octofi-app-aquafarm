import React from 'react';
import { Token } from "@uniswap/sdk";
import { isMobile } from 'react-device-detect';

import { useActiveWeb3React } from "../../hooks";
import CurrencyText from "../CurrencyText";
import CurrencyLogo from "../CurrencyLogo";
import styled from "styled-components";

const LogoContainer = styled.div`
  max-width: 32px;
  max-height: 32px;
  height: 32px;
  width: 32px;
  
  @media (max-width: 1199px) {
    max-width: 24px;
    max-height: 24px;
    height: 24px;
    width: 24px;
  }
`

const CustomText = styled.span`
  color: ${({theme}) => theme.text1};
  font-weight: 500;
  font-size: ${({ size }) => size === 'sm' ? '0.75rem' : size === 'md' ? '.875rem' : size === 'lg' ? '1rem' : '.875rem' };
  
  
  @media (min-width: 1200px) {
  font-weight: 700;
  font-size: ${({ size }) => size === 'sm' ? '0.75rem' : size === 'md' ? '1rem' : size === 'lg' ? '1.25rem' : '1rem' };
  }
`
const Title = styled.span`
  color: ${({theme}) => theme.text1};
  font-weight: 500;
  font-size: ${({ size }) => size === 'sm' ? '0.75rem' : size === 'md' ? '.875rem' : size === 'lg' ? '1rem' : '.875rem' };
  margin-left: 0.875rem;
  
  @media (min-width: 1200px) {
    font-weight: 700;
    font-size: ${({ size }) => size === 'sm' ? '0.75rem' : size === 'md' ? '1rem' : size === 'lg' ? '1.25rem' : '1rem' };
    margin-left: 1.25rem;
  }
`

const AssetTable = (props) => {
    const { chainId } = useActiveWeb3React();
    const { balances } = props;

    let data = balances ? balances : [];

    return (
        <div className={'table-responsive'}>
            <table className={`table currency__table table-borderless mb-0 table-head-custom ${props.size ? `currency__table--${props.size}` : ''}`}>
                <thead>
                    <tr>
                        <th>Assets</th>
                        <th>Balance</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                {data.map(row => {
                    if(row.underlying.length > 0) {
                        return row.underlying.map(uRow => {
                            const currency = new Token(chainId, uRow.metadata.address, uRow.metadata.decimals, uRow.metadata.symbol, uRow.metadata.name);
                            return (
                                <tr key={uRow.metadata.address} className={'assets__row'}>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <LogoContainer>
                                                <CurrencyLogo currency={currency} />
                                            </LogoContainer>
                                            <Title size={props.size || 'md'} className={'font-weight-boldest assets__title'}>{uRow.metadata.symbol}</Title>
                                        </div>
                                    </td>
                                    <td className={'assets__value'}>
                                        <CustomText size={props.size || 'md'}>
                                            {(uRow.balance / 10 ** uRow.metadata.decimals).toFixed(6)}
                                        </CustomText>
                                    </td>
                                    <td className={'assets__value assets__value--right'}>
                                        <CustomText size={props.size || 'md'}>
                                            <CurrencyText>{uRow.balanceUSD}</CurrencyText>
                                        </CustomText>
                                    </td>
                                </tr>
                            )
                        })
                    } else {
                        const currency = new Token(chainId, row.base.metadata.address, row.base.metadata.decimals, row.base.metadata.symbol, row.base.metadata.name);
                        return (
                            <tr key={row.base.metadata.address} className={'assets__row'}>
                                <td>
                                    <div className="d-flex align-items-center">
                                        <LogoContainer>
                                            <CurrencyLogo currency={currency} />
                                        </LogoContainer>
                                        <Title size={props.size || 'md'} className={'font-weight-boldest assets__title'}>{row.base.metadata.symbol}</Title>
                                    </div>
                                </td>
                                <td className={'assets__value'}>
                                    <CustomText size={props.size || 'md'}>
                                        {(row.base.balance / 10 ** row.base.metadata.decimals).toFixed(6)}
                                    </CustomText>
                                </td>
                                <td className={'assets__value assets__value--right'}>
                                    <CustomText size={props.size || 'md'}>
                                        <CurrencyText>{row.base.balanceUSD}</CurrencyText>
                                    </CustomText>
                                </td>
                            </tr>
                        )
                    }
                })}
                </tbody>
            </table>
        </div>
    )
}

export default AssetTable;