import React from 'react';
import styled from 'styled-components';
import { isMobile } from 'react-device-detect';
import { Link } from 'react-router-dom';
import SVG from 'react-inlinesvg';
import Skeleton from "react-loading-skeleton";

import {useLogo} from "../../state/governance/hooks";

const Wrapper = styled(Link)`
  background-color: ${({ theme }) => theme.modalBG};
  border: 1px solid transparent;
  padding: 50px;
  border-radius: 1.25rem;
  position: relative;
  transition: .3s ease all;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
  
  @media (max-width: 991px) {
    padding: 20px 12px 10px;
    border-radius: 10px;
  }
  
  &:hover {
    background-color: ${({ theme, loading }) => !loading && theme.bg2};
    text-decoration: none;
    border-color: ${({ theme }) => theme.primary};
  }
  
  &:focus,
  &:active {
    outline: none;
  }
`

const Logo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 100px;
  margin-bottom: 1.25rem;
  background-color: ${({ theme }) => theme.text1};
  
  
  @media (max-width: 991px) {
      width: 60px;
      height: 60px;
      border-radius: 60px;
  }
  
`

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text1};
  margin-bottom: 1.125rem;
  white-space: pre-wrap;
  text-align: center;
  
  @media (max-width: 991px) {
    font-size: 1rem;
    margin-bottom: 0.875rem;
  }
`
const CurrencyName = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text1};
  text-align: center;
  
  
  @media (max-width: 991px) {
    font-size: 0.875rem;
    margin-bottom: 0.875rem;
  }
`

const StarWrapper = styled.div`
  position: absolute;
  right: 20px;
  top: 20px;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.primary};
  
  
  @media (max-width: 991px) {
      right: 10px;
      top: 10px;
      width: 10px;
      height: 10px;
      
      svg {
          width: 10px;
          height: 10px;
      }
  }
`

const SpaceCard = props => {
    const LogoURL = useLogo(props.id, props.symbolIndex);
    return (
        <Wrapper to={props.loading ? '#' : `/tools/governance/${props.id}`} loading={props.loading}>
            {!props.loading && props.pinned && (
                <StarWrapper>
                    <SVG src={require('../../assets/images/governance/pin-start.svg').default} width={16} height={16} />
                </StarWrapper>
            )}
            {props.loading ? (<Skeleton circle={true} width={isMobile ? 100 : 66} height={isMobile ? 100 : 66} style={{ marginBottom: '1.25rem'}}/>) : (<Logo src={LogoURL}/>)}
            <Title>{props.loading ? (<Skeleton height={20} width={isMobile ? 80 : 120}/>) : props.name}</Title>
            <CurrencyName>{props.loading ? (<Skeleton height={15} width={isMobile ? 50 : 80}/>) : props.symbol}</CurrencyName>
        </Wrapper>
    )
}

export default SpaceCard;