import React from 'react';
import {Row, Col, Spinner, Button, ProgressBar} from 'react-bootstrap';
import { connect } from 'react-redux';
import { withSnackbar } from 'notistack';
import styled, {ThemeContext} from "styled-components";
import Web3 from 'web3';
import _ from 'lodash';

import ValueCard from "../../components/ValueCard";
import CustomCard, {CustomHeader, CustomTitle} from "../../components/CustomCard";
import CryptoInput from "../../components/CryptoInput";
import {ArrowWrapper} from "../../components/swap/styleds";
import {ArrowDown} from "react-feather";
import {ClickableText} from "../../components/ExternalLink";
import withWeb3Account from "../../components/hoc/withWeb3Account";
import {DEXesImages, DEXesName, supportedDEXes, TYPING_INTERVAL} from "../../constants";
import InstantSwapApi from '../../http/instantSwap';
import SwapInputPanel from "../../components/SwapInputPanel";
import tokens from '../../constants/walletTokens.json';
import {toAbsoluteUrl} from "../../lib/helper";
import ERC20_ABI from '../../constants/abis/erc20.json';
import {getContract} from "../../utils";
import {ETHER, Token, TokenAmount} from "@uniswap/sdk";


const Logo = styled.img`
  width: ${({size}) => size ? `${size}px` : '24px'};
  height: ${({size}) => size ? `${size}px` : '24px'};
  border-radius: ${({size}) => size ? `${size}px` : '24px'};
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.075);
  margin-right: 8px;
`

const BUY_STATES = {
    'not_started': 'Instant Exchange',
    'initializing': 'Initializing...',
    'allowance': 'Checking Allowance',
    'approving': 'Creating Approve Transaction',
    'validation': 'Validating...',
    'create_tx': 'Creating Transaction',
    'send_tx': 'Sending Transaction',
    'submitted': "Order Submitted",
    'pending': 'Pending...',
    'failed': "Transaction failed",
}

class InstantSwap extends React.Component {
    static contextType = ThemeContext

    constructor(props) {
        super(props);

        this.api = InstantSwapApi;
        this.typeTimeout = undefined;
        this.isExchangeInProgress = false;

        this.state = {
            loading: false,
            loadingState: {
                all: 32,
                loaded: 0,
            },
            tokens: [],
            pair: {
                deposit: {
                    token: null,
                    value: '',
                },
                destination: {
                    token: null,
                    value: '',
                },
            },
            hasEnoughBalance: true,
            rates: [],
            rate: undefined,
            showMore: false,
            ip: undefined,
            buyState: 'not_started',
            max: 0
        }
    }

    onChangeBalance = (balance) => {
        this.setState({
            max: balance,
        })
    }

    promiseHandler = (callback) => {
        return new Promise((resolve) => {
            callback()
                .then(response => resolve(response))
                .catch(error => resolve(undefined));
        })
    }

    getOneInchSortedRates = (rates) => {
        if(rates.hasOwnProperty('results')) {
            const filteredRates = rates.results.filter(item => Number(item.toTokenAmount) > 0);
            return _.orderBy(filteredRates, ['toTokenAmount'], ['desc'])
        }
        return []
    }

    getParaswapSortedRates = rates => {
        return _.orderBy(rates.others, ['rate'], ['desc'])
    }

    getDexagSortedRates = rates => {
        return _.orderBy(rates, ['price'], ['desc'])
    }

    getSortedRates = (response, type) => {
        if(!response) return [];
        switch(type) {
            case '1inch': {
                return this.getOneInchSortedRates(response.data);
            }
            case 'paraswap': {
                return this.getParaswapSortedRates(response);
            }
            case 'dexag': {
                return this.getDexagSortedRates(response);
            }
            default: {
                return response.hasOwnProperty('data') ? response.data : response;
            }
        }
    }

