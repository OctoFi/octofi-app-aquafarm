/* eslint-disable no-unused-vars */
import React, {useContext} from "react";
import {PaginationTotalStandalone} from "react-bootstrap-table2-paginator";
import {ThemeContext} from "styled-components";

export function PaginationToolbar(props) {
  const { isLoading, paginationProps } = props;
  const {
    sizePerPageList,
    sizePerPage,
    totalSize,
    onSizePerPageChange = [
      { text: "3", value: 3 },
      { text: "5", value: 5 },
      { text: "10", value: 10 }
    ]
  } = paginationProps;
  const theme = useContext(ThemeContext)

  const onSizeChange = event => {
    const newSize = +event.target.value;
    onSizePerPageChange(newSize);
  };

  return (
    <div className="d-flex align-items-center py-3">
      {isLoading && (
        <div className="d-flex align-items-center">
          <div className="mr-2 text-muted">Loading...</div>
          <div className="spinner spinner-primary mr-10"></div>
        </div>
      )}
      <select
        style={{
          backgroundColor: theme.bg2,
          borderColor: theme.bg4,
          color: theme.text1,
          width: "75px"
        }}
        disabled={totalSize === 0}
        className={`form-control form-control-sm font-weight-bold mr-4 border-0 ${totalSize ===
          0 && "disabled"}`}
        onChange={onSizeChange}
        value={sizePerPage}
      >
        {sizePerPageList.map(option => {
          const isSelect = sizePerPage === `${option.page}`;
          return (
            <option
              key={option.text}
              value={option.page}
              className={`btn ${isSelect ? "active" : ""}`}
            >
              {option.text}
            </option>
          );
        })}
      </select>
      <PaginationTotalStandalone className="text-muted" {...paginationProps} />
    </div>
  );
}
