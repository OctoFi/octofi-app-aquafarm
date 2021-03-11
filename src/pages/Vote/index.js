import React, { useEffect, useState, useCallback } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import {useDispatch, useSelector} from "react-redux";
import {_numeral, formatProposal, getScores} from '../../lib/utils';
import styled from 'styled-components';

import { Modal } from '../../components/Modal/bootstrap';
import ListItem from '../../components/ListItem';
import Governance from "../../http/governance";
import Card from "../../components/Card";
import {fetchProposals, fetchSpaces} from "../../state/governance/actions";
import VoteItem, {ModifiedJazzicon} from '../../components/VoteItem';
import VoteLogo from "../../components/VoteLogo";
import moment from "moment";
import Loading from '../../components/Loading';
import {useWeb3React} from "@web3-react/core";
import {shorten} from "../../state/governance/hooks";
import {Remarkable} from "remarkable";
import Page from "../../components/Page";
import GradientButton from '../../components/UI/Button';
import {toast} from "react-hot-toast";
import {useWalletModalToggle} from "../../state/application/hooks";
import {useTranslation} from "react-i18next";

const md = new Remarkable();

const StyledLinkButton = styled.button`
  font-weight: 500;
  font-size: 1rem;
  
  @media (min-width: 768px) {
  font-weight: 400;
  }
`

const VoteCard = styled(Card)`
  @media (max-width: 767px) {
    .card-body {
      padding-top: 0; 
    }
  }
`

const CardHeader = styled.div`
  display: flex;
  flex-direction: column;
  margin: -5px;
  
  @media (min-width: 768px) {
    margin: -10px 0 -18px;
    height: ${({ withoutSubtitle }) => withoutSubtitle ? '70px' : 'auto'};
  }
`

const BoxTitle = styled.h4`
  font-weight: 700;
  font-size: 0.875rem;
  line-height: 1.5rem;
  color: ${({ theme }) => theme.text1};
  margin: 0 auto 0 0;
  padding-right: .75rem;
  
  
  @media (min-width: 768px) {
  padding-right: 0;
  font-size: 1.25rem;
  margin: 0 1.25rem 0 0;
  }
`

const BoxSubTitle = styled.span`
  margin-bottom: .5rem;
  font-size: 0.875rem;
  font-weight: 400;
  color: ${({ theme }) => theme.text1};
  display: none;
  
  @media (min-width: 768px) {
    display: block;
  }
`

const BoxHeader = styled.div`
  min-height: 40px;
  display: flex;
  align-items: center;
  
  & .label {
    @media (max-width: 767px) {
      height: 30px;
      padding: 5px 17px;
      border-radius: 12px;
      font-size: .875rem;
    }
  }
 
`

const VoteContent = styled.div`
  line-height: 19px;
  font-size: 1rem !important;
  color: ${({ theme }) => theme.text1};
  font-weight: 400;
  
  & p {
    margin: 0;
    font-weight: 400;
    font-size: 0.875rem;

      @media (min-width: 768px) {
        font-size: 1rem;
      }
  }
  
  & h1,
  & h2,
  & h3,
  & h4,
  & h5,
  & h6 {
    font-size: 1.25rem;
    margin-bottom: 0;
    font-weight: 500;
    
    
      @media (min-width: 768px) {
        font-size: 1.875rem;
      }
  }
`

const TokenValue = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  padding-left: 11px;
  color: ${({ theme }) => theme.text1};
  
  
  @media (min-width: 768px) {
    font-size: 1rem;
    font-weight: 700;
  }
`

const AuthorLink = styled.a`
  color: ${({ theme }) => theme.primary1};
  font-weight: 700;
  font-size: 0.875rem;
  
  
  @media (min-width: 768px) {
    font-size: 1rem;
  }
  
  &:focus,
  &:active {
    outline: none;
  }
`
const InfoText = styled.span`
  font-size: 0.875rem;
  font-weight: ${({ fontWeight}) => fontWeight || 700};
  color: ${({ theme }) => theme.text1};
  
  
  @media (min-width: 768px) {
    font-size: 1rem;
    font-weight: 700;
  }
