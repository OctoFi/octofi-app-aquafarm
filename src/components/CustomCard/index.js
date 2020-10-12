import React from 'react';
import styled from 'styled-components';

const StyledCard = styled.div`
    background-color: ${({ theme }) => theme.bg1};
    color: ${({theme}) => theme.text1};
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    word-wrap: break-word;
    background-clip: border-box;
    border: 1px solid ${({ theme }) => theme.bg2};
    border-radius: 0.42rem;
`


const CustomCard = ({className, ...props}) => {
    return (
        <StyledCard className={`card-custom ${className || ''}`} {...props}>
            {props.children}
        </StyledCard>
    )
}


export const CustomHeader = styled.div`
  border-bottom-color: ${({theme}) => theme.bg3} !important;
`

export const CustomText = styled.div`
  color: ${({theme}) => theme.text1} !important;
`

export const CustomTitle = styled.h5`
  color: ${({theme}) => theme.text2} !important
`

export default CustomCard;