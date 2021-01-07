import React from 'react';
import {Row, Col, Spinner, Button} from 'react-bootstrap';
import { connect } from 'react-redux';
import { withSnackbar } from 'notistack';
import {ThemeContext} from "styled-components";
import TransakSDK from '@transak/transak-sdk'

import ValueCard from "../../components/ValueCard";
import CustomCard from "../../components/CustomCard";
import CryptoInput from "../../components/CryptoInput";
import {ArrowWrapper} from "../../components/swap/styleds";
import {ArrowDown} from "react-feather";
import {ClickableText} from "../../components/ExternalLink";
import withWeb3Account from "../../components/hoc/withWeb3Account";
import TransakApi from "../../http/transak";
import {TYPING_INTERVAL} from "../../constants";

class BuyCrypto extends React.Component {
    static contextType = ThemeContext

    constructor(props) {
        super(props);

        this.api = new TransakApi();
        this.typeTimeout = undefined;

        this.state = {
            loading: true,
            priceLoading: false,
            cryptoCurrencies: [],
            fiatCurrencies: [],
            selected: {
                crypto: {
                    currency: null,
                    value: ''
                },
                fiat: {
                    currency: null,
                    value: '',
                }
            },
            conversionRate: 0,
        }
    }

    async componentDidMount() {
        try {
            const cryptoRes = await this.api.get('crypto')
            const fiatRes = await this.api.get('fiat');
            this.setState(prevState => {
                return {
                    cryptoCurrencies: cryptoRes.data.response,
                    fiatCurrencies: fiatRes.data.response,
                    selected: {
                        ...prevState.selected,
                        crypto: {
                            ...prevState.selected.crypto,
                            currency: cryptoRes.data.response.find(item => item.symbol === process.env.REACT_APP_TRANSAK_CRYPTO_SYMBOL) || null
                        },
                        fiat: {
                            ...prevState.selected.fiat,
                            currency: fiatRes.data.response.find(item => item.symbol === process.env.REACT_APP_TRANSAK_FIAT_SYMBOL) || null
                        },
                    },
                    loading: false,
                }
            })
        } catch(e) {
            this.props.enqueueSnackbar('Something went wrong. please try again later.', { variant: 'error' });
            this.setState({
                loading: false
            })
        }
    }

    fetchPrices = async (value, type) => {
        try {
            this.setState({
                priceLoading: true,
            })
            const prices = await this.api.get('price', {
                type: 'BUY',
                fiat: this.state.selected.fiat.currency.symbol,
                crypto: this.state.selected.crypto.currency.symbol,
                amount: Number(value) || 300,
                amountType: type,
                network: type === 'crypto' ? value.network.name : this.state.selected.crypto.currency.network.name
            })

            let fiatValue = 0;
            let cryptoValue = 0;
            if(type === 'fiat') {
                fiatValue = value;
                cryptoValue = prices.data.response.cryptoAmount
            } else {
                cryptoValue = value;
                fiatValue = prices.data.response.fiatAmount
            }
            this.setState(prevState => {
                return {
                    selected: {
                        ...prevState.selected,
                        fiat: {
                            ...prevState.selected.fiat,
                            value: fiatValue
                        },
                        crypto: {
                            ...prevState.selected.crypto,
                            value: cryptoValue
                        },
                    },
                    priceLoading: false,
                }
            })

        } catch(e) {
            if(e.hasOwnProperty('response')) {
                this.props.enqueueSnackbar(e?.response?.data?.error?.message, { variant: 'error' });
            }
            this.setState(prevState => {
                return {
                    selected: {
                        ...prevState.selected,
                        [type]: {
                            ...prevState.selected[type],
                            value
                        }
                    },
                    priceLoading: false,
                }
            })
        }
    }

    onUserInputHandler = async (value, type) => {
        if(this.state.selected.fiat.currency && this.state.selected.crypto.currency) {
            clearTimeout(this.typeTimeout);
            this.typeTimeout = setTimeout(() => {
                this.fetchPrices(value, type);
            }, TYPING_INTERVAL);

            this.setState(prevState => {
                return {
                    selected: {
                        ...prevState.selected,
                        [type]: {
                            ...prevState.selected[type],
                            value
                        }
                    },
                }
            })
        } else {
            this.setState(prevState => {
                return {
                    selected: {
                        ...prevState.selected,
                        [type]: {
                            ...prevState.selected[type],
                            value
                        }
                    },
                    priceLoading: false,
                }
            })
        }

    }

