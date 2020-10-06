import React, { useState, useEffect} from 'react';
import {connect} from "react-redux";
import {Col, Row} from 'react-bootstrap';
import { Token } from "@uniswap/sdk";
import defiSdk from "../../utils/getDefiSdk";

import { useActiveWeb3React } from "../../hooks";
import ValueCard from "../../components/ValueCard";
import TableCard from "../../components/TableCard";
import CurrencyText from "../../components/CurrencyText";
import CurrencyLogo from "../../components/CurrencyLogo";

function Platforms(props) {
    const { chainId } = useActiveWeb3React();
    const [platform, setPlatform] = useState(null)
    const [totalAssets, setTotalAssets] = useState(0)
    const [totalDebts, setTotalDebts] = useState(0)

    useEffect(() => {
        defiSdk.getProtocolNames().then(protocols => {
            if(!protocols.includes(props.match.params.platform)) {
                props.history.push('/dashboard');
            }
        });
    })

    useEffect(() => {
        const p = props.balances.find((item) => {
            return item.metadata.name === props.match.params.platform;
        })
        if(p) {
            setPlatform(p)
            const account = {
                assets: 0,
                debts: 0
            }
            p.balances.map(balance => {
                if(balance.metadata.type === 'Debt') {
                    account.debts += balance.total;
                } else {
                    account.assets += balance.total;
                }
            })
            setTotalAssets(account.assets);
            setTotalDebts(account.debts);
        }

    }, [props.balances, props.match.params.platform])

    const breadCrumbs = [{pathname: '/dashboard', title: 'Dashboard'}, {
        pathname: props.match.url,
        title: props.match.params.platform
    }];
    return (
        <>
            <Row data-breadcrumbs={JSON.stringify(breadCrumbs)} data-title={props.match.params.platform}>
                <Col span={12} md={4}>
                    <ValueCard className={'gutter-b'} title={'Supplied Total'} value={totalAssets}/>
                </Col>
                <Col span={12} md={4}>
                    <ValueCard className={'gutter-b'} title={'Borrowed Total'} value={totalDebts}/>
                </Col>
                <Col span={12} md={4}>
                    <ValueCard className={'gutter-b'} title={'Net'} value={platform ? platform.total : 0}/>
                </Col>
            </Row>
            {platform && platform.balances.map(asset => {
                let data = [];
                asset.balances.map(balance => {
                    if(balance.underlying.length === 0) {
                        const baseCurrency = new Token(chainId, balance.base.metadata.address, balance.base.metadata.decimals, balance.base.metadata.symbol, balance.base.metadata.name)
                        data.push([
                            (<div className="d-flex align-items-center">
                                <CurrencyLogo size={'36px'} currency={baseCurrency}/>
                                <span className={'font-weight-boldest text-dark assets__title ml-4'}>{balance.base.metadata.name}</span>
                            </div>),
                            (Number(balance.base.balance) / 10 ** balance.base.metadata.decimals).toFixed(6),
                            (<CurrencyText>{balance.base.balanceUSD}</CurrencyText>)
                        ])
                    } else {
                        for(let i in balance.underlying) {
                            const underlying = balance.underlying[i];
                            const currency = new Token(chainId, underlying.metadata.address, underlying.metadata.decimals, underlying.metadata.symbol, underlying.metadata.name)
                            data.push([
                                (<div className="d-flex align-items-center">
                                    <CurrencyLogo size={'36px'} currency={currency}/>
                                    <span className={'font-weight-boldest text-dark assets__title ml-4'}>{balance.base.metadata.name}</span>
                                </div>),
                                (Number(underlying.balance) / 10 ** underlying.metadata.decimals).toFixed(6),
                                (<CurrencyText>{underlying.balanceUSD}</CurrencyText>)
                            ])
                        }
                    }
                })
                return (
                    <Row>
                        <Col xs={12} className={'gutter-b'}>
                            <h3 className={'mb-1 mt-4'}>{asset.metadata.type}</h3>
                        </Col>
                        <Col xs={12} md={asset.balances.length > 2 && asset.balances.length % 2 === 0 ? 6 : 12} className={'gutter-b'}>
                            <TableCard
                                title={asset.metadata.type}
                                columns={[
                                    {
                                        id: 'asset',
                                        title: 'Asset'
                                    },
                                    {
                                        id: 'balance',
                                        title: 'Balance'
                                    },
                                    {
                                        id: 'value',
                                        title: 'Value',
                                    },
                                ]}
                                data={data}
                            />
                        </Col>

                    </Row>
                )
            })}

        </>
    )
}

const mapStateToProps = state => {
    return {
        account: state.account,
        balances: state.balances.transformedBalance,
    }
}

export default connect(mapStateToProps)(Platforms);