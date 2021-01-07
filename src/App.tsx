import React, { useEffect } from 'react';

import Routes from './Routes';
import Web3ReactManager from "./components/Web3ReactManager";
import {useDarkModeManager} from "./state/user/hooks";

const App = () => {
    const [darkMode] = useDarkModeManager();

    useEffect(() => {
        if(darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [darkMode])

    return (
        <Web3ReactManager>
            <Routes/>
        </Web3ReactManager>
    )
}

export default App;