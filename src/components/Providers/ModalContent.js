import React from 'react';
import { Row, Col } from 'react-bootstrap';
import Snackbar from "@material-ui/core/Snackbar";
import { useWeb3React } from "@web3-react/core";
import { makeStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom';
import Alert from "@material-ui/lab/Alert";

import ProvidersItem from "./ProvidersItem";
import { useInactiveListener } from '../../lib/hooks';
import connectors from "../../connectors";
import functions from './functions';


const useStyles = makeStyles(theme => ({
    error: {
        backgroundColor: theme.palette.error.dark,
    },
    icon: {
        fontSize: 20,
    },
    iconVariant: {
        opacity: 0.9,
        marginRight: theme.spacing(1),
    },
    message: {
        display: 'flex',
        alignItems: 'center',
    },
}));
const Providers =  (props) => {
    const classes = useStyles();
    const context = useWeb3React();
    const { connector, activate, error } = context

    // handle logic to recognize the connector currently being activated
    const [activatingConnector, setActivatingConnector] = React.useState()
    React.useEffect(() => {
        if (activatingConnector && activatingConnector === connector) {
            setActivatingConnector(undefined)
        }
    }, [activatingConnector, connector])


    return (
        <div className="provider">
            <Row className={'row-paddingless'}>
            {Object.keys(connectors).map((name, index) => {
                const currentConnector = connectors[name].provider
                // const activating = currentConnector === activatingConnector
                // const connected = currentConnector === connector
                // const disabled = !triedEager || !!activatingConnector || connected || !!error

                return (
                    <Col key={name} md={name === 'injected' ? 12 : 6} xs={12} className={`d-flex align-items-stretch provider__item-container bg-hover-light border-bottom ${index > 0 && index % 2 === 0 ? 'border-left' : ''}`}>
                        <ProvidersItem
                            type={name}
                            name={connectors[name].name}
                            clickHandler={async () => {
                                setActivatingConnector(currentConnector)
                                await activate(connectors[name].provider);
                            }}
                        />
                    </Col>
                )
            })}
            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                open={!!error}
                autoHideDuration={6000}
                key={'error' + error}
                variant={'error'}
            >
                <Alert
                    severity="error"
                    className={classes[error]}
                >{!!error && functions.getErrorMessage(error)}</Alert>
            </Snackbar>

            </Row>
        </div>
    )
}

export default withRouter(Providers);