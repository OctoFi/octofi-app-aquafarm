import React, {KeyboardEvent, RefObject, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react'
import Modal from '../Modal'
import Column, {AutoColumn} from "../Column";
import AutoSizer from "react-virtualized-auto-sizer";
import CurrencyList from "./CurrencyList";
import {PaddedColumn, Separator} from "../SearchModal/styleds";
import {AutoRow, RowBetween} from "../Row";
import {Text} from "rebass";
import QuestionHelper from "../QuestionHelper";
import {CloseIcon} from "../../theme";
import {Form} from "react-bootstrap";
import CommonBases from "../SearchModal/CommonBases";
import SortButton from "../SearchModal/SortButton";
import {currencyEquals, ETHER, Token} from "@uniswap/sdk";
import {filterTokens} from "../SearchModal/filtering";
import {isAddress} from "../../utils";
import styled, {ThemeContext} from "styled-components";
import CurrencyLogo from "../CurrencyLogo";
import {SUGGESTED_BASES} from "../../constants";

const BaseWrapper = styled.div`
  border: 1px solid ${({ theme, disable }) => (disable ? 'transparent' : theme.bg3)};
  border-radius: 10px;
  display: flex;
  padding: 6px;

  align-items: center;
  :hover {
    cursor: ${({ disable }) => !disable && 'pointer'};
    background-color: ${({ theme, disable }) => !disable && theme.bg2};
  }

  background-color: ${({ theme, disable }) => disable && theme.bg3};
  opacity: ${({ disable }) => disable && '0.4'};
`


export default function SwapSelectModal({
    isOpen,
    onDismiss,
    onCurrencySelect,
    selectedCurrency,
    currencies,
    type
}) {
    const theme = useContext(ThemeContext);
    const [searchQuery, setSearchQuery] = useState('')
    const fixedList = useRef()
    const inputRef = useRef();

    const filteredTokens = useMemo(() => {
        return currencies.filter(token => JSON.stringify(token).toLowerCase().includes(searchQuery) || !searchQuery);
    }, [currencies, searchQuery])

    const titles = useMemo(() => {
        return currencies.map((token, index) => {
            return {
                ...token, index
            }
        }).filter(token => token.type === 'title');
    }, [currencies])

    useEffect(() => {
        if (isOpen) {
            setSearchQuery('')
        }
    }, [isOpen])

    const handleInput = useCallback(event => {
        const input = event.target.value
        setSearchQuery(input.toLowerCase())
        fixedList.current.scrollTo(0)
    }, [])

    const handleCurrencySelect = useCallback(
        (currency) => {
            onCurrencySelect(currency, type)
            onDismiss()
        },
        [onDismiss, onCurrencySelect]
    )


    return (
        <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={80} minHeight={80}>


            <Column style={{ width: '100%', flex: '1 1', minHeight: '100px' }}>
                <PaddedColumn gap="14px">
                    <Form.Control
                        size={"lg"}
                        style={{
                            backgroundColor: theme.bg2,
                            color: theme.text1
                        }}
                        type="text"
                        id="token-search-input"
                        placeholder={'Search name or paste address'}
                        value={searchQuery}
                        ref={inputRef}
                        onChange={handleInput}
                    />


                </PaddedColumn>
                <Separator />


                <div style={{ flex: '1' }}>
                    <AutoSizer disableWidth>
                        {({ height }) => (
                            <CurrencyList
                                height={height}
                                currencies={filteredTokens}
                                onCurrencySelect={handleCurrencySelect}
                                selectedCurrency={selectedCurrency}
                                fixedListRef={fixedList}
                            />
                        )}
                    </AutoSizer>
                </div>

            </Column>
        </Modal>
    )
}
