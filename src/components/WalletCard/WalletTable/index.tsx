import BootstrapTable from "react-bootstrap-table-next";
import ResponsiveTable from "../../../components/ResponsiveTable";
import * as Styled from "./styleds";

export type WalletTableProps = {
	entities: any;
	columns: any;
};

export function WalletTable({ entities, columns }: WalletTableProps) {
	return (
		<>
			<Styled.WalletTableWrap>
				<BootstrapTable
					wrapperClasses="table-responsive d-none d-lg-block"
					bordered={false}
					classes="table table-head-custom table-vertical-center overflow-hidden"
					bootstrap4
					remote
					keyField="id"
					data={entities === null ? [] : entities}
					columns={columns}
				></BootstrapTable>
			</Styled.WalletTableWrap>
			<ResponsiveTable breakpoint="lg" columns={columns} data={entities} direction="rtl" />
		</>
	);
}
