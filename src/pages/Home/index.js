import { useEffect } from 'react';
import aos from 'aos';

import Page from '../../components/Page';
import Hero from "./sections/Hero";
import Features from "./sections/Features";
import Currencies from "./sections/Currencies";
import Banners from "./sections/Banners";
import useParsedQueryString from "../../hooks/useParsedQueryString";
import {toast} from "react-hot-toast";
import {useActiveWeb3React} from "../../hooks";
import {useTranslation} from "react-i18next";

const HomePage = props => {
    const { account } = useActiveWeb3React();
    const queryString = useParsedQueryString();
    const { t } = useTranslation()

    useEffect(() => {
        aos.init();
    }, [])

    useEffect(() => {
        if(queryString && queryString.error) {
            if(account) {
                toast.error(t('errors.notFound'));
            } else {
                toast.error(t('errors.walletConnect'));
            }
        }
    }, [queryString])

    return (
        <Page disableAccountCheck={true}>
            {/* Home-Hero: start */}
            <Hero/>
            {/* Home-Hero: end */}


            {/* Home-Currencies: start */}
            <Banners />
            {/* Home-Currencies: end */}

            {/* Home-Currencies: start */}
            <Currencies/>
            {/* Home-Currencies: end */}

            {/* Home-Features: start */}
            <Features/>
            {/* Home-Features: end */}
        </Page>
    )
}

export default HomePage;