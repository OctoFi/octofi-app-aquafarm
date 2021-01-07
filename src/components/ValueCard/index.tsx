/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";

import CurrencyText from "../CurrencyText";
import CustomCard from '../CustomCard';

interface Props {
    className: string | undefined,
    widgetHeight?: string,
    value: number | string | undefined | null,
    title: string
}

function ValueCard({ className, widgetHeight = "175px" , value, title} : Props) {
    return (
        <>
            <CustomCard
                className={`value-card ${className}`}
                style={{ height: widgetHeight }}
            >
                {/* begin::Body */}
                <div className="card-body d-flex flex-column align-items-center justify-content-center flex-wrap">
                    <span className="font-weight-light font-size-lg text-dark-50 value-card__title">{title}</span>
                    <h3 className="mt-2 font-weight-bolder value-card__content">
                        <CurrencyText>{value}</CurrencyText>
                    </h3>
                </div>
                {/* end::Body */}
            </CustomCard>
        </>
    );
}

export default ValueCard
