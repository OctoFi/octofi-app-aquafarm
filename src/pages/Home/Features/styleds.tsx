import styled from "styled-components";

export const Features = styled.section`
	padding: 20px 0 0;

	@media (min-width: 576px) {
		padding: 35px 0 0;
	}
`;

export const Container = styled.div`
	overflow: hidden;
`;

export const Inner = styled.div`
	width: calc(100% + 20px);
	margin-left: -10px;
	padding-bottom: 24px;

	.slick-slide {
		height: 100%;
		padding: 0 10px;
	}

	.features__dots {
		list-style: none;
		padding-top: 0;
		padding-left: 0;
		margin: 0;
		display: flex !important;
		align-items: center;
		position: relative;
		justify-content: center;

		@media (min-width: 576px) {
			padding-top: 10px;
		}

		li {
			button {
				width: 5px !important;
				height: 5px !important;
				border-radius: 5px;
				opacity: 0.5;
				background-color: ${({ theme }) => theme.primary};
				transition: opacity 0.4s ease;
				margin: 0 5px;
				padding: 0;

				@media (min-width: 576px) {
					width: 10px !important;
					height: 10px !important;
					border-radius: 10px;
				}

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
