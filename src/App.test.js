import { render } from "./testing/customRender";
import App from "./App";

jest.mock("./theme", () => ({
	FixedGlobalStyle: () => "FixedGlobalStyle",
	ThemedGlobalStyle: () => "ThemedGlobalStyle",
}));

jest.mock("./components/RouteChanger/routeChanger", () => () => <div>RouteChanger</div>);
jest.mock("./components/WalletModal", () => () => <div>WalletModal</div>);
jest.mock("./state/lists/updater", () => () => <div>ListsUpdater</div>);
jest.mock("./state/application/updater", () => () => <div>ApplicationUpdater</div>);
jest.mock("./state/multicall/updater", () => () => <div>MultiCallUpdater</div>);
jest.mock("./state/transactions/updater", () => () => <div>TransactionUpdater</div>);
jest.mock("./state/user/updater", () => () => <div>UserUpdater</div>);
jest.mock("./Routes", () => () => <div>Routes</div>);
jest.mock("./components/Web3ReactManager", () => ({ children }) => <div>Web3ReactManager {children}</div>);
jest.mock("./components/TransactionHandler", () => () => <div>TransactionHandler</div>);

let state = {
	initialState: {
		user: {
			userDarkMode: false,
		},
	},
};

test("smoke test light mode", () => {
	render(<App />, state);
});

test("smoke test dark mode", () => {
	state.initialState.user.userDarkMode = true;
	render(<App />, state);
});

test("requires user state", () => {
	state.initialState.user = null;
	expect(() => render(<App />, state)).toThrow();
});
