import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import {
    NoRecordsFoundMessage,
    PleaseWaitMessage,
} from "../../components/_metronic/_helpers";

export function PoolsTable({entities, columns}) {
    return (
        <BootstrapTable
            wrapperClasses="table-responsive"
            bordered={false}
            classes="table table-head-custom table-vertical-center overflow-hidden table-dark-border"
            bootstrap4
            remote
            keyField="id"
            data={entities === null ? [] : entities}
            columns={columns}
        >
            <PleaseWaitMessage entities={entities} />
            <NoRecordsFoundMessage entities={entities} />
        </BootstrapTable>
    );
}
