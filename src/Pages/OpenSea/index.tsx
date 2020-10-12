import React from "react";
import { useSelector } from "react-redux";
import { Row, Col } from "react-bootstrap";
import { AppState } from "../../state";
import ValueCard from "../../components/ValueCard";
import OpenSeaContainer from "../../components/OpenSeaContainer";

const OpenSea = () => {
  const overview = useSelector((state: AppState) => state.balances.overview);

  return (
    <>
      <Row>
        <Col xs={12} md={4}>
          <ValueCard
            className={"gutter-b"}
            title={"Total Assets"}
            value={overview.deposits.total + overview.wallet.total}
          />
        </Col>
        <Col xs={12} md={4}>
          <ValueCard
            className={"gutter-b"}
            title={"Total Debt"}
            value={overview.debts.total}
          />
        </Col>
        <Col xs={12} md={4}>
          <ValueCard
            className={"gutter-b"}
            title={"Net Worth"}
            value={
              overview.deposits.total +
              overview.wallet.total -
              overview.debts.total
            }
          />
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <OpenSeaContainer />
        </Col>
      </Row>
    </>
  );
};

export default OpenSea;
