import React, { Component } from 'react';
import moment from 'moment';
import axios from 'axios';
import { Spinner, Col } from "react-bootstrap";
import { connect } from 'react-redux';

import EthDater from '../../lib/ethDater';
import Chart from '../Chart';

class ChartCard extends Component {
    constructor(props) {
        super(props);
        this.dater = new EthDater(
            window.web3
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
                    title: '1 Day',
                    id: 'day',
                },
                {
                    title: '1 Week',
                    id: 'week',
                },
                {
                    title: '1 Month',
                    id: 'month',
                },
                {
                    title: '6 Month',
                    id: 'six_month',
                },
                {
                    title: '1 Year',
                    id: 'year',
                },
            ],
            loading: false,
        }
    }

    componentDidMount() {
        this.changeOption('month');
    }

    changeOption = async (id) => {
        this.setState({
            selected: id,
            loading: true
        })
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

    getBlockNumber() {
        return new Promise((resolve, reject) => {
            window.web3.eth.getBlockNumber((error, result) => {
                if(error) reject(error);
                resolve(result);
            })
        })
    }

    getBalanceInRange = async (address, startBlock, endBlock) => {

        // Calculate the step size given the range of blocks and the number of points we want
        let step = Math.floor((endBlock - startBlock) / 200)
        console.log(step);
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
                    let balancePromise = this.promisify(cb => window.web3.eth.getBalance(address, i, cb));
                    // Create a promise to get the timestamp for that block
                    let timePromise = this.promisify(cb => window.web3.eth.getBlock(i, cb));
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
                    balance: parseFloat(window.web3.fromWei(results[i + 1], 'ether')),
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
        // @ts-ignore
        let {chartColor, className} = this.props;
        return this.state.loading ? (
            <Col xs={12}  className={'d-flex align-items-center justify-content-center bg-white rounded'} style={{ padding: '120px 0'}}>
                <Spinner size='lg' animation="border" role="status" variant={'primary'}>
                    <span className="sr-only">Loading...</span>
                </Spinner>
            </Col>
        ) : (
            <div className={`card card-custom ${className}`}>

                {/* begin::Header */}
                <div className="card-header border-0 pt-5">
                    <div className="card-title">
                        <div className="card-label">
                            <div className="font-weight-bolder">Portfolio Performance</div>
                        </div>
                    </div>
                    <div className="card-toolbar">
                        {this.state.options.map(option => {
                            return (
                                <button
                                    onClick={this.changeOption.bind(this, option.id)}
                                    className={`btn btn-sm ${this.state.selected === option.id ? 'btn-success' : 'btn-light-success'} px-4 mr-2 btn-inline`}
                                >
                                    {option.title}
                                </button>
                            )
                        })}
                    </div>
                </div>
                {/* end::Header */}

                {/* begin::Content */}
                <div className="card-body d-flex flex-column px-0">
                    {/* begin::Chart */}
                    <Chart
                        series={this.state.series}
                        categories={this.state.categories}
                        chartColor={chartColor}
                        height={300}
                    />
                    {/* end::Chart */}
                </div>
                {/* end::Content */}
            </div>
        )
    }
};

const mapStateToProps = state => {
    return {
        rates: state.currency.currenciesRate
    }
}

export default connect(mapStateToProps)(ChartCard);