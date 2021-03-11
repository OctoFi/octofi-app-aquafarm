import React from 'react';

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

const WalletTable = (props) => {

    const { balances } = props;
    let data = balances || [];

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
                    return (
                        <tr key={row.metadata.address} className={'assets__row'} style={{ cursor: 'pointer' }} onClick={props.clickable ? props.onClickToken.bind(this, row) : () => false}>
                            <td>
                                <div className="d-flex align-items-center">
                                    <LogoContainer>
                                        <CurrencyLogo currency={row.metadata} />
                                    </LogoContainer>
                                    <Title size={props.size || 'md'} className={'font-weight-boldest assets__title ml-2 ml-xl-4'}>{row.metadata.symbol}</Title>
                                </div>
                            </td>
                            <td className={'assets__value'}>
                                <CustomText size={props.size || 'md'}>{row.balance ? row.balance.toSignificant(6) : 0}</CustomText>
                            </td>
                            <td className={'assets__value assets__value--right'}>
                                <CustomText size={props.size || 'md'}><CurrencyText>{row.balanceUSD}</CurrencyText></CustomText>
                            </td>
                        </tr>
                    )
                })}
                </tbody>
            </table>
        </div>
    )
}

export default WalletTable