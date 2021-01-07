import React from 'react';

import ProviderIcon from '../Icons';

const ProvidersItem = ({type, name, clickHandler, active, ...props}: {
    type: string,
    name: string | undefined,
    clickHandler: any,
    active: boolean
}) => {
    return (
        <button className="provider__item" onClick={clickHandler} {...props}>
            <ProviderIcon type={type}/>
            <div className="provider__content">
                <h3 className="provider__name">{name}</h3>
                <span className="provider__connect text-muted">Try to connect</span>
            </div>
        </button>
    )
}

export default ProvidersItem;