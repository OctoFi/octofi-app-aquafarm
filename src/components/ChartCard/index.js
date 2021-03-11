import React, { Component } from 'react';
import moment from 'moment';
import axios from 'axios';
import Web3 from 'web3';
import { connect } from 'react-redux';
import styled, {ThemeContext} from 'styled-components';

import Loading from '../Loading';
import EthDater from '../../lib/ethDater';
import Chart from "../Chart";
import withWeb3Account from "../hoc/withWeb3Account";


const LoadingCol = styled.div`
  background-color: ${({ theme }) => theme.modalBG};
  border-radius: 20px;
  min-height: 400px;
  margin-top: 10px;
`

const CustomTitle = styled.span`
  font-weight: 700;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.text1}
`

const Card = styled.div`
  background-color: ${({ theme }) => theme.modalBG};
  color: ${({ theme }) => theme.text1};
  display: flex;
  border-radius: 20px;
  justify-content: center;
  flex-direction: column;
  padding: 0 0 8px;
  margin-top: 20px;
  
  
  @media (min-width: 768px) {
  padding: 30px 30px 38px;
  margin-top: 0;
  }
  
`

const ToolbarButton = styled.button`
  font-size: .875rem;
  padding: 0 20px;
  
  &:first-child {
    padding-left: 0;
  }
  
  &:last-child {
    padding-right: 0;
  }
  
  &:focus,
  &:hover,
  &:active {
    text-decoration: none;
    outline: none;
    box-shadow: none;
  }
`

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: transparent;
  
  padding: 20px;
  
  
  @media (min-width: 768px) {
    padding: 0;
  }
