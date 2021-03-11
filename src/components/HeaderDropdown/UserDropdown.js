import {useContext} from "react";
import styled, {ThemeContext} from "styled-components";
import SVG from "react-inlinesvg";

import ArrowDown from "../../assets/images/global/arrow-down.svg";
import UserIcon from "../Icons/User";
import {Link, withRouter} from "react-router-dom";
import {useActiveWeb3React} from "../../hooks";
import {useTranslation} from "react-i18next";

const Wrapper = styled.div`
  position: relative;
  padding: 14px 0;
  
  &:hover .header-dropdown {
    opacity: 1;
    visibility: visible;
    transform: rotateX(0deg) scale(1);
  }
`

const Item = styled.div`
  display: flex;
  align-items: center;
`

const Button = styled.button`
  margin-right: .75rem;
`

const DropDown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: ${({ theme }) => theme.modalBG};
  border-radius: .75rem;
  box-shadow: -1px 11px 43px rgba(0, 0, 0, 0.12);
  padding: 20px;
  
  opacity: 0;
  visibility: hidden;
  transform-style: preserve-3d;
  transform: rotateX(-40deg) scale(0.8);
  transform-origin: top center;
  transition: 0.4s ease all;
  z-index: 99999;
  
`

const DropDownItem = styled(Link)`
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 20px;
  outline: none;
  text-decoration: none;
  white-space: nowrap;
  color: ${({ theme }) => theme.text1};
  
  &:not(:last-child) {
    margin-bottom: 20px;
  }
  
  &:hover,
  &:focus,
  &:active {
    color: ${({ theme }) => theme.text2};
    box-shadow: none;
    outline: none;
    text-decoration: none;
  }
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 6px;
    width: 10px;
    height: 10px;
    border-radius: 10px;
    background-color: ${({ theme }) => theme.success};
  }
`

const DropDownButton = styled.button`
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 20px;
  outline: none;
  text-decoration: none;
  white-space: nowrap;
  border: none;
  background-color: transparent;
  color: ${({ theme }) => theme.text1};
  
  &:not(:last-child) {
    margin-bottom: 20px;
  }
  
  &:hover,
  &:focus,
  &:active {
    color: ${({ theme }) => theme.text2};
    box-shadow: none;
    outline: none;
    text-decoration: none;
  }
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 6px;
    width: 10px;
    height: 10px;
    border-radius: 10px;
    background-color: ${({ theme }) => theme.success};
  }
`

const HeaderDropdown = ({items, title, ...props}) => {
    const { account, deactivate } = useActiveWeb3React();
    const theme = useContext(ThemeContext);
    const { t } = useTranslation();

    const logoutHandler = () => {
        if(account) {
            deactivate();
            props.history.push('/');
        }
    }
    return (
        <Wrapper>
            <Item>
                <Button className="btn btn-circle btn-light-primary">
                    <UserIcon size={'20px'}/>
                </Button>
                <SVG src={ArrowDown} style={{ color: theme.primary }}/>
            </Item>
            <DropDown className={'header-dropdown'}>
                {Object.values(items).map((item, index) => {
                    return (
                        <DropDownItem to={item.path} key={`${title}-${index}`}>{t(`menu.${item.title}`)}</DropDownItem>
                    )
                })}
                <DropDownButton onClick={logoutHandler}>{t('menu.disconnect')}</DropDownButton>
            </DropDown>
        </Wrapper>
    )
}

export default withRouter(HeaderDropdown);
