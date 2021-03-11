import { Row, Col } from 'react-bootstrap'
import styled from 'styled-components';

import Header from '../Header';
import Footer from "../Footer";
import {useEffect} from "react";
import {withRouter} from "react-router";
import {useActiveWeb3React} from "../../hooks";
import toast from "react-hot-toast";

const PageContainer = styled.div`
  background-color: ${({ hasBg, theme }) => hasBg ? theme.modalBG : 'transparent'};
  padding-top: 112px;
  
  @media (min-width: 768px) {
    background-color: transparent;
  }
`

const PageContent = styled.div`
  @media (min-width: 768px) {
    margin-left: ${({ size }) => size === 'lg' ? '-60px' : size === 'sm' ? '60px' : '0'};
    margin-right: ${({ size }) => size === 'lg' ? '-60px' : size === 'sm' ? '60px' : '0'};
  }
  @media (min-width: 1400px) {
    margin-left: ${({ size }) => size === 'xl' ? '-110px' : size === 'lg' ? '-60px' : size === 'sm' ? '60px' : '0'};
    margin-right: ${({ size }) => size === 'xl' ? '-110px' : size === 'lg' ? '-60px' : size === 'sm' ? '60px' : '0'};
  }
`

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text1};
  margin-top: 26px;
  margin-bottom: ${({ morePadding }) => morePadding ? '50px' : '20px'} !important;
  
  @media (min-width: 768px) {
    font-size: 2.5rem;
    margin-top: 86px;
    margin-bottom: 50px !important;
  }
`

const Page = props => {
    useEffect(() => {
        document.body.scrollTo(0, 0)
    }, [])
    return (
        <>
            <Header/>
            <PageContainer hasBg={props.hasBg} className="page container">
                <PageContent size={props.size || 'base'}>
                    {props.title && (
                        <Row>
                            <Col xs={12}>
                                <Title morePadding={props.morePadding}>{props.title}</Title>
                            </Col>
                        </Row>
                    )}
                    {props.children}
                </PageContent>
                <Footer/>
            </PageContainer>
        </>
    )
}

export default withRouter(Page);
