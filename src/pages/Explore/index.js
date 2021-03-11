import React from 'react';
import { Row, Col } from 'react-bootstrap';
import styled from "styled-components";
import { connect } from 'react-redux';
import Slider from "react-slick";
import { isMobile } from 'react-device-detect';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './style.scss';

import { fetchTokens } from "../../state/explore/actions";
import SectionList from "../../components/SectionList";
import InnerCard from "../../components/InnerCard";
import ExchangeIcon from "../../components/Icons/Exchange";
import Loading from '../../components/Loading';
import Page from "../../components/Page";
import {Link} from "react-router-dom";

const TypeIcon = styled.div`
    width: 24px;
    min-width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #1BC5BD20;
    border-radius: 32px;
  
  @media (min-width: 768px) {
    width: 48px;
    height: 48px;
    min-width: 48px;
    border-radius: 48px;
  }
`

const Container = styled.div` 
  display: block;
  width: 100%;
  overflow: hidden;
`

const ContainerInner = styled.div`
  width: calc(100% + 18px);
`

const StyledLink = styled(Link)`
  @media (max-width: 767px) {
    background-color: transparent !important;
    padding: 0;
    text-decoration: underline;
    white-space: nowrap;
    
    &:focus,
    &:active {
      color: ${({ theme }) => theme.primary1} !important;
    }
  }
  
  @media (min-width: 768px) {
    padding: 0.625rem 1.875rem;
    height: 48px;
  }
`


class Explore extends React.Component {
    componentDidMount() {
        this.props.fetchTokens();
    }
    render() {
        const sections = Object.keys(this.props.exploreSections).map(sec => {
            const data = this.props.exploreSections[sec];

            const settings = {
                className: "slider w-100",
                dots: true,
                arrows: false,
                infinite: false,
                centerMode: false,
                slidesToShow: 3,
                slidesToScroll: 3,
                responsive: [
                    {
                        breakpoint: 1199,
                        settings: {
                            slidesToShow: 2,
                            slidesToScroll: 2,
                            infinite: true,
                        }
                    },
                    {
                        breakpoint: 767,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1,
                            infinite: true,
                        }
                    },
                ],

                dotsClass: "explore__dots slick-dots"
            };

            return {
                title: data.title,
                description: data.description,
                headerAction: data.seeMore && (
                    <div className="pr-4">
                        <StyledLink className={'btn btn-light-primary font-weight-bold'} to={data.seeMore}>See More</StyledLink>
                    </div>
                ),
                content: data.loading ? (
                    <div className="d-flex align-items-center justify-content-center py-6 w-100">
                        <Loading color={'primary'} width={40} height={40} active id={'explore-loading'}/>
                    </div>
                ) : (
                    <Slider {...settings}>
                        {[...Array(5)].map((item, index) => {
                            let row = data.data[index];
                            let imageComponent = sec === 'derivatives' && (
                                <TypeIcon>
                                    <ExchangeIcon size={isMobile ? 16 : 28} fill={'#1BC5BD'}/>
                                </TypeIcon>
                            )
                            let dataItem = data.schema(row, imageComponent);
                            return (
                                <div className={'h-100'}>
                                    <InnerCard
                                        key={index + data.title}
                                        {...dataItem}
                                    />
                                </div>
                            )
                        })}
                    </Slider>
                )
            }
        })

        return (
            <Page title={'Explore'}>
                <Row>
                    <Col xs={12}>
                        <Container>
                            <ContainerInner>
                                <SectionList sections={sections} direction={'row'}/>
                            </ContainerInner>
                        </Container>
                    </Col>
                </Row>
            </Page>

        )
    }
}

const mapStateToDispatch = state => {
    return {
        exploreSections: state.explore
    }
}

const mapDispatchToProps = dispatch => {
    return {
        fetchTokens: () => dispatch(fetchTokens())
    }
}

export default connect(mapStateToDispatch, mapDispatchToProps)(Explore);