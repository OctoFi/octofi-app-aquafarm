import React from 'react';
import styled from 'styled-components';
import {CircularProgress} from "@material-ui/core";

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10999;
  background-color: ${({theme}) => theme.bg1};
  display: flex;
  visibility: ${props => props.loaded ? 'hidden' : 'visible'};
  opacity: ${props => props.loaded ? 0 : 1};
  align-items: center;
  justify-content: center;
  transition: all ease 0.4s;
  
`

const SplashScreen = props => {
    return (
        <Wrapper loaded={!props.loading}>
            <CircularProgress color={'primary'} style={{ width: 60, height: 60}} />
        </Wrapper>
    );
}

export default SplashScreen;