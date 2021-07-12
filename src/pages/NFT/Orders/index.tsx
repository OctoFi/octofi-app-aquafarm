import { useRef, useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import NFTCard from "../../../components/NFTCard";
import Dropdown from "../../../components/UI/Dropdown";
// import { OrderSide } from "opensea-js/lib/types";
import { useTranslation } from "react-i18next";
import * as Styled from "./styleds";

export type OrdersProps = {
	selectedCollection: any;
	seaport: any;
	fetchOrders: any;
	page: any;
	increasePage: any;
	setSort: any;
	orders: any;
	hasMore: any;
};

const Orders = ({
	selectedCollection,
	seaport,
	fetchOrders,
	page,
	increasePage,
	setSort,
	orders,
	hasMore,
}: OrdersProps) => {
	const loader = useRef(null);
	const { t } = useTranslation();

	const changeSort = (value: any) => {
		setSort(value);
	};

	useEffect(() => {
		fetchOrders();
	}, [selectedCollection, fetchOrders]);

	useEffect(() => {
		fetchOrders();
	}, [page, seaport, fetchOrders]);

	useEffect(() => {
		const handleObserver = (entities: any) => {
			const target = entities[0];
			if (target.isIntersecting) {
				increasePage();
			}
		};

		const options = {
			root: null,
			rootMargin: "20px",
			threshold: 0,
		};

		const observer = new IntersectionObserver(handleObserver, options);
		if (loader.current) {
			// @ts-ignore
			observer.observe(loader.current);
		}
	}, [increasePage]);

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
		<>
			<div className={"d-flex align-items-end justify-content-end mb-4"}>
				<Dropdown
					placeholder={t("sort.placeholder")}
					variant={"primary"}
					items={sortItems}
					onChange={changeSort}
				/>
			</div>

			<Row>
				{orders.map((order: any, i: number) => {
					return (
						<Col key={`nft-order-${i}`}>
							<NFTCard seaport={seaport} order={order} />
						</Col>
					);
				})}
			</Row>

			<Row ref={loader}>
				{hasMore &&
					[...Array(orders.length > 0 ? 4 : 8)].map((item, i) => {
						return (
							<Col key={`nft-loading-${i}`}>
								<NFTCard loading={true} />
							</Col>
						);
					})}
			</Row>

			{!hasMore && orders.length === 0 && (
				<div className={"d-flex flex-column align-items-center justify-content-center py-5"}>
					<Styled.NoResultText>{t("errors.noAssets")}</Styled.NoResultText>
					<Styled.NoResultDescription>
						{selectedCollection
							? "Please change selected collection or try later."
							: "Please try later to see new offers"}
					</Styled.NoResultDescription>
				</div>
			)}
		</>
	);
};

export default Orders;
