import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { connect } from "react-redux";
import styled from "styled-components";

import PlatformLogo from "../../components/PlatformLogo";
import { sortedData } from "../../lib/helper";
import CurrencyText from "../../components/CurrencyText";
import { fetchPools } from "../../state/pools/actions";
import ExchangeIcon from "../../components/Icons/Exchange";
import { PoolsTable } from "./PoolsTable";
import { shorten } from "../../state/governance/hooks";
import { usePoolsBalances } from "../../state/pools/hooks";
import { useActiveWeb3React } from "../../hooks";
import Loading from "../../components/Loading";
import { useTranslation } from "react-i18next";

const CustomTitle = styled.h4`
	color: ${({ theme }) => theme.text1};
	font-size: 0.875rem;
	font-weight: 700;
	margin-bottom: 0.25rem;

	@media (max-width: 767px) {
		white-space: nowrap;
		text-overflow: ellipsis;
		max-width: 100px;
		overflow: hidden;
	}
`;

const Text = styled.span`
	color: ${({ theme }) => theme.text1};
	font-size: 0.875rem;
	font-weight: 700;
`;

const PlatformName = styled.span`
	font-size: 0.875rem;
	font-weight: 500;
	color: ${({ theme }) => theme.text1};
`;

const PoolsButton = styled.button`
	border-radius: 12px;
	background-color: ${({ theme }) => theme.bg1};
	padding: 6px 18px;
	max-height: 40px;
	min-height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	white-space: nowrap;
	font-size: 1rem;
	font-family: inherit;
	font-weight: 500;
	border: none;
	outline: none;

	&:hover,
	&:focus,
	&:active {
		outline: none;
		box-shadow: none;
	}
`;

const AddLiquidityButton = styled(PoolsButton)`
	color: ${({ theme }) => theme.primary};
	transition: 0.4s ease all;

	&:hover {
		color: ${({ theme }) => theme.bg1};
		background-color: ${({ theme }) => theme.primary};
	}
`;

const WithdrawButton = styled(PoolsButton)`
	color: ${({ theme }) => theme.secondary};
	transition: 0.4s ease all;

	&:hover {
		color: ${({ theme }) => theme.bg1};
		background-color: ${({ theme }) => theme.secondary};
	}
`;

