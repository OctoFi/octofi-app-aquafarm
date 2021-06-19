import styled from "styled-components";
import {useActiveWeb3React} from "../../hooks";
import {useEffect, useState} from "react";
import {useETHBalances} from "../../state/wallet/hooks";
import {Button, Col, Form, Row} from "react-bootstrap";
import {useTranslation} from "react-i18next";
import toast from "react-hot-toast";
import {lighten} from "polished";
import {shortenAddress} from "../../utils";


const UpperSection = styled.div`
  position: relative;

  h5 {
    margin: 0 0 0.5rem;
    font-size: 1rem;
    font-weight: 400;
  }

  h5:last-child {
    margin-bottom: 0;
  }

  h4 {
    margin-top: 0;
    font-weight: 500;
  }
`;

const ContentWrapper = styled.div`
	background-color: ${({ theme }) => theme.modalBG};
	margin-bottom: 1rem;
	border-bottom-left-radius: 0.42rem;
	border-bottom-right-radius: 0.42rem;
`;

const Select = styled(Form.Control)`
  background-color: ${({ theme }) => theme.bg1};
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.text3};
  overflow: hidden;

  &:focus {
    box-shadow: none;
    outline: none;
    border: 1px solid ${({ theme }) => theme.text3};
  }

  /* width */
  ::-webkit-scrollbar {
    width: 3px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    box-shadow: none;
    background-color: transparent;
    border-radius: 10px;
    padding: 0 6px;
    margin: 0 6px;
    border-right: 1px solid ${({ theme }) => theme.text1};
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.text1};
    border-radius: 10px;
    width: 4px !important;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => lighten(0.08, theme.text1)};
  }
`

const Option = styled.option`
  padding: 10px 18px;
  border-radius: 12px;
  
  @media (max-width: 576px) {
    padding: 10px 8px;
  }
  
  &:checked {
    background-color: ${({ theme }) => theme.primary};
  }
`

const LedgerAccount = props => {
    const { connector } = useActiveWeb3React();
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null)
    const accountsEthBalance = useETHBalances(accounts);
    const { t } = useTranslation()

    useEffect(() => {
        if(connector?.getAccounts) {
            connector?.getAccounts(2)
                .then(acc => {
                    setAccounts(acc);
                })
        }
    }, [connector])

    const changeSelectedAccount = (e) => {
        setSelectedAccount(e.target.value);
    }

    const selectLedgerAccount = (e) => {
        e.preventDefault();
        if(!selectedAccount) {
            toast.error(t('errors.selectAAccount'))
        }

        if(connector?.setAccount) {
            connector?.setAccount(selectedAccount);
            props.onDone()
        }
    }

    return (
        <UpperSection>
            <ContentWrapper>
                <Form onSubmit={selectLedgerAccount}>
                    <Row>
                        <Form.Group as={Col} xs={12}>
                            <Form.Label>Select default Address</Form.Label>
                            <Select as={"select"} size={5} className={'custom-select'} htmlSize={5} custom onChange={changeSelectedAccount}>
                                {accounts.map(acc => {
                                    return (
                                        <Option key={acc} value={acc}>{shortenAddress(acc)}&nbsp;&nbsp;&nbsp;{accountsEthBalance?.[acc]?.toFixed(6) || 0} ETH</Option>
                                    )
                                })}
                            </Select>
                        </Form.Group>
                        <Form.Group as={Col} xs={12} className={'d-flex align-items-center justify-content-center'}>
                            <Button type={'submit'} variant={'primary'} style={{ minWidth: 125, height: 56 }}>Select Account</Button>
                        </Form.Group>
                    </Row>

                </Form>
            </ContentWrapper>
        </UpperSection>
    )
}

export default LedgerAccount;