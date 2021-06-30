import React, { Component } from "react";
import styled, { ThemeContext } from "styled-components";

import { ResponsiveCard } from "../../components/Card";
import { Nav, Tab, Row, Col } from "react-bootstrap";
import PoolsTab from "./PoolsTab";
import { connect } from "react-redux";
import Button from "../../components/UI/Button";
import SearchIcon from "../../assets/images/search.svg";
import SVG from "react-inlinesvg";
import {
	InputGroupText,
	InputGroup,
	InputGroupPrepend,
	InputGroupFormControl as FormControl,
} from "../../components/Form";
import { withTranslation } from "react-i18next";

const CustomTitle = styled.span`
	font-weight: 700;
	color: ${({ theme }) => theme.text1};
	font-size: 1.25rem;
	margin-bottom: 0.5rem;
`;

const CustomSubtitle = styled.span`
	font-size: 1rem;
	font-weight: 500;
	color: ${({ theme }) => theme.text1};
	opacity: 0.5;
`;

const Content = styled.div`
	padding-top: 30px;

	@media (min-width: 768px) {
		padding-top: 57px;
	}
`;

const CustomInputGroup = styled(InputGroup)`
	padding-bottom: 30px;

	@media (min-width: 768px) {
		padding-bottom: 0;
	}
`;

const CustomNav = styled(Nav)`
	margin-bottom: 30px;
	min-width: 100%;
	overflow: auto;
	margin-left: -30px !important;
	margin-right: -30px !important;

	@media (min-width: 768px) {
		margin-left: -10px !important;
		margin-right: -10px !important;
	}
`;

const CustomNavItem = styled(Nav.Item)`
	padding: 0 10px 10px;

	@media (max-width: 767px) {
		padding: 0 5px 10px;
	}

	&:first-child {
		@media (max-width: 767px) {
			padding-left: 30px;
		}
	}
	&:last-child {
		@media (max-width: 767px) {
			padding-right: 30px;
		}
	}
`;

const CustomNavLink = styled(Nav.Link)`
	border-radius: 18px !important;
	color: ${({ theme }) => theme.primary};
	background-color: ${({ theme }) => theme.primaryLight};
	padding: 14px 24px;
	min-height: 56px;
	font-weight: 500;
	display: flex;
	align-items: center;
	justify-content: center;

	@media (max-width: 767px) {
		padding: 6px 15px;
		font-size: 1rem;
		min-height: 32px;
		border-radius: 12px !important;
	}

	&:hover {
		color: ${({ theme }) => theme.primary};
	}

	&.active {
		color: ${({ theme }) => theme.text1};
		background-color: ${({ theme }) => theme.primary};
	}
`;

class PoolsCard extends Component {
	static contextType = ThemeContext;

	state = {
		query: "",
	};

	changeInputHandler = (e) => {
		this.setState({
			query: e.target.value,
		});
	};
	render() {
		const { t } = this.props;
		return (
			<ResponsiveCard className={`gutter-b`}>
				<div className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center justify-content-between border-0">
					<div className="d-flex justify-content-center align-items-start flex-column">
						<CustomTitle>{t("pools.title")}</CustomTitle>
						<CustomSubtitle>{t("pools.description")}</CustomSubtitle>
					</div>
					<div className="card-toolbar d-flex flex-column-reverse flex-lg-row align-items-stretch align-items-lg-center justify-content-end pt-4 pt-lg-0">
						<Button
							style={{ minWidth: 127 }}
							onClick={this.props.investHandler}
							className={"mr-0 mr-lg-40"}
						>
							{t("invest")}
						</Button>

						<CustomInputGroup className={"w-auto"} bg={"darker"}>
							<InputGroupPrepend>
								<InputGroupText>
									<SVG src={SearchIcon} />
								</InputGroupText>
							</InputGroupPrepend>
							<FormControl
								id="PoolsSearch"
								placeholder={t("search")}
								onChange={this.changeInputHandler}
							/>
						</CustomInputGroup>
					</div>
				</div>
				<Content>
					<Tab.Container defaultActiveKey={"Uniswap"}>
						<Row>
							<Col xs={12}>
								<CustomNav
									fill
									variant="pills"
									className={"d-flex flex-row align-items-center flex-nowrap"}
								>
									<CustomNavItem className={"flex-grow-1"}>
										<CustomNavLink eventKey="Uniswap">Uniswap</CustomNavLink>
									</CustomNavItem>
									<CustomNavItem className={"flex-grow-1"}>
										<CustomNavLink eventKey="Balancer">Balancer</CustomNavLink>
									</CustomNavItem>
									<CustomNavItem className={"flex-grow-1"}>
										<CustomNavLink eventKey="Curve">Curve</CustomNavLink>
									</CustomNavItem>
									<CustomNavItem className={"flex-grow-1"}>
										<CustomNavLink eventKey="Yearn">yEarn</CustomNavLink>
									</CustomNavItem>
								</CustomNav>
							</Col>
							<Col xs={12}>
								<Tab.Content className={"bg-transparent"}>
									<Tab.Pane eventKey="Uniswap">
										<PoolsTab
											type={"Uniswap"}
											addLiquidityHandler={this.props.addLiquidityHandler}
											removeLiquidityHandler={this.props.removeLiquidityHandler}
											query={this.state.query}
										/>
									</Tab.Pane>
									<Tab.Pane eventKey="Balancer">
										<PoolsTab
											type={"Balancer"}
											addLiquidityHandler={this.props.addLiquidityHandler}
											removeLiquidityHandler={this.props.removeLiquidityHandler}
											query={this.state.query}
										/>
									</Tab.Pane>
									<Tab.Pane eventKey="Curve">
										<PoolsTab
											type={"Curve"}
											addLiquidityHandler={this.props.addLiquidityHandler}
											removeLiquidityHandler={this.props.removeLiquidityHandler}
											query={this.state.query}
										/>
									</Tab.Pane>
									<Tab.Pane eventKey="Yearn">
										<PoolsTab
											type={"Yearn"}
											addLiquidityHandler={this.props.addLiquidityHandler}
											removeLiquidityHandler={this.props.removeLiquidityHandler}
											query={this.state.query}
										/>
									</Tab.Pane>
								</Tab.Content>
							</Col>
						</Row>
					</Tab.Container>
				</Content>
				{/*end::body*/}
			</ResponsiveCard>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		darkMode: state.user.userDarkMode,
	};
};

export default connect(mapStateToProps)(withTranslation()(PoolsCard));
