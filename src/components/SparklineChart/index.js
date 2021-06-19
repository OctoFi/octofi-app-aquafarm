import ReactApexChart from "react-apexcharts";
import { Component } from "react";

const primaryColor = `#34D399`;
const secondaryColor = `#EB6B6B`;

const colors = {
	primary: primaryColor,
	secondary: secondaryColor,
};

class SparklineChart extends Component {
	constructor(props) {
		super(props);

		this.state = {
			hasError: false,
			series: [
				{
					name: "Market",
					data: props.data
						? props.data.map((price, index) => {
								return {
									x: 100 + index,
									y: price,
								};
						  })
						: [],
				},
			],
			currentData: null,
			options: {
				chart: {
					id: "area-datetime",
					height: 40,
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
				},
				dataLabels: {
					enabled: false,
				},
				markers: {
					size: 0,
					style: "hollow",
				},
				stroke: {
					width: 1,
					curve: "straight",
				},
				colors: [colors[props.theme || "primary"]],
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
					enabled: false,
				},
				grid: {
					borderColor: "#fc0",
					clipMarkers: false,
					yaxis: {
						lines: {
							show: false,
						},
					},
				},
				fill: {
					gradient: {
						enabled: true,
						opacityFrom: 0.55,
						opacityTo: 0,
					},
				},
				padding: {
					top: 0,
					bottom: 0,
				},
			},
		};
	}

	componentDidCatch() {
		this.setState({
			hasError: true,
		});
	}

	render() {
		return this.state.hasError ? null : (
			<ReactApexChart
				options={this.state.options}
				series={this.state.series}
				type="line"
				height={this.props.minHeight || 40}
				width={this.props.minWidth || 120}
			/>
		);
	}
}

export default SparklineChart;
