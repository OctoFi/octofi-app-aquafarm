import React from 'react';
import { useWeb3React } from "@web3-react/core";
import {useEagerConnect} from "../../lib/hooks";

const withWeb3Account = (Component: any) => {
    return (props: any) => {
        const context = useWeb3React();
        const { error, account } = context;

        // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
        const triedEager = useEagerConnect()

        return <Component
            error={error}
            account={account}
            triedEager={triedEager}
            { ...props }/>
    }
}

export default withWeb3Account;