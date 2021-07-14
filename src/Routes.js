import { Switch, Route, Redirect } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";

// import { useActiveWeb3React } from "./hooks";
import SplashScreen from "./components/SplashScreen";
import { fetchCurrencies } from "./state/currency/actions";
import { useDarkModeManager } from "./state/user/hooks";
// import Page from "./components/Page";
// import WrongNetwork from "./components/WrongNetwork";

import HomePage from "./pages/Home";
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Platform = lazy(() => import("./pages/Platform"));
const Pools = lazy(() => import("./pages/Pools"));
const Swap = lazy(() => import("./pages/Swap"));
const Exchange = lazy(() => import("./pages/Exchange"));
const Explore = lazy(() => import("./pages/Explore"));
const MarketsExplore = lazy(() => import("./pages/MarketsExplore"));
const CoinDetailsPage = lazy(() => import("./pages/CoinDetailsPage"));
const Governance = lazy(() => import("./pages/Governance"));
const CreateProposal = lazy(() => import("./pages/CreateProposal"));
const Proposals = lazy(() => import("./pages/Proposals"));
const Vote = lazy(() => import("./pages/Vote"));
const History = lazy(() => import("./pages/History"));
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
	// const { account, chainId } = useActiveWeb3React();

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
					{/* {chainId && chainId !== 1 ? (
						<Route path={'/'}>
							<Page>
								<WrongNetwork/>
							</Page>
						</Route>
					) : ()} */}
					<Route path={"/"} exact component={HomePage} />
					<Route path={"/dashboard"} component={Dashboard} />
					<Route path={"/history"} exact component={History} />
					<Route path={"/exchange"} component={Exchange} />
					<Route path={"/uniswap"} component={Swap} />
					<Route path={"/onramp"} component={FiatOn} />
					<Route path={"/offramp"} component={FiatOff} />
					<Route path={"/invest"} exact component={Explore} />
					<Route path={"/invest/pools"} component={Pools} />
					<Route path={"/invest/tokens"} component={MarketsExplore} />
					<Route path={"/invest/tokensets"} component={TokenSets} />
					<Route path={"/invest/loans"} component={Borrow} />
					<Route path={"/platforms/:platform"} component={Platform} />
					<Route path={"/nft"} exact component={NFT} />
					<Route path={"/governance"} exact component={Governance} />
					<Route path={"/governance/:space/create"} exact component={CreateProposal} />
					<Route path={"/governance/:space"} exact component={Proposals} />
					<Route path={"/governance/:space/proposal/:id"} exact component={Vote} />
					<Route path={"/launchpad"} exact component={Launchpad} />
					<Route path={"/launchpad/new"} exact component={NewLaunchpad} />
					<Route path={"/launchpad/:address"} exact component={LaunchpadItem} />
					<Route path={"/market/:id"} exact component={CoinDetailsPage} />
					<Route path={"/coins/:id"} exact component={CoinDetailsPage} />
					<Route path={"/cross"} component={CrossRouteHandler} />
					<Redirect to={"/?error=1"} />
				</Switch>
			</Suspense>
		</>
	);
};

export default Routes;
