import React from 'react';
import { useSelector } from "react-redux";

import { rates as currencies } from "../../constants";
import { formatMoney } from "../../lib/helper";

const CurrencyText = (props: any) => {
    // @ts-ignore
    const {selected, currenciesRate}: { selected: any, currenciesRate: any } = useSelector(state => state.currency);
    const value = props.children * (currenciesRate[selected] || 1) ;
    return (
        <>
            {currencies[selected].symbol + formatMoney(value, value < 0.1 && value !== 0 ? 6 : 2)}
        </>
    );
}

export default CurrencyText;