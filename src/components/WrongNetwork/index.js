import styled from "styled-components";
import { Button as BS} from 'react-bootstrap';
import React from "react";
import SVG from "react-inlinesvg";

import DefaultCard from '../Card';
import Ethereum from "../../assets/images/networks/ethereumMainnet.svg";
import {useWalletModalToggle} from "../../state/application/hooks";

const Card = styled(DefaultCard)`
  	margin-top: 40px;
  
	& > .card-body {
	  padding: 60px 64px 48px;
	  position: relative;
	}
`

const Title = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text1};
  line-height: 1;
  margin-top: 0;
  margin-bottom: 0.75rem;
  display: block;

  @media (max-width: 991px) {
    font-size: .875rem;
  }
`

const Description = styled.span`
  font-size: .875rem;
  font-weight: 400;
  color: ${({ theme }) => theme.text3};
  line-height: 1.6;
  margin-bottom: 1.5rem;
  display: block;

  @media (max-width: 991px) {
    font-size: .75rem;
  }
`

const Button = styled(BS)`
  min-height: 56px;
  height: 56px;
  
  @media (max-width: 991px) {
    min-height: 48px;
    height: 48px;
  }
`

const ImageContainer = styled.div`
  width: 100px;
  height: 100px;
  min-width: 100px;
  min-height: 100px;
  margin-bottom: 2.5rem;
  border-radius: 1000px;
  padding: 1rem;
  background-color: ${({ theme }) => theme.primaryLight};
  
  @media (max-width: 991px) {
    width: 80px;
    height: 80px;
    min-width: 80px;
    min-height: 80px;
    margin-bottom: 2rem;
  }
`

const WrongNetwork = props => {
	const toggleWalletModal = useWalletModalToggle();

	return (
		<Card>
			<div className="d-flex flex-column align-items-center">
				<ImageContainer>
					<SVG src={Ethereum} style={{ width: '100%', height: '100%' }}/>
				</ImageContainer>
				<Title>Wrong Network</Title>
				<Description>
					Please connect to the Ethereum network to continue.
				</Description>
				<Button onClick={toggleWalletModal}>Change Network</Button>
			</div>
		</Card>
	)
}

export default WrongNetwork;