import React, { useEffect, useState, useCallback } from 'react';
import { Row, Col, Modal, Button } from 'react-bootstrap';
import {useDispatch, useSelector} from "react-redux";
import {CircularProgress} from "@material-ui/core";
import { useSnackbar } from "notistack";
import {_numeral, formatProposal, formatProposals, getScores} from '../../lib/utils';

import ListItem from '../../components/ListItem';
import Governance from "../../http/governance";
import {useIsDarkMode} from "../../state/user/hooks";
import CustomCard, { CustomHeader, CustomTitle } from "../../components/CustomCard";
import {fetchProposals, fetchSpaces} from "../../state/governance/actions";
import VoteItem, {ModifiedJazzicon} from '../../components/VoteItem';
import VoteLogo from "../../components/VoteLogo";
import moment from "moment";
import {useWeb3React} from "@web3-react/core";
import {shorten} from "../../state/governance/hooks";
import {Remarkable} from "remarkable";

const md = new Remarkable();

const Vote = (props) => {
    const { account, library } = useWeb3React();
    const [selectedProposal, setSelectedProposal] = useState(false)
    const [selectedVote, setSelectedVote] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showMore, setShowMore] = useState(false);
    const [votes, setVotes] = useState({})
    const [result, setResult] = useState({})
    const [status, setStatus] = useState({});
    const dispatch = useDispatch();
    const {spaces, loading: governanceLoading, proposals} = useSelector(state => state.governance);
    const api = new Governance();
    const darkMode = useIsDarkMode();
    const { enqueueSnackbar } = useSnackbar();

    let id = props.match.params.space;
    let address = props.match.params.id;
    let space = spaces[id]

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

    const transformVotes = async (votes, proposals) => {
        let result = {};
        if(Object.keys(votes).length > 0) {
            const selectedProposals = proposals.hasOwnProperty(id) && proposals[id].hasOwnProperty(address) ? formatProposal(Object.assign({}, proposals[id][address])) : formatProposal({});
            const scores = await getScores(
                id,
                space.strategies,
                space.network,
                library,
                Object.keys(votes)
            )
            result.votes = Object.fromEntries(
                Object.entries(votes)
                    .map((vote) => {
                        let transformed = [vote[0], Object.assign({}, vote[1])]
                        transformed[1].scores = space.strategies.map(
                            (strategy, i) => scores[i][transformed[1].address] || 0
                        );
                        transformed[1].balance = transformed[1].scores.reduce((a, b) => a + b, 0);
                        return transformed;
                    })
                    .sort((a, b) => b[1].balance - a[1].balance)
            );
            result.results = {
                totalVotes: selectedProposals.msg?.payload?.choices?.map(
                    (choice, i) =>
                        Object.values(result.votes).filter(
                            (vote) => vote.msg.payload.choice === i + 1
                        ).length
                ),
                totalBalances: selectedProposals.msg?.payload?.choices?.map((choice, i) =>
                    Object.values(result.votes)
                        .filter((vote) => vote.msg.payload.choice === i + 1)
                        .reduce((a, b) => a + b.balance, 0)
                ),
                totalScores: selectedProposals.msg?.payload?.choices?.map((choice, i) =>
                    space.strategies.map((strategy, sI) =>
                        Object.values(result.votes)
                            .filter((vote) => vote.msg.payload.choice === i + 1)
                            .reduce((a, b) => a + b.scores[sI], 0)
                    )
                ),
                totalVotesBalances: Object.values(result.votes).reduce(
                    (a, b) => a + b.balance,
                    0
                )
            };
            setResult(result);
        }
    }

    useEffect(() => {
        transformVotes(votes, proposals);
    }, [proposals, votes])

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


    const breadCrumbs = [{
        pathname: '/governance',
        title: 'Governance'
    }, {
        pathname: `/governance/${id}`,
        title: 'Proposals'
    }, {
        pathname: props.match.url,
        title: 'Proposal'
    }];


    return (
        <>
            <Row data-breadcrumbs={JSON.stringify(breadCrumbs)} data-title={'Proposal'}>
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
                                            <p className={'font-size-lg opacity-80'} style={{ whiteSpace: 'pre-wrap'}}
                                               dangerouslySetInnerHTML={{ __html: md.render(selectedProposal.msg.payload.body) }} />
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
                                                {(showMore || result.hasOwnProperty('votes') && Object.keys(result.votes).length < 10) ? Object.values(result.votes).map((vote, index) => {
                                                    return (
                                                        <VoteItem
                                                            key={index}
                                                            address={vote?.address}
                                                            vote={selectedProposal?.msg?.payload?.choices[vote.msg.payload.choice - 1]}
                                                            score={vote?.balance}
                                                            symbol={space?.symbol}
                                                        />
                                                    )
                                                }) : result.hasOwnProperty('votes') && Object.values(result.votes).slice(0, 10).map((vote, index) => {
                                                    return (
                                                        <VoteItem
                                                        key={index}
                                                        address={vote?.address}
                                                        vote={selectedProposal?.msg?.payload?.choices[vote.msg.payload.choice - 1]}
                                                        score={vote?.balance}
                                                        symbol={space?.symbol}
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
                            <CustomCard className={'gutter-b'}>
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

                                    <ListItem title={'Author'}>
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
                            { result.results?.hasOwnProperty('totalBalances') && (
                                <CustomCard>
                                    <CustomHeader className="card-header">
                                        <CustomTitle className="card-title">Results</CustomTitle>
                                    </CustomHeader>
                                    <div className="card-body d-flex flex-column">
                                        {selectedProposal.msg.payload.choices.map((choice, i) => {
                                            return (
                                                <div className="d-flex flex-column w-100 mb-3">
                                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                            <span
                                                className="text-muted mr-2 font-size-sm font-weight-bold">{shorten(choice, 'choice')}</span>
                                                        <span
                                                            className="text-muted font-size-sm font-weight-bold">{ _numeral(result.results.totalBalances?.[i]) }
                                                            { shorten(space.symbol, 'symbol') }</span>
                                                        <span
                                                            className="text-muted font-size-sm font-weight-bold">{!result.results.totalVotesBalances
                                                            ? 0
                                                            : `${(((100 / result.results.totalVotesBalances) *
                                                                result.results.totalBalances?.[i])).toFixed(2)}%`}</span>
                                                    </div>
                                                    <div className={`progress progress-xs w-100 ${darkMode ? 'bg-dark' : ''}`}>
                                                        <div className="progress-bar bg-primary"
                                                             role="progressbar"
                                                             aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"
                                                             style={{
                                                                 width: `${!result.results.totalVotesBalances ? '0' : Number.parseInt(((100 / result.results.totalVotesBalances) *
                                                                     result.results.totalBalances?.[i]))}%`
                                                             }} />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CustomCard>
                            )}
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