import { Col } from "react-bootstrap";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import FeatureItem from "../../../components/FeatureItem";
import "./features.scss";
import { useTranslation } from "react-i18next";

const Features = (props) => {
	const { t } = useTranslation();

	const settings = {
		className: "slider w-100",
		dots: true,
		arrows: false,
		infinite: false,
		centerMode: false,
		slidesToShow: 4,
		slidesToScroll: 1,
		centerPadding: "20px",
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
		dotsClass: "features__dots slick-dots d-lg-none",
	};

	return (
		<section className="row custom-row features section d-flex align-items-stretch">
			<Col xs={12}>
				<h3 className="h3 text-center section__title">{t("app.getInTouch")}</h3>
			</Col>
			<Col xs={12}>
				<div className="features__container">
					<div className="features__inner">
						<Slider {...settings}>
							<FeatureItem
								href={"https://help.octo.fi"}
								iconName={"support"}
								title={t("app.features.support.title")}
							>
								{t("app.features.support.desc")}
							</FeatureItem>
							<FeatureItem
								href={"https://blog.octo.fi"}
								iconName={"blog"}
								title={t("app.features.blog.title")}
							>
								{t("app.features.blog.desc")}
							</FeatureItem>
							<FeatureItem
								href={"https://den.octo.fi"}
								iconName={"community"}
								title={t("app.features.community.title")}
							>
								{t("app.features.community.desc")}
							</FeatureItem>
							<FeatureItem
								href={"https://yolo.octo.fi"}
								iconName={"blog"}
								title={t("app.features.careers.title")}
							>
								{t("app.features.careers.desc")}
							</FeatureItem>
						</Slider>
					</div>
				</div>
			</Col>
		</section>
	);
};

export default Features;
