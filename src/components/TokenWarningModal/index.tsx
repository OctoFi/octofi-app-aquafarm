import { Token } from '@uniswap/sdk'
import { transparentize } from 'polished'
import { Modal, Button, Form } from 'react-bootstrap';
import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useActiveWeb3React } from '../../hooks'
import { useAllTokens } from '../../hooks/Tokens'
import { ExternalLink, TYPE } from '../../theme'
import { getEtherscanLink, shortenAddress } from '../../utils'
import CurrencyLogo from '../CurrencyLogo'
import { AutoRow } from '../Row'
import { AutoColumn } from '../Column'
import { AlertTriangle } from 'react-feather'

const Wrapper = styled.div<{ error: boolean }>`
  background: ${({ theme }) => transparentize(0.6, theme.bg3)};
  padding: 0.75rem;
  border-radius: 20px;
`

const StyledWarningIcon = styled(AlertTriangle)`
  stroke: ${({ theme }) => theme.red2};
`

interface TokenWarningCardProps {
  token?: Token
}

function TokenWarningCard({ token }: TokenWarningCardProps) {
  const { chainId } = useActiveWeb3React()

  const tokenSymbol = token?.symbol?.toLowerCase() ?? ''
  const tokenName = token?.name?.toLowerCase() ?? ''

  const allTokens = useAllTokens()

  const duplicateNameOrSymbol = useMemo(() => {
    if (!token || !chainId) return false

    return Object.keys(allTokens).some(tokenAddress => {
      const userToken = allTokens[tokenAddress]
      if (userToken.equals(token)) {
        return false
      }
      return userToken.symbol?.toLowerCase() === tokenSymbol || userToken.name?.toLowerCase() === tokenName
    })
  }, [token, chainId, allTokens, tokenSymbol, tokenName])

  if (!token) return null

  return (
    <Wrapper error={duplicateNameOrSymbol}>
      <AutoRow gap="6px">
        <AutoColumn gap="24px">
          <CurrencyLogo currency={token} size={'16px'} />
          <div> </div>
        </AutoColumn>
        <AutoColumn gap="10px" justify="flex-start">
          <TYPE.main>
            {token && token.name && token.symbol && token.name !== token.symbol
              ? `${token.name} (${token.symbol})`
              : token.name || token.symbol}{' '}
          </TYPE.main>
          {chainId && (
            <ExternalLink style={{ fontWeight: 400 }} href={getEtherscanLink(chainId, token.address, 'token')}>
              <TYPE.blue title={token.address}>{shortenAddress(token.address)} (View on Etherscan)</TYPE.blue>
            </ExternalLink>
          )}
        </AutoColumn>
      </AutoRow>
    </Wrapper>
  )
}

export default function TokenWarningModal({
  isOpen,
  tokens,
  onConfirm
}: {
  isOpen: boolean
  tokens: Token[]
  onConfirm: () => void
}) {
  const [understandChecked, setUnderstandChecked] = useState(false)
  const toggleUnderstand = useCallback(() => setUnderstandChecked(uc => !uc), [])

  const handleDismiss = useCallback(() => null, [])
  return (
    <Modal
        show={isOpen}
        backdrop="static"
        centered={true}
        onHeight={handleDismiss}>
      <Modal.Header>
        <Modal.Title className={'d-flex align-items-center'}>
          <StyledWarningIcon />
          <h3 className={'font-weight-bolder font-size-lg text-danger mb-0 ml-4'}>Token imported</h3>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className={'text-danger font-weight-normal'}>
          Anyone can create an ERC20 token on Ethereum with <em>any</em> name, including creating fake versions of
          existing tokens and tokens that claim to represent projects that do not have a token.
        </p>
        <p className={'text-danger font-weight-normal'}>
          This interface can load arbitrary tokens by token addresses. Please take extra caution and do your research
          when interacting with arbitrary ERC20 tokens.
        </p>
        <p className={'text-danger font-weight-normal'}>
          If you purchase an arbitrary token, <strong>you may be unable to sell it back.</strong>
        </p>
        {tokens.map(token => {
          return <TokenWarningCard key={token.address} token={token} />
        })}
      </Modal.Body>
      <Modal.Footer className={'d-flex align-items-center justify-content-between'}>

        <Form.Check
            type={'checkbox'}
            id={`understand-checkbox`}
            label={`I Understand`}
            checked={understandChecked}
            onChange={toggleUnderstand}
        />
        <Button
            disabled={!understandChecked}
            className={'px-7 py-3 font-weight-bold'}
            onClick={onConfirm}
            variant={'danger'}
          >
          Continue
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
