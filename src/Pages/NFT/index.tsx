import React from "react";
import { useSelector } from "react-redux";
import { Row, Col, Button } from "react-bootstrap";
import { AppState } from "../../state";
import CustomCard, { CustomHeader, CustomTitle } from "../../components/CustomCard";
import OpenSeaCard from "../../components/OpenSeaCard";

const NFT = () => {
  const assets = useSelector((state: AppState) => state.opensea.assets);
  const assetList = assets.map((asset, index) => (
    <div className='col mb-8' key={index}>
      <OpenSeaCard asset={asset} />
    </div>
  ));

  return (
    <>
      <Row>
        <Col xs={12}>
          <CustomCard className="test">
            <CustomHeader className="card-header d-flex align-items-center justify-content-between">
                <CustomTitle className="card-title">
                  Non-Fungible Tentacles
                </CustomTitle>
                <Button
                  type='button'
                  as='a'
                  className='btn btn-success font-weight-bolder font-size-lg px-9 py-3'
                  href='https://opensea.io/accounts/octofi'
                  target="_blank"
                  rel="noopener noreferrer">
                    Visit OpenSea
                </Button>
            </CustomHeader>
            <div className="card-body">
              {!!assets.length ? (
                <div className='row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4'>
                  {assetList}
                </div>
              ) : (
                <p className='h3'>No items available at this time.</p>
              )}
            </div>
          </CustomCard>
        </Col>
      </Row>
    </>
  );
};

export default NFT;
