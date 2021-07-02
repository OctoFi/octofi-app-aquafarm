import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import moment from "moment";

import OpenSeaApi from "../../http/opensea";
import { useActiveWeb3React } from "../../hooks";
import { WalletPageTable } from "./WalletPageTable";
import Loading from "../Loading";
import { CustomText, LogoContainer, Title, TradeButton } from "./styleds";

const Logo = styled.img`
	width: 100%;
	height: 100%;
	display: block;
	border-radius: 300px;
`;

export const StyledLink = styled.a`
	text-decoration: none;
	display: inline-flex;
	margin-right: 30px;

	@media (max-width: 991px) {
		margin-right: 0;
		&:not(:last-child) {
			margin-bottom: 14px;
		}
	}

	&:hover,
	&:focus,
	&:active {
		text-decoration: none;
		outline: none;
		box-shadow: none;
	}
`;

const api = new OpenSeaApi();
const PAGE_SIZE = 20;

const NftTab = (props) => {
	const { account } = useActiveWeb3React();
	const [page, setPage] = useState(1);
	const [data, setData] = useState([]);
	const [hasMore, setHasMore] = useState(true);
	const [loading, setLoading] = useState(true);
	const loader = useRef(null);
	const { t } = useTranslation();

	const { query } = props;

	const columns = [
		{
			dataField: "token_id",
			text: "ID",
			formatter: (cellContent, row) => {
				return <CustomText>{row.id}</CustomText>;
			},
		},
		{
			dataField: "asset",
			text: t("tokens.assets"),
			formatter: (cellContent, row) => {
				return (
					<div className="d-flex align-items-center flex-row-reverse flex-lg-row">
						{row.image_preview_url !== null && (
							<LogoContainer>
								<Logo src={row.image_preview_url} alt={row.name} />
							</LogoContainer>
						)}
						<div className="d-flex flex-column align-items-end align-items-lg-start">
							<Title className={"mb-1"}>{row.name}</Title>
							<CustomText>
								{row?.description?.length > 120
									? row?.description?.slice(0, 120) + "..."
									: row?.description}
							</CustomText>
						</div>
					</div>
				);
			},
		},
		{
			dataField: "collection",
			text: t("collections"),
			formatter: (cellContent, row) => {
				return (
					<div className="d-flex align-items-center flex-row-reverse flex-lg-row">
						{row.hasOwnProperty("collection") ? (
							<>
								{row.collection.image_url !== null && (
									<LogoContainer>
										<Logo src={row.collection.image_url} alt={row.name} />
									</LogoContainer>
								)}
								<CustomText>{row.collection.name}</CustomText>
							</>
						) : (
							<CustomText>-</CustomText>
						)}
					</div>
				);
			},
		},
		{
			dataField: "created_at",
			text: t("createdAt"),
			formatter: (cellContent, row) => {
				return (
					<div className="d-flex align-items-center flex-row-reverse flex-lg-row">
						<CustomText>
							{moment(row.asset_contract.created_date).format("YYYY-MM-DD<br/>HH:mm:ss")}
						</CustomText>
					</div>
				);
			},
		},
		{
			dataField: "actions",
			text: t("table.actions"),
			formatter: (cellContent, row) => {
				return (
					<div
						className={
							"d-flex align-items-stretch justify-content-center flex-column flex-lg-row align-items-lg-center justify-content-lg-start w-100"
						}
					>
						<StyledLink href={row.external_link} target={"_blank"} rel={"noopener noreferrer"}>
							<TradeButton>{t("viewMore")}</TradeButton>
						</StyledLink>
					</div>
				);
			},
			isAction: true,
		},
	];

	const observeAction = () => {
		setPage((p) => {
			return p + 1;
		});
	};

	const handleObserver = (entities) => {
		const target = entities[0];
		if (target.isIntersecting) {
			observeAction();
		}
	};

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

	useEffect(() => {
		if (hasMore) {
			api.get("userAssets", {
				params: {
					limit: PAGE_SIZE,
					offset: (page - 1) * PAGE_SIZE,
				},
				address: account,
			}).then((response) => {
				setLoading(false);

				if (response.hasOwnProperty("data")) {
					setData((data) => data.concat(response.data?.assets));
					if (response?.data?.assets?.length < PAGE_SIZE) {
						setHasMore(false);
					}
				}
			});
		}
	}, [account, page]);

	const filteredData = useMemo(() => {
		if (query === "") {
			return data;
		} else {
			const lowerQuery = query.toLowerCase();
			return data.filter((token) => JSON.stringify(token.metadata).toLowerCase().includes(lowerQuery));
		}
	}, [data, query]);

	return (
		<div className="d-flex flex-column align-items-stretch">
			<WalletPageTable columns={columns} entities={filteredData} />
			<div className="d-flex align-items-center justify-content-center" ref={loader}>
				{hasMore ? (
					<div className="py-5">
						<Loading width={40} height={40} active id={`nft-wallet`} />
					</div>
				) : null}
			</div>
		</div>
	);
};

export default NftTab;
