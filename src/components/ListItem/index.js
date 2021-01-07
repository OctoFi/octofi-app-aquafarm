import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.bg2};
  background-color: ${({ theme }) => theme.bg1};
  box-shadow: 0 0 5px transparent;
  padding: 1rem 1.5rem;
  border-radius: .42rem;
  position: relative;
  transition: .3s ease all;
  margin-bottom: 0.25rem;
  width: 100%;
  
  &:hover {
    border-color:  ${({ theme }) => theme.bg4};
  }
`
const listItem = props => {
    return (
        <Wrapper className="d-flex align-items-center justify-content-between">
            <span className="text-muted font-size-base">{props.title}</span>
            <div className="font-size-lg">{props.children}</div>
        </Wrapper>
    )
}

export default listItem;