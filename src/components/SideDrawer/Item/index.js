import styled, {ThemeContext} from 'styled-components';
import SVG from "react-inlinesvg";
import {useCallback, useContext, useRef, useState} from "react";
import { Link } from 'react-router-dom';

import ArrowDown from "../../../assets/images/global/arrow-down.svg";

const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.bg3};
  position: relative;
`

const Header = styled.div`
  padding: 20px 24px 20px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.modalBG};
  height: 64px;
  border-bottom: 1px solid ${({ theme }) => theme.text3};
  cursor: pointer;
`

const IconContainer = styled.div`
  transition: all ease 0.3s;
  transform: ${({ open }) => open ? 'rotate(180deg)' : 'rotate(0deg)'}; 
`
const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  
`
const Title = styled.span`
  color: ${({ theme }) => theme.text1};
  font-size: .875rem;
  font-weight: 400;
  padding-right: 10px;
`

const Icon = styled.div`
  padding-right: 22px;
  color: ${({ theme }) => theme.primary};
`

const Collapse = styled.div`
  overflow: hidden;
  max-height: ${({ height }) => height ? `${height}px` : 0};
  transition: all ease 0.3s;
`

const Body = styled.div`
  padding: 20px 30px;
  border-bottom: 1px solid ${({ theme }) => theme.text3};
  display: flex;
  flex-direction: column;
  
`

const BodyItem = styled(Link)`
  font-size: .875rem;
  font-weight: 400;
  color: ${({ theme }) => theme.text1};
  
  
  &:hover,
  &:focus,
  &:active {
    outline: none;
    text-decoration: none;
    color: ${({ theme }) => theme.text2};
  }
  
  &:not(:last-child) {
    margin-bottom: 20px;
  }
`

const SideDrawerItem = ({items, title, ...props}) => {
    const theme = useContext(ThemeContext);
    const body = useRef(null);
    const [open, setOpen] = useState(false);
    const [height, setHeight] = useState(0);

    const toggleOpen = useCallback(() => {
        if(open) {
            setOpen(false);
            setHeight(0);
        } else {
            if(body.current) {
                const { height } = body.current.getBoundingClientRect();
                setOpen(open => !open)
                setHeight(height || 0);
            }
        }

    }, [body.current, open])

    return (
        <Wrapper>
            <Header onClick={toggleOpen}>
                {props.icon ? (
                    <TitleContainer>
                        <Icon>
                            {props.icon}
                        </Icon>
                        <Title>{title}</Title>
                    </TitleContainer>
                ) : (
                    <Title>{title}</Title>
                )}
                <IconContainer open={open}>
                    <SVG src={ArrowDown} style={{ color: theme.primary }}/>
                </IconContainer>
            </Header>
            <Collapse height={height}>
                <Body ref={body}>
                    {Object.values(items).map((item, index) => {
                        return (
                            <BodyItem to={item.path} key={`${title}-${index}`}>{item.title}</BodyItem>
                        )
                    })}
                </Body>
            </Collapse>
        </Wrapper>
    )
}

export default SideDrawerItem;