    onSelect = async (value, type) => {

        this.setState({
            priceLoading: true,
        })

        let cryptoValue = '';
        if((this.state.selected.crypto.currency !== null  || type === 'crypto') && (this.state.selected.fiat.currency !== null || type === 'fiat')) {
            try {
                const prices = await this.api.get('price', {
                    type: 'BUY',
                    fiat: type === 'fiat' ? value.symbol : this.state.selected.fiat.currency.symbol,
                    crypto: type === 'crypto' ? value.symbol : this.state.selected.crypto.currency.symbol,
                    amount: this.state.selected.fiat.value || 300,
                    amountType: 'fiat',
                    network: type === 'crypto' ? value.network.name : this.state.selected.crypto.currency.network.name
                })

                if(this.state.selected.fiat.value) {
                    cryptoValue = prices.data.response.cryptoAmount
                }

                if(type === 'crypto') {
                    this.setState(prevState => {
                        return {
                            selected: {
                                ...prevState.selected,
                                [type]: {
                                    ...prevState.selected[type],
                                    currency: value,
                                    value: cryptoValue
                                },
                            },
                            priceLoading: false,
                            conversionRate: prices.data.response.conversionPrice,
                        }
                    })
                } else {
                    this.setState(prevState => {
                        return {
                            selected: {
                                ...prevState.selected,
                                [type]: {
                                    ...prevState.selected[type],
                                    currency: value,
                                },
                                crypto: {
                                    ...prevState.selected.crypto,
                                    value: cryptoValue
                                },
                            },
                            priceLoading: false,
                            conversionRate: prices.data.response.conversionPrice,
                        }
                    })
                }
            } catch(e) {
                if(e.hasOwnProperty('response')) {
                    console.log(e.response);
                    this.props.enqueueSnackbar(e?.response?.data?.error?.message, { variant: 'error' });
                }
                this.setState(prevState => {
                    return {
                        selected: {
                            ...prevState.selected,
                            [type]: {
                                ...prevState.selected[type],
                                currency: value
                            }
                        },
                        priceLoading: false,
                        conversionRate: 0,
                    }
                })
            }

        }

    }

