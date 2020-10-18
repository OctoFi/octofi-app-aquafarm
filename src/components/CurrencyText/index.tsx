import React from 'react';
import { useSelector } from "react-redux";

import { rates as currencies } from "../../constants";
import { formatMoney } from "../../lib/helper";

const CurrencyText = (props: any) => {
    // @ts-ignore
    const {selected, currenciesRate}: { selected: any, currenciesRate: any } = useSelector(state => state.currency);
    const value = props.children * (currenciesRate[selected] || 1);
    const formattedValue = formatMoney(value, value < 0.1 && value !== 0 ? 6 : 2);
    if(props.type === 'grey-dark') {
        const splitedValue = formattedValue?.split('.');
        return (
            <>
                {currencies[selected].symbol + splitedValue?.[0]}<span className={'text-muted opacity-60'}>.{splitedValue?.[1]}</span>
            </>
        )
    }
    return (
        <>
            {currencies[selected].symbol + formattedValue}
        </>
    );
}

export default CurrencyText;