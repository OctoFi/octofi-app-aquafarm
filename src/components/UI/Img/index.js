import SVG from "react-inlinesvg";
import styled from "styled-components";
import React, { useState, useCallback } from "react";
import QuestionMark from "../../../assets/images/question-mark.svg";

const BadSource = styled.div`
	width: 100%;
	height: 100%;
	border-radius: 300px;
	background-color: ${({ theme }) => theme.text1};
	display: flex;
	align-items: center;
	justify-content: center;
	color: ${({ theme }) => theme.primary};
`;

const Img = ({ src, alt, ...props }) => {
	const [tries, refresh] = useState(0);

	const errorHandler = useCallback(() => {
		refresh(-1);
	}, []);

	if (tries > -1 && src) {
		return <img {...props} src={src} alt={alt} onError={errorHandler} />;
	}

	return (
		<BadSource {...props}>
			<SVG src={QuestionMark} />
		</BadSource>
	);
};

export default Img;
