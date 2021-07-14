import React, { Component } from "react";
import { connect } from "react-redux";
import { Route, Switch } from "react-router-dom";

import PoolsCard from "./PoolsCard";
import AddLiquidityModal from "../../components/AddLiquidityModal";
import RemoveLiquidityModal from "../../components/RemoveLiquidityModal";
import UniswapLiquidityModal from "../../components/AddLiquidityModal/uniswap";
import * as actions from "../../state/pools/actions";
import Page from "../../components/Page";
import { emitter } from "../../lib/helper";

class Pools extends Component {
	investButtonClick = () => {
		emitter.emit("open-modal", {
			action: () => {
				this.props.history.push("/invest/pools");
				emitter.emit("close-modal");
			},
		});
		this.props.history.push("/invest/pools/ETH/undefined");
	};
	addLiquidityDialog = (type, pool) => {
		emitter.emit("open-modal", {
			action: () => {
				this.props.history.push(`/invest/pools`);
				emitter.emit("close-modal");
			},
		});
		if (type === "Uniswap") {
			const currencyA = pool.token0.symbol.toUpperCase() === "ETH" ? "ETH" : pool.token0.id;
			const currencyB = pool.token1.id;
			this.props.history.push(`/invest/pools/${currencyA}/${currencyB}`);
		} else {
			this.props.setSelectedPool(type, pool);
			this.props.history.push(`/invest/pools/ETH/`);
		}
	};
	removeLiquidityDialog = (type, pool) => {
		this.props.setSelectedPool(type, pool);
		this.props.history.push(`/invest/pools/remove/ETH/`);
		emitter.emit("open-modal", {
			action: () => {
				this.props.history.push(`/invest/pools`);
				emitter.emit("close-modal");
			},
		});
	};
	render() {
		return (
			<Page title={"Pools"} networkSensitive={true}>
				<PoolsCard
					investHandler={this.investButtonClick}
					addLiquidityHandler={this.addLiquidityDialog}
					removeLiquidityHandler={this.removeLiquidityDialog}
				/>
				<Switch>
					<Route path={"/invest/pools/remove/ETH"} exact component={RemoveLiquidityModal} />
					<Route path={"/invest/pools/:currencyIdA/:currencyIdB"} exact component={UniswapLiquidityModal} />
					<Route path={"/invest/pools/ETH"} exact component={AddLiquidityModal} />
				</Switch>
			</Page>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		account: state.account,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		setSelectedPool: (type, pool) => dispatch(actions.selectPool(type, pool)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Pools);
