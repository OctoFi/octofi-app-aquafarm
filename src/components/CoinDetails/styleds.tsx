import styled from "styled-components";
import { Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import Card, { ResponsiveCard } from "../Card";

export const ChartResponsiveCard = styled(ResponsiveCard)`
	@media (max-width: 991px) {
		margin-bottom: -1px !important;
		border: none;

		.card-body {
			padding-top: 15px;
			padding-bottom: 15px;
		}
	}
`;

export const ResponsiveCol = styled.div`
	@media (max-width: 991px) {
		margin: -1px -30px 0;
		padding: 15px 30px;
		background-color: ${({ theme }) => theme.modalBG};
	}
`;

export const BalanceCard = styled(Card)`
	.card-body {
		padding: 20px 30px;
	}

	@media (max-width: 991px) {
		margin-bottom: 40px;

		.card-body {
			padding: 20px 15px;
		}
	}
`;

export const StyledCard = styled(Card)`
	@media (max-width: 991px) {
		border: 1px solid ${({ theme }) => theme.text4};
		margin-bottom: 0 !important;

		.card-header,
		.card-body {
			padding: 20px 15px;
		}

		.card-header {
			min-height: 57px;
		}

		h4 {
			font-size: 0.875rem;
		}
	}

	@media (min-width: 992px) {
		.card-header {
			padding: 15px 30px;
			position: relative;
			border: none;

			&::before {
				content: "";
				position: absolute;
				left: 30px;
				right: 30px;
				bottom: 0;
				border-bottom: 1px solid ${({ theme }) => theme.text3};
			}
		}

		h4 {
			font-size: 1rem;
		}
	}
`;

export const ChangesCard = styled(StyledCard)`
	@media (max-width: 991px) {
		.card-body {
			padding-top: 34px;
			padding-bottom: 34px;
		}
	}
`;

export const About = styled.div`
	font-weight: 400;
	font-size: 1rem;
	line-height: 19px;

	@media (max-width: 991px) {
		font-size: 0.875rem;
		line-height: 17px;
		text-align: justify;
	}
`;

export const DetailsCol = styled(Col)`
	&:not(:last-child) {
		margin-bottom: 20px;
	}
`;

export const DetailsInnerCol = styled(Col)`
	width: initial !important;
	flex: 1;
	max-width: 100%;
`;

export const DetailsDesc = styled.span`
	font-weight: 400;
	font-size: 1rem;

	@media (max-width: 991px) {
		font-size: 0.75rem;
	}
`;

export const DetailsValue = styled.span`
	font-weight: 700;
	font-size: 1rem;
	text-align: right;
	width: 100%;

	@media (max-width: 991px) {
		font-size: 0.875rem;
	}
`;

export const DetailsLink = styled.a<{ withUnderline?: boolean }>`
	color: ${({ theme }) => theme.primary};
	text-decoration: ${({ withUnderline }) => (withUnderline ? "underline" : "none")};
	font-weight: 700;
	font-size: 1rem;
	text-align: right;
	width: 100%;

	@media (max-width: 991px) {
		font-size: 0.875rem;
		font-weight: 400;
		max-width: 180px;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}
`;

export const StatsDesc = styled.span<{ last?: boolean }>`
	color: ${({ theme }) => theme.text3};
	font-size: 0.875rem;
	display: block;
	margin-bottom: 1.25rem;

	@media (max-width: 991px) {
		font-size: 0.75rem;
		color: ${({ theme }) => theme.text1};
		margin-bottom: ${({ last }) => (!last ? "0.875rem" : "0")};
	}
`;

export const StatsValue = styled.span<{ last?: boolean }>`
	color: ${({ theme }) => theme.text1};
	font-size: 1rem;
	font-weight: 700;

	@media (max-width: 991px) {
		font-size: 0.875rem;
		margin-bottom: ${({ last }) => (!last ? "0.875rem" : "0")};
	}
`;

export const ChangesTitle = styled.span`
	font-weight: 700;
	font-size: 1.25rem;
	margin-left: 1rem;
`;

export const ChangesSubtitle = styled.span`
	font-weight: 400;
	font-size: 0.875rem;
	display: block;
	margin-top: 18px;
`;

export const BalanceText = styled.span`
	font-weight: 400;
	font-size: 0.875rem;
	margin-bottom: 20px;

	@media (min-width: 991px) {
		margin-bottom: 0;
		font-size: 1rem;
	}
`;

export const BalanceValue = styled.span`
	font-weight: 700;
	font-size: 1rem;
`;

export const BuyHelper = styled.span`
	font-weight: 400;
	font-size: 1rem;

	@media (max-width: 991px) {
		margin-bottom: 30px;
	}
`;

export const BuyLink = styled(Link)`
	flex: 1;
	display: flex;
	flex-direction: column;
`;
