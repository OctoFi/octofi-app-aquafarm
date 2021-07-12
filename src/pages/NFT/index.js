import { Component } from "react";
import { withTranslation } from "react-i18next";
import { Row, Col, Button } from "react-bootstrap";
import Web3 from "web3";
import { OpenSeaPort, Network } from "opensea-js";
import { OrderSide } from "opensea-js/lib/types";

import Page from "../../components/Page";
import Collections from "../../components/Collections";
import withWeb3Account from "../../components/hoc/withWeb3Account";
import Orders from "./Orders";
import * as Styled from "./styleds";

const PAGE_SIZE = 24;

class NFT extends Component {
	state = {
		selectedCollection: undefined,
		side: OrderSide.Buy,
		onlyForMe: false,
		onlyByMe: false,
		onlyBundles: false,
		hasMore: true,
		sort: "",
		orders: [],
		page: 1,
	};

	componentDidMount() {
		const web3 = new Web3(Web3.givenProvider || new Web3.providers.HttpProvider(process.env.REACT_APP_NETWORK_URL));
		this.seaport = new OpenSeaPort(web3.currentProvider || window.ethereum, {
			networkName: Network.Main,
		});
		this.web3 = this.seaport.web3;
	}

	render() {
		const sellSide = this.state.side === OrderSide.Sell;
		const buySide = this.state.side === OrderSide.Buy;
		const { selectedCollection, onlyByMe, onlyForMe, onlyBundles, orders, hasMore } = this.state;
		const { t } = this.props;

		return (
			<Page networkSensitive={true} fluid={true}>
				<Row>
					<Styled.FiltersCol xs={12} md={4}>
						<Styled.CardSection>
							<Styled.Title>{t("orderbookSide")}</Styled.Title>
							<div className="d-flex align-items-center">
								<Button
									variant={sellSide ? "primary" : "light-primary"}
									onClick={() => this.toggleSide(OrderSide.Sell)}
									className={"w-50 mr-1"}
								>
									{t("auction")}
								</Button>
								<Button
									variant={buySide ? "primary" : "light-primary"}
									onClick={() => this.toggleSide(OrderSide.Buy)}
									className={"w-50 ml-1"}
								>
									{t("bids")}
								</Button>
							</div>
						</Styled.CardSection>
						<Styled.CardSection>
							<Styled.Title>{t("accountFilter")}</Styled.Title>
							<div className="d-flex align-items-center">
								<Button
									variant={onlyForMe ? "primary" : "light-primary"}
									onClick={this.toggleForMe}
									className={"w-50 mr-1"}
								>
									{t("forMe")}
								</Button>
								<Button
									variant={onlyByMe ? "primary" : "light-primary"}
									onClick={this.toggleByMe}
									className={"w-50 ml-1"}
								>
									{t("byMe")}
								</Button>
							</div>
						</Styled.CardSection>
						<Styled.CardSection>
							<Styled.Title>{t("bundles")}</Styled.Title>
							<div className="d-flex align-items-center">
								<Button
									variant={onlyBundles ? "primary" : "light-primary"}
									onClick={this.toggleBundles}
									className={"flex-grow-1"}
									block
								>
									{t("onlyBundles")}
								</Button>
							</div>
						</Styled.CardSection>
						<Styled.CardSection>
							<Styled.Title>{t("collections")}</Styled.Title>
							<Collections
								onChangeCollection={this.changeSelectedCollection}
								selected={selectedCollection}
							/>
						</Styled.CardSection>
					</Styled.FiltersCol>
					<Col xs={12} sm={true}>
						<Orders
							seaport={this.seaport}
							web3={this.web3}
							selectedCollection={selectedCollection}
							fetchOrders={this.fetchOrders}
							increasePage={this.increasePage}
							setSort={this.setSort}
							orders={orders}
							hasMore={hasMore}
							page={this.state.page}
						/>
					</Col>
				</Row>
			</Page>
		);
	}

	toggleSide = (s) => {
		if (this.state.side === s) {
			s = undefined;
		}
		this.setState(
			{
				page: 1,
				side: s,
				onlyForMe: undefined,
				hasMore: true,
			},
			() => this.fetchOrders()
		);
	};

	toggleForMe = async () => {
		this.setState(
			(prevState) => {
				return {
					side: prevState.onlyForMe ? undefined : OrderSide.Buy,
					onlyByMe: false,
					page: 1,
					onlyForMe: !prevState.onlyForMe,
					hasMore: true,
				};
			},
			() => this.fetchOrders()
		);
	};

	toggleBundles = () => {
		this.setState(
			(prevState) => {
				return {
					side: OrderSide.Sell,
					onlyByMe: false,
					page: 1,
					onlyBundles: !prevState.onlyBundles,
					hasMore: true,
				};
			},
			() => this.fetchOrders()
		);
	};

	toggleByMe = () => {
		this.setState(
			(prevState) => {
				return {
					side: OrderSide.Sell,
					onlyForMe: false,
					page: 1,
					onlyByMe: !prevState.onlyByMe,
					hasMore: true,
				};
			},
			() => this.fetchOrders()
		);
	};

	changeSelectedCollection = (collection) => {
		this.setState(
			(prevState) => {
				return {
					selectedCollection: prevState.selectedCollection === collection.slug ? undefined : collection.slug,
					page: 1,
					hasMore: true,
				};
			},
			() => this.fetchOrders()
		);
	};

	getOrderSort = () => {
		switch (this.state.sort) {
			case "recently_created": {
				return {
					order_by: "created_date",
					order_direction: "desc",
				};
			}
			case "oldest": {
				return {
					order_by: "created_date",
					order_direction: "asc",
				};
			}
			case "lowest_price": {
				return {
					order_by: "eth_price",
					order_direction: "asc",
				};
			}
			case "highest_price": {
				return {
					order_by: "eth_price",
					order_direction: "desc",
				};
			}
			default: {
				return {};
			}
		}
	};

	setPage = (page = 1) => {
		this.setState({
			page,
		});
	};

	increasePage = () => {
		this.setState((prevState) => {
			return {
				page: prevState.page + 1,
			};
		});
	};

	setSort = (sort) => {
		this.setState(
			{
				sort: sort,
				page: 1,
			},
			() => this.fetchOrders()
		);
	};

	fetchOrders = async () => {
		if (this.seaport) {
			const { page, selectedCollection, onlyByMe, onlyForMe, side, onlyBundles } = this.state;
			const { account } = this.props.web3;
			if (page === 1) {
				this.setState({
					orders: [],
				});
			}
			try {
				const { orders } = await this.seaport.api.getOrders(
					{
						collection_slug: selectedCollection || undefined,
						limit: PAGE_SIZE,
						maker: onlyByMe ? account : undefined,
						owner: onlyForMe ? account : undefined,
						side: side,
						bundled: onlyBundles ? true : undefined,
						...this.getOrderSort(),
					},
					page
				);

				this.setState({
					hasMore: !(orders.length < PAGE_SIZE),
				});

				if (page === 1) {
					this.setState({
						orders,
					});
				} else {
					this.setState((prevState) => {
						return {
							orders: prevState.orders.concat(orders),
						};
					});
				}
			} catch (e) {}
		}
	};
}

export default withWeb3Account(withTranslation()(NFT));
