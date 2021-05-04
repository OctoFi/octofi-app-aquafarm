import { Route, Switch } from 'react-router-dom';
import {lazy, Suspense} from "react";

import LocalStorageContextProvider, { Updater as LocalStorageContextUpdater } from './contexts/LocalStorage'
import ApplicationContextProvider, { Updater as ApplicationContextUpdater } from './contexts/Application'
import TransactionContextProvider, { Updater as TransactionContextUpdater } from './contexts/Transactions'
import BalancesContextProvider, { Updater as BalancesContextUpdater } from './contexts/Balances'
import TokensContextProvider from './contexts/Tokens/index.js'
import AllowancesContextProvider from './contexts/Allowances'
import SplashScreen from "./components/SplashScreen";

const CrossBalance = lazy(() => import("./pages/CrossBalance"));
const CrossBridge = lazy(() => import("./pages/CrossBridge"));
const CrossAnySwap = lazy(() => import("./pages/CrossAnySwap"))

function ContextProviders({ children }) {
	return (
		<LocalStorageContextProvider>
			<ApplicationContextProvider>
				<TransactionContextProvider>
					<TokensContextProvider>
						<BalancesContextProvider>
							<AllowancesContextProvider>{children}</AllowancesContextProvider>
						</BalancesContextProvider>
					</TokensContextProvider>
				</TransactionContextProvider>
			</ApplicationContextProvider>
		</LocalStorageContextProvider>
	)
}


function Updaters() {
	return (
		<>
			<LocalStorageContextUpdater />
			<ApplicationContextUpdater />
			<TransactionContextUpdater />
			<BalancesContextUpdater />
		</>
	)
}

const CrossRouteHandler = props => {
	return (
		<ContextProviders>
			<Updaters/>
			<Suspense fallback={<SplashScreen />}>
				<Switch>
					<Route path={"/cross/balance"} component={CrossBalance} />
					<Route path={"/cross/bridges"} component={CrossBridge} />
					<Route path={"/cross/anyswap"} component={CrossAnySwap} />
				</Switch>
			</Suspense>
		</ContextProviders>
	)
}

export default CrossRouteHandler;