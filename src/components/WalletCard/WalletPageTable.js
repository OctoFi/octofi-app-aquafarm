import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import "./style.scss";
import ResponsiveTable from "../../components/ResponsiveTable";

export function WalletPageTable({ entities, columns }) {
	return (
		<>
			<BootstrapTable
				wrapperClasses="table-responsive d-none d-lg-block"
				bordered={false}
				classes="table table-head-custom table-vertical-center overflow-hidden wallet-page__table"
				bootstrap4
				remote
				keyField="id"
				data={entities === null ? [] : entities}
				columns={columns}
			></BootstrapTable>
			<ResponsiveTable breakpoint={"lg"} columns={columns} data={entities} direction={"rtl"} />
		</>
	);
}
