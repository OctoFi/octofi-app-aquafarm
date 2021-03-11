import {Link} from "react-router-dom";

import LogoImage from '../../assets/images/logo.svg';

const Logo = props => {
    return (
        <Link to={'/'} className={'header__logo'}>
            <img src={LogoImage} alt={process.env.REACT_APP_BRAND} className={'header__logo-img'}/>
            <span className={`text-primary header__logo-title ${props.hideOnMobile ? 'd-none d-lg-block' : ''}`}>{process.env.REACT_APP_BRAND}</span>
        </Link>
    )
}

export default Logo;