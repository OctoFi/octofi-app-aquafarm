import React from "react";
import styled from "styled-components";
import { RowBetween } from "../Row";
import { AutoColumn } from "../Column";
import { transparentize } from "polished";

const Wrapper = styled(AutoColumn)``;

const Grouping = styled(RowBetween)`
	width: 50%;
`;

const Circle = styled.div<{ confirmed?: boolean; disabled?: boolean }>`
	min-width: 30px;
	min-height: 30px;
	background-color: ${({ theme, confirmed, disabled }) =>
		disabled ? theme.bg1 : confirmed ? theme.green1 : theme.primary};
	border-radius: 0.5rem;
	color: ${({ theme }) => theme.text1};
	display: flex;
	align-items: center;
	justify-content: center;
	line-height: 8px;
	font-size: 12px;
`;

const CircleRow = styled.div`
	width: calc(100% - 30px);
	display: flex;
	align-items: center;
`;

const Connector = styled.div<{ prevConfirmed?: boolean; disabled?: boolean }>`
	width: 100%;
	height: 2px;
	background: linear-gradient(
		90deg,
		${({ theme, prevConfirmed, disabled }) =>
				disabled ? theme.bg1 : transparentize(0.5, prevConfirmed ? theme.green1 : theme.primary)}
			0%,
		${({ theme, prevConfirmed, disabled }) => (disabled ? theme.bg1 : prevConfirmed ? theme.primary : theme.bg1)}
			80%
	);
	opacity: 0.6;
`;

interface ProgressCirclesProps {
	steps: boolean[];
	disabled?: boolean;
}

/**
 * Based on array of steps, create a step counter of circles.
 * A circle can be enabled, disabled, or confirmed. States are derived
 * from previous step.
 *
 * An extra circle is added to represent the ability to swap, add, or remove.
 * This step will never be marked as complete (because no 'txn done' state in body ui).
 *
 * @param steps  array of booleans where true means step is complete
 */
export default function ProgressCircles({ steps, disabled = false, ...rest }: ProgressCirclesProps) {
	return (
		<Wrapper justify={"center"} {...rest}>
			<Grouping>
				{steps.map((step, i) => {
					return (
						<CircleRow key={i}>
							<Circle confirmed={step} disabled={disabled || (!steps[i - 1] && i !== 0)}>
								{step ? "✓" : i + 1}
							</Circle>
							<Connector prevConfirmed={step} disabled={disabled} />
						</CircleRow>
					);
				})}
				<Circle disabled={disabled || !steps[steps.length - 1]}>{steps.length + 1}</Circle>
			</Grouping>
		</Wrapper>
	);
}
