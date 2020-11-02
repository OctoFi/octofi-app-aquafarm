/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import styled from "styled-components";
import { LightCard } from "../Card";

interface Props {
  asset: any;
  className?: string | undefined;
}

const DivImgWrapper = styled.div(({ image }: { image: string }) => ({
  height: "250px",
  backgroundSize: "cover",
  backgroundPosition: "center center",
  backgroundRepeat: "no-repeat",
  maxHeight: "100%",
  backgroundImage: `url('${image}')`,
  borderTopLeftRadius: "16px",
  borderTopRightRadius: "16px",
}));

function OpenSeaCard({ asset, className }: Props) {
  const { name, image_preview_url, permalink, asset_contract } = asset;

  return (
    <>
      <LightCard padding='0' className={`h-100 nft-card ${className || ""}`}>
        <DivImgWrapper image={image_preview_url}>
          <img
            src={image_preview_url}
            alt={name}
            className='card-img-top invisible h-100 mx-auto d-block nft-card__thumbnail'
          />
        </DivImgWrapper>
        {/* begin::Body */}
        <div className='card-body p-4'>
          <p className='card-text mb-2'>
            <small className='text-muted'>{asset_contract.name}</small>
          </p>
          <a href={permalink} target='_blank' rel="noopener noreferrer">
            <h5 className='card-title'>{name}</h5>
          </a>
        </div>
        {/* end::Body */}
      </LightCard>
    </>
  );
}

export default OpenSeaCard;
