import styled from "styled-components";

export const Banners = styled.section`
	margin: 40px 0 25px;
	overflow: hidden;

	@media (min-width: 576px) {
		margin: 80px 0;
	}
`;

export const BannerLink = styled.a`
	display: block;
	padding: 0 27px;
	width: 100%;

	&:focus {
		outline: none;
	}
`;

export const BannerImage = styled.img`
	width: 100%;
	display: block;
`;

export const BannersInner = styled.div`
	width: calc(100% + 54px);
	margin-left: -27px;
	padding-bottom: 2.5rem;

	.banner__dots {
		bottom: -35px;

		li {
			width: 12px;
			height: 12px;

			button {
				width: 12px;
				height: 12px;
				border-radius: 50%;
				opacity: 0.5;
				background-color: ${({ theme }) => theme.primary};
				transition: opacity 0.4s ease;
				padding: 0;
				margin: 0 5px;

				&::before {
					display: none;
				}
			}

			&.slick-active button {
				opacity: 1;
			}
		}
	}
`;
