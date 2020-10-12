import React from 'react';
import CustomCard from "../CustomCard";
import styled from "styled-components";

const CustomTitle = styled.h5`
  color: ${({theme}) => theme.text2} !important
`

const CustomHeader = styled.div`
  border-bottom-color: ${({theme}) => theme.bg3} !important;
`

const CustomText = styled.div`
  color: ${({theme}) => theme.text1} !important;
`

const TableCard = props => {
    return (
        <CustomCard className="gutter-b">
            <CustomHeader className="card-header">
                <CustomTitle className={'card-title'}>{props.title}</CustomTitle>
            </CustomHeader>
            <div className="card-body">
                <table className="table table-head-custom table-vertical-center table-dark-border">
                    <thead>
                        <tr>
                            {props.columns.map((c) => {
                                return (
                                    <th key={c.id}>{c.title}</th>
                                )
                            })}
                        </tr>
                    </thead>
                    <tbody>
                    {props.data.map((row, index) => {
                        return (
                            <tr key={index} className={'assets__row'}>
                                {row.map((field, i) => {
                                    return (
                                        <td key={index + '-' + i} className={'py-7 assets__value'}>
                                            <CustomText>{field}</CustomText>
                                        </td>
                                    )
                                })}
                            </tr>
                        )
                    })}
                    </tbody>
                </table>
            </div>
        </CustomCard>

    )
}

export default TableCard;