    transformRates = (rates) => {
        let result = [];
        for(let i in rates) {
            const key = rates[i][0];
            const apiRates = rates[i][1];
            switch(key) {
                case '1inch': {
                    if(apiRates) {

                        apiRates.forEach(rate => {
                            if(supportedDEXes['1inch'].includes(rate.protocol)) {
                                result.push({
                                    rate: rate.toTokenAmount / (10 ** this.state.pair.destination.token.decimals),
                                    platform: rate.protocol,
                                    source: '1inch',
                                })
                            }
                        })
                    }
                    break;
                }
                case 'paraswap': {
                    if(apiRates) {

                        apiRates.forEach(rate => {
                            if(supportedDEXes['paraswap'].includes(rate.exchange)) {
                                result.push({
                                    rate: rate.unit / (10 ** this.state.pair.destination.token.decimals),
                                    platform: rate.exchange,
                                    source: 'paraswap',
                                })
                            }
                        })
                    }
                    break;
                }
                case 'dexag': {
                    if(apiRates) {

                        apiRates.forEach(rate => {
                            if(supportedDEXes['dexag'].includes(rate.dex)) {
                                result.push({
                                    rate: Number(rate.price),
                                    platform: rate.dex,
                                    source: 'dexag',
                                })
                            }
                        })
                    }
                    break;
                }
                // case 'godex': {
                //     // if(apiRates.hasOwnProperty('rate')) {
                //     //     result.push({
                //     //         rate: Number(apiRates.rate),
                //     //         platform: 'godex',
                //     //         source: 'godex',
                //     //         min: apiRates.min_amount,
                //     //         max: apiRates.max_amount,
                //     //     })
                //     // }
                //     break;
                // }
            }
        }

        return result;
    }

    getSortedResult = (response) => {
        let sortedParts = Object.keys(response).map(key => [key, this.getSortedRates(response[key], key)]);
        let transformedRates = this.transformRates(sortedParts);
        return _.sortBy(transformedRates, (o) => -o.rate);
    }

    fetchPrices = async (pair) => {

        let { deposit, destination } = pair;

        if(deposit.token !== null && destination.token !== null) {
            this.setState({
                loading: true,
                loadingState: {
                    all: 32,
                    loaded: 0,
                }
            })
            let fromAmount = (10 ** deposit.token.decimals);

            let dexagParams = {
                to: destination.token.symbol,
                from: deposit.token.symbol,
                dex: 'all',
                fromAmount: 1
            }

            let oneInch = await this.promiseHandler(() => this.api.oneInch.get('quote', {
                fromTokenAddress: deposit.token.address,
                toTokenAddress: destination.token.address,
                amount: fromAmount,
            }))
            this.setState({
                loadingState: {
                    all: 32,
                    loaded: 14,
                }
            })
            let paraswap = await this.promiseHandler(() => this.api.paraswap.getRate(deposit.token.address, destination.token.address, fromAmount));

            this.setState({
                loadingState: {
                    all: 32,
                    loaded: 22,
                }
            })

            let dexag = await this.promiseHandler(() => this.api.dexag.sdk.getPrice(dexagParams))

            this.setState({
                loadingState: {
                    all: 32,
                    loaded: 30,
                }
            })
            let godex = await this.promiseHandler(() => this.api.godex.get('rate', {
                to: destination.token.symbol,
                from: deposit.token.symbol,
                amount: 1,
            }))

            this.setState({
                loadingState: {
                    all: 32,
                    loaded: 32,
                }
            })

            let response = {
                '1inch': oneInch,
                'paraswap': paraswap,
                'dexag': dexag,
                'godex': godex
            }

            let result = this.getSortedResult(response);

            if(result.length > 0) {
                if(deposit.value) {
                    pair.destination.value = (deposit.value * result[0].rate).toFixed(6);
                } else if(destination.value) {
                    pair.deposit.value = (destination.value / result[0].rate).toFixed(6);
                }
            } else {
                this.props.enqueueSnackbar('This Pair is not available.', { variant: 'error' });
            }


            this.setState({
                pair,
                rates: result,
                rate: result.length > 0 ? result[0] : undefined,
                loading: false,
                showMore: false,
                hasEnoughBalance: !this.state.max || Number(pair.deposit.value) <= Number(this.state.max.toSignificant(6))
            })

        } else {
            this.setState({
                pair,
                showMore: false
            })
        }
    }

