import React, { useEffect, useState, useCallback } from 'react';
import { Row, Col, Modal, Button } from 'react-bootstrap';
import {useDispatch, useSelector} from "react-redux";
import {CircularProgress} from "@material-ui/core";
import { useSnackbar } from "notistack";

import ListItem from '../../components/ListItem';
import Governance from "../../http/governance";
import {useIsDarkMode} from "../../state/user/hooks";
import CustomCard, { CustomHeader, CustomTitle } from "../../components/CustomCard";
import {fetchProposals, fetchSpaces} from "../../state/governance/actions";
import VoteItem, {ModifiedJazzicon} from '../../components/VoteItem';
import VoteLogo from "../../components/VoteLogo";
import moment from "moment";
import {useWeb3React} from "@web3-react/core";

const Vote = (props) => {
    const { account, library } = useWeb3React();
    const [selectedProposal, setSelectedProposal] = useState(false)
    const [selectedVote, setSelectedVote] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showMore, setShowMore] = useState(false);
    const [votes, setVotes] = useState({})
    const [status, setStatus] = useState({});
    const dispatch = useDispatch();
    const {spaces, loading: governanceLoading, proposals} = useSelector(state => state.governance);
    const api = new Governance();
    const darkMode = useIsDarkMode();
    const { enqueueSnackbar } = useSnackbar();

    let id = props.match.params.space;
    let address = props.match.params.id;

    useEffect(() => {
        if(Object.keys(spaces).length === 0) {
            dispatch(fetchSpaces());
        } else {
            if(spaces.hasOwnProperty(id)) {
                dispatch(fetchProposals(id));
                api.get('votes', { id, address})
                    .then(response => {
                        setVotes(response);
                    })
                    .catch(error => {
                        console.log(error);
                    })
            } else {
                props.history.push('/governance');
            }
        }
    }, [spaces, id, address, dispatch, props.history])

    useEffect(() => {
        if(proposals.hasOwnProperty(id)) {
            if(proposals[id].hasOwnProperty(address)) {
                setSelectedProposal(proposals[id][address]);
                const ts = (Date.now() / 1e3).toFixed();
                const { start, end } = proposals[id][address].msg.payload;
                let state = ts > end ? {title: 'Closed', className: 'label-light-danger'} : ts > start ? {title: 'Active', className: 'label-light-success'} : {title: 'Pending', className: 'label-light-info'};
                setStatus(state);
            } else {
                props.history.push(`/governance/${id}`)
            }
        } else {
            setSelectedProposal(false)
        }
    }, [proposals, id, address, props.history]);


    const handleSubmit = useCallback(async () => {
        const options = {
            token: spaces[id].token,
            type: 'vote',
            payload: {
                proposal: address,
                choice: selectedVote,
                metadata: {}
            }
        }
        const msg = {
            address: account,
            msg: JSON.stringify({
                version: selectedProposal.msg.version,
                timestamp: (Date.now() / 1e3).toFixed(),
                ...options
            })
        };
        try {

            const signer = library.getSigner(account);
            msg.sig = await signer.signMessage(msg.msg);
            enqueueSnackbar('Sending ...', { variant: 'info' })
            await api.sendMessage(msg);
            enqueueSnackbar('Your Vote is in!', { variant: 'success' })
            setShowModal(false);
        } catch(error) {
            enqueueSnackbar('Something went wrong!', { variant: 'error' })
        }

    }, [selectedProposal, selectedVote, account, address, api, enqueueSnackbar, id, library, spaces])

    return (
        <>
            <Row>
                <Col xs={12}>
                {governanceLoading && !selectedProposal ? (
                    <CustomCard>
                        <div className="card-body">
                            <div className="d-flex align-items-center justify-content-center py-6 w-100">
                                <CircularProgress color={'primary'} style={{ width: 40, height: 40 }}/>
                            </div>
                        </div>
                    </CustomCard>
                ) : selectedProposal && (
                    <Row>
                        <Col xs={12} md={8}>
                            <Row>
                                <Col xs={12} className={'gutter-b'}>
                                    <CustomCard>
                                        <CustomHeader className="card-header d-flex align-items-center justify-content-start">
                                            <CustomTitle className="card-title">{ selectedProposal.msg.payload.name}
                                            </CustomTitle>
                                            {status && (
                                                <span className={`label ${status.className} label-lg font-weight-bold d-flex label-inline py-3`}>
                                                    {status.title}
                                                </span>
                                            )}
                                        </CustomHeader>
                                        <div className="card-body">
                                            <p className={'font-size-lg opacity-80'} style={{ whiteSpace: 'pre-wrap'}}>{selectedProposal.msg.payload.body}</p>
                                        </div>
                                    </CustomCard>
                                </Col>
                                {status.title === 'Active' && (
                                    <Col xs={12} className={'gutter-b'}>
                                        <CustomCard>
                                            <CustomHeader className="card-header">
                                                <CustomTitle className="card-title">Cast Your vote
                                                </CustomTitle>
                                            </CustomHeader>
                                            <div className="card-body">
                                                {selectedProposal.msg.payload.choices.map((option, index) => {
                                                    const style = darkMode ? 'dark' : 'light';
                                                    return (
                                                        <button
                                                            key={index}
                                                            className={`btn ${index === selectedVote - 1 ? `btn-${style}` : `btn-outline-${style}`} mb-2 btn-block text-muted`}
                                                            onClick={setSelectedVote.bind(this, index + 1)}
                                                            >{option}</button>
                                                        )
                                                })}
                                                <button className="btn btn-primary btn-block py-5 mt-3" disabled={!selectedVote} onClick={() => setShowModal(true)}>Vote</button>
                                            </div>
                                        </CustomCard>
                                    </Col>
                                )}
                                <Col xs={12} className={'gutter-b'}>
                                    <CustomCard>
                                        <CustomHeader className="card-header d-flex align-items-center justify-content-start">
                                            <CustomTitle className="card-title">Votes
                                            </CustomTitle>

                                            {votes && (
                                                <span className={`label label-light-warning label-lg font-weight-bold d-flex label-inline py-3`}>
                                                    {Object.keys(votes).length}
                                                </span>
                                            )}
                                        </CustomHeader>
                                        {votes ? (
                                            <div className="card-body d-flex flex-column align-items-center">
                                                {(showMore || Object.keys(votes).length < 10) ? Object.values(votes).map((vote, index) => {
                                                    return (
                                                        <VoteItem
                                                            key={index}
                                                            address={vote.address}
                                                            vote={selectedProposal.msg.payload.choices[vote.msg.payload.choice - 1]}
                                                        />
                                                    )
                                                }) : Object.values(votes).slice(0, 10).map((vote, index) => {
                                                    return (
                                                    <VoteItem
                                                    key={index}
                                                    address={vote.address}
                                                    vote={selectedProposal.msg.payload.choices[vote.msg.payload.choice - 1]}
                                                    />
                                                    )
                                                }).concat((
                                                    <button className="btn btn-light-primary mt-5" onClick={() => setShowMore(true)}>show more</button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="card-body">
                                                <div className="d-flex align-items-center justify-content-center py-6 w-100">
                                                    <CircularProgress color={'primary'} style={{ width: 40, height: 40 }}/>
                                                </div>
                                            </div>
                                        )}

                                    </CustomCard>
                                </Col>
                            </Row>
                        </Col>
                        <Col xs={12} md={4}>
                            <CustomCard>
                                <CustomHeader className="card-header">
                                    <CustomTitle className="card-title">Information</CustomTitle>
                                </CustomHeader>
                                <div className="card-body d-flex flex-column justify-content-start">
                                    <ListItem title={'Token(s)'}>
                                        <div className="d-flex align-items-center justify-content-end">
                                            {spaces[id].strategies.map((s, index) => {
                                                return (
                                                        <div className="d-flex align-items-center">
                                                            <VoteLogo id={id} symbolIndex={index} size={20}/>
                                                            <span className="font-size-sm font-weight-bold ml-2">{s.params.symbol}</span>
                                                            {index !== spaces[id].strategies.length - 1 && (<span className="px-3 text-muted font-size-sm">+</span>)}
                                                        </div>
                                                )
                                            })}
                                        </div>
                                    </ListItem>

                                    <ListItem title={'Start Date'}>
                                        <div className="d-flex align-items-center">
                                            <ModifiedJazzicon address={selectedProposal && selectedProposal.address}/>
                                            <a href={`https://etherscan.io/address/${selectedProposal && selectedProposal.address}`} className="ml-3" target={"_blank"} rel={'noopener noreferrer'}>
                                                {selectedProposal && selectedProposal.address.slice(0, 6)}...{selectedProposal && selectedProposal.address.slice(-4)}</a>
                                        </div>
                                    </ListItem>

                                    <ListItem title={'IPFS'}>
                                        <a href={`https://ipfs.io/ipfs/${selectedProposal && selectedProposal.authorIpfsHash}`} className="ml-3" target={"_blank"} rel={'noopener noreferrer'}>
                                            #{selectedProposal && selectedProposal.authorIpfsHash.slice(0, 7)}
                                        </a>
                                    </ListItem>
                                    <ListItem title={'Start Date'}>
                                        {selectedProposal && moment(selectedProposal.msg.payload.start * 1e3).format('MMM D, YYYY hh:mm A')}
                                    </ListItem>
                                    <ListItem title={'End Date'}>
                                        {selectedProposal && moment(selectedProposal.msg.payload.end * 1e3).format('MMM D, YYYY hh:mm A')}
                                    </ListItem>
                                    <ListItem title={'Token'}>
                                        {selectedProposal && selectedProposal.address.slice(0, 6)}
                                    </ListItem>
                                    <ListItem title={'Snapshot'}>
                                        <a href={`https://etherscan.io/block/${selectedProposal && selectedProposal.msg.payload.snapshot}`}
                                           className="text-primary" target={"_blank"} rel={'noopener noreferrer'}>
                                            {selectedProposal && selectedProposal.msg.payload.snapshot}
                                        </a>
                                    </ListItem>
                                </div>
                            </CustomCard>
                        </Col>
                    </Row>
                )}
                </Col>
            </Row>
            {selectedProposal && (
                <Modal show={showModal} centered onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Vote</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <p>Are you sure you want to vote "{
                            selectedProposal.msg.payload.choices[selectedVote - 1]
                        }"? <br />This action <b>cannot</b> be undone.
                        </p>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                        <Button variant="primary" onClick={handleSubmit}>Vote</Button>
                    </Modal.Footer>
                </Modal>
            )}

        </>
    )
}

export default Vote;