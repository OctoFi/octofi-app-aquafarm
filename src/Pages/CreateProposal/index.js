import React, {useCallback, useContext, useEffect, useState} from 'react';
import {Row, Col, Form, Spinner} from 'react-bootstrap';
import 'react-modern-calendar-datepicker/lib/DatePicker.css';
import DatePicker from 'react-modern-calendar-datepicker';
import {useDispatch, useSelector} from "react-redux";
import {ThemeContext} from "styled-components";
import moment from "moment";

import CustomCard, { CustomHeader, CustomTitle } from "../../components/CustomCard";
import {fetchSpaces} from "../../state/governance/actions";
import {useIsDarkMode} from "../../state/user/hooks";
import {useActiveWeb3React} from "../../hooks";
import {useSnackbar} from "notistack";
import Governance from "../../http/governance";


const CreateProposals = (props) => {
    const { account, library } = useActiveWeb3React();
    const { enqueueSnackbar } = useSnackbar();
    const api = new Governance();

    const dispatch = useDispatch();
    const {spaces} = useSelector(state => state.governance);
    const theme = useContext(ThemeContext);
    const darkMode = useIsDarkMode();

    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        body: '',
        choices: ['', ''],
        snapshot: [],
        dateRange: {
            from: null,
            to: null
        },
        metadata: {}
    })

    let id = props.match.params.space;

    const handleChange = useCallback((key, value) => {
        setForm({
            ...form,
            [key]: value
        })
    }, [setForm, form])

    const isValid = () => {
        const date = {
            start: moment(`${form.dateRange.from.year}-${form.dateRange.from.month}-${form.dateRange.from.day}`).format('X'),
            end: moment(`${form.dateRange.to.year}-${form.dateRange.to.month}-${form.dateRange.to.day}`).format('X'),
        }
        return (
            !loading &&
            account &&
            form.name &&
            form.body &&
            date.start &&
            date.end &&
            date.end > date.start &&
            form.snapshot &&
            form.choices.length >= 2 &&
            !form.choices.some(a => a === '')
        )
    }

    const handleSubmit = async () => {
        if(isValid()) {
            setLoading(true);
            const payload = {
                name: form.name,
                body: form.body,
                snapshot: form.snapshot,
                choices: form.choices,
                start: moment(`${form.dateRange.from.year}-${form.dateRange.from.month}-${form.dateRange.from.day}`).format('X'),
                end: moment(`${form.dateRange.to.year}-${form.dateRange.to.month}-${form.dateRange.to.day}`).format('X'),
                metadata: form.metadata
            }

            const options = {
                token: spaces[id].token,
                type: 'proposal',
                payload
            }
            const msg = {
                address: account,
                msg: JSON.stringify({
                    version: "0.1.2",
                    timestamp: (Date.now() / 1e3).toFixed(),
                    ...options
                })
            };

            try {
                const signer = library.getSigner(account);
                msg.sig = await signer.signMessage(msg.msg);
                enqueueSnackbar('Sending ...', { variant: 'info' })
                await api.sendMessage(msg);
                enqueueSnackbar('Your Proposal is in!', { variant: 'success' })
                setLoading(false);
            } catch(error) {
                enqueueSnackbar('Something went wrong!', { variant: 'error' })
            }
        } else {
            enqueueSnackbar('Please fill all Fields and your proposal choices should be more than 1', { variant: 'error' });
        }
    }


    useEffect(() => {
        if(Object.keys(spaces).length === 0) {
            dispatch(fetchSpaces());
        } else {
            if(!spaces.hasOwnProperty(id)) {
                props.history.push('/governance');
            }
        }
    }, [spaces, id, dispatch, props.history])

    useEffect(() => {
        window.web3.eth.getBlockNumber((error, result) => {
            if(error) throw error;
            handleChange('snapshot', result);
        })
    }, [handleChange])

    const StartDayPicker = ({ ref }) => (
        <Form.Control
            readOnly
            ref={ref} // necessary
            size={'lg'}
            placeholder={'Select a Date'}
            value={form.dateRange.from ? `${form.dateRange.from.year}/${form.dateRange.from.month}/${form.dateRange.from.day}` : ''}
            style={darkMode ? {
                backgroundColor: theme.bg2,
                color: theme.text1,
                borderColor: theme.bg4
            } : {}}
        />
    )


    const EndDayPicker = ({ ref }) => (
        <Form.Control
            readOnly
            ref={ref} // necessary
            placeholder={'Select a Date'}
            size={'lg'}
            value={form.dateRange.to ? `${form.dateRange.to.year}/${form.dateRange.to.month}/${form.dateRange.to.day}` : ''}
            style={darkMode ? {
                backgroundColor: theme.bg2,
                color: theme.text1,
                borderColor: theme.bg4,
                display: 'block',
                width: '100%',
            } : {}}
        />
    )


    return (
        <>
            <Row>
                <Col xs={12}>
                    <CustomCard>
                        <CustomHeader className="card-header d-flex align-items-center justify-content-between">
                            <CustomTitle className="card-title">Create New Proposal</CustomTitle>
                        </CustomHeader>
                        <div className="card-body">
                            <Form>
                                <Form.Row>
                                    <Form.Group as={Col} xs={12}>
                                        <Form.Label className={'text-muted'}>Question</Form.Label>
                                        <Form.Control
                                            placeholder="Question"
                                            size={'lg'}
                                            value={form.name}
                                            onChange={e => handleChange('name', e.target.value)}
                                            style={darkMode ? {
                                                backgroundColor: theme.bg2,
                                                color: theme.text1,
                                                borderColor: theme.bg4
                                            } : {}}/>
                                    </Form.Group>
                                    <Form.Group as={Col} xs={12}>
                                        <Form.Label className={'text-muted'}>What is your Proposal?</Form.Label>
                                        <Form.Control
                                            as={'textarea'}
                                            rows={'5'}
                                            placeholder="What is your Proposal?"
                                            size={'lg'}
                                            value={form.body}
                                            onChange={e => handleChange('body', e.target.value)}
                                            style={darkMode ? {
                                                backgroundColor: theme.bg2,
                                                color: theme.text1,
                                                borderColor: theme.bg4
                                            } : {}}/>
                                    </Form.Group>
                                    <Form.Group as={Col} xs={12} md={6}>
                                        <Form.Label className={'text-muted'}>Start Date</Form.Label>
                                        <DatePicker
                                            wrapperClassName={'d-flex'}
                                            value={form.dateRange}
                                            onChange={e => handleChange('dateRange', e)}
                                            colorPrimary="#007bff"
                                            colorPrimaryLight="rgba(75, 207, 250, 0.4)"
                                            renderInput={StartDayPicker}
                                            shouldHighlightWeekends
                                        />
                                    </Form.Group>
                                    <Form.Group as={Col} xs={12} md={6}>
                                        <Form.Label className={'text-muted'}>End Date</Form.Label>
                                        <DatePicker
                                            wrapperClassName={'d-flex'}
                                            value={form.dateRange}
                                            onChange={e => handleChange('dateRange', e)}
                                            colorPrimary="#007bff"
                                            colorPrimaryLight="rgba(75, 207, 250, 0.4)"
                                            renderInput={EndDayPicker}
                                            shouldHighlightWeekends
                                        />
                                    </Form.Group>

                                    <Form.Group as={Col} xs={12}>
                                        <Form.Label className={'text-muted'}>Snapshot</Form.Label>
                                        <Form.Control
                                            placeholder="Snapshot"
                                            value={form.snapshot}
                                            onChange={e => handleChange('snapshot', e.target.value)}
                                            size={'lg'}
                                            style={darkMode ? {
                                                backgroundColor: theme.bg2,
                                                color: theme.text1,
                                                borderColor: theme.bg4
                                            } : {}}/>
                                    </Form.Group>

                                    <hr/>
                                    <Form.Group as={Col} xs={12} className={'d-flex flex-column'}>
                                        <Form.Label className={'text-muted'}>Choices</Form.Label>
                                        {form.choices.map((item, index) => {
                                            return (
                                                <Form.Control
                                                    key={`choice-${index + 1}`}
                                                    value={form.choices[index]}
                                                    onChange={(e) => {
                                                        const newChoices = [...form.choices];
                                                        newChoices[index] = e.target.value
                                                        handleChange('choices', newChoices)
                                                    }}
                                                    placeholder={`Choice ${index + 1}`}
                                                    className={'mb-3'}
                                                    size={'lg'}
                                                    style={darkMode ? {
                                                        backgroundColor: theme.bg2,
                                                        color: theme.text1,
                                                        borderColor: theme.bg4
                                                    } : {}}/>
                                            )
                                        })}
                                        <button
                                            className="btn btn-link align-self-center"
                                            onClick={() => {
                                                const newChoices =form.choices.concat('');
                                                handleChange('choices', newChoices)
                                            }}
                                        >
                                            + Add Choice
                                        </button>
                                    </Form.Group>

                                    <Form.Group as={Col}>
                                        <button
                                            className="btn btn-primary btn-block py-4"
                                            onClick={handleSubmit}
                                        >
                                            {loading ? (
                                                <Spinner size='lg' animation="border" role="status" variant={'primary'}>
                                                    <span className="sr-only">Loading...</span>
                                                </Spinner>
                                            ) : 'Publish'}
                                        </button>
                                    </Form.Group>

                                </Form.Row>
                            </Form>
                            <Row>
                                <Col xs={12} md={6}>
                                </Col>
                            </Row>
                        </div>
                    </CustomCard>
                </Col>
            </Row>
        </>
    )
}

export default CreateProposals;