    onSelect = async (token, type) => {
        let pair = this.state.pair;

        pair[type].token = token;
        this.setState({
            pair
        }, this.fetchPrices.bind(this, this.state.pair))
    }

    onSwapTokens = () => {
        let pair;
        this.setState(prevState => {
            pair = {
                deposit: {
                    ...prevState.pair.destination,
                },
                destination: {
                    ...prevState.pair.deposit,
                }
            }
            return {
                pair
            }
        }, () => this.fetchPrices(pair));
    }

    onUserInputHandler = (value, type, max) => {
        this.setState(prevState => {
            const pair = prevState.pair;
            pair[type].value = value;
            if(prevState.rate) {
                if(type === 'deposit') {
                    pair.destination.value = (value * prevState.rate.rate).toFixed(6);
                } else if(type === 'destination') {
                    pair.deposit.value = (value / prevState.rate.rate).toFixed(6);
                }
            }
            return {
                pair,
                hasEnoughBalance: !max || Number(value) <= Number(max.toSignificant(6))
            }
        })
    }

    selectRate = (rate) => {
        this.setState(prevState => {
            let pair = {
                ...prevState.pair
            };
            if(pair.deposit.value) {
                pair.destination.value = (pair.deposit.value * rate.rate).toFixed(6);
            } else if(pair.destination.value) {
                pair.deposit.value = (pair.destination.value / rate.rate).toFixed(6);
            }

            return {
                pair,
                rate
            }
        })
    }

    setBuyState = (state = 'not_started') => {
        this.setState({
            buyState: state,
        })
    }

    setDefaultBuyState = () => {
        setTimeout(this.setBuyState, 4000)
    }

    oneInchBuyHandler = async (pair, rate) => {
        try {
            this.setBuyState('initializing')
            let { deposit, destination } = pair;
            let allowance;
            let token = deposit.token.symbol === 'ETH' ? ETHER : new Token(deposit.token.chainId, deposit.token.address, deposit.token.decimals, deposit.token.symbol, deposit.token.name);

            const spenderRes = await this.api.oneInch.get('spender');
            const spender = spenderRes.data.address;

            let fromAmount = deposit.value * (10 ** deposit.token.decimals);
            const amount = new TokenAmount(token, `${fromAmount}`);

            if(deposit.token.symbol !== 'ETH') {
                this.setBuyState('allowance')

                let contract = getContract(deposit.token.address, ERC20_ABI, this.props.web3.library, this.props.web3.account);

                allowance = await contract.functions.allowance(this.props.web3.account, spender);
                allowance = new TokenAmount(token, allowance.toString())

                if(!amount.lessThan(allowance)) {
                    this.setBuyState('approving')

                    let approve = await contract.functions.approve(spender, amount.raw.toString());

                    if(approve) {
                        window.open(`https://etherscan.io/tx/${approve}`, '_blank')
                    }
                }
            }

            if(deposit.token.symbol === 'ETH' || amount.lessThan(allowance)) {
                this.setBuyState('create_tx')

                const res = await this.api.oneInch.get('swap', {
                    fromTokenAddress: deposit.token.address,
                    toTokenAddress: destination.token.address,
                    amount: fromAmount,
                    fromAddress: this.props.web3.account,
                    slippage: this.props.slippage,
                    protocols: rate.platform,
                })
                const tx = res.data.tx;

                this.setBuyState('send_tx')

                window.web3.eth.sendTransaction(tx, async (err, transactionHash) => {
                    if (err) {
                        this.setBuyState('failed')

                        this.setDefaultBuyState()
                        if(err.code === 4001){
                            this.props.enqueueSnackbar('You canceled exchange process', { variant: 'info' })
                        } else {
                            this.props.enqueueSnackbar('An Error was occurred', { variant: 'error' })
                        }
                        this.isExchangeInProgress = false;
                        return false;
                    }

                    this.setBuyState('submitted')

                    this.setDefaultBuyState()
                    this.isExchangeInProgress = false;
                    this.props.enqueueSnackbar('Your Exchange order submitted successfully', { variant: 'success' })
                    window.open(`https://etherscan.io/tx/${transactionHash}`, '_blank');
                });
            } else {
                this.props.enqueueSnackbar('Token approval is pending or rejected', { variant: 'warning' })
            }
            this.isExchangeInProgress = false;

        } catch(e) {
            this.setBuyState('failed')

            this.setDefaultBuyState()

            this.isExchangeInProgress = false;

            if(e.hasOwnProperty('code')) {
                if(e.code === 4001) {
                    this.props.enqueueSnackbar('You canceled exchange process', { variant: 'info' })
                } else {
                    this.props.enqueueSnackbar('An Error was occurred', { variant: 'error' })
                }
            } else {
                if(e.hasOwnProperty('response')) {
                    if(e.response.status === 500) {
                        this.props.enqueueSnackbar('This pair is not available on this platform, Please select another one.', { variant: 'error' })
                    } else {
                        this.props.enqueueSnackbar('An Error was occurred', { variant: 'error' })
                    }
                } else {
                    this.props.enqueueSnackbar('An Error was occurred', { variant: 'error' })
                }
            }
            console.log(e);
        }
    }

