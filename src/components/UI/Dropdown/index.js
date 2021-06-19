import styled from "styled-components";
import { useState, useCallback } from "react";
import SVG from "react-inlinesvg";
import { darken } from "polished";

const Wrapper = styled.div`
	position: relative;
	z-index: 2;
	perspective: 800px;
`;

const Button = styled.button`
	height: ${({ size }) => (size === "sm" ? "32px" : "56px")};
	padding-left: ${({ size }) => (size === "sm" ? "16px" : "20px")};
	padding-right: ${({ size }) => (size === "sm" ? "22px" : "24px")};
	border-radius: ${({ size }) => (size === "sm" ? "12px" : "18px")};
	background-color: ${({ variant, theme }) =>
		variant === "secondary" ? theme.secondaryLight : theme.primaryLight};
	transition: 0.4s ease all;
	display: flex;
	align-items: center;
	justify-content: space-between;
	color: ${({ variant, theme }) => (variant === "secondary" ? theme.secondary : theme.primary)};
	border: none;

	&:hover {
		background-color: ${({ variant, theme }) => (variant === "secondary" ? theme.secondary : theme.primary)};
		color: ${({ theme }) => theme.text1};
	}

	&:focus,
	&:active {
		outline: none;
		background-color: ${({ variant, theme }) =>
			variant === "secondary" ? darken(0.1, theme.secondary) : darken(0.1, theme.primary)};
		box-shadow: 0 0 0 5px
			${({ variant, theme }) => (variant === "secondary" ? theme.secondaryLight : theme.primaryLight)};
		color: ${({ theme }) => theme.text1};
	}

	@media (max-width: 991px) {
		height: 32px;
		font-size: 0.875rem;
		border-radius: 12px;
		padding-left: 15px;
		padding-right: 21px;
	}
`;

const ButtonText = styled.span`
	color: currentColor;
	font-weight: 500;
	font-size: 1rem;
	padding-right: 1rem;

	@media (max-width: 991px) {
		padding-right: 0.5rem;
	}
`;

const DropdownList = styled.div`
	background-color: #f2f2f2;
	box-shadow: -1px 11px 43px rgba(0, 0, 0, 0.12);
	border-radius: 12px;
	position: absolute;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	right: 0;
	top: ${({ size }) => (size === "sm" ? `42px` : `66px`)};
	min-width: 100%;
	padding: ${({ size }) => (size === "sm" ? `14px` : `20px`)};
	transition: 0.5s ease all;
	transform-style: preserve-3d;
	transform-origin: top center;
	transform: ${({ isOpen }) => (isOpen ? `translateY(0) scale(1)` : `translateY(20px) scale(0.8)`)};
	opacity: ${({ isOpen }) => (isOpen ? `1` : `0`)};
	visibility: ${({ isOpen }) => (isOpen ? `visible` : `hidden`)};

	@media (max-width: 991px) {
		top: 42px;
	}
`;

const DropdownItem = styled.button`
	border: none;
	background-color: transparent;
	font-weight: 500;
	font-size: 1rem;
	color: #232429;
	white-space: nowrap;
	padding: 0;

	@media (max-width: 991px) {
		font-size: 0.875rem;
	}

	&:hover,
	&:focus,
	&:active {
		outline: none;
		text-decoration: none;
		box-shadow: none;
	}

	&:not(:last-child) {
		margin-bottom: ${({ size }) => (size === "sm" ? `14px` : `20px`)};
	}
`;

const Dropdown = (props) => {
	const [active, setActive] = useState(props.items[props.active] || null);
	const [open, setOpen] = useState(false);

	const toggleModal = useCallback(() => {
		setOpen((open) => !open);
	}, []);

	const changeActiveHandler = useCallback(
		(item) => {
			setActive(item);
			setOpen(false);
			if (props.hasOwnProperty("onChange")) {
				props.onChange(item.value);
			}
		},
		[props.onChange]
	);

	return (
		<Wrapper>
			<Button variant={props.variant} onClick={toggleModal} isOpen={open} size={props.size || "md"}>
				<ButtonText>{active ? active.title : props.placeholder || "Select"}</ButtonText>
				<SVG src={require("../../../assets/images/global/dropdown.svg").default} />
			</Button>
			<DropdownList isOpen={open} size={props.size || "md"}>
				{props.items.map((item, i) => {
					return (
						<DropdownItem size={"sm"} onClick={changeActiveHandler.bind(this, item)} key={`dropdown-${i}`}>
							{item.title}
						</DropdownItem>
					);
				})}
			</DropdownList>
		</Wrapper>
	);
};

export default Dropdown;
