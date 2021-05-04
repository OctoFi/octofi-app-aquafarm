import styled from "styled-components";

import Card from '../../components/Card';
import {AlertTriangle} from "react-feather";
import {useTranslation} from "react-i18next";
import {useState} from "react";
import {Button} from "react-bootstrap";

const StyledWarningIcon = styled(AlertTriangle)`
	stroke: ${({ theme }) => theme.red1};
  margin-right: 1rem;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text1};
  margin-top: 0;
  margin-bottom: 0;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.25rem;
`

const Content = styled.p`
  margin-top: 0;
  margin-bottom: 24px;
  font-weight: 400;
  font-size: 0.875rem;
  line-height: 23px;
  color: ${({ theme }) => theme.text1};
`

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`

const SafetyAlert = () => {
    const [show, setShow] = useState(true);
    const { t } = useTranslation();

    const toggleCard = () => {
        setShow(false);
    }

    return show && (
        <Card>
            <Header>
                <StyledWarningIcon/>
                <Title>{t('launchpad.safetyAlert')}</Title>
            </Header>
            <Content>{t("launchpad.safetyAlertContent")}</Content>
            <Footer>
                <Button variant={'light-danger'} onClick={toggleCard} size={'sm'}>{t('importToken.understand')}</Button>
            </Footer>
        </Card>
    )
}

export default SafetyAlert;