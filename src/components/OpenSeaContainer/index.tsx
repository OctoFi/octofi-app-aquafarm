import React from "react";
import { useSelector } from "react-redux";
import { Button } from "react-bootstrap";
import OpenSeaCard from "../OpenSeaCard";
import { AppState } from "../../state";

export default function OpenSeaContainer() {
  const assets = useSelector((state: AppState) => state.opensea.assets);
  const assetList = assets.map((asset, index) => (
    <div className='col mb-8' key={index}>
      <OpenSeaCard asset={asset} />
    </div>
  ));

  return (
    <div className={`card card-custom gutter-b`}>
      {/* begin::Header */}
      <div className='card-header border-0 py-5'>
        <h3 className='card-title align-items-start flex-column'>
          <span className='card-label font-weight-bolder text-dark'>
            OctoNFTs
          </span>
          <span className='text-muted mt-3 font-weight-bold font-size-sm'>
            Explore NFTs available through OpenSea.
          </span>
        </h3>
        <div className='card-toolbar'>
          <Button
            type='button'
            className='btn btn-success font-weight-bolder font-size-lg px-9 py-3'
            href='https://opensea.io/accounts/octofi'>
            Visit OpenSea
          </Button>
        </div>
      </div>
      {/* end::Header */}

      {/*begin::body*/}
      <div className='card-body pt-4'>
        {!!assets.length ? (
          <div className='row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4'>
            {assetList}
          </div>
        ) : (
          <p className='h3'>No items available at this time.</p>
        )}
      </div>
      {/*end::body*/}
    </div>
  );
}
