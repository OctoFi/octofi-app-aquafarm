import React from 'react';
import { Jazzicon } from '@ukstv/jazzicon-react';
import styled from 'styled-components';

export const ModifiedJazzicon = styled(Jazzicon)`
    width: 24px;
    height: 24px;
`
const Wrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.bg3};
  background-color: ${({ theme }) => theme.bg1};
  box-shadow: 0 0 5px transparent;
  padding: 1.75rem 1.5rem;
  border-radius: .42rem;
  position: relative;
  transition: .3s ease all;
  margin-bottom: 0.5rem;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  &:hover {
    background-color: ${({ theme }) => theme.bg2};
    border-color:  ${({ theme }) => theme.primary1};
    box-shadow: ${({theme}) => `0 5px 15px ${theme.primary1}20`};
}
`
const voteItem = props => {
    return (
        <Wrapper>
            <div className="d-flex align-items-center">
                <ModifiedJazzicon address={props.address}/>
                <span className="ml-3">{props.address.slice(0, 6)}...{props.address.slice(-4)}</span>
            </div>
            <span className="text-muted font-weight-bolder font-size">{props.vote}</span>
        </Wrapper>
    )
}

export default voteItem;