import React from 'react';
import {useActiveWeb3React} from "../../hooks";

const withWeb3Account = (Component: any) => {
    return (props: any) => {
        const context = useActiveWeb3React();
        return <Component
            web3={context}
            { ...props }/>
    }
}

export default withWeb3Account;