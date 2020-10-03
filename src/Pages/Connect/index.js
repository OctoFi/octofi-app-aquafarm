import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Button,
    Modal
} from "react-bootstrap";

import { useActiveWeb3React } from "../../hooks";
import Providers from '../../components/Providers/ModalContent'
import {toAbsoluteUrl} from "../../lib/helper";
import "../../components/_metronic/_assets/sass/pages/login/classic/login-1.scss";

const Connect = props => {
    const [modalVisible, setModalVisible] = useState(false);
    const { account } = useActiveWeb3React();

    useEffect(() => {
        if(account) {
            props.history.replace('/dashboard');
        }
    }, [account])

    const toggleModal = () => {
        setModalVisible(!modalVisible);
    }
    return (
        <>
            <div className="d-flex flex-column flex-root">
                {/*begin::Login*/}
                <div
                    className="login login-1 login-signin-on d-flex flex-column flex-lg-row flex-row-fluid bg-white"
                    id="kt_login"
                >
                    {/*begin::Aside*/}
                    <div
                        className="login-aside d-flex flex-row-auto bgi-size-cover bgi-no-repeat p-10 p-lg-10"
                        style={{
                            backgroundImage: `url(${toAbsoluteUrl("/media/bg/bg-4.jpg")})`
                        }}
                    >
                        {/*begin: Aside Container*/}
                        <div className="d-flex flex-row-fluid flex-column justify-content-between">
                            {/* start:: Aside header */}
                            <Link to="/" className="flex-column-auto mt-5">
                                <h2 className={'text-white font-weight-bold'}></h2>
                            </Link>
                            {/* end:: Aside header */}

                            {/* start:: Aside content */}
                            <div className="flex-column-fluid d-flex flex-column justify-content-center">
                                <h3 className="font-size-h1 mb-5 text-white">
                                    Welcome to Aquafarm
                                </h3>
                                <p className="font-weight-light text-white opacity-70">
                                    Track your <strong>DeFi</strong> portfolio, find new investment opportunities, <br/>
                                    buy and sell directl, and wrap your tentacles around a sea of gains.
                                </p>
                            </div>
                            {/* end:: Aside content */}

                            {/* start:: Aside footer for desktop */}
                            <div className="d-none flex-column-auto d-lg-flex justify-content-between mt-10">
                                <div className="opacity-70 font-weight-bold	text-white">
                                    &copy; 2020 Open Source (MIT) <a href="https://octo.fi" className="text-white">OctoFi</a>
                                </div>
                            </div>
                            {/* end:: Aside footer for desktop */}
                        </div>
                        {/*end: Aside Container*/}
                    </div>
                    {/*begin::Aside*/}

                    {/*begin::Content*/}
                    <div className="flex-row-fluid d-flex flex-column position-relative p-7 overflow-hidden">

                        {/* begin::Content body */}
                        <div className="d-flex flex-column-fluid flex-center mt-30 mt-lg-0">
                            <div className="connect-form">
                                {/* begin::Head */}
                                <div className="text-center mb-10">
                                    <h3 className="font-size-h1">
                                        Connect To Your <strong className="font-weight-bolder text-info">Wallet</strong>
                                    </h3>
                                    <p className="text-muted font-weight-bold">
                                        Select Your Connection method
                                    </p>
                                </div>
                                {/* end::Head */}

                                {/* begin::Content */}
                                <div className="connect-form__content d-flex align-items-center justify-content-center">
                                    <Button
                                        type="submit"
                                        variant={'info'}
                                        className={`font-weight-bold px-9 py-4 my-3`}
                                        onClick={toggleModal}
                                    >
                                        <span>Connect Wallet</span>
                                    </Button>
                                </div>
                                {/* end::Content */}

                                {/* begin::Modal */}
                                <Modal
                                    className={'provider__modal'}
                                    show={modalVisible}
                                    onHide={toggleModal}
                                    centered={true}
                                >
                                    <Modal.Header
                                        closeButton
                                        className={'d-flex align-items-center justify-content-center bg-light py-7'}>
                                        <Modal.Title className={'font-weight-bold text-dark-75 font-size-base'}>Select a Wallet to Connect to DeFi</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body className={'px-0 py-0'}>
                                        <Providers/>
                                    </Modal.Body>
                                </Modal>
                                {/* end::Modal */}

                            </div>
                        </div>
                        {/*end::Content body*/}

                        {/* begin::Mobile footer */}
                        <div
                            className="d-flex d-lg-none flex-column-auto flex-column flex-sm-row justify-content-between align-items-center mt-5 p-5">
                            <div className="text-dark-50 font-weight-bold order-2 order-sm-1 my-2">
                                &copy; 2020 Open Source (MIT) OctoFi
                            </div>
                        </div>
                        {/* end::Mobile footer */}
                    </div>
                    {/*end::Content*/}
                </div>
                {/*end::Login*/}
            </div>
        </>
    )
}

export default Connect;
