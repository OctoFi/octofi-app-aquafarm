import React from "react";
import styled from "styled-components";

import ArrowRightLongIcon from "../Icons/ArrowRightLong";
import { Link } from "react-router-dom";

const IconWrapper = styled.div`
	width: 24px;
	height: 24px;
	border-radius: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
`;

const SeeMore = (props) => {
	return (
		<Link to={props.to}>
			<div className="d-flex align-items-center justify-content-center h-100 pl-3">
				<span className="text-primary mr-3 font-weight-normal font-size-base">See All</span>
				<IconWrapper className={"bg-primary"}>
					<ArrowRightLongIcon fill={"#fff"} size={16} />
				</IconWrapper>
			</div>
		</Link>
	);
};

export default SeeMore;