    paraSwapBuyHandler = async (pair, rate) => {
        try {
            this.setBuyState('initializing')

            let { deposit, destination } = pair;
            let canExchange = false;
            const paraswap = this.api.paraswap.setWeb3Provider(window.ethereum);

            let fromAmount = (deposit.value * (10 ** deposit.token.decimals)).toFixed(0);
            let toAmount = (destination.value * (10 ** destination.token.decimals)).toFixed(0);

            this.setBuyState('allowance')
            const allowanceRes = await paraswap.getAllowance(this.props.web3.account, deposit.token.address);
            if(Number(allowanceRes.allowance) < fromAmount) {
                this.setBuyState('approving')
                const approve = await paraswap.approveToken(fromAmount, this.props.web3.account, deposit.token.address);

                if(approve) {
                    window.open(`https://etherscan.io/tx/${approve}`, '_blank')
                }
            } else {
                canExchange = true;
            }

            if(canExchange) {
                this.setBuyState('create_tx')
                const rates = await paraswap.getRate(deposit.token.address, destination.token.address, fromAmount);
                const selectedRoute = rates.others.find(item => item.exchange === rate.platform);
                const txRoute = [
                    {
                        ...rates.bestRoute[0],
                        ...selectedRoute
                    }
                ]
                rates.bestRoute = txRoute;
                const txParams = await paraswap.buildTx(deposit.token.address, destination.token.address, fromAmount, toAmount, rates, this.props.web3.account, process.env.REACT_APP_NAME, '');


                this.setBuyState('send_tx')
                window.web3.eth.sendTransaction(txParams, async (err, transactionHash) => {
                    if (err) {
                        this.setBuyState('failed')

                        this.setDefaultBuyState()
                        if(err.code === 4001){
                            this.props.enqueueSnackbar('You canceled exchange process', { variant: 'info' })
                        } else {
                            this.props.enqueueSnackbar('An Error was occurred', { variant: 'error' })
                        }
                        this.isExchangeInProgress = false;
                        return false;
                    }
                    this.setBuyState('submitted')

                    this.setDefaultBuyState()
                    this.isExchangeInProgress = false;
                    this.props.enqueueSnackbar('Your Exchange order submitted successfully', { variant: 'success' })
                    window.open(`https://etherscan.io/tx/${transactionHash}`, '_blank');
                });
            } else {
                this.setBuyState('pending')

                this.setDefaultBuyState()
            }
        } catch(e) {
            this.setBuyState('failed')

            this.setDefaultBuyState()

            this.isExchangeInProgress = false;

            if(e.hasOwnProperty('code')) {
                if(e.code === 4001) {
                    this.props.enqueueSnackbar('You canceled exchange process', { variant: 'info' })
                } else {
                    this.props.enqueueSnackbar('An Error was occurred', { variant: 'error' })
                }
            } else {
                this.props.enqueueSnackbar('An Error was occurred', { variant: 'error' })
            }
            console.log(e);
        }
    }

