import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import ResponsiveTable from "../../components/ResponsiveTable";
import * as Styled from "./styleds";

export function PoolsTable({ entities, columns, onTableChange }) {
	return (
		<>
			<Styled.PoolsTableWrap>
				<BootstrapTable
					wrapperClasses="d-none d-lg-block"
					bordered={false}
					classes="table table-head-custom table-borderless table-vertical-center overflow-hidden"
					bootstrap4
					keyField={"id"}
					remote
					data={entities === null ? [] : entities}
					columns={columns}
					onTableChange={onTableChange}
				/>
			</Styled.PoolsTableWrap>
			<ResponsiveTable breakpoint="lg" columns={columns} data={entities} direction="rtl" />
		</>
	);
}
