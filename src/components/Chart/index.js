import { Component } from 'react';
import ReactApexChart from "react-apexcharts";
import moment from 'moment';
import { isMobile } from 'react-device-detect';

import './style.scss';

class Chart extends Component {
    constructor(props) {
        super(props);

        this.state = {
            options: {
                chart: {
                    id: 'area-datetime',
                    height: 400,
                    toolbar: {
                        show: false
                    },
                    zoom: {
                        enabled: false,
                    },
                    sparkline: {
                        enabled: false,
                    },
                    animations: {
                        enabled: false,
                    },
                    type: 'area',
                },
                markers: {
                    size: 0,
                    style: 'hollow',
                },
                dataLabels: {
                    enabled: false,
                },
                stroke: {
                    width: 4,
                    curve: 'smooth'
                },
                colors: [props.color],
                xaxis: {
                    categories: props.categories,
                    tickAmount: 6,
                    labels: {
                        show: true,
                        formatter: (value, timestamp) => {
                            const m = moment(value);
                            return m.format(
                                props.selected === 'day' ? 'DD MMM, HH:mm' :
                                props.selected === 'week' || props.selected === 'month' ? "DD MMM" :
                                props.selected === 'six_month' || props.selected === 'year' ? 'YYYY-MM-DD' : 'DD MMM'
                            );
                        },
                        style: {
                            cssClass: 'chart__label',
                        },
                        rotate: !isMobile ? 0 : -89,

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
                        show: true,
                        style: {
                            cssClass: 'chart__label',
                            fontSize: '14px',
                            fontWeight: '500',
                        },
                        formatter: (val) => {
                            return val;
                        }
                    },

                    axisBorder: {
                        show: false,
                    },
                },
                plotOptions: {},
                tooltip: {
                    theme: 'dark',
                    y: {
                        formatter: (value) => {
                            return "$" + value;
                        }
                    },
                    custom: ({series, seriesIndex, dataPointIndex, w}) => {
                        const category = w?.globals?.lastXAxis?.categories[dataPointIndex];
                        return `
                            <div class="chart__tooltip d-flex flex-column justify-content-between">
                                <div class="d-flex flex-column mb-3">
                                    <span class="chart__tooltip-title">Performance</span>
                                    <span class="chart__tooltip-value">$${series[seriesIndex][dataPointIndex]?.toFixed(4)}</span>
                                </div>
                                <div class="d-flex flex-column">
                                    <span class="chart__tooltip-title">Date</span>
                                    <span class="chart__tooltip-value">${category}</span>
                                </div>
                            </div>
                        `
                    }
                },
                grid: {
                    borderColor: props.theme.modalBG,
                    clipMarkers: false,
                    yaxis: {
                        lines: {
                            show: false
                        }
                    }
                },
                fill: {
                    gradient: {
                        enabled: true,
                        opacityFrom: 0.55,
                        opacityTo: 0
                    }
                },
                padding: {
                    top: 0,
                    bottom: 0,
                    right: 0,
                    left: 0
                },
            },
        }
    }
    render() {
        return (
            <ReactApexChart options={this.state.options} series={this.props.series} type="area" height={this.props.minHeight || 400} />
        )
    }
}

export default Chart;