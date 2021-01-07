import React from 'react';
import { Row, Col } from 'react-bootstrap';
import styled from "styled-components";
import {CircularProgress} from "@material-ui/core";
import { connect } from 'react-redux';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { fetchTokens } from "../../state/explore/actions";
import SectionList from "../../components/SectionList";
import CustomCard, { CustomHeader, CustomTitle } from "../../components/CustomCard";
import InnerCard from "../../components/InnerCard";
import SeeMore from "../../components/SeeMore";
import ExchangeIcon from "../../components/Icons/Exchange";

const TypeIcon = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #1BC5BD20;
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
                dots: false,
                arrows: false,
                infinite: false,
                centerMode: false,
                slidesToShow: 3,
                slidesToScroll: 3,
                centerPadding: '30px',
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
                ]
            };

            return {
                title: data.title,
                description: data.description,
                headerAction: data.seeMore && (
                    <div className="pr-3">
                        <SeeMore to={data.seeMore}/>
                    </div>
                ),
                content: data.loading ? (
                    <div className="d-flex align-items-center justify-content-center py-6 w-100">
                        <CircularProgress color={'primary'} style={{ width: 40, height: 40 }}/>
                    </div>
                ) : (
                    <Slider {...settings}>
                        {[...Array(5)].map((item, index) => {
                            let row = data.data[index];
                            let imageComponent = sec === 'derivatives' && (
                                <TypeIcon>
                                    <ExchangeIcon size={28} fill={'#1BC5BD'}/>
                                </TypeIcon>
                            )
                            let dataItem = data.schema(row, imageComponent);
                            return (
                                <div className={'pr-5'}>
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

        const breadCrumbs = [{
            pathname: this.props.match.url,
            title: 'Explore'
        }];

        return (
            <Row data-breadcrumbs={JSON.stringify(breadCrumbs)} data-title={'Explore'}>
                <Col xs={12}>
                    <CustomCard>
                        <CustomHeader className={'card-header'}>
                            <CustomTitle className="card-title">Explore</CustomTitle>
                        </CustomHeader>
                        <div className="card-body">
                            <SectionList sections={sections} direction={'row'}/>
                        </div>
                    </CustomCard>
                </Col>
            </Row>
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