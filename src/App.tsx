import React, { Component } from 'react';

import Routes from './Routes';
import Web3ReactManager from "./components/Web3ReactManager";

class App extends Component{
    render() {
        return (
            <Web3ReactManager>
                <Routes/>
            </Web3ReactManager>
        )
    }
}

export default App;