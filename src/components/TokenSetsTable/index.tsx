import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import BootstrapTable from "react-bootstrap-table-next";

import { fetchTokens } from "../../state/explore/actions";
import CurrencyLogo from "../CurrencyLogo";
import CurrencyText from "../CurrencyText";
import Loading from "../Loading";
import ResponsiveTable from "../ResponsiveTable";
import * as Styled from "./styleds";

const TokenSetsExploreTable = () => {
	const dispatch = useDispatch();
	const [data, setData] = useState<Array<any>>([]);
	const [loading, setLoading] = useState<boolean>(true);
	// @ts-ignore
	const exploreSets = useSelector((state) => state.explore);

	useEffect(() => {
		if (exploreSets.tokenSets.data.length === 0) {
			dispatch(fetchTokens());
		}

		setData(exploreSets.tokenSets.data);
		setLoading(false);
	}, [exploreSets, dispatch]);

	const columns = [
		{
			dataField: "id",
			text: "ID",
			// @ts-ignore
			formatter: (cellContent, row, rowIndex) => (
				<Styled.CellText className="font-weight-bold">{rowIndex + 1}</Styled.CellText>
			),
		},

		{
			dataField: "name",
			text: "NAME",
			// @ts-ignore
			formatter: (cellContent, row, rowIndex) => (
				<div
					key={rowIndex}
					className="d-flex flex-row-reverse flex-lg-row align-items-start align-items-lg-center py-lg-2 pr-lg-4"
				>
					{row.image ? (
						<Styled.Logo src={row.image} alt={row.name} />
					) : (
						<Styled.LogoContainer>
							<CurrencyLogo currency={row.currency} />
						</Styled.LogoContainer>
					)}
					<div className="d-flex flex-column justify-content-center ml-lg-3 mr-3 mr-lg-0">
						<Styled.TokenSetCustomTitle className={"font-weight-bold"}>
							{row.name}
						</Styled.TokenSetCustomTitle>
					</div>
				</div>
			),
			style: {
				maxWidth: 250,
			},
			notCentered: true,
		},
		{
			dataField: "price_usd",
			text: "CURRENT PRICE",
			// @ts-ignore
			formatter: (cellContent, row) => (
				<Styled.CellText className={`label label-inline label-lg label-light-success`}>
					<CurrencyText>{row.price_usd}</CurrencyText>
				</Styled.CellText>
			),
		},
		{
			dataField: "components",
			text: "ASSETS",
			// @ts-ignore
			formatter: (cellContent, row) => (
				<div className="d-flex align-items-center">
					{/* @ts-ignore */}
					{row.components.map((c, index) => {
						return (
							<Styled.CellText key={`cell-${index}`} className={`mr-lg-4 ml-2 font-size-base`}>
								{c.symbol}
							</Styled.CellText>
						);
					})}
				</div>
			),
		},
		{
			dataField: "natural_units",
			text: "NATURAL UNITS",
			// @ts-ignore
			formatter: (cellContent, row) => (
				<Styled.CellText className="font-weight-bold">{row.natural_unit}</Styled.CellText>
			),
		},
		{
			dataField: "unit_shares",
			text: "UNIT SHARES",
			// @ts-ignore
			formatter: (cellContent, row) => (
				<Styled.CellText className="font-weight-bold">{row.unit_shares}</Styled.CellText>
			),
		},
		{
			dataField: "market_cap",
			text: "MARKET CAP",
			// @ts-ignore
			formatter: (cellContent, row) => (
				<Styled.CellText>
					<CurrencyText>{row.market_cap}</CurrencyText>
				</Styled.CellText>
			),
		},
	];

	if (loading) {
		return (
			<div className="d-flex align-items-center justify-content-center py-5">
				<Loading color={"primary"} width={40} height={40} active />
			</div>
		);
	}

	if (data.length === 0) {
		return <h2>No data to display</h2>;
	}

	return (
		<>
			<Styled.ExploreTable>
				<BootstrapTable
					wrapperClasses="table-responsive d-none d-lg-block"
					bordered={false}
					classes="table table-head-custom table-borderless table-vertical-center overflow-hidden table-hover"
					bootstrap4
					remote
					keyField="id"
					columns={columns}
					data={data.slice(0, 100)}
				></BootstrapTable>
			</Styled.ExploreTable>

			<ResponsiveTable
				centered
				size={"lg"}
				breakpoint={"lg"}
				columns={columns}
				data={data.slice(0, 100)}
				direction={"rtl"}
			/>
		</>
	);
};

export default TokenSetsExploreTable;
