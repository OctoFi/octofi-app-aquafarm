import { useCallback, useContext, useRef, useState } from "react";
import SVG from "react-inlinesvg";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "styled-components";

import ArrowDown from "../../../assets/images/global/arrow-down.svg";
import * as Styled from "./styleds";

const SideDrawerItem = ({ items, title, ...props }) => {
	const theme = useContext(ThemeContext);
	const body = useRef(null);
	const [open, setOpen] = useState(false);
	const [height, setHeight] = useState(0);
	const { t } = useTranslation();

	const toggleOpen = useCallback(() => {
		if (open) {
			setOpen(false);
			setHeight(0);
		} else {
			if (body.current) {
				const { height } = body.current.getBoundingClientRect();
				setOpen((open) => !open);
				setHeight(height || 0);
			}
		}
	}, [body.current, open]);

	return (
		<Styled.Wrapper>
			<Styled.Header onClick={toggleOpen}>
				{props.icon ? (
					<Styled.TitleContainer>
						<Styled.Icon>{props.icon}</Styled.Icon>
						<Styled.Title>{t(`menu.${title}`)}</Styled.Title>
					</Styled.TitleContainer>
				) : (
					<Styled.Title>{t(`menu.${title}`)}</Styled.Title>
				)}
				<Styled.IconContainer open={open}>
					<SVG src={ArrowDown} style={{ color: theme.primary }} />
				</Styled.IconContainer>
			</Styled.Header>
			<Styled.Collapse height={height}>
				<Styled.Body ref={body}>
					{Object.values(items).map((item, index) => {
						return (
							<Styled.BodyItem to={item.path} key={`${title}-${index}`}>
								{t(`menu.${item.title}`)}
							</Styled.BodyItem>
						);
					})}
				</Styled.Body>
			</Styled.Collapse>
		</Styled.Wrapper>
	);
};

export default SideDrawerItem;
