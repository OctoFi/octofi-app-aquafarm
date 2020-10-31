import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

import {useLogo} from "../../state/governance/hooks";

const Wrapper = styled(Link)`
  border: 1px solid ${({ theme }) => theme.bg3};
  background-color: ${({ theme }) => theme.bg1};
  box-shadow: 0 0 5px transparent;
  padding: 2.25rem 1.5rem;
  border-radius: .42rem;
  position: relative;
  transition: .3s ease all;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: ${({ theme }) => theme.bg2};
    border-color:  ${({ theme }) => theme.primary1};
    box-shadow: ${({theme}) => `0 5px 15px ${theme.primary1}20`};
  }
`

const Logo = styled.img`
  width: 98px;
  height: 98px;
  border-radius: 98px;
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.075);
  margin-bottom: 1.25rem;
`

const Title = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text1};
  margin-bottom: .5rem;
  text-align: center;
`

const SpaceCard = props => {
    const LogoURL = useLogo(props.id, props.symbolIndex);
    return (
        <Wrapper className={'gutter-b'} to={`/governance/${props.id}`}>
            <Logo src={LogoURL}/>
            <Title>{props.name}</Title>
            <span className="text-muted font-size-base">{props.symbol}</span>
        </Wrapper>
    )
}

export default SpaceCard;