import React from "react";
import BootstrapTable from "react-bootstrap-table-next";

import "./style.scss";
import ResponsiveTable from "../../components/ResponsiveTable";

export function Table({ entities, columns }) {
	return (
		<>
			<BootstrapTable
				wrapperClasses="d-none d-lg-block"
				bordered={false}
				classes="table table-head-custom table-borderless table-vertical-center overflow-hidden cross-balance__table"
				bootstrap4
				keyField={"id"}
				remote
				data={entities === null ? [] : entities}
				columns={columns}
			/>
			<ResponsiveTable breakpoint={"lg"} columns={columns} data={entities} direction={"rtl"} />
		</>
	);
}
