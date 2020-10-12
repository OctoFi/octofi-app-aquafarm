import React from 'react';
import { Modal } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import CurrencyText from "../CurrencyText";
import CurrencyLogo from "../CurrencyLogo";
import styled from "styled-components";

const CustomTitle = styled.h4`
  color: ${({theme}) => theme.text2}
`

const CustomText = styled.span`
  color: ${({theme}) => theme.text1}
`

const WalletModal = (props) => {
    const overview = useSelector(state => state.balances.overview);

    const onHide = () => {
        props.history.push('/dashboard');
    }

    if(overview.wallet === undefined) {
        onHide();
    }

    let data = overview.wallet.balances || [];

    return (
        <Modal
            size={'lg'}
            show={true}
            centered={true}
            className={'assets'}
            onHide={onHide}>
            <Modal.Header className={'border-0'}>
                <Modal.Title>
                    <CustomTitle>
                        Wallet assets
                    </CustomTitle>
                </Modal.Title>
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
                            console.log(row);
                                return (
                                    <tr key={row.metadata.address} className={'assets__row'}>
                                        <td>
                                            <CurrencyLogo currency={row.metadata} size={'36px'}/>
                                            <CustomText className={'font-weight-boldest assets__title ml-4'}>{row.metadata.symbol}</CustomText>
                                        </td>
                                        <td className={'assets__value'}>
                                            <CustomText>{row.balance ? row.balance.toSignificant(6) : 0}</CustomText>
                                        </td>
                                        <td className={'assets__value assets__value--right'}>
                                            <CustomText><CurrencyText>{row.balanceUSD}</CurrencyText></CustomText>
                                        </td>
                                    </tr>
                                )
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

export default WalletModal