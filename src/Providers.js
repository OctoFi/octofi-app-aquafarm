import { Provider } from "react-redux";
import { store } from "./state";
import ThemeProvider from "./theme";

const Providers = (props) => {
	return (
		<Provider store={store}>
			<ThemeProvider>{props.children}</ThemeProvider>
		</Provider>
	);
};

export default Providers;
