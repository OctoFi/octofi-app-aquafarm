import { useMemo, useEffect, useCallback } from "react";
import Web3 from "web3";
import { useDispatch, useSelector } from "react-redux";
import { useActiveWeb3React } from "../../hooks";
import DDexApi from "../../http/ddex";
import * as actions from "./actions";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export const useApi = () => {
	const { account } = useActiveWeb3React();
	const { authCode, authCodeExpire } = useSelector((state) => state.margin);
	const dispatch = useDispatch();
	const web3 = new Web3(Web3.givenProvider || new Web3.providers.WebsocketProvider(process.env.REACT_APP_WSS_URL));

	const api = useMemo(() => {
		return new DDexApi(account, web3);
	}, []);

	useEffect(() => {
		if (authCode) {
			api.setAuthCode(authCode, authCodeExpire);
		}
	}, [authCode, authCodeExpire]);

	useEffect(() => {
		api.setAccount(account);
	}, [account]);

	return api;
};

export const useAuthSigner = () => {
	const { account } = useActiveWeb3React();
	const api = useApi();
	const dispatch = useDispatch();

	return useCallback(async () => {
		if (!account) {
			return null;
		}
		const res = await api.getAuthCode();
		dispatch(actions.setAuthCode(res.authCode));
		dispatch(actions.setAuthCodeExpire(res.authCodeExpire));
		dispatch(actions.setPrivateData());
		return res.authCode;
	}, [dispatch, account]);
};

export const useUserUpdater = () => {
	const dispatch = useDispatch();
	const api = useApi();
	const { account } = useActiveWeb3React();
	const marketId = useSelector((state) => state.margin.selectedMarket);

	return useCallback(() => {
		if (!marketId || !account) {
			return null;
		}

		dispatch(actions.fetchUserLockedBalances(api));
		dispatch(actions.fetchUserTrades(api));
		dispatch(actions.fetchPositions(api));
		dispatch(actions.fetchOrders(api));
	}, [dispatch, account, marketId]);
};

export const useMarketUpdater = () => {
	const api = useApi();
	const dispatch = useDispatch();
	const marketId = useSelector((state) => state.margin.selectedMarket);

	return useCallback(() => {
		dispatch(actions.fetchMarkets(api));

		if (marketId) {
			dispatch(actions.fetchOrderbook(api));
			dispatch(actions.fetchTrades(api));
			dispatch(actions.fetchMarketStats(api));
			dispatch(actions.getGasPrice(api));
		}
	}, [dispatch, marketId]);
};

export const useMarginUpdater = () => {
	const { account } = useActiveWeb3React();
	const marketUpdater = useMarketUpdater();
	const userUpdater = useUserUpdater();

	return useCallback(() => {
		marketUpdater();

		if (account) {
			userUpdater();
		}
	}, [account, marketUpdater, userUpdater]);
};

export const useOrderBuilder = () => {
	const api = useApi();
	const updater = useMarginUpdater();
	const signer = useAuthSigner();
	const { t } = useTranslation();
	const { account } = useActiveWeb3React();

	return useCallback(
		async (body) => {
			try {
				if (!account) {
					return false;
				}
				await signer();
				const res = await api.buildUnsignedOrder(body);
				if (res.hasOwnProperty("order")) {
					const order = res.order;
					const signature = await api.signOrder(order.id);
					const signedOrder = await api.placeOrder({
						orderId: order.id,
						signature,
						method: 0,
					});
					if (signedOrder.desc === "success") {
						toast.success(t("instantSwap.submitted"));
						updater();
						return true;
					} else {
						toast.error(t("errors.default"));
						return false;
					}
				}
			} catch (e) {
				if (e.hasOwnProperty("desc")) {
					toast.error(e.desc);
				} else {
					toast.error(t("errors.default"));
				}
				return false;
			}
		},
		[account, signer, t]
	);
};

export const useOrderCanceler = () => {
	const api = useApi();
	const updater = useMarginUpdater();
	const signer = useAuthSigner();
	const { t } = useTranslation();
	const { account } = useActiveWeb3React();

	return useCallback(
		async (orderId) => {
			try {
				if (!account) {
					return false;
				}
				await signer();
				const res = await api.deleteOrder(orderId);

				if (res.desc === "success") {
					toast.success(t("txnSubmitted"));
					updater();
					return true;
				} else {
					toast.error(t("errors.default"));
					return false;
				}
			} catch (e) {
				if (e.hasOwnProperty("desc")) {
					toast.error(e.desc);
				} else {
					toast.error(t("errors.default"));
				}
				return false;
			}
		},
		[account, signer]
	);
};

export const useMarketChanger = () => {
	const dispatch = useDispatch();
	const api = useApi();
	const updater = useMarginUpdater();

	return useCallback(
		async (marketId) => {
			try {
				const { market } = await api.getMarket(marketId);
				if (market !== null) {
					dispatch(actions.setSelectedMarket(market));
					updater();
					return true;
				}
				return false;
			} catch (e) {
				return false;
			}
		},
		[dispatch]
	);
};
