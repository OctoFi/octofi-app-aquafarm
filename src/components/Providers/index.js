import {Web3ReactProvider} from "@web3-react/core";
import React from "react";

import functions from './functions';

export default function(props) {
    return (
        <Web3ReactProvider getLibrary={functions.getLibrary}>
            {props.children}
        </Web3ReactProvider>
    )
}