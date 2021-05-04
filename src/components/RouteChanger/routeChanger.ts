import { Component } from "react";
import { withRouter } from "react-router-dom";

import { emitter } from "../../lib/helper";

interface Props {
	history: {
		push: (path: string, state: any) => void;
	};
}

class RouteChanger extends Component<Props> {
	componentDidMount() {
		emitter.on("change-route", this.changeRouteHandler);
	}

	componentWillUnmount() {
		emitter.off("change-route", this.changeRouteHandler);
	}

	changeRouteHandler = (e: any) => {
		this.props.history?.push(e.path, e.state || {});
	};

	render() {
		return null;
	}
}

// @ts-ignore
export default withRouter(RouteChanger);
