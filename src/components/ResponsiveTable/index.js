import styled from "styled-components";

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
`;

const Header = styled.div`
	display: flex;
	flex-direction: column;
	margin: -15px -15px 20px;
	padding: 20px 16px 15px;
	border-bottom: 1px solid ${({ theme }) => theme.text3};
`;
const HeaderTitle = styled.span`
	display: block;
	margin-bottom: 1rem;
	font-size: 0.75rem;
	font-weight: 400;
	color: ${({ theme }) => theme.text1};
`;

const HeaderValue = styled.span`
	display: block;
	font-size: 0.875rem;
	font-weight: 400;
	color: ${({ theme }) => theme.text1};
`;

const Row = styled.div`
	border-radius: 18px;
	border: ${({ withoutBorder, theme }) => (withoutBorder ? "none" : `1px solid ${theme.text4}`)};
	padding: ${({ withoutBorder }) => (withoutBorder ? "0" : "15px")};

	&:not(:last-child) {
		margin-bottom: 10px;
	}
`;

const Field = styled.div`
	display: flex;
	align-items: ${({ centered }) => (centered ? "center" : "flex-start")};
	justify-content: ${({ direction }) => (direction !== "rtl" ? "flex-start" : "space-between")};

	&:not(:last-child) {
		margin-bottom: 20px;
	}
`;

const Desc = styled.span`
	font-size: ${({ size }) => (size === "lg" ? "0.875rem" : "0.75rem")};
	font-weight: 400;
	display: flex;
	min-width: 100px;
`;

const Value = styled.div`
	flex: 1;
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	justify-content: ${({ direction }) => (direction === "rtl" ? "flex-end" : "flex-start")};
	text-align: ${({ direction }) => (direction === "rtl" ? "right" : "left")};
	padding-top: ${({ withPadding }) => (withPadding ? "12px" : "0")};
`;

const ResponsiveTable = ({ data, columns, breakpoint, ...props }) => {
	return (
		<Wrapper className={`d-flex d-${breakpoint}-none`}>
			{data.map((row, index) => {
				return (
					<Row key={`row-${index}`} withoutBorder={props.withoutBorder}>
						{props.hasOwnProperty("headerIndex") && (
							<Header>
								<HeaderTitle>{columns[props.headerIndex].text}</HeaderTitle>
								<HeaderValue>
									{columns[props.headerIndex].formatter(
										null,
										row,
										index,
										columns[props.headerIndex].hasOwnProperty("formatExtraData")
											? columns[props.headerIndex].formatExtraData
											: {}
									)}
								</HeaderValue>
							</Header>
						)}
						{columns.map((col, colIndex) => {
							if (props.hasOwnProperty("headerIndex") && colIndex === props.headerIndex) {
								return null;
							}
							return (
								<Field
									key={col.dataField}
									direction={props.direction}
									centered={props.centered && !col.notCentered}
								>
									{col.isAction ? (
										<Value withPadding direction={props.direction}>
											{col.formatter(
												null,
												row,
												index,
												col.hasOwnProperty("formatExtraData") ? col.formatExtraData : {}
											)}
										</Value>
									) : (
										<>
											<Desc size={props.size}>{col.text}</Desc>
											<Value direction={props.direction}>
												{col.formatter(
													null,
													row,
													index,
													col.hasOwnProperty("formatExtraData") ? col.formatExtraData : {}
												)}
											</Value>
										</>
									)}
								</Field>
							);
						})}
					</Row>
				);
			})}
		</Wrapper>
	);
};

export default ResponsiveTable;
