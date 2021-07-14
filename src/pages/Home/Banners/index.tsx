import Slider from "react-slick";

import { banners } from "../../../data/banners";
import * as Styled from "./styleds";

const Banners = () => {
	const settings = {
		className: "slider w-100",
		dots: true,
		arrows: false,
		infinite: false,
		centerMode: false,
		slidesToShow: 3,
		slidesToScroll: 3,
		centerPadding: "30px",
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
		dotsClass: "banner__dots slick-dots",
	};

	return (
		<Styled.Banners>
			<Styled.BannersInner>
				<Slider {...settings}>
					{banners.map((banner, i) => {
						return (
							<div className={"w-100"} key={`banner-${i}`}>
								<Styled.BannerLink href={banner.url} target={"_blank"} rel={"noopener noreferrer"}>
									<Styled.BannerImage src={banner.image} alt={`banner ${i}`} />
								</Styled.BannerLink>
							</div>
						);
					})}
				</Slider>
			</Styled.BannersInner>
		</Styled.Banners>
	);
};

export default Banners;