`

const ResultRow = styled.div`
  display: flex;
  flex-direction: column;
  
  &:not(:last-child) {
    margin-bottom: 40px;
  }
`

const ResultTitle = styled.span`
  font-size: .875rem;
  font-weight: 400;
  margin: 0;
  color: ${({ theme }) => theme.text1};
  
  
  @media (min-width: 768px) {
    font-weight: 500;
  }
`

const ResultProgress = styled.div`
  background-color: rgba(135, 220, 225, 0.3);
  height: 5px;
  border: none;
  width: 100%;
  border-radius: 20px;
`

const ResultProgressBar = styled.div`
  background-color: ${({ theme }) => theme.primary};
  border-radius: 20px;
`

const Table = styled.table`
  border-spacing: 0 10px;
  border-collapse: separate;
`

const Thead = styled.thead`
  height: 1px;
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
  display: none;
`

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
    const toggleWalletModal = useWalletModalToggle();
    const {spaces, loading: governanceLoading, proposals} = useSelector(state => state.governance);
    const { t } = useTranslation();
    const api = new Governance();

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
                        toast.error('Cannot get votes, Please try again in a minute')
                    })
            } else {
                props.history.push('/governance');
            }
        }
    }, [spaces, id, address, dispatch, props.history])

    const getVotes = () => {
        api.get('votes', { id, address})
            .then(response => {
                setVotes(response);
            })
            .catch(error => {
                toast.error('Cannot get votes, Please try again in a minute')
            })
    }

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
        if(!account) {
            toggleWalletModal();
            return false;
        }
        const options = {
            token: spaces[id].token,
            type: 'vote',
            space: id,
            payload: {
                proposal: address,
                choice: selectedVote,
                metadata: {}
            }
        }
        const msg = {
            address: account,
            msg: JSON.stringify({
                version: '0.1.3',
                timestamp: (Date.now() / 1e3).toFixed(),
                ...options
            })
        };
        try {
            toast('Sending ...', {
                icon: '💡'
            })
            const signer = library.getSigner(account);
            msg.sig = await signer.signMessage(msg.msg);
            const res = await api.sendMessage(msg);
            toast.success('Your Vote is in!')
            if(res.hasOwnProperty('ipfsHash')) {
                getVotes();
            }
            setShowModal(false);
        } catch(error) {
            toast.error('Something went wrong!');
        }

    }, [selectedProposal, selectedVote, account, address, api, id, library, spaces])


    return (
        <Page title={t('governance.title')} morePadding>
            <Row>
                <Col xs={12} style={{ marginTop: -30 }}>
                {governanceLoading && !selectedProposal ? (
                    <Card>
                        <div className="d-flex align-items-center justify-content-center py-5 w-100">
                            <Loading color={'primary'} width={40} height={40} active id={'vote-loading'}/>
                        </div>
                    </Card>
                ) : selectedProposal && (
                    <Row className={'custom-row'}>
                        <Col className={'order-2 order-md-1'} xs={12} md={8}>
                            <Row>
                                <Col xs={12} className={'gutter-b'}>
                                    <Card header={(
                                        <CardHeader className="d-flex flex-column justify-content-around">
                                            <BoxSubTitle>{t('governance.proposal')}</BoxSubTitle>
                                            <BoxHeader>
                                                <BoxTitle>{ selectedProposal.msg.payload.name}</BoxTitle>
                                                {status && (
                                                    <span className={`label ${status.className} label-lg font-weight-medium d-flex label-inline py-3`}>
                                                        {status.title}
                                                    </span>
                                                )}
                                            </BoxHeader>
                                        </CardHeader>

                                    )}>
                                        <VoteContent className={'font-size-lg opacity-80'} style={{ whiteSpace: 'pre-wrap'}}
                                           dangerouslySetInnerHTML={{ __html: md.render(selectedProposal.msg.payload.body) }} />
                                    </Card>
                                </Col>
                                {status.title === 'Active' && (
                                    <Col xs={12} className={'gutter-b'}>

                                        <Card header={(
                                            <CardHeader className="d-flex flex-column justify-content-around">
                                                <BoxSubTitle>{t('governance.vote')}</BoxSubTitle>
                                                <BoxHeader>
                                                    <BoxTitle>{t('governance.castVote')}</BoxTitle>
                                                </BoxHeader>
                                            </CardHeader>

                                        )}>
                                            <div className="d-flex flex-column">
                                                {selectedProposal.msg.payload.choices.map((option, index) => {
                                                    return (
                                                        <button
                                                            key={index}
                                                            className={`btn ${index === selectedVote - 1 ? `btn-secondary-light` : `btn-light-secondary-light`} mb-2 btn-block py-3`}
                                                            onClick={setSelectedVote.bind(this, index + 1)}
                                                        >{option}</button>
                                                    )
                                                })}
                                                <GradientButton
                                                    className="py-3 mt-3 align-self-center"
                                                    disabled={!selectedVote}
                                                    style={{ width: 250 }}
                                                    onClick={() => {
                                                        !account ? toggleWalletModal() : setShowModal(true)
                                                    }}>{account ? t('governance.vote') : t('wallet.connect')}</GradientButton>
                                            </div>
                                        </Card>
                                    </Col>
                                )}
                                <Col xs={12} className={'gutter-b'}>

                                    <VoteCard header={(
                                        <CardHeader className="d-flex flex-column justify-content-around">
                                            <BoxSubTitle>{t('governance.proposal')}</BoxSubTitle>
                                            <BoxHeader>
                                                <BoxTitle>{t('governance.votes')}</BoxTitle>
                                                {votes && (
                                                    <span className={`label label-light-primary label-lg font-weight-medium d-flex label-inline py-3`}>
                                                        {Object.keys(votes).length}
                                                    </span>
                                                )}
                                            </BoxHeader>
                                        </CardHeader>

                                    )}>
                                        <div className="d-flex flex-column">
                                            <Table>
                                                <Thead style={{ maxHeight: 1, opacity: 0, visibility: 'hidden'}}>
                                                    <tr>
                                                        <td>user</td>
                                                        <td>vote</td>
                                                        <td>power</td>
                                                    </tr>
                                                </Thead>
                                                <tbody>
                                                    {result ? (showMore || (result.hasOwnProperty('votes') && Object.keys(result.votes || {}).length < 10)) ? Object.values(result.votes).map((vote, index) => {
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
                                                    }) : null}
                                                </tbody>
                                            </Table>
                                            {votes ? (
                                                <>
                                                    {Object.keys(votes || {}).length > 10 ? (
                                                        <StyledLinkButton className="btn btn-link " onClick={() => setShowMore(true)}>{t('showMore')}</StyledLinkButton>
                                                    ) : null}
                                                </>
                                            ) : (
                                                <div className="d-flex align-items-center justify-content-center py-5 w-100">
                                                    <Loading color={'primary'} width={40} height={40} active id={'votes-loading'}/>
                                                </div>
                                            )}
                                        </div>
                                    </VoteCard>
                                </Col>
                            </Row>
                        </Col>
                        <Col className={'order-1 order-md-2'} xs={12} md={4}>
                            <Card header={(
                                <CardHeader className="d-flex flex-column justify-content-around" withoutSubtitle>
                                    <BoxHeader>
                                        <BoxTitle>{t('information')}</BoxTitle>
                                    </BoxHeader>
                                </CardHeader>
                            )} >
                                <div className="d-flex flex-column justify-content-start">
                                    <ListItem title={t('importList.tokens')}>
                                        <div className="d-flex align-items-center justify-content-end">
                                            {spaces[id].strategies.map((s, index) => {
                                                return (
                                                        <div className="d-flex align-items-center" style={{ marginLeft: index !== 0 ? '21px' : '0px'}}>
                                                            <VoteLogo id={id} symbolIndex={index} size={30}/>
                                                            <TokenValue>{s.params.symbol}</TokenValue>
                                                        </div>
                                                )
                                            })}
                                        </div>
                                    </ListItem>

                                    <ListItem title={t('author')}>
                                        <div className="d-flex align-items-center">
                                            <ModifiedJazzicon address={selectedProposal && selectedProposal.address}/>
                                            <AuthorLink href={`https://etherscan.io/address/${selectedProposal && selectedProposal.address}`} target={"_blank"} rel={'noopener noreferrer'}>
                                                {selectedProposal && selectedProposal.address.slice(0, 6)}...{selectedProposal && selectedProposal.address.slice(-4)}</AuthorLink>
                                        </div>
                                    </ListItem>

                                    <ListItem title={'IPFS'}>
                                        <AuthorLink href={`https://ipfs.io/ipfs/${selectedProposal && selectedProposal.authorIpfsHash}`} target={"_blank"} rel={'noopener noreferrer'}>
                                            #{selectedProposal && selectedProposal.authorIpfsHash.slice(0, 7)}
                                        </AuthorLink>
                                    </ListItem>
                                    <ListItem title={t('startDate')}>

                                        <InfoText fontWeight={400}>
                                            {selectedProposal && moment(selectedProposal.msg.payload.start * 1e3).format('YYYY/MM/DD hh:mm')}
                                        </InfoText>
                                    </ListItem>
                                    <ListItem title={t('endDate')}>
                                        <InfoText fontWeight={400}>
                                            {selectedProposal && moment(selectedProposal.msg.payload.end * 1e3).format('YYYY/MM/DD hh:mm')}
                                        </InfoText>
                                    </ListItem>
                                    <ListItem title={t('token')}>
                                        <InfoText>
                                            {selectedProposal && selectedProposal.address.slice(0, 6)}
                                        </InfoText>
                                    </ListItem>
                                    <ListItem title={'Snapshot'}>
                                        <AuthorLink href={`https://etherscan.io/block/${selectedProposal && selectedProposal.msg.payload.snapshot}`}
                                                    target={"_blank"} rel={'noopener noreferrer'}>
                                            {selectedProposal && selectedProposal.msg.payload.snapshot}
                                        </AuthorLink>
                                    </ListItem>
                                </div>
                            </Card>
                            { result.results?.hasOwnProperty('totalBalances') && (
                                <Card header={(
                                    <CardHeader className="d-flex flex-column justify-content-around" withoutSubtitle>
                                        <BoxHeader>
                                            <BoxTitle>{t('results')}</BoxTitle>
                                        </BoxHeader>
                                    </CardHeader>
                                )} >
                                    <div className="d-flex flex-column">
                                        {selectedProposal.msg.payload.choices.map((choice, i) => {
                                            return (
                                                <ResultRow>
                                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                                        <ResultTitle>
                                                            {shorten(choice, 'choice')}
                                                        </ResultTitle>

                                                        <ResultTitle>
                                                            { _numeral(result.results.totalBalances?.[i]) }
                                                            { shorten(space.symbol, 'symbol') }
                                                        </ResultTitle>

                                                        <ResultTitle>
                                                            {!result.results.totalVotesBalances
                                                                ? 0
                                                                : `${(((100 / result.results.totalVotesBalances) *
                                                                    result.results.totalBalances?.[i])).toFixed(2)}%`}
                                                        </ResultTitle>
                                                    </div>
                                                    <ResultProgress className={`progress progress-xs w-100`}>
                                                        <ResultProgressBar
                                                             role="progressbar"
                                                             aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"
                                                             style={{
                                                                 width: `${!result.results.totalVotesBalances ? '0' : Number.parseInt(((100 / result.results.totalVotesBalances) *
                                                                     result.results.totalBalances?.[i]))}%`
                                                             }} />
                                                    </ResultProgress>
                                                </ResultRow>
                                            )
                                        })}
                                    </div>
                                </Card>
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
                        <p>{t('governance.voteConfirmation')} "{
                            selectedProposal.msg.payload.choices[selectedVote - 1]
                        }"? <br />{t('governance.voteWarning')}
                        </p>
                        <div className="pt-4 d-flex align-items-center justify-content-end">
                            <Button variant="outline-danger" onClick={() => setShowModal(false)}>{t('close')}</Button>
                            <Button variant="primary" onClick={handleSubmit} className={'ml-3'}>{t('governance.vote')}</Button>
                        </div>
                    </Modal.Body>
                </Modal>
            )}

        </Page>
    )
}

export default Vote;
