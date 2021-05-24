import React, { useEffect } from "react";
import styled, { css } from "styled-components";
import { animated, useTransition, useSpring } from "react-spring";
import { DialogOverlay, DialogContent } from "@reach/dialog";
import { isMobile } from "react-device-detect";
import "@reach/dialog/styles.css";
import { transparentize } from "polished";
import { useGesture } from "react-use-gesture";

const AnimatedDialogOverlay = animated(DialogOverlay);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const StyledDialogOverlay = styled(AnimatedDialogOverlay)`
	&[data-reach-dialog-overlay] {
		z-index: 1100;
		overflow: hidden;

		display: flex;
		align-items: center;
		justify-content: center;

		background-color: ${({ theme }) => theme.backdrop};
	}
`;

const AnimatedDialogContent = animated(DialogContent);
// destructure to not pass custom props to Dialog DOM element
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const StyledDialogContent = styled(({ minHeight, maxHeight, mobile, isOpen, maxWidth, ...rest }) => (
	<AnimatedDialogContent {...rest} />
)).attrs({
	"aria-label": "dialog",
})`
	overflow-y: ${({ mobile }) => (mobile ? "scroll" : "hidden")};

	&[data-reach-dialog-content] {
		margin: 0 0 2rem 0;
		background-color: ${({ theme }) => theme.modalBG};
		box-shadow: 0 4px 8px 0 ${({ theme }) => transparentize(0.95, theme.shadow1)};
		padding: 0;
		width: 50vw;
		overflow-x: hidden;
		display: flex;
		border-radius: 10px;
		overflow-y: ${({ mobile }) => (mobile ? "scroll" : "hidden")};
		align-self: ${({ mobile }) => (mobile ? "flex-end" : "center")};

		${({ maxWidth }) =>
			maxWidth &&
			css`
				max-width: ${maxWidth}px;
			`}
		${({ maxHeight }) =>
			maxHeight &&
			css`
				max-height: ${maxHeight}vh;
			`}
		${({ minHeight }) =>
			minHeight &&
			css`
				min-height: ${minHeight}vh;
			`}
		${({ theme }) => theme.mediaWidth.upToMedium`
			width: 65vw;
			margin: 0;
		`}
		${({ theme, mobile }) => theme.mediaWidth.upToSmall`
			width:  85vw;
			${
				mobile &&
				css`
					width: 100vw;
					border-radius: 10px;
					border-bottom-left-radius: 0;
					border-bottom-right-radius: 0;
				`
			}
		`}
	}
`;

interface ModalProps {
	isOpen: boolean;
	onDismiss: () => void;
	minHeight?: number | false;
	maxHeight?: number;
	maxWidth?: number;
	initialFocusRef?: React.RefObject<any>;
	children?: React.ReactNode;
}

export default function Modal({
	isOpen,
	onDismiss,
	minHeight = false,
	maxHeight = 90,
	maxWidth = 420,
	initialFocusRef,
	children,
}: ModalProps) {
	const fadeTransition = useTransition(isOpen, null, {
		config: { duration: 200 },
		from: { opacity: 0 },
		enter: { opacity: 1 },
		leave: { opacity: 0 },
	});

	const _getScrollbarWidth = () => {
		const scrollDiv = document.createElement("div");
		scrollDiv.className = "modal-scrollbar-measure";
		document.body.appendChild(scrollDiv);
		const scrollbarWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth;
		document.body.removeChild(scrollDiv);
		return scrollbarWidth;
	};

	useEffect(() => {
		if (isOpen) {
			const PaddingWidth = _getScrollbarWidth();
			document.body.style.paddingRight = `${PaddingWidth}px`;
		}
	}, [isOpen]);

	const [, set] = useSpring(() => ({ y: 0, config: { mass: 1, tension: 210, friction: 20 } }));
	const bind = useGesture({
		onDrag: (state) => {
			set({
				y: state.down ? state.movement[1] : 0,
			});
			if (state.movement[1] > 300 || (state.velocity > 3 && state.direction[1] > 0)) {
				onDismiss();
			}
		},
	});

	return (
		<>
			{fadeTransition.map(
				({ item, key, props }) =>
					item && (
						<StyledDialogOverlay
							key={key}
							style={props}
							onDismiss={() => {
								onDismiss();
								setTimeout(() => {
									document.body.style.paddingRight = `0`;
								}, 200);
							}}
							initialFocusRef={initialFocusRef}
						>
							<StyledDialogContent
								{...(isMobile
									? {
											...bind(),
									  }
									: {})}
								aria-label="dialog content"
								minHeight={minHeight}
								maxHeight={maxHeight}
								maxWidth={maxWidth}
								mobile={isMobile}
							>
								{/* prevents the automatic focusing of inputs on mobile by the reach dialog */}
								{!initialFocusRef && isMobile ? <div tabIndex={1} /> : null}
								{children}
							</StyledDialogContent>
						</StyledDialogOverlay>
					)
			)}
		</>
	);
}
