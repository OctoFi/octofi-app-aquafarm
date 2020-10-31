import React from 'react';
import {Row, Col, Spinner, Button} from 'react-bootstrap';
import { connect } from 'react-redux';
import axios from 'axios';
import { withSnackbar } from 'notistack';
import {ThemeContext} from "styled-components";
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';

import ValueCard from "../../components/ValueCard";
import CustomCard from "../../components/CustomCard";
import CryptoInput from "../../components/CryptoInput";
import { cryptoBuyCurrencies } from "../../constants";
import {ArrowWrapper} from "../../components/swap/styleds";
import {ArrowDown} from "react-feather";
import {ClickableText} from "../../components/ExternalLink";
import withWeb3Account from "../../components/hoc/withWeb3Account";

class BuyCrypto extends React.Component {

    static contextType = ThemeContext

    state = {
        loading: true,
        assets: {
            items: [],
            selected: null,
            value: ''
        },
        currency: {
            items: [...cryptoBuyCurrencies],
            selected: null,
            value: ''
        }
    }

    componentDidMount() {
        axios.get('https://api-instant.ramp.network/api/host-api/assets')
            .then(response => {
                this.setState(prevState => {
                    return {
                        loading: false,
                        assets: {
                            ...prevState.assets,
                            items: response.data.assets.filter(asset => {
                                return ['btc', 'eth', 'dai', 'usdc'].includes(asset.symbol.toLowerCase());
                            })
                        }
                    }
                })
            })
            .catch(error => {
                this.props.enqueueSnackbar('Something went wrong. please try again later.', { variant: 'error' });
                console.log(error);
                this.setState({
                    loading: false,
                    assets: {
                        items: [],
                        selected: null,
                        value: ''
                    }
                })
            })
    }

    onUserInputHandler = (value, type) => {
        if(this.state.currency.selected && this.state.assets.selected) {
            let currencyValue = 0;
            let assetValue = 0;
            if(type === 'currency') {
                currencyValue = value;
                assetValue = value / this.state.assets.selected.price[this.state.currency.selected.symbol]
            } else {
                assetValue = value;
                currencyValue = value * this.state.assets.selected.price[this.state.currency.selected.symbol]
            }

            this.setState(prevState => {
                return {
                    currency: {
                        ...prevState.currency,
                        value: currencyValue
                    },
                    assets: {
                        ...prevState.assets,
                        value: assetValue
                    }
                }
            })
        } else {
            this.setState(prevState => {
                return {
                    [type]: {
                        ...prevState[type],
                        value
                    }
                }
            })
        }

    }

    onSelect = (value, type) => {
        const items = this.state[type].items;
        const selectedItem = items.find(item => item.symbol === value);
        let assetValue = '';

        if(this.state.currency.value && this.state.currency.selected) {
            if(type === 'assets') {
                assetValue = this.state.currency.value / selectedItem.price[this.state.currency.selected.symbol];
            } else {
                assetValue = this.state.currency.value / this.state.assets.selected.price[selectedItem.symbol];
            }
        }

        if(type === 'assets') {
            this.setState(prevState => {
                return {
                    [type]: {
                        ...prevState[type],
                        selected: selectedItem,
                        value: assetValue
                    }
                }
            })
        } else {
            this.setState(prevState => {
                return {
                    [type]: {
                        ...prevState[type],
                        selected: selectedItem,
                    },
                    assets: {
                        ...prevState.assets,
                        value: assetValue
                    }
                }
            })
        }
    }

