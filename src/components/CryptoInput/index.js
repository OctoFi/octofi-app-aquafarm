import React from 'react'
import styled from 'styled-components'
import { darken } from 'polished'
import { Dropdown, DropdownButton } from 'react-bootstrap';

import { RowBetween } from '../Row'
import { Input as NumericalInput } from '../NumericalInput'

const InputRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  padding: ${({ selected }) => (selected ? '0.75rem 0.5rem 0.75rem 1rem' : '0.75rem 0.75rem 0.75rem 1rem')};
`


const Logo = styled.img`
  width: ${({size}) => size ? `${size}px` : '24px'};
  height: ${({size}) => size ? `${size}px` : '24px'};
  border-radius: ${({size}) => size ? `${size}px` : '24px'};
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.075);
  margin-right: ${({ margin }) => margin ? '8px' : 0};
`

const LabelRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
  color: ${({ theme }) => theme.text1};
  font-size: 0.75rem;
  line-height: 1rem;
  padding: 0.75rem 1rem 0 1rem;
  span:hover {
    cursor: pointer;
    color: ${({ theme }) => darken(0.2, theme.text2)};
  }
`

const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const InputPanel = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  position: relative;
  border-radius: 0.42rem;
  background-color: ${({ theme }) => theme.bg2};
`

const Container = styled.div`
  border-radius: 0.42rem;
  border: 1px solid ${({ theme }) => theme.bg2};
  background-color: ${({ theme }) => theme.bg1};
`

const StyledTokenName = styled.span`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.75rem;' : '  margin: 0 0.25rem 0 0.25rem;')};
  font-size:  ${({ active }) => (active ? '20px' : '16px')};

`


export default function CryptoInput({
    value,
    onUserInput,
    label = 'Input',
    onSelect,
    disable = false,
    selected,
    hideInput = false,
    id,
    items,
    type
}) {

    return (
        <InputPanel id={id}>
            <Container hideInput={hideInput}>
                {!hideInput && (
                    <LabelRow>
                        <RowBetween>
                          <span className={'font-weight-bold text-muted font-size-sm'}>
                            {label}
                          </span>
                        </RowBetween>
                    </LabelRow>
                )}
                <InputRow style={hideInput ? { padding: '0', borderRadius: '0.42rem' } : {}} selected={disable}>
                    {!hideInput && (
                        <>
                            <NumericalInput
                                className="token-amount-input"
                                value={value}
                                onUserInput={val => {
                                    onUserInput(val, type)
                                }}
                            />
                        </>
                    )}

                    <DropdownButton
                        key={'select'}
                        id={`dropdown-variants-select`}
                        variant={'light-success py-1 px-2'}
                        className={'d-flex align-items-center justify-content-between'}
                        onSelect={(symbol) => onSelect(symbol, type)}
                        title={(
                            <Aligner>
                                {selected ? (
                                    <>
                                        <Logo src={selected.image || selected.logoUrl} alt={selected.symbol}/>
                                        <StyledTokenName className="token-symbol-container" active={Boolean(selected.symbol)}>
                                            {selected.symbol}
                                        </StyledTokenName>
                                    </>
                                ) : (
                                    <StyledTokenName className="token-symbol-container">
                                        Select {label}
                                    </StyledTokenName>
                                )}

                            </Aligner>
                        )}
                    >
                        {items.map(item => {
                            return (
                                <Dropdown.Item eventKey={item.symbol}>
                                    <Aligner>
                                        <Logo size={20} src={item.image || item.logoUrl} alt={item.symbol} margin/>
                                        <StyledTokenName className="token-symbol-container">
                                            {item.symbol}
                                        </StyledTokenName>
                                    </Aligner>
                                </Dropdown.Item>
                            )
                        })}
                    </DropdownButton>
                </InputRow>
            </Container>
        </InputPanel>
    )
}
