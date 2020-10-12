import React, { useEffect } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBalances, fetchTransformedBalances } from "../state/balances/actions";
import { fetchOpenSeaAssets } from "../state/opensea/actions";
import {useMemoTokenBalances} from '../state/balances/hooks';
import { AppState } from "../state";

import { useActiveWeb3React } from "../hooks";
import {Layout} from "../components/_metronic/layout";
import RouteChanger from '../components/RouteChanger/routeChanger';
import ConnectPage from '../Pages/Connect';
import Dashboard from '../Pages/Dashboard';
import Invest from '../Pages/Invest';
import Platforms from '../Pages/Platforms';
import Exchange from '../Pages/Exchange';
import OpenSea from '../Pages/OpenSea';
import Error404 from '../Pages/Error/404';
import WalletModal from "../components/WalletModal";


const Routes = () => {
    const address = process.env.REACT_APP_OPENSEA_ADDRESS || '';
    let context = useActiveWeb3React();
    const balances = useSelector((state: AppState) => state.balances.data);
    // @ts-ignore
    const { ETH } = useSelector((state: AppState) => state.currency.currenciesRate)
    const dispatch = useDispatch();
    const walletBalances = useMemoTokenBalances()

    useEffect(() => {
        if(context.account) {
            dispatch(fetchBalances(context.account))
        }
    }, [context.account, dispatch])

    useEffect(() => {
        dispatch(fetchTransformedBalances(balances, walletBalances, ETH));
    }, [balances, walletBalances]);

    useEffect(() => {
        dispatch(fetchOpenSeaAssets(address));
    }, [address]);

    return (
        <>
            <RouteChanger/>
            <WalletModal/>
            {context.account ? (
                <Layout>
                    <Switch>
                        <Route path={'/dashboard'} component={Dashboard}/>
                        <Route path={'/invest'} component={Invest}/>
                        <Route path={'/exchange'} exact component={Exchange}/>
                        <Route path={'/opensea'} exact component={OpenSea}/>
                        <Route path={'/platforms/:platform'} exact component={Platforms}/>
                        <Redirect to={'/dashboard'}/>
                    </Switch>
                </Layout>
            ) : (
                <Switch>
                    <Route path={'/'} exact component={ConnectPage}/>
                    <Route path={'/404'} exact component={Error404}/>
                    <Redirect from={'/dashboard'} to={'/'} exact />
                    <Redirect from={'/invest'} to={'/'} exact />
                    <Redirect from={'/exchange'} to={'/'} exact />
                    <Redirect from={'/opensea'} to={'/'} exact />
                    <Redirect from={'/protocols'} to={'/'} exact />
                    <Redirect to={'/404'}/>
                </Switch>
            )}
        </>
    )
}

export default Routes;