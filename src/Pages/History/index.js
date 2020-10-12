import React from 'react';
import { Row, Col } from 'react-bootstrap';
import {CircularProgress} from "@material-ui/core";
import moment from 'moment';
import axios from "axios";
import { CSVLink } from "react-csv";
import SVG from "react-inlinesvg";

import CustomCard, { CustomHeader, CustomTitle } from "../../components/CustomCard";
import SectionList from "../../components/SectionList";
import Collapse from "../../components/Collapse";
import withWeb3Account from "../../components/hoc/withWeb3Account";
import ExchangeIcon from "../../components/Icons/Exchange";

const PAGE_SIZE = 30;

class History extends React.Component {
    constructor(props) {
        super(props);

        this.loader = React.createRef();

        this.state = {
            loading: false,
            blockNumber: null,
            finished: false,
            sections: [],
            transactions: [],
        }
    }

    componentDidMount() {
        const options = {
            root: null,
            rootMargin: "0px",
            threshold: 0
        };
        // initialize IntersectionObserver
        // and attaching to Load More div
        const observer = new IntersectionObserver(this.handleObserver, options);
        if (this.loader.current) {
            observer.observe(this.loader.current)
        }
    }

    handleObserver = (entities) => {
        const target = entities[0];
        if (target.isIntersecting && !this.state.finished) {
            this.fetchTransactions();
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

    fetchTransactions = async () => {
        if(this.state.finished) {
            return;
        }
        this.setState({
            loading: true,
        })
        const lastBlockNumber = this.state.blockNumber || await this.getBlockNumber();
        let txnRes = await axios.get(`https://api.etherscan.io/api?module=account&action=txlist&address=${this.props.web3.account}&startblock=0&endblock=${lastBlockNumber}&page=1&offset=${PAGE_SIZE}&sort=desc&apikey=KM1S3UP6BGICACR5X2IE5E3ZIADV33DKA1`);
        let erc20Res = await axios.get(`https://api.etherscan.io/api?module=account&action=tokentx&address=${this.props.web3.account}&startblock=0&endblock=${lastBlockNumber}&page=1&offset=${PAGE_SIZE}&sort=desc&apikey=KM1S3UP6BGICACR5X2IE5E3ZIADV33DKA1`);

        let ethLastBlock = txnRes.data.status === '1' ? txnRes.data.result[txnRes.data.result.length - 1].blockNumber : 0;
        let ercLastBlock = erc20Res.data.status === '1' ? erc20Res.data.result[erc20Res.data.result.length - 1].blockNumber : 0;

        let lastBlock;
        let isFinished = false;

        if(txnRes.data.result.length < PAGE_SIZE && erc20Res.data.result.length < PAGE_SIZE) {
            lastBlock = ethLastBlock < ercLastBlock ? ethLastBlock : ercLastBlock;
            isFinished = true;
        } else {
            lastBlock = ethLastBlock > ercLastBlock ? ethLastBlock : ercLastBlock;
        }
        let mixed = [ ...txnRes.data.result, ...erc20Res.data.result ];

        this.setState(prevState => {
            let result = {}
            for(let i in mixed) {
                const txn = mixed[i];
                if (txn.blockNumber >= lastBlock) {
                    if(!result.hasOwnProperty(txn.timeStamp)) {
                        result[txn.timeStamp] = {
                            [txn.hash]: [txn]
                        }
                    } else {
                        if (!result[txn.timeStamp].hasOwnProperty(txn.hash)) {
                            result[txn.timeStamp][txn.hash] = [{...txn}]
                        } else {
                            result[txn.timeStamp][txn.hash].push({...txn})
                        }
                    }
                }
            }

            let sections = []
            for(let i in result) {
                const title = moment(i, 'X').format('MMMM D, YYYY');
                let item = sections.findIndex(item => item.title === title);
                let transactions = Object.keys(result[i]);
                if(item > -1) {
                    sections[item].content.push(...transactions.map(t => {
                        const txn = result[i][t];
                        return (
                            <Collapse txn={txn}/>
                        )
                    }))
                } else {
                    sections.push({
                        title,
                        content: transactions.map(t => {
                            const txn = result[i][t];
                            return (
                                <Collapse txn={txn}/>
                            )
                        })
                    })
                }
            }
            for(let i in sections) {
                sections[i].content.reverse();
            }
            sections.reverse();


            let transformedSections = prevState.sections.concat(sections);



            return {
                loading: false,
                blockNumber: lastBlock - 1,
                finished: isFinished,
                sections: transformedSections,
                transactions: prevState.transactions.concat(txnRes.data.result, erc20Res.data.result)
            }

        })

    }

    render() {
        return (
            <Row>
                <Col xs={12}>
                    <CustomCard>
                        <CustomHeader className="card-header d-flex align-items-center justify-content-between">
                            <CustomTitle className="card-title">Transactions History</CustomTitle>
                            <CSVLink className={'btn btn-outline-primary'} data={this.state.transactions} filename={`${this.props.web3.account}_${this.state.blockNumber}__defi_dashboard.csv`}>Download CSV</CSVLink>
                        </CustomHeader>
                        <div className="card-body">
                            {(!this.state.loading || this.state.sections.length > 1) && (
                                <SectionList sections={this.state.sections}/>
                            )}
                            {(this.state.finished && this.state.sections.length === 0) && (
                                <div className="d-flex flex-column align-items-center justify-content-center py-8 px-4">
                                    <ExchangeIcon size={48} fill={'#6993FF'}/>
                                    <h5 className="text-primary font-weight-bolder mb-3 mt-5">
                                        There is no <strong>Transaction</strong>
                                    </h5>
                                    <span className="text-muted font-weight-light font-size-lg">
                                        Please make some transactions first.
                                    </span>
                                </div>
                            )}
                            <div className="d-flex align-items-center justify-content-center py-6" ref={this.loader}>
                                {!this.state.finished && (
                                    <CircularProgress color={'primary'} style={{ width: 40, height: 40 }}/>
                                )}
                            </div>


                        </div>
                    </CustomCard>
                </Col>
            </Row>
        )
    }
}

export default withWeb3Account(History);