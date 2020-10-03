/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";

import CurrencyText from "../CurrencyText";

function OverviewCard({
    className,
    widgetHeight = "85px" ,
    value,
    title,
    icon,
    image,
    theme,
    clickHandler,
    description
}: {
    className: string | undefined,
    widgetHeight?: string,
    value: string | null,
    title: string,
    icon?: any,
    image?: any,
    theme?: string,
    clickHandler?: any,
    description?: string
}) {
    return (
        <>
            <div
                className={`card card-custom overview-card bg-hover-light ${className}`}
                style={{ height: widgetHeight }}
                onClick={clickHandler}
            >
                {/* begin::Body */}
                <div className="card-body d-flex align-items-center justify-content-between flex-wrap">
                    <div className="overview-card__content d-flex align-items-center mr-5">
                        <div className={`overview-card__icon mr-4 d-flex align-items-center justify-content-center ${theme ? `bg-light-${theme}` : '' }`}>
                            {image ? (
                                <img src={image} alt={title} className={'overview-card__image'}/>
                            ) : icon}
                        </div>
                        <div className="d-flex justify-content-center flex-column">
                            <span className="font-weight-normal font-size-lg text-dark overview-card__title">{title}</span>
                            <span className="text-muted font-weight-light font-size-sm">{description}</span>
                        </div>
                    </div>
                    <h3 className="mt-2 font-weight-bolder overview-card__total">
                        <CurrencyText>{value}</CurrencyText>
                    </h3>
                </div>
                {/* end::Body */}
            </div>
        </>
    );
}

export default OverviewCard
