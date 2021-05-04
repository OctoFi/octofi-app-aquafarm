import { withRouter } from "react-router-dom";
import { Component } from "react";
import { connect } from "react-redux";
import {
	updateERC20Markets,
	updateERC20Store,
	updateMarketPriceEther,
	updateMarketPriceQuote,
	updateMarketPriceTokens,
} from "../../../../state/spot/actions";
import withWeb3Account from "../../../../components/hoc/withWeb3Account";
import {
	UI_UPDATE_CHECK_INTERVAL,
	UPDATE_ERC20_MARKETS,
	UPDATE_ETHER_PRICE_INTERVAL,
	UPDATE_TOKENS_PRICE_INTERVAL,
} from "../../../../constants";
import Web3 from "web3";

const web3 = new Web3(Web3.givenProvider || new Web3.providers.HttpProvider(process.env.REACT_APP_NETWORK_URL));

class Provider extends Component {
	_deactivatePollingUpdates = () => {
		if (this._updateStoreInterval) {
			clearInterval(this._updateStoreInterval);
			this._updateStoreInterval = undefined;
		}

		if (this._updatePriceEtherInterval) {
			clearInterval(this._updatePriceEtherInterval);
			this._updatePriceEtherInterval = undefined;
		}
		if (this._updatePriceTokensInterval) {
			clearInterval(this._updatePriceTokensInterval);
			this._updatePriceTokensInterval = undefined;
		}
		if (this._updateERC20MarketsInterval) {
			clearInterval(this._updateERC20MarketsInterval);
			this._updateERC20MarketsInterval = undefined;
		}
	};

	_activatePollingUpdates = () => {
		this.props.onUpdateERC20Markets();
		this.props.onUpdateMarketPriceTokens();
		this.props.onUpdateMarketPriceEther();
		this.props.onUpdateMarketPriceQuote();
		if (this.props.web3.account) {
			this.props.onUpdateERC20Store(this.props.web3.account, web3.currentProvider || window.ethereum);
		}
		// Enables realtime updates of the store using polling
		if (UI_UPDATE_CHECK_INTERVAL !== 0 && !this._updateStoreInterval) {
			this._updateStoreInterval = window.setInterval(async () => {
				if (this.props.web3.account) {
					this.props.onUpdateERC20Store(this.props.web3.account, web3.currentProvider || window.ethereum);
					this.props.onUpdateMarketPriceQuote();
					this.setState({
						isActiveCheckUpdates: true,
					});
				}
			}, UI_UPDATE_CHECK_INTERVAL);
		}

		// Enables realtime updates of the price ether and quote token using polling
		if (!this._updatePriceEtherInterval && UPDATE_ETHER_PRICE_INTERVAL !== 0) {
			this._updatePriceEtherInterval = window.setInterval(async () => {
				this.props.onUpdateMarketPriceEther();
				this.props.onUpdateMarketPriceQuote();
			}, UPDATE_ETHER_PRICE_INTERVAL);
		}
		// Enables realtime updates of token prices
		if (!this._updatePriceTokensInterval && UPDATE_TOKENS_PRICE_INTERVAL !== 0) {
			this._updatePriceTokensInterval = window.setInterval(async () => {
				this.props.onUpdateMarketPriceTokens();
			}, UPDATE_TOKENS_PRICE_INTERVAL);
		}
		// Enables realtime updates of the token markets
		if (!this._updateERC20MarketsInterval && UPDATE_ERC20_MARKETS !== 0) {
			this._updateERC20MarketsInterval = window.setInterval(async () => {
				this.props.onUpdateERC20Markets();
			}, UPDATE_ERC20_MARKETS);
		}
	};

	componentDidMount() {
		if (this.props.web3.account) {
			this._activatePollingUpdates();
		} else {
			this.props.onUpdateERC20Markets();
			this.props.onUpdateMarketPriceTokens();
			this.props.onUpdateMarketPriceEther();
			this.props.onUpdateMarketPriceQuote();
			this.props.onUpdateERC20Store("", undefined);
			this._deactivatePollingUpdates();
		}
	}

	componentWillUnmount = () => {
		clearInterval(this._updateStoreInterval);
		clearInterval(this._updatePriceEtherInterval);
		clearInterval(this._updatePriceTokensInterval);
		clearInterval(this._updateERC20MarketsInterval);
	};

	render = () => this.props.children;
}

const mapDispatchToProps = (dispatch) => {
	return {
		onUpdateMarketPriceEther: () => dispatch(updateMarketPriceEther()),
		onUpdateMarketPriceQuote: () => dispatch(updateMarketPriceQuote()),
		onUpdateMarketPriceTokens: () => dispatch(updateMarketPriceTokens()),
		onUpdateERC20Markets: () => dispatch(updateERC20Markets()),
		onUpdateERC20Store: (account, library) => dispatch(updateERC20Store(account, library)),
	};
};

export default withRouter(connect(null, mapDispatchToProps)(withWeb3Account(Provider)));