    buyHandler = () => {
        const { selected: assetsSelected, value: assetsValue} = this.state.assets;
        new RampInstantSDK({
            hostAppName: process.env.REACT_APP_NAME,
            hostLogoUrl: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
            swapAmount: Number.parseInt(((assetsValue) * (10 ** assetsSelected.decimals))),
            swapAsset: assetsSelected.symbol,
            userAddress: this.props.web3.account,
            hostApiKey: process.env.REACT_APP_RAMP_HOST_API_KEY
        })
            .on('WIDGET_CLOSE', event => {
                this.props.enqueueSnackbar('You Canceled The Purchase Progress, Maybe the next time!', { variant: 'info' });
            })
            .on('PURCHASE_FAILED', event => {
                this.props.enqueueSnackbar('Your Purchase was failed, Please try again later.', { variant: 'error' });
            })
            .on('PURCHASE_CREATED', event => {
                this.props.enqueueSnackbar('Your Purchase was created successfully!', { variant: 'success' });
            })
            .on('PURCHASE_SUCCESSFUL', event => {
                this.props.enqueueSnackbar('Your Purchase was completed Successfully, You can see your assets in dashboard', { variant: 'success' })
            })
            .show();
    }

    render() {
        const theme = this.context;
        const { selected: currencySelected, value: currencyValue} = this.state.currency;
        const { selected: assetsSelected, value: assetsValue} = this.state.assets;

        return (
            <>
                <Row>
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
                                                    value={currencyValue}
                                                    onUserInput={this.onUserInputHandler}
                                                    label='Currency'
                                                    onSelect={this.onSelect}
                                                    selected={currencySelected}
                                                    items={this.state.currency.items}
                                                    type={'currency'}
                                                    id={'currency'}
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
                                                    value={assetsValue}
                                                    onUserInput={this.onUserInputHandler}
                                                    label='Token'
                                                    onSelect={this.onSelect}
                                                    selected={assetsSelected}
                                                    items={this.state.assets.items}
                                                    type={'assets'}
                                                    id={'assets'}
                                                />
                                            </Col>
                                            {(currencySelected && currencyValue && assetsValue && assetsSelected && currencyValue > 0) ? (
                                                <Col xs={12} className={'d-flex justify-content-between align-items-center gutter-b'}>
                                                    <ClickableText fontWeight={500} fontSize={14} color={theme.text2}>
                                                        Price
                                                    </ClickableText>
                                                    <ClickableText fontWeight={500} fontSize={14} color={theme.text1}>
                                                        {assetsSelected && currencySelected ? `1 ${assetsSelected.symbol} = ${currencySelected.notation} ${assetsSelected.price[currencySelected.symbol].toFixed(4)} ± ${assetsSelected.maxFeePercent[currencySelected.symbol]}% (Fee)` : ''}
                                                    </ClickableText>
                                                </Col>
                                            ) : ''}

                                            <Col xs={12}>
                                                <Button block size={'lg'}
                                                        onClick={this.buyHandler}
                                                        className={'py-6 font-weight-bolder font-size-lg'}
                                                        disabled={!currencySelected || !currencyValue || !assetsValue || !assetsSelected || currencyValue > (assetsSelected.maxSinglePurchase[currencySelected.symbol] / 10 ** assetsSelected.decimals) * assetsSelected.price[currencySelected.symbol] || currencyValue < 15}
                                                        variant={
                                                            !(!currencySelected || !currencyValue || !assetsValue || !assetsSelected || currencyValue > ((assetsSelected.maxSinglePurchase[currencySelected.symbol] / 10 ** assetsSelected.decimals) * assetsSelected.price[currencySelected.symbol]) || currencyValue < 15) ? 'success' : this.props.darkMode ? 'dark' : 'light'
                                                        }
                                                >
                                                    {
                                                        !currencySelected ? 'Please Select Your Currency' :
                                                        !assetsSelected ? 'Please Select Your asset' :
                                                        !currencyValue || !assetsValue ? 'Please Enter Amount' :
                                                        currencyValue < 15 ? 'Too Low value' :
                                                        currencyValue > ((assetsSelected.maxSinglePurchase[currencySelected.symbol] / 10 ** assetsSelected.decimals) * assetsSelected.price[currencySelected.symbol]) ? 'Too High Value' :
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