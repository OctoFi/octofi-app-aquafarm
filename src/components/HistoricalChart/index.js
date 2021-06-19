import React from "react";
import ReactApexChart from "react-apexcharts";
import moment from "moment";
import styled from "styled-components";
import { isMobile } from "react-device-detect";
import { connect } from 'react-redux';

import Loading from "../Loading";
import CurrencyText from "../CurrencyText";
import Observer from "../ComponentObserver";
import "./style.scss";
import {formatMoney} from "../../lib/helper";

const Title = styled.span`
	font-size: ${({ isPrimary }) => (isPrimary ? "1.875rem" : "1.25rem")};
	font-weight: 700;

	@media (max-width: 991px) {
		font-size: 1.25rem;
	}
`;

const Subtitle = styled.span`
	color: ${({ theme }) => theme.text3};
	font-weight: 400;
	font-size: 0.875rem;
`;

const ChartBody = styled.div`
	@media (min-width: 992px) {
		padding-top: ${({ isPrimary }) => (isPrimary ? "0px" : "80px")};
	}

	padding-top: ${({ isPrimary }) => (isPrimary ? "50px" : "80px")};
`;

class HistoricalChart extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			series: [],
			currentData: null,
		};
	}

	getOptions = () => {
		return {
			chart: {
				id: `'area-datetime-${this.props.field}`,
					height: 350,
					toolbar: {
					show: false,
				},
				zoom: {
					enabled: false,
				},
				sparkline: {
					enabled: true,
				},
				animations: {
					enabled: false,
				},
				type: "area",
					dropShadow: {
					color: ["#34D399", "#a890fe", "#0891B2", "#FBAA9E"],
						enabled: !this.props.isPrimary,
						top: 2,
						left: 2,
						blur: 14,
						opacity: 0.4,
				},
			},
			dataLabels: {
				enabled: false,
			},
			markers: {
				size: 0,
					style: "hollow",
			},
			stroke: {
				width: 2,
					curve: "smooth",
			},
			colors: ["#34D399", "#a890fe", "#0891B2", "#FBAA9E"],
				xaxis: {
				type: "datetime",
					tickAmount: 6,
					labels: {
					show: false,
				},

				axisBorder: {
					show: false,
				},

				axisTicks: {
					show: false,
				},
				crosshairs: {
					show: false,
				},
				tooltip: {
					enabled: false,
				},
			},
			yaxis: {
				labels: {
					show: false,
				},

				axisBorder: {
					show: false,
				},
			},
			plotOptions: {},
			tooltip: {
				theme: this.props.darkMode ? 'dark' : 'light',
					x: {
					format: "yyyy MMM dd, HH:mm:ss",
				},
				y: {
					formatter: (value) => {
						this.setState({
							currentData: value,
						});
						return formatMoney(value, value < 0.1 ? 6 : 4);
					},
				},
				custom: ({ seriesIndex, dataPointIndex, w }) => {
					const series = w.config.series[seriesIndex];
					const [, value, date] = series.data[dataPointIndex];
					const name = series.name;
					return `
                            <div class="chart__tooltip d-flex flex-column justify-content-between">
                                <div class="d-flex flex-column mb-3">
                                    <span class="chart__tooltip-title">${name}</span>
                                    <span class="chart__tooltip-value">$${formatMoney(value, value < 0.1 ? 6 : 4)}</span>
                                </div>
                                
                                <div class="d-flex flex-column">
                                    <span class="chart__tooltip-title">Date</span>
                                    <span class="chart__tooltip-value">${moment(date).format("YYYY/MM/DD HH:mm")}</span>
                                </div>
                            </div>
                        `;
				},
			},
			grid: {
				borderColor: "rgba(255, 255, 255, 0.25)",
					clipMarkers: false,
					yaxis: {
					lines: {
						show: false,
					},
				},
			},
			fill: {
				gradient: {
					opacityFrom: this.props.isPrimary ? 0.55 : 0,
						opacityTo: 0,
				},
			},
			padding: {
				top: 0,
					bottom: 0,
			},
			legend: {
				show: true,
					position: "top",
					horizontalAlign: isMobile ? "left" : "right",
					fontSize: "14px",
					fontFamily: "inherit",
					fontWeight: 400,
					floating: true,
					labels: {
					colors: this.props.darkMode ? "white" : 'black',
					useSeriesColors: false,
				},
				markers: {
					width: 8,
						height: 8,
						strokeWidth: 0,
						strokeColor: "#fff",
						fillColors: undefined,
						radius: 8,
						customHTML: undefined,
						onClick: undefined,
						offsetX: -10,
						offsetY: -3,
				},
				itemMargin: {
					horizontal: isMobile ? 15 : this.props.isPrimary ? 15 : 7,
						vertical: isMobile ? 7 : 0,
				},
			},
		}
	}

	getMaximum(series) {
		const lengths = series.map((item) => item.length);
		let max = 0;
		for (let i in lengths) {
			if (lengths[i] > max) {
				max = lengths[i];
			}
		}

		return max;
	}

	updateSeries = (data) => {
		const titles = {
			1: "1 Day",
			7: "1 Week",
			30: "1 Month",
			365: "1 Year",
		};
		const rows = Object.keys(data).map((key) => data[key][this.props.field] || []);
		const maximumLength = this.getMaximum(rows);
		const series = [];
		for (let i in data) {
			let row = data[i][this.props.field] || [];
			if (row.length > 0) {
				let step = maximumLength / row.length;
				row = row.map((item, index) => [Math.floor(100 + index * step), item[1], item[0]]);
				series.push({
					name: titles[i],
					data: row,
				});
			}
		}
		this.setState({
			series,
		});
	};

	render() {
		return (
			<div id="chart" className={this.props.isPrimary ? "primary-chart" : ""}>
				<Observer value={this.props.data} didUpdate={this.updateSeries} />
				<div className="d-flex align-items-center justify-content-between card-spacer flex-grow-1">
					<div className="d-flex flex-column text-left">
						<Title isPrimary={this.props.isPrimary}>
							<CurrencyText>{this.state.currentData || this.props.currentData}</CurrencyText>
						</Title>
						<Subtitle>{this.props.description}</Subtitle>
					</div>
				</div>
				<ChartBody isPrimary={this.props.isPrimary}>
					{this.props.loading ? (
						<div
							className="d-flex align-items-center justify-content-center py-5 w-100"
							style={{
								minHeight: this.props.minHeight || isMobile ? (this.props.isPrimary ? 423 : 293) : 350,
							}}
						>
							<Loading
								width={40}
								height={40}
								color={this.props.variant}
								active
								id={"historical-" + this.props.variant}
							/>
						</div>
					) : (
						<ReactApexChart
							options={this.getOptions()}
							series={this.state.series}
							type="area"
							height={this.props.minHeight || isMobile ? (this.props.isPrimary ? 423 : 293) : 350}
						/>
					)}
				</ChartBody>
			</div>
		);
	}
}

const mapStateToProps = state => {
	return {
		darkMode: state.user.userDarkMode,
	}
}

export default connect(mapStateToProps)(HistoricalChart);