    dexagBuyHandler = async (pair, rate) => {
        let valid = false;
        try {
            this.setBuyState('initializing')

            let { deposit, destination } = pair;

            const sdk = this.api.dexag.sdk;
            sdk.registerStatusHandler((status, data) => {
                switch(status) {
                    case 'rejected': {
                        this.setBuyState('failed')
                        this.setDefaultBuyState()
                        this.props.enqueueSnackbar('You canceled exchange process', { variant: 'info' })
                        break;
                    }
                    case 'network': {
                        this.props.enqueueSnackbar('Please change your network to mainnet to continue', { variant: 'warning' })
                        break;
                    }
                    case 'send_trade': {
                        this.setBuyState('submitted')
                        this.setDefaultBuyState()
                        window.open(`https://etherscan.io/tx/${data}`, '_blank');
                        break;
                    }
                    case 'failed': {
                        this.setBuyState('failed')
                        this.setDefaultBuyState()
                        this.props.enqueueSnackbar('Your transaction was failed', { variant: 'error' })
                        window.open(`https://etherscan.io/tx/${data}`, '_blank');
                        break;
                    }
                }
            });

            this.setBuyState('create_tx')
            const tx = await sdk.getTrade({to: destination.token.symbol, from: deposit.token.symbol, fromAmount: deposit.value, dex: rate.platform});


            this.setBuyState('validation')
            valid = await sdk.validate(tx);

            if (valid) {
                sdk.trade(tx);
            }

        } catch(e) {
            this.setBuyState('failed')
            this.setDefaultBuyState()

            this.isExchangeInProgress = false;

            if(e.hasOwnProperty('code')) {
                if(e.code !== 4001) {
                    this.props.enqueueSnackbar('An Error was occurred', { variant: 'error' })
                }

                if(!valid) {
                    this.props.enqueueSnackbar('Transaction failed please try again later or select another platform', { variant: 'error' })
                }
            } else {

                if(!valid) {
                    this.props.enqueueSnackbar('Transaction failed please try again later or select another platform', { variant: 'error' })
                }
                this.props.enqueueSnackbar('An Error was occurred', { variant: 'error' })
            }
        }

    }

    godexBuyHandler = (pair, rate) => {

    }

    buyHandler = async () => {
        if(!this.isExchangeInProgress) {
            this.isExchangeInProgress = true;

            const { pair, rate } = this.state;
            let result;

            switch(rate.source) {
                case '1inch': {
                    result = await this.oneInchBuyHandler(pair, rate);
                    break;
                }
                case 'paraswap': {
                    result = await this.paraSwapBuyHandler(pair, rate);
                    break;
                }
                case 'dexag': {
                    result = await this.dexagBuyHandler(pair, rate);
                    break;
                }
                case 'godex': {
                    result = await this.godexBuyHandler(pair, rate);
                    break;
                }
            }

            this.isExchangeInProgress = false;
        }
    }
    toggleShowMore = () => {
        this.setState(prevState => {
            return {
                showMore: !prevState.showMore,
            }
        })
    }

