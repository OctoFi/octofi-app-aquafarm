import React from "react";
import { connect } from "react-redux";
import Slider from "react-slick";
import { isMobile } from "react-device-detect";
import { Button } from "react-bootstrap";

import { fetchTokens } from "../../state/explore/actions";
import SectionList from "../../components/SectionList";
import InnerCard from "../../components/InnerCard";
import ExchangeIcon from "../../components/Icons/Exchange";
import Loading from "../../components/Loading";
import Page from "../../components/Page";
import "./style.scss";
import * as Styled from "./styleds";

class Explore extends React.Component {
	componentDidMount() {
		this.props.fetchTokens();
	}
	render() {
		const sections = Object.keys(this.props.exploreSections).map((sec) => {
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
						},
					},
					{
						breakpoint: 767,
						settings: {
							slidesToShow: 1,
							slidesToScroll: 1,
							infinite: true,
						},
					},
				],

				dotsClass: "explore__dots slick-dots",
			};

			return {
				title: data.title,
				description: data.description,
				headerAction: data.seeMore && (
					<div>
						<Button variant={"outline-primary"} href={data.seeMore}>
							See More
						</Button>
					</div>
				),
				content: data.loading ? (
					<div className="d-flex align-items-center justify-content-center py-6 w-100">
						<Loading color={"primary"} width={40} height={40} active id={"explore-loading"} />
					</div>
				) : (
					<Slider {...settings}>
						{[...Array(5)].map((item, index) => {
							let row = data.data[index];
							let imageComponent = sec === "derivatives" && (
								<Styled.TypeIcon>
									<ExchangeIcon size={isMobile ? 16 : 28} fill={"#1BC5BD"} />
								</Styled.TypeIcon>
							);

							let dataItem = data.schema(row, imageComponent);
							return (
								<div className={"h-100"} key={index}>
									<InnerCard key={index + data.title} {...dataItem} />
								</div>
							);
						})}
					</Slider>
				),
			};
		});

		return (
			<Page title={"Invest"} networkSensitive={false}>
				<SectionList sections={sections} direction={"row"} />
			</Page>
		);
	}
}

const mapStateToDispatch = (state) => {
	return {
		exploreSections: state.explore,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		fetchTokens: () => dispatch(fetchTokens()),
	};
};

export default connect(mapStateToDispatch, mapDispatchToProps)(Explore);
