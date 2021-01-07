import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import {useDispatch, useSelector} from "react-redux";
import {CircularProgress} from "@material-ui/core";
import BootstrapTable from "react-bootstrap-table-next";

import {NoRecordsFoundMessage, PleaseWaitMessage} from "../../components/_metronic/_helpers";
import {useIsDarkMode} from "../../state/user/hooks";
import CustomCard, { CustomHeader, CustomTitle } from "../../components/CustomCard";
import {fetchProposals, fetchSpaces} from "../../state/governance/actions";
import {shorten} from "../../state/governance/hooks";
import moment from "moment";
import {Link} from "react-router-dom";
import {_numeral, formatProposals, getScores} from "../../lib/utils";
import {useActiveWeb3React} from "../../hooks";

const Proposals = (props) => {
    const { library } = useActiveWeb3React();
    const [selectedProposal, setSelectedProposal] = useState({})
    const dispatch = useDispatch();
    const {spaces, loading: governanceLoading, proposals} = useSelector(state => state.governance);

    const darkMode = useIsDarkMode();

    let id = props.match.params.space;
    let space = spaces[id];

    useEffect(() => {
        if(Object.keys(spaces).length === 0) {
            dispatch(fetchSpaces());
        } else {
            if(spaces.hasOwnProperty(id)) {
                dispatch(fetchProposals(id));
            } else {
                props.history.push('/governance');
            }
        }
    }, [spaces, id, props.history, dispatch])

    const transformProposals = async (proposals, id) => {
        if(proposals.hasOwnProperty(id)) {
            let result = {};
            const selected = proposals[id];
            const scores = await getScores(
                id,
                space.strategies,
                space.network,
                library,
                Object.values(selected).map((proposal) => proposal.address)
            )
            result = Object.fromEntries(
                Object.entries(selected).map((proposal) => {
                    const transformed = [proposal[0], Object.assign({}, proposal[1])]
                    transformed[1].score = scores.reduce(
                        (a, b) => a + (b[transformed[1].address] || 0),
                        0
                    );
                    return [transformed[0], transformed[1]];
                })
            );

            result = formatProposals(result);
            const transformedProposal = Object.fromEntries(
                Object.entries(result)
                    .sort((a, b) => b[1].msg.payload.end - a[1].msg.payload.end, 0)
            );
            setSelectedProposal(transformedProposal);
        } else {
            setSelectedProposal({})
        }
    }

    useEffect(() => {
        transformProposals(proposals, id)
    }, [proposals, id]);

    const rowEvents = {
        onClick: (e, row) => {
            props.history.push(`/governance/${id}/proposal/${row[0]}`);
        }
    }

    const columns = [
        {
            dataField: "asset",
            text: "Description",
            formatter: (cellContent, row, rowIndex) => (
                <div key={rowIndex} className="d-flex align-items-center flex-row py-3">
                    <div className="d-flex flex-column justify-content-center ml-5">
                        <CustomTitle className={'font-weight-bolder mb-1'}>{shorten(row[1].msg.payload.name, 'name')}</CustomTitle>
                        <div className={'d-flex align-items-center'}>
                            <span className="text-muted font-size-sm pr-5">#{row[1].authorIpfsHash.slice(0, 7)}</span>
                            <span className="text-muted font-size-sm">{_numeral(row[1].score)} {space?.symbol}</span>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            dataField: "status",
            text: "status",
            formatter(cellContent, row) {
                const ts = (Date.now() / 1e3).toFixed();
                const { start, end } = row[1].msg.payload;
                let state = ts > end ? {title: 'Closed', className: 'label-light-danger'} : ts > start ? {title: 'Active', className: 'label-light-success'} : {title: 'Pending', className: 'label-light-info'};
                return (
                    <span className={`label ${state.className} label-lg font-weight-bold d-flex w-100 label-inline py-3`}>
                        {state.title}
                    </span>
                )
            }
        },
        {
            dataField: "start",
            text: "Start date",
            formatter(cellContent, row) {
                return (
                    <span className={`text-muted font-weight-bold`}>
                        {moment(row[1].msg.payload.start * 1e3).format('YYYY/MM/DD HH:mm')}
                    </span>
                )
            }
        },
        {
            dataField: "end",
            text: "End date",
            formatter(cellContent, row) {
                return (
                    <span className={`text-muted font-weight-bold`}>
                        {moment(row[1].msg.payload.end * 1e3).format('YYYY/MM/DD HH:mm')}
                    </span>
                )
            }
        },
        {
            dataField: "author",
            text: "Author",
            formatter(cellContent, row) {
                return (
                    <span className={`text-primary font-weight-bold`}>
                        {row[1].address.slice(0, 6)}...{row[1].address.slice(-4)}
                    </span>
                )
            }
        },

    ]


    const breadCrumbs = [{
        pathname: '/governance',
        title: 'Governance'
    }, {
        pathname: props.match.url,
        title: 'Proposals'
    }];


    return (
        <>
            <Row data-breadcrumbs={JSON.stringify(breadCrumbs)} data-title={'Proposals'}>
                <Col xs={12}>
                    <CustomCard>
                        <CustomHeader className="card-header d-flex align-items-center justify-content-between">
                            <CustomTitle className="card-title">Proposals</CustomTitle>
                            <Link to={`${props.match.url}/create`} className="btn btn-outline-primary">Create New</Link>
                        </CustomHeader>
                        <div className="card-body">
                            {governanceLoading ? (
                                <div className="d-flex align-items-center justify-content-center py-6 w-100">
                                    <CircularProgress color={'primary'} style={{ width: 40, height: 40 }}/>
                                </div>
                            ) : (
                                <Row>
                                    <BootstrapTable
                                        wrapperClasses="table-responsive"
                                        bordered={false}
                                        classes={`table table-head-custom table-vertical-center overflow-hidden table-dark-border table-hover ${darkMode && 'table-hover--dark'}`}
                                        bootstrap4
                                        remote
                                        keyField="id"
                                        columns={columns}
                                        data={Object.entries(selectedProposal)}
                                        rowEvents={rowEvents}
                                    >
                                        <PleaseWaitMessage entities={Object.entries(selectedProposal)} />
                                        <NoRecordsFoundMessage entities={Object.entries(selectedProposal)} />
                                    </BootstrapTable>
                                </Row>
                            )}
                        </div>
                    </CustomCard>
                </Col>
            </Row>
        </>
    )
}

export default Proposals;