    render() {
        const theme = this.context;
        const {pair, rate, hasEnoughBalance, rates, loading, loadingState, showMore, buyState} = this.state;


        const breadCrumbs = [{
            pathname: this.props.match.url,
            title: 'Instant Swap'
        }];

        return (
            <>
                <Row data-breadcrumbs={JSON.stringify(breadCrumbs)} data-title={'Instant Swap'}>
                    <Col xs={12} md={4}>
                        <ValueCard className={'gutter-b'} title={'Total Assets'} value={this.props.overview.deposits.total + this.props.overview.wallet.total}/>
                    </Col>
                    <Col xs={12} md={4}>
                        <ValueCard className={'gutter-b'} title={'Total Debt'} value={this.props.overview.debts.total}/>
                    </Col>
                    <Col xs={12} md={4}>
                        <ValueCard className={'gutter-b'} title={'Net Worth'} value={this.props.overview.deposits.total + this.props.overview.wallet.total - this.props.overview.debts.total}/>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} md={{ offset: 3, span: 6}}>
                        <CustomCard>
                            <div className="card-body">
                                <Row>
                                    <Col xs={12}>
                                        <SwapInputPanel
                                            value={pair.deposit.value}
                                            onUserInput={this.onUserInputHandler}
                                            label='You Pay'
                                            onSelect={this.onSelect}
                                            selected={pair.deposit.token}
                                            currencies={tokens}
                                            type={'deposit'}
                                            id={'deposit'}
                                            onChangeBalance={this.onChangeBalance}
                                        />
                                    </Col>
                                    <Col xs={12} className={'py-5 d-flex align-items-center justify-content-center'}>
                                        <ArrowWrapper clickable onClick={this.onSwapTokens}>
                                            <ArrowDown
                                                size="16"
                                                color={theme.text2}
                                            />
                                        </ArrowWrapper>
                                    </Col>
                                    <Col xs={12} className={'gutter-b'}>
                                        <SwapInputPanel
                                            value={pair.destination.value}
                                            onUserInput={this.onUserInputHandler}
                                            label='You Receive (estimated)'
                                            onSelect={this.onSelect}
                                            selected={pair.destination.token}
                                            currencies={tokens}
                                            type={'destination'}
                                            id={'destination'}
                                        />
                                    </Col>
                                    {!!rate ? (
                                        <Col xs={12} className={'d-flex justify-content-between align-items-center gutter-b'}>
                                            <ClickableText fontWeight={500} fontSize={14} color={theme.text2}>
                                                Exchange Rate
                                            </ClickableText>
                                            <ClickableText fontWeight={500} fontSize={14} color={theme.text1}>
                                                {pair.deposit.token && pair.destination.token ? `1 ${pair.deposit.token.symbol || pair.deposit.token.code} = ${rate.rate.toFixed(4)} ${pair.destination.token.symbol || pair.destination.token.code}` : null}
                                            </ClickableText>
                                        </Col>
                                    ) : ''}

                                    <Col xs={12} className={rates.length > 0 ? 'gutter-b' : ''}>
                                        {loading ? (
                                            <div className={`d-flex flex-column align-items-center justify-content-center py-5 px-4 bg-${this.props.darkMode ? 'dark' : 'light'} rounded`}>
                                                <span className="text-muted pb-4">Our tentacles aggregating from {loadingState.loaded} of {loadingState.all} exchanges...</span>
                                                <ProgressBar
                                                    now={(loadingState.loaded / loadingState.all * 100).toFixed(0)}
                                                    variant={loadingState.loaded === loadingState.all ? 'success' : 'primary'}
                                                    className={'align-self-stretch w-100 progress-xs'} />
                                            </div>
                                        ) : (
                                            <Button block size={'lg'}
                                                    onClick={this.buyHandler}
                                                    className={'py-6 font-weight-bolder font-size-lg'}
                                                    disabled={!(pair.deposit.token && pair.destination.token && pair.deposit.value && pair.destination.value && hasEnoughBalance && Number(pair.deposit.value) > 0 && rate) || rate.platform === 'godex'}
                                                    variant={
                                                        pair.deposit.token && pair.destination.token && pair.deposit.value && pair.destination.value && hasEnoughBalance && Number(pair.deposit.value) > 0 && rate ? 'primary' : this.props.darkMode ? 'dark' : 'light'
                                                    }
                                            >
                                                {
                                                    !pair.deposit.token || !pair.destination.token ? 'Select a pair' :
                                                    !hasEnoughBalance ? `Insufficient ${pair.deposit.token.symbol} Balance` :
                                                    !pair.deposit.value || !pair.destination.value ? 'Please Enter Amount' :
                                                    !rate && !loading ? 'This pair is not available' :
                                                    rate.platform === 'godex' ? 'This pair is not available on this platform to exchange' :
                                                    Number(pair.deposit.value) > 0 ? BUY_STATES[buyState] : 'Please Enter Amount'
                                                }
                                            </Button>
                                        )}

                                    </Col>
                                    {rates.length > 0 && !loading && (
                                        <Col xs={12} className={'d-flex flex-column'}>
                                            {showMore ? rates.map((item, index) => {
                                                return (
                                                    <div key={`show-all-${item.platform}`} onClick={this.selectRate.bind(this, item)} className={`d-flex align-items-center justify-content-between px-5 py-4 mb-2 rounded bg-hover-${this.props.darkMode ? 'dark' : 'light'}`} style={{ border: `1px solid ${theme.bg3}`, backgroundColor: item.platform === rate.platform ? theme.bg2 : theme.bg1}}>
                                                        <div className={'d-flex align-items-center'} style={{ flex: 1}}>
                                                            <Logo src={toAbsoluteUrl(`/media/dex/${DEXesImages[item.platform]}`)} size={24} alt={item.platform}/>
                                                            <span className="text-muted" style={{ flex: 1}}>
                                                                {DEXesName[item.platform]}
                                                            </span>
                                                        </div>

                                                        <div className={'d-flex flex-row-reverse align-items-center justify-content center'} style={{ flex: 1}}>
                                                            {index === 0 ? (
                                                                <span className="label label-inline label-lg label-light-success">Best</span>
                                                            ) : (
                                                                <span style={{ display: 'block', flexBasis: 45}}/>
                                                            )}
                                                            <span className={'mr-3'}>
                                                                {item.rate.toFixed(6)} {pair.destination.token.symbol}/{pair.deposit.token.symbol}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )
                                            }) : rates.slice(0, 5).map((item, index) => {
                                                return (
                                                    <div key={`show-less-${item.platform}`} onClick={this.selectRate.bind(this, item)} className={`d-flex align-items-center justify-content-between px-5 py-4 mb-2 rounded bg-hover-${this.props.darkMode ? 'dark' : 'light'}`} style={{ border: `1px solid ${theme.bg3}`, backgroundColor: item.platform === rate.platform ? theme.bg2 : theme.bg1}}>
                                                        <div className={'d-flex align-items-center'} style={{ flex: 1}}>
                                                            <Logo src={toAbsoluteUrl(`/media/dex/${DEXesImages[item.platform]}`)} size={24} alt={item.platform}/>
                                                            <span className="text-muted" style={{ flex: 1}}>
                                                                {DEXesName[item.platform]}
                                                            </span>
                                                        </div>


                                                        <div className={'d-flex flex-row-reverse align-items-center justify-content center'} style={{ flex: 1}}>
                                                            {index === 0 ? (
                                                                <span className="label label-inline label-lg label-light-success">Best</span>
                                                            ) : (
                                                                <span style={{ display: 'block', flexBasis: 45}}/>
                                                            )}
                                                            <span className={'mr-3'}>
                                                                {item.rate.toFixed(6)} {pair.destination.token.symbol}/{pair.deposit.token.symbol}
                                                            </span>

                                                        </div>
                                                    </div>
                                                )
                                            })}
                                            <Button variant={'link'} size={'sm'} onClick={this.toggleShowMore} className={'align-self-center'}>Show {showMore ? 'less' : 'more'}</Button>
                                        </Col>
                                    )}
                                </Row>

                            </div>
                        </CustomCard>
                    </Col>
                </Row>
            </>
        )
    }
}

const mapStateToProps = state => {
    return {
        overview: state.balances.overview,
        darkMode: state.user.userDarkMode,
        slippage: state.user.userSlippageTolerance
    }
}

export default connect(mapStateToProps)(
    withWeb3Account(
        withSnackbar(InstantSwap)
    )
);