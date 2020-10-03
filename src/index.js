import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core'
//import { BrowserRouter } from "react-router-dom";
import { HashRouter } from "react-router-dom";
import { Provider } from "react-redux";
import App from './App';
import { NetworkContextName } from "./constants";
import { store } from "./state";

import ApplicationUpdater from './state/application/updater'
import ListsUpdater from './state/lists/updater'
import MulticallUpdater from './state/multicall/updater'
import TransactionUpdater from './state/transactions/updater'
import UserUpdater from './state/user/updater'
import getLibrary from './utils/getLibrary'
import ThemeProvider from './theme'

import "./components/_metronic/_assets/plugins/keenthemes-icons/font/ki.css";
import "socicon/css/socicon.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./components/_metronic/_assets/plugins/flaticon/flaticon.css";
import "./components/_metronic/_assets/plugins/flaticon2/flaticon.css";
import "react-datepicker/dist/react-datepicker.css";
import './normalize.css';

import './style.scss';


import {
    MetronicLayoutProvider,
    MetronicSplashScreenProvider,
    MetronicSubheaderProvider
} from "./components/_metronic/layout";


const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

function Updaters() {
    return (
        <>
            <ListsUpdater />
            <UserUpdater />
            <ApplicationUpdater />
            <TransactionUpdater />
            <MulticallUpdater />
        </>
    )
}

ReactDOM.render(
    (<Web3ReactProvider getLibrary={getLibrary}>
        <Web3ProviderNetwork getLibrary={getLibrary}>
            <MetronicLayoutProvider>
                <MetronicSubheaderProvider>
                    <MetronicSplashScreenProvider>
                        <Provider store={store}>
                            <HashRouter basename={'/octofi-app-aquafarm'}>
                                <Updaters />
                                <ThemeProvider>
                                    <App />
                                </ThemeProvider>
                            </HashRouter>
                        </Provider>
                    </MetronicSplashScreenProvider>
                </MetronicSubheaderProvider>
            </MetronicLayoutProvider>
        </Web3ProviderNetwork>
    </Web3ReactProvider>),
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
