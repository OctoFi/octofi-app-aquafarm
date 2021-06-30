import { Switch, Route, Redirect } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useActiveWeb3React } from "./hooks";
import SplashScreen from "./components/SplashScreen";
import { fetchCurrencies } from "./state/currency/actions";
import HomePage from "./pages/Home";
import { useDarkModeManager } from "./state/user/hooks";
import Page from "./components/Page";
import WrongNetwork from "./components/WrongNetwork";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Platform = lazy(() => import("./pages/Platform"));
const Pools = lazy(() => import("./pages/Pools"));
const Swap = lazy(() => import("./pages/Swap"));
const InstantSwap = lazy(() => import("./pages/InstantSwap"));
const Explore = lazy(() => import("./pages/Explore"));
const ExploreTypeList = lazy(() => import("./pages/ExploreTypeList"));
const CoinDetails = lazy(() => import("./pages/CoinDetails"));
const Governance = lazy(() => import("./pages/Governance"));
const CreateProposal = lazy(() => import("./pages/CreateProposal"));
const Proposals = lazy(() => import("./pages/Proposals"));
const Vote = lazy(() => import("./pages/Vote"));
const History = lazy(() => import("./pages/History"));
const Wallet = lazy(() => import("./pages/Wallet"));
const FiatOff = lazy(() => import("./pages/FiatOff"));
const FiatOn = lazy(() => import("./pages/FiatOn"));
const NFT = lazy(() => import("./pages/NFT"));
const Borrow = lazy(() => import("./pages/Borrow"));
const TokenSets = lazy(() => import("./pages/TokenSets"));
const Launchpad = lazy(() => import("./pages/Launchpad"));
const LaunchpadItem = lazy(() => import("./pages/LaunchpadItem"));
const NewLaunchpad = lazy(() => import("./pages/NewLaunchpad"));
const CrossRouteHandler = lazy(() => import("./CrossRouteHandler"));


const Routes = (props) => {
	const [darkMode] = useDarkModeManager();
	const { account, chainId } = useActiveWeb3React();

	const selectedCurrency = useSelector((state) => state.currency.selected);
	const dispatch = useDispatch();

	useEffect(() => {
		if (darkMode) {
			document.body.classList.add("dark-mode");
		} else {
			document.body.classList.remove("dark-mode");
		}
	}, [darkMode]);

	useEffect(() => {
		dispatch(fetchCurrencies(selectedCurrency));
	}, [selectedCurrency, dispatch]);

	return (
		<>
			<Suspense fallback={<SplashScreen />}>
				<Switch>
					<Route path={"/"} component={HomePage} exact />
					<Route path={'/cross'} component={CrossRouteHandler}/>
					{chainId && chainId !== 1 ? (
						<Route path={'/'}>
							<Page>
								<WrongNetwork/>
							</Page>
						</Route>
					) : (
						<Switch>
							<Route path={"/platforms/:platform"} component={Platform} />
							<Route path={"/fiat/off-cards"} component={FiatOff} />
							<Route path={"/fiat/on"} component={FiatOn} />
							<Route path={"/invest"} exact component={Explore} />
							<Route path={"/invest/pools"} component={Pools} />
							<Route path={"/invest/nft"} exact component={NFT} />
							<Route path={"/invest/loans"} component={Borrow} />
							<Route path={"/invest/tokensets"} component={TokenSets} />
							<Route path={"/invest/launchpad"} exact component={Launchpad}/>
							<Route path={"/invest/launchpad/new"} exact component={NewLaunchpad}/>
							<Route path={'/invest/launchpad/:address'} exact component={LaunchpadItem}/>
							<Route path={"/invest/:type"} exact component={ExploreTypeList} />
							<Route path={"/swap/uni"} component={Swap} />
							<Route path={"/swap/all"} component={InstantSwap} />
							<Route path={"/swap/all"} component={InstantSwap} />
							<Route path={"/governance"} exact component={Governance} />
							<Route path={"/governance/:space/create"} exact component={CreateProposal} />
							<Route path={"/governance/:space"} exact component={Proposals} />
							<Route path={"/governance/:space/proposal/:id"} exact component={Vote} />
							<Route path={"/market/:id"} exact component={CoinDetails} />
							<Route path={"/coins/:id"} exact component={CoinDetails} />
							{account && (
								<>
									<Route path={"/account/history"} exact component={History} />
									<Route path={"/account/wallet"} exact component={Wallet} />
									<Route path={"/dashboard"} component={Dashboard} />
								</>
							)}

							<Redirect to={"/?error=1"} />
						</Switch>
					)}
				</Switch>
			</Suspense>
		</>
	);
};

export default Routes;
