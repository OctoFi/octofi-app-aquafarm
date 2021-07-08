import React from "react";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";
import "inter-ui";
import { createWeb3ReactRoot, Web3ReactProvider } from "@web3-react/core";
import getLibrary from "../utils/getLibrary";
import { NetworkContextName } from "../constants";
import "../i18n";
import { createStore } from "redux";
import { reducer } from "./testReducer";

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName);

jest.mock("@web3-react/ledger-connector", () => ({
	LedgerConnector: jest.fn(() => ({})),
}));

jest.mock("@web3-react/trezor-connector", () => ({
	TrezorConnector: jest.fn(() => ({})),
}));

jest.mock("@web3-react/torus-connector", () => ({
	TorusConnector: jest.fn(() => ({})),
}));

jest.mock("@web3-react/portis-connector", () => ({
	PortisConnector: jest.fn(() => ({})),
}));

const customRender = (ui, { initialState, store = createStore(reducer, initialState), ...renderOptions } = {}) => {
	const Wrapper = ({ children }) => {
		return (
			<React.StrictMode>
				<Web3ReactProvider getLibrary={getLibrary}>
					<Web3ProviderNetwork getLibrary={getLibrary}>
						<Provider store={store}>{children}</Provider>
					</Web3ProviderNetwork>
				</Web3ReactProvider>
			</React.StrictMode>
		);
	};

	return render(ui, { wrapper: Wrapper, ...renderOptions });
};

export * from "@testing-library/react";

export { customRender as render };