    buyHandler = () => {
        const { selected } = this.state;
        let transak = new TransakSDK({
            environment: process.env.REACT_APP_TRANSAK_ENVIRONMENT,
            defaultCryptoCurrency: selected.crypto.currency.symbol,
            walletAddress: this.props.web3.account,
            fiatCurrency: selected.fiat.currency.symbol,
            fiatAmount: Number(selected.fiat.value),
            hostURL: window.location.origin,
            widgetHeight: '550px',
            widgetWidth: '450px',
            apiKey: process.env.REACT_APP_TRANSAK_API_KEY,
        });

        transak.init();

        transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData) => {
            this.props.enqueueSnackbar('Your Purchase was completed Successfully, You can see your assets in dashboard', { variant: 'success' });
            transak.close();
        });
        transak.on(transak.EVENTS.ORDER_COMPLETED, (orderData) => {
            this.props.enqueueSnackbar('Your Purchase was completed Successfully, You can see your assets in dashboard', { variant: 'success' });
            transak.close();
        });
        transak.on(transak.EVENTS.TRANSAK_ORDER_CANCELLED, (orderData) => {
            this.props.enqueueSnackbar('You Canceled The Purchase Progress, Maybe the next time!', { variant: 'info' });
            transak.close();
        });
        transak.on(transak.EVENTS.TRANSAK_ORDER_FAILED, (orderData) => {
            this.props.enqueueSnackbar('Your order process failed unfortunately, Please try again later', { variant: 'error' });
            transak.close();
        });
        transak.on(transak.EVENTS.ORDER_FAILED, (orderData) => {
            this.props.enqueueSnackbar('Your order process failed unfortunately, Please try again later', { variant: 'error' });
            transak.close();
        });
    }

    checkLimits = () => {
        const {selected} = this.state;
        if(selected.fiat.currency.symbol === 'INR') {
            return !selected.crypto.currency || !selected.crypto.value || !selected.fiat.value || !selected.fiat.currency || selected.fiat.value < 750
        } else {
            return !selected.crypto.currency || !selected.crypto.value || !selected.fiat.value || !selected.fiat.currency || selected.fiat.value < 10
        }
    }

    render() {
        const theme = this.context;
        const {cryptoCurrencies: cryptoList, fiatCurrencies: fiatList, selected, conversionRate} = this.state;

        const breadCrumbs = [{
            pathname: this.props.match.url,
            title: 'Buy Crypto'
        }];

        return (
            <>
                <Row data-breadcrumbs={JSON.stringify(breadCrumbs)} data-title={'Buy Crypto'}>
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
                    {this.state.loading ? (
                        <Col xs={12} md={{ offset: 3, span: 6}}>
                            <CustomCard>
                                <div className="card-body py-10 d-flex align-items-center justify-content-center rounded">
                                    <Spinner size='lg' animation="border" role="status" variant={'primary'}>
                                        <span className="sr-only">Loading...</span>
                                    </Spinner>
                                </div>
                            </CustomCard>
                        </Col>
                    ) : (
                        <>
                            <Col xs={12} md={{ offset: 3, span: 6}}>
                                <CustomCard>
                                    <div className="card-body">
                                        <Row>
                                            <Col xs={12}>
                                                <CryptoInput
                                                    value={selected.fiat.value}
                                                    onUserInput={this.onUserInputHandler}
                                                    label='You Pay'
                                                    onSelect={this.onSelect}
                                                    selected={selected.fiat.currency}
                                                    currencies={fiatList}
                                                    type={'fiat'}
                                                    id={'fiat'}
                                                />
                                            </Col>
                                            <Col xs={12} className={'py-5 d-flex align-items-center justify-content-center'}>
                                                <ArrowWrapper clickable>
                                                    <ArrowDown
                                                        size="16"
                                                        color={theme.text2}
                                                    />
                                                </ArrowWrapper>
                                            </Col>
                                            <Col xs={12} className={'gutter-b'}>
                                                <CryptoInput
                                                    value={selected.crypto.value}
                                                    onUserInput={this.onUserInputHandler}
                                                    label='You Receive(estimated)'
                                                    onSelect={this.onSelect}
                                                    selected={selected.crypto.currency}
                                                    currencies={cryptoList}
                                                    type={'crypto'}
                                                    id={'crypto'}
                                                />
                                            </Col>
                                            {(selected.crypto.currency && selected.crypto.value && selected.fiat.currency && selected.crypto.value && selected.crypto.value > 0) ? (
                                                <Col xs={12} className={'d-flex justify-content-between align-items-center gutter-b'}>
                                                    <ClickableText fontWeight={500} fontSize={14} color={theme.text2}>
                                                        Price
                                                    </ClickableText>
                                                    <ClickableText fontWeight={500} fontSize={14} color={theme.text1}>
                                                        {selected.fiat.currency && selected.crypto.currency ? `1 ${selected.crypto.currency.symbol} = ${selected.fiat.currency.symbol} ${(conversionRate > 0 ? 1 / conversionRate : 1 / selected.crypto.currency.priceUSD).toFixed(4)}` : ''}
                                                    </ClickableText>
                                                </Col>
                                            ) : ''}

                                            <Col xs={12}>
                                                <Button block size={'lg'}
                                                        onClick={this.buyHandler}
                                                        className={'py-6 font-weight-bolder font-size-lg'}
                                                        disabled={this.checkLimits()}
                                                        variant={
                                                            !this.checkLimits() ? 'success' : this.props.darkMode ? 'dark' : 'light'
                                                        }
                                                >
                                                    {
                                                        !selected.crypto.currency ? 'Please Select Your Currency' :
                                                        !selected.fiat.currency ? 'Please Select Your asset' :
                                                        !selected.fiat.value || !selected.crypto.value ? 'Please Enter Amount' :
                                                        this.checkLimits() ? 'Too Low value' :
                                                        'Buy Crypto Asset'
                                                    }
                                                </Button>
                                            </Col>
                                        </Row>

                                    </div>
                                </CustomCard>
                            </Col>
                        </>
                    )}
                </Row>
            </>
        )
    }
}

const mapStateToProps = state => {
    return {
        overview: state.balances.overview,
        darkMode: state.user.userDarkMode
    }
}

export default connect(mapStateToProps)(
    withWeb3Account(
        withSnackbar(BuyCrypto)
    )
);