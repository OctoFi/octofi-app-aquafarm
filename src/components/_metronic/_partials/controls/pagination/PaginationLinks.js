/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React from "react";
import styled from 'styled-components';

import { getPages, getPagesCount } from "../../../_helpers";

const StyledButton = styled.a`
  background-color: ${({ theme }) => theme.bg2 } !important;
  border: none;
`

export function PaginationLinks({ paginationProps }) {
  const { totalSize, sizePerPage, page, paginationSize } = paginationProps;
  const pagesCount = getPagesCount(totalSize, sizePerPage);
  const pages = getPages(page, pagesCount, paginationSize);
  const handleFirstPage = ({ onPageChange }) => {
    onPageChange(1);
  };

  const handlePrevPage = ({ page, onPageChange }) => {
    onPageChange(page - 1);
  };

  const handleNextPage = ({ page, onPageChange }) => {
    if (page < pagesCount) {
      onPageChange(page + 1);
    }
  };

  const handleLastPage = ({ onPageChange }) => {
    onPageChange(pagesCount);
  };

  const handleSelectedPage = ({ onPageChange }, pageNum) => {
    onPageChange(pageNum);
  };

  const disabledClass = pagesCount > 1 ? "" : "disabled";
  return (
    <>
      {pagesCount < 2 && <></>}
      {pagesCount > 1 && (
        <>
          <div className={`d-flex flex-wrap py-2 mr-3 ${disabledClass}`}>
            <StyledButton
              onClick={() => handleFirstPage(paginationProps)}
              className="btn btn-icon btn-sm btn-hover-primary mr-2 my-1"
            >
              <i className="ki ki-bold-double-arrow-back icon-xs" />
            </StyledButton>
            <StyledButton
              onClick={() => handlePrevPage(paginationProps)}
              className="btn btn-icon btn-sm btn-hover-primary mr-2 my-1"
            >
              <i className="ki ki-bold-arrow-back icon-xs" />
            </StyledButton>

            {page > 1 && (
              <a className="btn btn-icon btn-sm border-0 btn-hover-primary mr-2 my-1">
                ...
              </a>
            )}
            {pages.map((p) => (
              <StyledButton
                key={p}
                onClick={() => handleSelectedPage(paginationProps, p)}
                className={`btn btn-icon btn-sm border-0 ${
                  page === p ? " btn-hover-primary active" : ""
                } mr-2 my-1`}
              >
                {p}
              </StyledButton>
            ))}
            {page < pagesCount && (
              <a className="btn btn-icon btn-sm border-0 btn-hover-primary mr-2 my-1">
                ...
              </a>
            )}
            <StyledButton
              onClick={() => handleNextPage(paginationProps)}
              className="btn btn-icon btn-sm btn-hover-primary mr-2 my-1"
            >
              <i className="ki ki-bold-arrow-next icon-xs"/>
            </StyledButton>
            <StyledButton
              onClick={() => handleLastPage(paginationProps)}
              className="btn btn-icon btn-sm btn-hover-primary mr-2 my-1"
            >
              <i className="ki ki-bold-double-arrow-next icon-xs"/>
            </StyledButton>
          </div>
        </>
      )}
    </>
  );
}
