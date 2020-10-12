/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";

function OpenSeaCard({
  asset,
  className,
}: {
  asset: any;
  className?: string | undefined;
}) {
  const { name, image_preview_url, permalink, asset_contract } = asset;

  return (
    <>
      <div className={`card h-100 nft-card ${className}`}>
        <div
          style={{
            height: "250px",
            backgroundImage: `url(${image_preview_url})`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
            maxHeight: "100%",
          }}>
          <img
            src={image_preview_url ? image_preview_url : ""}
            alt={name}
            className={
              "card-img-top invisible h-100 mx-auto d-block nft-card__thumbnail"
            }
          />
        </div>
        {/* begin::Body */}
        <div className='card-body p-4'>
          <p className='card-text mb-2'>
            <small className='text-muted'>{asset_contract.name}</small>
          </p>
          <a href={permalink} target='_blank'>
            <h5 className='card-title'>{name}</h5>
          </a>
        </div>
        {/* end::Body */}
      </div>
    </>
  );
}

export default OpenSeaCard;
