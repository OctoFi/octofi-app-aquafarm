import React, { Component } from "react";
import styled from "styled-components";
import Loading from "../Loading";

const Wrapper = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 10999;
	background-color: ${({ theme }) => theme.bg1};
	background-image: ${({ theme }) => theme.splashBG};
	display: flex;
	visibility: ${(props) => (props.loaded ? "hidden" : "visible")};
	opacity: ${(props) => (props.loaded ? 0 : 1)};
	align-items: center;
	justify-content: center;
	transition: all ease 0.4s;
`;

class SplashScreen extends Component {
	render() {
		return (
			<Wrapper loaded={false}>
				<Loading width={"88"} height={"88"} color={"primary"} active={true} id={"splash-screen-loading"} />
			</Wrapper>
		);
	}
}

export default SplashScreen;