`

class ChartCard extends Component {
    static contextType = ThemeContext;

    constructor(props) {
        super(props);
        this.web3Provider = new Web3(new Web3.providers.WebsocketProvider(process.env.REACT_APP_WSS_URL))
        this.dater = new EthDater(
            this.web3Provider
        );

        this.state = {
            series: [{
                name: 'Performance',
                data: [],
            }],
            categories: [],
            selected: 'month',
            options: [
                {
                    title: 'Day',
                    id: 'day',
                },
                {
                    title: 'Week',
                    id: 'week',
                },
                {
                    title: 'Month',
                    id: 'month',
                },
                {
                    title: '6 Month',
                    id: 'six_month',
                },
                {
                    title: 'Year',
                    id: 'year',
                },
            ],
            loading: false,
        }
    }

    async componentDidMount() {
        this.changeOption('month');
    }

    changeOption = async (id) => {
        this.setState({
            selected: id,
            loading: true
        })
        try {
            let date = this.getStartDate(id);
            let blockNumber = await this.dater.getDate(
                date,
                false,
            )

            let latestBlockNumber = await this.getBlockNumber();
            let balances = await this.getBalanceInRange(this.props.account, blockNumber.block, latestBlockNumber);
            let transformedBalances = balances.map(balance => {
                return balance.balance / this.props.rates.ETH
            })
            let categories = balances.map(balance => {
                return moment(balance.time).format('YYYY MMM D, HH:mm:ss')
            })
            this.setState({
                loading: false,
                series: [{
                    name: 'Performance',
                    data: transformedBalances,
                }],
                categories
            })
        } catch(e) {
            console.log(e)
        }

    }

    promisify = (inner) =>
        new Promise((resolve, reject) =>
            inner((err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            })
        );

    async getFirstBlock(address) {
        try {
            let response = await axios.get("https://api.etherscan.io/api?module=account&action=txlist&address=" + address + "&startblock=0&page=1&offset=10&sort=asc&apikey=KM1S3UP6BGICACR5X2IE5E3ZIADV33DKA1");
            let data = response.data;

            if ((data.result).length > 0) {
                return data.result[0].blockNumber;
            } else {
                return -1;
            }
        } catch (error) {
            console.error(error);
        }
    }

    getBlockNumber = () => {
        return new Promise((resolve, reject) => {
            resolve(this.props.web3.library.blockNumber > 0 ? this.props.web3.library.blockNumber : 999999999);
        })
    }

    getBalanceInRange = async (address, startBlock, endBlock) => {
        // Calculate the step size given the range of blocks and the number of points we want
        let step = Math.floor((endBlock - startBlock) / 200)
        // Make sure step is at least 1
        if (step < 1) {
            step = 1;
        }

        try {
            let promises = []
            // Loop over the blocks, using the step value
            for (let i = startBlock; i < endBlock; i = i + step) {
                // If we already have data about that block, skip it
                if (!this.state.series[0].data.find(x => x.hasOwnProperty('block') ? x.block === i : false)) {
                    // Create a promise to query the ETH balance for that block
                    let balancePromise = this.promisify(cb => this.web3Provider.eth.getBalance(address, cb));
                    // Create a promise to get the timestamp for that block
                    let timePromise = this.promisify(cb => this.web3Provider.eth.getBlock(i, false, cb));
                    // Push data to a linear array of promises to run in parallel.
                    promises.push(i, balancePromise, timePromise)
                }
            }

            // Call all promises in parallel for speed, result is array of {block: <block>, balance: <ETH balance>}
            let results = await Promise.all(promises);

            // Restructure the data into an array of objects
            let balances = []
            for (let i = 0; i < results.length; i = i + 3) {
                balances.push({
                    block: results[i],
                    balance: parseFloat(this.web3Provider.utils.fromWei(results[i + 1])),
                    time: new Date(results[i + 2].timestamp * 1000)
                })
            }


            return balances;

        } catch (error) {
            console.log(error);
        }
    }

    unpack(rows, index) {
        return rows.map(function (row) {
            return row[index];
        });
    }

    getStartDate = (id) => {
        let date = moment();
        switch(id) {
            case 'year': {
                date.subtract(1, 'years');
                break;
            }
            case 'six_month': {
                date.subtract(6, 'months');
                break;
            }
            case 'month': {
                date.subtract(1, 'months');
                break;
            }
            case 'week': {
                date.subtract(7, 'days');
                break;
            }
            case 'day': {
                date.subtract(1, 'days');
                break;
            }
            default: {
                break;
            }
        }
        return date;
    }

    render() {
        const theme = this.context;

        return this.state.loading && false ? (
            <LoadingCol xs={12} className={'d-flex align-items-center justify-content-center'}>
                <Loading width={55} height={55} active id={'chart-card'}/>
            </LoadingCol>
        ) : (
            <Card>
                {/* begin::Header */}
                <CardHeader className="card-header border-0">
                        <CustomTitle>Portfolio Performance</CustomTitle>
                    <div className="card-toolbar d-none d-lg-flex">
                        {this.state.options.map(option => {
                            return (
                                <ToolbarButton
                                    onClick={this.changeOption.bind(this, option.id)}
                                    className={`btn btn-sm btn-link ${this.state.selected === option.id ? 'text-white' : 'text-white-50'} btn-inline`}

                                >
                                    {option.title}
                                </ToolbarButton>
                            )
                        })}
                    </div>
                </CardHeader>
                {/* end::Header */}

                {/* begin::Content */}
                <div className="card-body d-flex flex-column px-0 pb-0">
                    {this.state.loading ? (
                        <LoadingCol xs={12} className={'d-flex align-items-center justify-content-center'}>
                            <Loading width={55} height={55} active id={'chart-card'}/>
                        </LoadingCol>
                    ) : (
                        <Chart
                            series={this.state.series}
                            categories={this.state.categories}
                            color={theme.primary}
                            theme={theme}
                            selected={this.state.selected}
                        />
                    )}
                </div>
                {/* end::Content */}
            </Card>
        )
    }
};

const mapStateToProps = state => {
    return {
        rates: state.currency.currenciesRate,
        darkMode: state.user.userDarkMode,
    }
}

export default connect(mapStateToProps)(withWeb3Account(ChartCard));
