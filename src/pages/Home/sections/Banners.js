import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { banners } from "../../../constants";
import "./banners.scss";

const Banners = (props) => {
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
		<section className="row banners section">
			<div className="banners__container">
				<div className="banners__inner">
					<Slider {...settings}>
						{banners.map((banner, i) => {
							return (
								<div className={"w-100"} key={`banner-${i}`}>
									<a
										href={banner.url}
										target={"_blank"}
										rel={"noopener noreferrer"}
										className={"banner__link"}
									>
										<img
											src={banner.image.default}
											alt={`banner ${i}`}
											className={"banner__image"}
										/>
									</a>
								</div>
							);
						})}
					</Slider>
				</div>
			</div>
		</section>
	);
};

export default Banners;
