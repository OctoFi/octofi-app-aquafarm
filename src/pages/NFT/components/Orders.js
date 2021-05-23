import styled from "styled-components";
import { Row, Col } from "react-bootstrap";
import NFTCard from "../../../components/NFTCard";
import Dropdown from "../../../components/UI/Dropdown";
import { useRef, useEffect, useState, useCallback } from "react";
import { OrderSide } from "opensea-js/lib/types";
import { useTranslation } from "react-i18next";

const HeaderCol = styled(Col)`
	margin-bottom: 20px;
`;

const NoResultText = styled.span`
	color: ${({ theme }) => theme.text1};
	font-size: 1rem;
	font-weight: 700;
	text-align: center;
	margin-bottom: 14px;
`;

const NoResultDescription = styled.span`
	color: ${({ theme }) => theme.text2};
	font-size: 0.875rem;
	font-weight: 400;
	text-align: center;
`;

const Orders = (props) => {
	const loader = useRef(null);
	const { t } = useTranslation();
	const { fetchOrders, page, increasePage, setSort, orders, hasMore } = props;

	const changeSort = (value) => {
		setSort(value);
	};

	const observeAction = () => {
		increasePage();
	};

	const handleObserver = (entities) => {
		const target = entities[0];
		if (target.isIntersecting) {
			observeAction();
		}
	};

	useEffect(() => {
		fetchOrders();
	}, [props.selectedCollection]);

	useEffect(() => {
		fetchOrders();
	}, [page, props.seaport]);

	useEffect(() => {
		const options = {
			root: null,
			rootMargin: "20px",
			threshold: 0,
		};

		const observer = new IntersectionObserver(handleObserver, options);
		if (loader.current) {
			observer.observe(loader.current);
		}
	}, []);

	const sortItems = [
		{
			title: t(`sort.recently_created`),
			value: "recently_created",
		},
		{
			title: t(`sort.lowest_price`),
			value: "lowest_price",
		},
		{
			title: t(`sort.highest_price`),
			value: "highest_price",
		},
		{
			title: t(`sort.oldest`),
			value: "oldest",
		},
	];
	return (
		<Row className={"custom-row"}>
			<HeaderCol xs={12} className={"d-flex align-items-end justify-content-end"}>
				<Dropdown
					placeholder={t("sort.placeholder")}
					variant={"secondary"}
					items={sortItems}
					onChange={changeSort}
				/>
			</HeaderCol>

			{orders.map((order, i) => {
				return (
					<Col key={`nft-order-${i}`} xs={12} md={6} lg={4}>
						<NFTCard seaport={props.seaport} order={order} />
					</Col>
				);
			})}
			<Col xs={12} ref={loader}>
				<Row className="custom-row">
					{hasMore &&
						[...Array(orders.length > 0 ? 4 : 8)].map((item, i) => {
							return (
								<Col key={`nft-loading-${i}`} xs={12} md={6} lg={4}>
									<NFTCard loading={true} />
								</Col>
							);
						})}
					{!hasMore && orders.length === 0 && (
						<Col xs={12} className={"d-flex flex-column align-items-center justify-content-center py-5"}>
							<NoResultText>{t("errors.noAssets")}</NoResultText>
							<NoResultDescription>
								{props.selectedCollection
									? "Please change selected collection or try later."
									: "Please try later to see new offers"}
							</NoResultDescription>
						</Col>
					)}
				</Row>
			</Col>
		</Row>
	);
};

export default Orders;
