import React from "react";
import styled from 'styled-components';

const Footer = styled.div`
  background-color: ${({ theme }) => theme.bg1 }
`

const FooterCopyright = styled.div`
  color: ${({ theme }) => theme.text1}
`
const FooterLink = styled.a`
  color: ${({ theme }) => theme.text3}
`

export function FooterCompact({
  today,
  footerClasses,
  footerContainerClasses,
}) {
  return (
    <>
      {/* begin::Footer */}
      <Footer
        className={`footer py-4 d-flex flex-lg-column ${footerClasses}`}
        id="kt_footer"
      >
        {/* begin::Container */}
        <div
          className={`${footerContainerClasses} d-flex flex-column flex-md-row align-items-center justify-content-between`}
        >
          {/* begin::Copyright */}
          <FooterCopyright className="order-2 order-md-1">
            <span className="text-muted font-weight-bold mr-2">
              {today} &copy;
            </span>
            {` `} Decentralized Finance Tentacles by {` `}
            <FooterLink
              href="https://octo.fi"
              rel="noopener noreferrer"
              target="_blank"
              className="text-hover-primary"
            >
              OctoFi
            </FooterLink>
          </FooterCopyright>
          {/* end::Copyright */}
        </div>
        {/* end::Container */}
      </Footer>
      {/* end::Footer */}
    </>
  );
}
