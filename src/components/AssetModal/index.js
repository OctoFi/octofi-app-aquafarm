import React from 'react';
import { Modal } from 'react-bootstrap';

import CurrencyText from "../CurrencyText";
import CurrencyLogo from "../CurrencyLogo";

const AssetModal = (props) => {
    const onHide = () => {
        props.history.push('/dashboard');
    }

    const data = props.location.state.data ?? [];
    return (
        <Modal
            size={'lg'}
            show={true}
            centered={true}
            className={'assets'}
            onHide={onHide}>
            <Modal.Header className={'border-0'}>
                <Modal.Title>{props.location.state.title || ''}</Modal.Title>
            </Modal.Header>
            <Modal.Body className={'py-3'}>
                <div>
                    <table className="table table-borderless mb-0 table-head-custom ">
                        <thead>
                            <th>Assets</th>
                            <th>Balance</th>
                            <th className={'assets__value--right'}>Value</th>
                        </thead>
                        <tbody>
                        {data.map(row => {
                            if(row.underlying.length > 0) {
                                row.underlying.map(uRow => {
                                    return (
                                        <tr key={uRow.metadata.address} className={'assets__row'}>
                                            <td>
                                                <CurrencyLogo currency={uRow.currency} size={'36px'}/>
                                                <span className={'font-weight-boldest text-dark assets__title ml-4'}>{uRow.metadata.name}</span>
                                            </td>
                                            <td className={'assets__value'}>
                                                {uRow.balance / 10 ** uRow.metadata.decimals}
                                            </td>
                                            <td className={'assets__value assets__value--right'}>
                                                <CurrencyText>{uRow.balanceUSD}</CurrencyText>
                                            </td>
                                        </tr>
                                    )
                                })
                            } else {
                                return (
                                    <tr key={row.base.metadata.address} className={'assets__row'}>
                                        <td>
                                            <CurrencyLogo currency={row.base.currency} size={'36px'}/>
                                            <span className={'font-weight-boldest text-dark assets__title ml-4'}>{row.base.metadata.name}</span>
                                        </td>
                                        <td className={'assets__value'}>
                                            {row.base.balance / 10 ** row.base.metadata.decimals}
                                        </td>
                                        <td className={'assets__value assets__value--right'}>
                                            <CurrencyText>{row.base.balanceUSD}</CurrencyText>
                                        </td>
                                    </tr>
                                )
                            }
                        })}
                        </tbody>
                    </table>
                </div>
            </Modal.Body>
            <Modal.Footer className={'py-3 px-5 border-0'}>
                <button className="btn btn-light" onClick={onHide}>Close</button>
            </Modal.Footer>
        </Modal>
    )
}

export default AssetModal