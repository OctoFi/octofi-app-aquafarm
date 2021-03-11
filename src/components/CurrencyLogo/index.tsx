import { Currency, ETHER, Token } from '@uniswap/sdk'
import React, { useMemo } from 'react'
import styled from 'styled-components'

import EthereumLogo from '../../assets/images/ethereum-logo.png'
import useHttpLocations from '../../hooks/useHttpLocations'
import { WrappedTokenInfo } from '../../state/lists/hooks'
import Logo from '../TokenLogo'

const getTokenLogoURL = (address: string) =>
  `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`

const StyledEthereumLogo = styled.img<{ size: string | undefined }>`
  width: ${({ size }) => size || '100%'};
  height: ${({ size }) => size || '100%'};
  border-radius: ${({ size }) => size || '100%'};
  border: 2px solid ${({ theme }) => theme.text1};
  color: ${({ theme }) => theme.text1};
`

const StyledLogo = styled(Logo)<{ size: string | undefined }>`
  width: ${({ size }) => size || '100%'};
  height: ${({ size }) => size || '100%'};
  border-radius: ${({ size }) => size || '100%'};
  border: 2px solid ${({ theme }) => theme.text1};
  color: ${({ theme }) => theme.text1};
`

export default function CurrencyLogo({
  currency,
  size,
  style
}: {
  currency?: Currency
  size?: string
  style?: React.CSSProperties
}) {
  const uriLocations = useHttpLocations(currency instanceof WrappedTokenInfo ? currency.logoURI : undefined)

  const srcs: string[] = useMemo(() => {
    if (currency === ETHER) return []

    if (currency instanceof Token) {
      if (currency instanceof WrappedTokenInfo) {
        return [...uriLocations, getTokenLogoURL(currency.address)]
      }

      return [getTokenLogoURL(currency.address)]
    }
    return []
  }, [currency, uriLocations])

  if (currency === ETHER) {
    return <StyledEthereumLogo src={EthereumLogo} size={size}  style={style} />
  }

  return <StyledLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? 'token'} logo`}  style={style} />
}
