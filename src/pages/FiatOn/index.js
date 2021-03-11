import { Component } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import TransakSDK from '@transak/transak-sdk'

import Page from '../../components/Page';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import CryptoInput from '../../components/CryptoInput';
import styled from "styled-components";
import TransakApi from "../../http/transak";
import {TYPING_INTERVAL} from "../../constants";
import withWeb3Account from "../../components/hoc/withWeb3Account";
import {toast} from "react-hot-toast";
import {withTranslation} from "react-i18next";

const Title = styled.h3`
  margin-top: 0;
  margin-bottom: 30px;
  font-weight: 700;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text1};
  
  
  @media (min-width: 768px) {
    font-size: 1.25rem;
    
    .card-body {
      padding: 0;
    }
  }
`

const CustomCard = styled(Card)`
  padding: 20px;
  margin-top: 86px;
  
  @media (max-width: 767px) {
    padding: 0;
    border: none;
    margin-top: 40px;
    
    .card-body {
      padding: 0;
    }
  }
`;

const PriceText = styled.span`
  display: flex;
  padding-top: 6px;
  color: ${({ theme }) => theme.text1};
  font-size: .875rem;
  font-weight: 400;
  
  @media (max-width: 767px) {
  padding-bottom: 9px;
  }
`

const PriceCol = styled(Col)`
  margin-bottom: 36px;
 
  @media (min-width: 768px) {
    margin-bottom: 66px;
  }
`

const BuyButton = styled(Button)`
  width: 100%;
  
  @media (min-width: 768px) {
    width: auto;
    min-width: 250px;
  }
`

class FiatOn extends Component {

    constructor(props) {
        super(props);

        this.api = new TransakApi(process.env.REACT_APP_TRANSAK_ENVIRONMENT);
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
            toast.error('Something went wrong. please try again later.');
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
                toast.error(e?.response?.data?.error?.message);
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
                    toast.error(e?.response?.data?.error?.message);

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
        if(!this.props.web3.account) {
            this.props.toggleWalletModal();
        } else {
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
                toast.success('Your Purchase was completed Successfully, You can see your assets in dashboard')
                transak.close();
            });
            transak.on(transak.EVENTS.ORDER_COMPLETED, (orderData) => {
                toast.success('Your Purchase was completed Successfully, You can see your assets in dashboard')
                transak.close();
            });
            transak.on(transak.EVENTS.TRANSAK_ORDER_CANCELLED, (orderData) => {
                toast.error('You Canceled The Purchase Progress, Maybe the next time!');
                transak.close();
            });
            transak.on(transak.EVENTS.TRANSAK_ORDER_FAILED, (orderData) => {
                toast.error('Your order process failed unfortunately, Please try again later')
                transak.close();
            });
            transak.on(transak.EVENTS.ORDER_FAILED, (orderData) => {
                toast.error('Your order process failed unfortunately, Please try again later')
                transak.close();
            });
        }
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
        const {cryptoCurrencies: cryptoList, fiatCurrencies: fiatList, selected, conversionRate} = this.state;
        const { t } = this.props;

        return (
            <Page hasBg={true}>
                <Row>
                    <Col xs={12} md={{ offset: 1, span: 10 }} lg={{ offset: 3, span: 6}}>
                        <CustomCard>
                            {this.state.loading ? (
                                <div className="py-5 d-flex align-items-center justify-content-center">
                                    <Loading width={40} height={40} active id={'fiat-on'}/>
                                </div>
                            ) : (
                                <Row>
                                    <Col xs={12}>
                                        <Title>1. {t('fiatOn.currencyLabel')}</Title>
                                    </Col>

                                    <Col xs={12} style={{ marginBottom: 36 }}>
                                        <CryptoInput
                                            value={selected.fiat.value}
                                            onUserInput={this.onUserInputHandler}
                                            label={t('currency')}
                                            onSelect={this.onSelect}
                                            selected={selected.fiat.currency}
                                            currencies={fiatList}
                                            type={'fiat'}
                                            id={'fiat'}
                                        />
                                    </Col>

                                    <Col xs={12}>
                                        <Title>2. {t("fiatOn.cryptoLabel")}</Title>
                                    </Col>

                                    <Col xs={12} style={{ marginBottom: (selected.crypto.currency && selected.crypto.value && selected.fiat.currency && selected.crypto.value && selected.crypto.value > 0) ? 0 : 66}}>
                                        <CryptoInput
                                            value={selected.crypto.value}
                                            onUserInput={this.onUserInputHandler}
                                            label={`${t('amount')} (${t('estimated')})`}
                                            onSelect={this.onSelect}
                                            selected={selected.crypto.currency}
                                            currencies={cryptoList}
                                            type={'crypto'}
                                            reverse={true}
                                            id={'crypto'}
                                        />
                                    </Col>

                                    {(selected.crypto.currency && selected.crypto.value && selected.fiat.currency && selected.crypto.value && selected.crypto.value > 0) && (
                                        <PriceCol xs={12}>
                                            <Row>
                                                <Col xs={12} md={6}>
                                                    <PriceText>{selected.fiat.currency && selected.crypto.currency ? `${t('exchange.rate')}: 1 ${selected.crypto.currency.symbol} = ${(conversionRate > 0 ? 1 / conversionRate : 1 / selected.crypto.currency.priceUSD).toFixed(4)} ${selected.fiat.currency.symbol}` : ''}</PriceText>
                                                </Col>
                                                <Col xs={12} md={6}>
                                                    <PriceText>{t('exchange.youWillGet')}: {selected.crypto.value} {selected.crypto.currency.symbol}</PriceText>
                                                </Col>
                                            </Row>
                                        </PriceCol>
                                    )}

                                    <Col xs={12} className={'d-flex align-items-center justify-content-center'}>
                                        <BuyButton
                                                onClick={this.buyHandler}
                                                className={'py-3 d-flex align-items-center justify-content-center'}
                                                disabled={(this.checkLimits() && this.props.web3.account) || this.state.priceLoading}
                                                variant={
                                                    !this.checkLimits() ? 'primary' : 'outline-primary'
                                                }
                                        >
                                            {   this.state.priceLoading ? (
                                                    <Loading width={24} height={24} id={'fiat-on-price'} active color={this.checkLimits() ? 'primary' : '#fff'}/>
                                                ) :
                                                !this.props.web3.account ? t('wallet.connect') :
                                                !selected.crypto.currency ? t('exchange.selectCrypto') :
                                                    !selected.fiat.currency ? t('exchange.selectFiat') :
                                                        !selected.fiat.value || !selected.crypto.value ? t('exchange.enterAmount') :
                                                            this.checkLimits() ? t('exchange.lowValue') :
                                                                t('fiatOn.buyText')
                                            }
                                        </BuyButton>
                                    </Col>
                                </Row>
                            )}
                        </CustomCard>
                    </Col>
                </Row>
            </Page>
        )
    }
}

export default withTranslation()(withWeb3Account(FiatOn));
