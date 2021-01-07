import React, {useCallback, useState} from 'react'
import styled from 'styled-components'
import { darken } from 'polished'

import { RowBetween } from '../Row'
import { Input as NumericalInput } from '../NumericalInput'
import {ReactComponent as DropDown} from "../../assets/images/dropdown.svg";
import Column from "../Column";
import Modal from "../Modal";
import CurrencySelectModal from "../CurrencySelectModal";
import EUR from '../../assets/images/currencies/EU.svg'

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
const LogoDiv = styled.div`
  width: ${({size}) => size ? `${size}px` : '24px'};
  height: ${({size}) => size ? `${size}px` : '24px'};
  border-radius: ${({size}) => size ? `${size}px` : '24px'};
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.075);
  margin-right: ${({ margin }) => margin ? '8px' : 0};
  display: flex;
  align-items: center;
  justify-content: center;
  
  & svg {
    width: 24px;
    height: 24px;
    border-radius: 24px;
  }
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

const StyledDropDown = styled(DropDown)`
  margin: 0 0.25rem 0 0.5rem;
  height: 35%;

  path {
    stroke: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
    stroke-width: 1.5px;
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

const CurrencySelect = styled.button`
  align-items: center;
  height: 2.7rem;
  font-size: 20px;
  font-weight: 500;
  background-color: ${({ selected, theme }) => (selected ? theme.bg1 : theme.primary1)};
  color: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
  border-radius: 0.42rem;
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  outline: none;
  cursor: pointer;
  user-select: none;
  border: none;
  padding: 0.25rem 0.5rem;

  :focus,
  :hover {
    background-color: ${({ selected, theme }) => (selected ? theme.bg2 : darken(0.05, theme.primary1))};
  }
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
    currencies,
    type,
    disableCurrencySelect = false
}) {
    const [modalOpen, setModalOpen] = useState(false)

    const handleDismissSearch = useCallback(() => {
        setModalOpen(false)
    }, [setModalOpen])

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

                    <CurrencySelect
                        selected={!!selected}
                        className="open-currency-select-button"
                        onClick={() => {
                            if (!disableCurrencySelect) {
                                setModalOpen(true)
                            }
                        }}
                    >
                        <Aligner>
                            {selected ? (
                                selected.symbol === 'EUR' ? (
                                    <Logo src={EUR} alt={selected.symbol} />
                                ) : selected.hasOwnProperty('image') ? (
                                    <Logo src={selected.image.small} alt={selected.symbol} />
                                ) : (
                                    <LogoDiv dangerouslySetInnerHTML={{__html: selected.icon}} />
                                )
                            ) : null}
                            <StyledTokenName className="token-symbol-container" active={Boolean(selected && selected.symbol)}>
                                {(selected && selected.symbol && selected.symbol.length > 20
                                    ? selected.symbol.slice(0, 4) +
                                    '...' +
                                    selected.symbol.slice(selected.symbol.length - 5, selected.symbol.length)
                                    : selected?.symbol) || `Select`}
                            </StyledTokenName>
                            {!disableCurrencySelect && <StyledDropDown selected={!!selected} />}
                        </Aligner>
                    </CurrencySelect>
                </InputRow>
            </Container>


            {!disableCurrencySelect && onSelect && (
                <CurrencySelectModal
                    isOpen={modalOpen}
                    onDismiss={handleDismissSearch}
                    onCurrencySelect={onSelect}
                    selectedCurrency={selected}
                    currencies={currencies}
                    type={type}
                />
            )}
        </InputPanel>
    )
}
