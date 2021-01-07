import { createReducer } from '@reduxjs/toolkit'
import { setCurrenciesRates, changeSelectedCurrency, setGasPrice, changeGasPrice } from './actions'

const initialState = {
    selected: 'USD',
    currenciesRate: {},
    gasPrice: [],
    selectedGasPrice: 'fast'
}

export default createReducer(initialState, builder =>
    // @ts-ignore
    builder
        .addCase(setCurrenciesRates, (state, { payload: { rates } }) => {
            return {
                ...state,
                currenciesRate: {
                    ...rates
                }
            }
        })
        .addCase(changeSelectedCurrency, (state, { payload: { id } }) => {
            return {
                ...state,
                selected: id
            }
        })
        .addCase(setGasPrice, (state, {payload}) => {
            return {
                ...state,
                gasPrice: Object.keys(payload).map(gas => {
                    return [gas, payload[gas]]
                }).filter(item => {
                    return !['health', "block_number", 'block_time'].includes(item[0])
                })
            }
        })
        .addCase(changeGasPrice, (state, { payload }) => {
            return {
                ...state,
                selectedGasPrice: payload
            }
        })
)
