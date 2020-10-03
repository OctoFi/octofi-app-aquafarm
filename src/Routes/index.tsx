import React, { useEffect } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchBalances } from "../state/balances/actions";

import { useActiveWeb3React } from "../hooks";
import {Layout} from "../components/_metronic/layout";
import RouteChanger from '../components/RouteChanger/routeChanger';
import ConnectPage from '../Pages/Connect';
import Dashboard from '../Pages/Dashboard';
import Invest from '../Pages/Invest';
import Exchange from '../Pages/Exchange';
import Error404 from '../Pages/Error/404';

const Routes = () => {
    let context = useActiveWeb3React();
    const dispatch = useDispatch();

    useEffect(() => {
        if(context.account) {
            dispatch(fetchBalances(context.account))
        }
    }, [context.account])
    return (
        <>
            <RouteChanger/>
            {context.account ? (
                <Layout>
                    <Switch>
                        <Route path={'/dashboard'} component={Dashboard}/>
                        <Route path={'/invest'} component={Invest}/>
                        <Route path={'/exchange'} exact component={Exchange}/>
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
                    <Redirect from={'/protocols'} to={'/'} exact />
                    <Redirect to={'/404'}/>
                </Switch>
            )}
        </>
    )
}

export default Routes;