const PoolTab = (props) => {
	const { t } = useTranslation();
	const { account } = useActiveWeb3React();
	const loader = useRef(null);
	const [page, setPage] = useState(1);
	const [virtualPage, setVirtualPage] = useState(1);
	const [sort, setSort] = useState({
		field: false,
		order: "desc",
	});
	const [pools, setPools] = useState([]);
	const [seeMore, setSeeMore] = useState(false);
	const [shownListLength, setShownListLength] = useState(0);
	const { query } = props;

	const filterHandler = useCallback(() => {
		if (query.length > 0) {
			return pools.filter((pool) => JSON.stringify(pool).toLowerCase().includes(query.toLowerCase()));
		} else {
			return pools;
		}
	}, [query, pools]);

	const filteredPools = useMemo(() => {
		const data = filterHandler().slice(0, virtualPage * 10);
		setShownListLength(data.length);
		return data;
	}, [props.query, virtualPage, pools]);

	const sortedPools = useMemo(() => {
		return sortedData(filteredPools, sort);
	}, [filteredPools, sort]);

	const balances = usePoolsBalances(
		account,
		filteredPools.map((p) => (p.hasOwnProperty("id") ? p.id : p.address)),
		props.type
	);

	const fetchPools = async () => {
		const res = await props.fetchPools(props.type || "Uniswap", {
			pageSize: 200,
			page: page,
		});
		if (res) {
			setPools((pools) => pools.concat(res));
		}
	};

	const showMorePools = () => {
		setVirtualPage((vp) => {
			let listLength = shownListLength;
			setShownListLength((ln) => {
				listLength = ln;
				return ln;
			});
			setSeeMore(false);
			if (((vp + 1) % 20 === 0 && !props.pools[props.type].isFinished) || listLength < vp * 10) {
				setPage((p) => p + 1);
			}
			return vp + 1;
		});
	};

	const observeAction = () => {
		setVirtualPage((vp) => {
			let listLength = shownListLength;
			setShownListLength((ln) => {
				listLength = ln;
				return ln;
			});
			if (vp > 0 && vp % 3 === 0) {
				setSeeMore(true);
				return vp;
			} else {
				if (((vp + 1) % 20 === 0 && !props.pools[props.type].isFinished) || listLength < vp * 10) {
					setPage((p) => p + 1);
				}
				return vp + 1;
			}
		});
	};

	const handleObserver = (entities) => {
		const target = entities[0];
		if (target.isIntersecting) {
			observeAction();
		}
	};

	const onTableChange = (type, context) => {
		if (type === "sort") {
			setSort({
				field: context.sortField,
				order: context.sortOrder,
			});
		}
	};

	let columns = {
		Uniswap: [
			{
				dataField: "id",
				text: "ID",
				formatter: (cellContent, row, rowIndex) => (
					<span className="font-weight-bold d-block">{rowIndex + 1}</span>
				),
			},
			{
				dataField: "poolName",
				text: t("pools.availablePools"),
				formatter: (cellContent, row, rowIndex) => {
					return (
						<div
							key={rowIndex}
							className="d-flex flex-row-reverse flex-lg-row align-items-center flex-row py-0 py-lg-3"
						>
							<PlatformLogo size={32} platform={"uniswap"} name={"Uniswap-v2"} />
							<div className="d-flex flex-column justify-content-center ml-lg-3 mr-3 mr-lg-0">
								<CustomTitle>
									{row.token0?.symbol}-{row.token1?.symbol}
								</CustomTitle>
								<PlatformName>Uniswap-v2</PlatformName>
							</div>
						</div>
					);
				},
			},
			{
				dataField: "totalSupply",
				text: t("pools.totalSupply"),
				formatter: (cellContent, row) => (
					<Text>
						<CurrencyText>{row.totalSupply}</CurrencyText>
					</Text>
				),
				sort: true,
			},
			{
				dataField: "volumeUSD",
				text: t("pools.volume"),
				formatter: (cellContent, row) => (
					<Text>
						<CurrencyText>{row.volumeUSD}</CurrencyText>
					</Text>
				),
				sort: true,
			},
			{
				dataField: "txCount",
				text: t("pools.txnCount"),
				formatter: (cellContent, row) => <Text>{row.txCount}</Text>,
				sort: true,
			},
			{
				dataField: "actions",
				text: "",
				formatter: (cellContent, row, rowIndex, { addLiquidityDialog, balances, removeLiquidityDialog }) => {
					const pool = {
						poolName: `${row.token0?.symbol}-${row.token1?.symbol}`,
						token0: row.token0,
						token1: row.token1,
						address: row.id,
					};
					return (
						<div className="d-flex flex-column-reverse flex-lg-row align-items-stretch align-items-lg-center justify-content-end flex-grow-1 flex-lg-grow-0">
							{Number(balances[0][row.id]) > 0 ? (
								<WithdrawButton
									className="mt-2 mt-lg-0 mr-0 mr-lg-2"
									onClick={() => removeLiquidityDialog("Uniswap", pool)}
								>
									{t("pools.withdraw")}
								</WithdrawButton>
							) : null}
							<AddLiquidityButton onClick={() => addLiquidityDialog("Uniswap", pool)}>
								{t("pools.addLiquidity")}
							</AddLiquidityButton>
						</div>
					);
				},
				formatExtraData: {
					addLiquidityDialog: props.addLiquidityHandler,
					removeLiquidityDialog: props.removeLiquidityHandler,
					balances: balances,
				},
			},
		],
		Balancer: [
			{
				dataField: "id",
				text: "ID",
				formatter: (cellContent, row, rowIndex) => (
					<span className="font-weight-bold d-block">{rowIndex + 1}</span>
				),
			},
			{
				dataField: "poolName",
				text: t("pools.availablePools"),
				formatter: (cellContent, row, rowIndex) => {
					return (
						<div
							key={rowIndex}
							className="d-flex flex-row-reverse flex-lg-row align-items-center flex-row py-0 py-lg-3"
						>
							<PlatformLogo size={32} platform={"balancer"} name={"balancer"} />
							<div className="d-flex flex-column justify-content-center ml-lg-3 mr-3 mr-lg-0">
								<CustomTitle>{row.tokens.map((t) => t.symbol).join("-")}</CustomTitle>
								<PlatformName>Balancer</PlatformName>
							</div>
						</div>
					);
				},
			},
			{
				dataField: "liquidity",
				text: t("pools.liquidity"),
				formatter: (cellContent, row) => (
					<Text>
						<CurrencyText>{row.liquidity}</CurrencyText>
					</Text>
				),
				sort: true,
			},
			{
				dataField: "totalSwapVolume",
				text: t("pools.totalSwapVolume"),
				formatter: (cellContent, row) => (
					<Text>
						<CurrencyText>{row.totalSwapVolume}</CurrencyText>
					</Text>
				),
				sort: true,
			},
			{
				dataField: "swapFee",
				text: t("pools.swapFee"),
				formatter: (cellContent, row) => <Text>{row.swapFee}</Text>,
				sort: true,
			},
			{
				dataField: "actions",
				text: "",
				formatter: (cellContent, row, rowIndex, { addLiquidityDialog, balances, removeLiquidityDialog }) => {
					const pool = {
						poolName: row.tokens.map((t) => t.symbol).join("-"),
						address: row.id,
					};
					return (
						<div className="d-flex flex-column-reverse flex-lg-row align-items-stretch align-items-lg-center justify-content-end flex-grow-1 flex-lg-grow-0">
							{Number(balances[0][row.id]) > 0 ? (
								<WithdrawButton
									className="mt-2 mt-lg-0 mr-0 mr-lg-2"
									onClick={() => removeLiquidityDialog("Balancer", pool)}
								>
									{t("pools.withdraw")}
								</WithdrawButton>
							) : null}
							<AddLiquidityButton onClick={() => addLiquidityDialog("Balancer", pool)}>
								{t("pools.addLiquidity")}
							</AddLiquidityButton>
						</div>
					);
				},
				formatExtraData: {
					addLiquidityDialog: props.addLiquidityHandler,
					removeLiquidityDialog: props.removeLiquidityHandler,
					balances: balances,
				},
			},
		],
		Curve: [
			{
				dataField: "id",
				text: "ID",
				formatter: (cellContent, row, rowIndex) => (
					<span className="font-weight-bold d-block">{rowIndex + 1}</span>
				),
			},
			{
				dataField: "poolName",
				text: t("pools.availablePools"),
				formatter: (cellContent, row, rowIndex) => {
					return (
						<div
							key={rowIndex}
							className="d-flex flex-row-reverse flex-lg-row align-items-center flex-row py-0 py-lg-3"
						>
							<PlatformLogo size={32} platform={"curve"} name={"Curve"} />
							<div className="d-flex flex-column justify-content-center ml-lg-3 mr-3 mr-lg-0">
								<CustomTitle>
									{row.poolToken
										? row.poolToken.name
										: row.coins?.length > 0
										? row.coins?.map((c) => c.symbol).join("-")
										: shorten(row.address, "name")}
								</CustomTitle>
								<PlatformName>Curve</PlatformName>
							</div>
						</div>
					);
				},
			},
			{
				dataField: "virtualPrice",
				text: t("pools.virtualPrice"),
				formatter: (cellContent, row) => (
					<Text>
						<CurrencyText>{row.virtualPrice}</CurrencyText>
					</Text>
				),
				sort: true,
			},
			{
				dataField: "fee",
				text: t("pools.fee"),
				formatter: (cellContent, row) => <Text>{row.fee}</Text>,
				sort: true,
			},
			{
				dataField: "actions",
				text: "",
				formatter: (cellContent, row, rowIndex, { addLiquidityDialog, balances, removeLiquidityDialog }) => {
					const pool = {
						poolName: row.poolToken
							? row.poolToken.name
							: row.coins?.length > 0
							? row.coins?.map((c) => c.symbol).join("-")
							: shorten(row.address, "name"),
						address: row.address,
					};
					return (
						<div className="d-flex flex-column-reverse flex-lg-row align-items-stretch align-items-lg-center justify-content-end flex-grow-1 flex-lg-grow-0">
							{Number(balances[0][row.id]) > 0 ? (
								<WithdrawButton
									className="mt-2 mt-lg-0 mr-0 mr-lg-2"
									onClick={() => removeLiquidityDialog("Curve", pool)}
								>
									{t("pools.withdraw")}
								</WithdrawButton>
							) : null}
							<AddLiquidityButton onClick={() => addLiquidityDialog("Curve", pool)}>
								{t("pools.addLiquidity")}
							</AddLiquidityButton>
						</div>
					);
				},
				formatExtraData: {
					addLiquidityDialog: props.addLiquidityHandler,
					removeLiquidityDialog: props.removeLiquidityHandler,
					balances: balances,
				},
			},
		],
		Yearn: [
			{
				dataField: "id",
				text: "ID",
				formatter: (cellContent, row, rowIndex) => (
					<span className="font-weight-bold d-block">{rowIndex + 1}</span>
				),
			},
			{
				dataField: "poolName",
				text: t("pools.availablePools"),
				formatter: (cellContent, row, rowIndex) => {
					return (
						<div
							key={rowIndex}
							className="d-flex flex-row-reverse flex-lg-row align-items-center flex-row py-0 py-lg-3"
						>
							<PlatformLogo size={32} platform={"yearn"} name={"yearn"} />
							<div className="d-flex flex-column justify-content-center ml-lg-3 mr-3 mr-lg-0">
								<CustomTitle>
									{row.shareToken ? row.shareToken.name : row.underlyingToken.name}
								</CustomTitle>
								<PlatformName>yEarn</PlatformName>
							</div>
						</div>
					);
				},
			},
			{
				dataField: "totalSupply",
				text: t("pools.totalSupply"),
				formatter: (cellContent, row) => (
					<Text>
						<CurrencyText>{row.totalSupply}</CurrencyText>
					</Text>
				),
				sort: true,
			},
			{
				dataField: "available",
				text: t("pools.totalSupply"),
				formatter: (cellContent, row) => <Text>{Number(row.available).toFixed(6)}</Text>,
				sort: true,
			},
			{
				dataField: "vaultBalance",
				text: t("pools.vaultBalance"),
				formatter: (cellContent, row) => <Text>{Number(row.vaultBalance).toFixed(6)}</Text>,
				sort: true,
			},
			{
				dataField: "actions",
				text: "",
				formatter: (cellContent, row, rowIndex, { addLiquidityDialog, balances, removeLiquidityDialog }) => {
					const pool = {
						poolName: row.shareToken ? row.shareToken.name : row.underlyingToken.name,
						address: row.id,
					};
					return (
						<div className="d-flex flex-column-reverse flex-lg-row align-items-stretch align-items-lg-center justify-content-end flex-grow-1 flex-lg-grow-0">
							{Number(balances[0][row.id]) > 0 ? (
								<WithdrawButton
									className="mt-2 mt-lg-0 mr-0 mr-lg-2"
									onClick={() => removeLiquidityDialog("Yearn", pool)}
								>
									{t("pools.withdraw")}
								</WithdrawButton>
							) : null}
							<AddLiquidityButton onClick={() => addLiquidityDialog("Yearn", pool)}>
								{t("pools.addLiquidity")}
							</AddLiquidityButton>
						</div>
					);
				},
				formatExtraData: {
					addLiquidityDialog: props.addLiquidityHandler,
					removeLiquidityDialog: props.removeLiquidityHandler,
					balances: balances,
				},
			},
		],
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
		fetchPools();
	}, [page]);

	useEffect(() => {
		setVirtualPage(1);
	}, [query]);

	useEffect(() => {
		if (shownListLength < virtualPage * 10 && !props.pools[props.type].isFinished) {
			setPage((page) => page + 1);
		}
	}, [shownListLength, pools]);

	return (
		<>
			{(!props.pools[props.type].loading || pools.length > 1) && (
				<PoolsTable entities={sortedPools} columns={columns[props.type]} onTableChange={onTableChange} />
			)}
			{props.pools[props.type].isFinished && filteredPools.length === 0 && (
				<div className="d-flex flex-column align-items-center justify-content-center py-8 px-4">
					<ExchangeIcon size={48} fill={"#6993FF"} />
					<h5 className="text-primary font-weight-bolder mb-3 mt-5">
						There is no <strong>Pool</strong> in <strong>{props.type}</strong> platform
					</h5>
					<span className="text-muted font-weight-light font-size-lg">{t("pools.chooseAnotherPool")}</span>
				</div>
			)}
			<div className="d-flex align-items-center justify-content-center" ref={loader}>
				{!props.pools[props.type].isFinished || (filteredPools.length === 0 && page > 1) ? (
					seeMore ? (
						<div className="py-4">
							<button className="btn btn-light-primary py-3" onClick={showMorePools}>
								{t("seeMore")}
							</button>
						</div>
					) : (
						<div className="py-5">
							<Loading width={40} height={40} active id={`pool-${props.type}`} />
						</div>
					)
				) : null}
			</div>
		</>
	);
};

const mapStateToProps = (state) => {
	return {
		pools: state.pools,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		fetchPools: (type, options) => dispatch(fetchPools(type, options)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(PoolTab);
