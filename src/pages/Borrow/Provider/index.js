import { ApolloProvider } from "@apollo/react-hooks";

import { getAaveGraphClient } from "../../../services/aave/aave";

const GraphQlProvider = (props) => {
	return <ApolloProvider client={getAaveGraphClient()}>{props.children}</ApolloProvider>;
};

export default GraphQlProvider;
