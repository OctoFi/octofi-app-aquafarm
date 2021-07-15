import React from "react";
import ReactDOM from "react-dom";
import "inter-ui";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { createWeb3ReactRoot, Web3ReactProvider } from "@web3-react/core";
import getLibrary from "./utils/getLibrary";
import { NetworkContextName } from "./constants";
import "./i18n";
import Providers from "./Providers";

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName);

ReactDOM.render(
	<React.StrictMode>
		<Web3ReactProvider getLibrary={getLibrary}>
			<Web3ProviderNetwork getLibrary={getLibrary}>
				<Providers>
					<App />
				</Providers>
			</Web3ProviderNetwork>
		</Web3ReactProvider>
	</React.StrictMode>,
	document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
