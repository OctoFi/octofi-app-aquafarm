import React, { useMemo } from "react";
import styled from 'styled-components';

import { PoolsFilter } from "./PoolsFilter";
import { PoolsTable } from "./PoolsTable";
import { usePoolsUIContext } from "./PoolsUIProvider";
import CustomCard from "../../components/CustomCard";


const CustomTitle = styled.span`
  font-weight: bolder;
  color: ${({ theme }) => theme.text1}
`

export function PoolsCard() {
    const poolsUIContext = usePoolsUIContext();
    const poolsUIProps = useMemo(() => {
        return {
            ids: poolsUIContext.ids,
            investButtonClick: poolsUIContext.investButtonClick,
        };
    }, [poolsUIContext]);

    return (
        <CustomCard className={`gutter-b`}>
            {/* begin::Header */}
            <div className="card-header border-0 py-5">
                <h3 className="card-title align-items-start flex-column">
                    <CustomTitle>
                        Explore Opportunities
                    </CustomTitle>
                    <span className="text-muted mt-3 font-weight-bold font-size-sm">
                        Add liquidity to earn fees, incentives, voting rights, etc.
                    </span>
                </h3>
                <div className="card-toolbar">
                    <button
                        type={'button'}
                        className="btn btn-success font-weight-bolder font-size-lg px-9 py-3"
                        onClick={poolsUIProps.investButtonClick}
                        >
                        Invest
                    </button>
                </div>
            </div>
            {/* end::Header */}

            {/*begin::body*/}
            <div className="card-body pt-4">
                <PoolsFilter/>
                <PoolsTable/>
            </div>
            {/*end::body*/}
        </CustomCard>
    );

}

