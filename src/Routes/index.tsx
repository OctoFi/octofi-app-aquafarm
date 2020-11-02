import React, { useEffect, useState } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {TokenAmount} from "@uniswap/sdk";
import { useSnackbar } from 'notistack';

import { fetchBalances, fetchTransformedBalances } from "../state/balances/actions";
import { fetchOpenSeaAssets } from "../state/opensea/actions";
import {useMemoTokenBalances} from '../state/balances/hooks';
import { AppState } from "../state";
import { useActiveWeb3React } from "../hooks";
import {Layout} from "../components/_metronic/layout";
import RouteChanger from '../components/RouteChanger/routeChanger';
import ConnectPage from '../Pages/Connect';
import Dashboard from '../Pages/Dashboard';
import Pools from '../Pages/Pools';
import Explore from '../Pages/Explore';
import ExploreTypeList from '../Pages/ExploreTypeList';
import Market from '../Pages/Market';
import CoinDetails from '../Pages/CoinDetails';
// import Invest from '../Pages/Invest';
import Platforms from '../Pages/Platforms';
import Exchange from '../Pages/Exchange';
import NFT from '../Pages/NFT';
import History from '../Pages/History';
import BuyCrypto from '../Pages/BuyCrypto';
import Governance from '../Pages/Governance';
import Proposals from '../Pages/Proposals';
import CreateProposal from '../Pages/CreateProposal';
import Vote from '../Pages/Vote';
import AddBalance from '../Pages/AddBalance';
import Error404 from '../Pages/Error/404';
import WalletModal from "../components/WalletModal";
import { BalanceToken } from "../constants";
import { useMemoTokenBalance } from '../hooks/checkBalance';
import SplashScreen from '../components/SplashScreen';
import {haveEnoughBalance} from "../state/account/actions";


const Routes = () => {
    const address = process.env.REACT_APP_OPENSEA_ADDRESS || '';
    let { account, deactivate } = useActiveWeb3React();
    const [loading, setLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();

    const balances = useSelector((state: AppState) => state.balances.data);
    // @ts-ignore
    const { ETH } = useSelector((state: AppState) => state.currency.currenciesRate)
    const accountBalance = useSelector((state: AppState) => state.account.enoughCoinBalance)
    const dispatch = useDispatch();
    const walletBalances = useMemoTokenBalances()

    const TokenBalance: TokenAmount | undefined = useMemoTokenBalance(account, BalanceToken);

    useEffect(() => {
        if(account) {
            setLoading(true)
            if(TokenBalance) {
                const value = TokenBalance.toSignificant(6);
                if (Number(value) < 1) {
                    dispatch(haveEnoughBalance(false));
                } else {
                    dispatch(haveEnoughBalance(true));
                }
                setLoading(false)
            }
        } else {
            setLoading(false);
        }
    }, [account, TokenBalance, enqueueSnackbar, deactivate, dispatch])

    useEffect(() => {
        if(account) {
            dispatch(fetchBalances(account))
        }
    }, [account, dispatch])

    useEffect(() => {
        dispatch(fetchTransformedBalances(balances, walletBalances, ETH));
    }, [balances, walletBalances, ETH, dispatch]);

    useEffect(() => {
        dispatch(fetchOpenSeaAssets(address));
    }, [address, dispatch]);

    return (
        <>
            <RouteChanger/>
            <WalletModal/>
            <SplashScreen loading={loading}/>
            {!loading && (!account ? (
                    <Switch>
                        <Route path={'/'} exact component={ConnectPage}/>
                        <Route path={'/404'} exact component={Error404}/>
                        <Redirect from={'/dashboard'} to={'/'} exact />
                        <Redirect from={'/pools'} to={'/'} exact />
                        <Redirect from={'/invest'} to={'/'} exact />
                        <Redirect from={'/exchange'} to={'/'} exact />
                        <Redirect from={'/protocols'} to={'/'} exact />
                        <Redirect from={'/history'} to={'/'} exact />
                        <Redirect from={'/explore'} to={'/'}/>
                        <Redirect from={'/market'} to={'/'}/>
                        <Redirect from={'/coins'} to={'/'}/>
                        <Redirect from={'/buy'} to={'/'}/>
                        <Redirect path={'/governance'} to={'/'}/>
                        <Redirect to={'/404'}/>
                    </Switch>
            ) : accountBalance ? (
                <Layout>
                    <Switch>
                        <Route path={'/dashboard'} component={Dashboard}/>
                        <Route path={'/pools'} component={Pools}/>
                        <Route path={'/exchange'} exact component={Exchange}/>
                        <Route path={'/history'} exact component={History}/>
                        <Route path={'/explore'} exact component={Explore}/>
                        <Route path={'/explore/:type'} exact component={ExploreTypeList} />
                        <Route path={'/explore/:type/:address'} exact component={Explore}/>
                        <Route path={'/market'} exact component={Market}/>
                        <Route path={'/market/:id'} exact component={CoinDetails}/>
                        <Route path={'/coins/:id'} exact component={CoinDetails}/>
                        <Route path={'/buy'} exact component={BuyCrypto}/>
                        <Route path={'/governance'} exact component={Governance}/>
                        <Route path={'/governance/:space/create'} exact component={CreateProposal}/>
                        <Route path={'/governance/:space'} exact component={Proposals}/>
                        <Route path={'/governance/:space/proposal/:id'} exact component={Vote}/>
                        {/*<Route path={'/invest'} exact component={Invest}/>*/}
                        <Route path={'/nft'} exact component={NFT}/>
                        <Route path={'/platforms/:platform'} exact component={Platforms}/>
                        <Redirect to={'/dashboard'}/>
                    </Switch>
                </Layout>
            ) : (
                <Switch>
                    <Route path={'/exchange'} component={AddBalance}/>
                    <Redirect to={'/exchange'}/>
                </Switch>
            ))}
        </>
    )
}

export default Routes;