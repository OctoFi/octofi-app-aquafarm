import React from 'react';
import ReactApexChart from 'react-apexcharts';
import {CircularProgress} from "@material-ui/core";

import CurrencyText from "../CurrencyText";

class HistoricalChart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentData: null,
            options: {
                chart: {
                    id: 'area-datetime',
                    height: 350,
                    toolbar: {
                        show: false
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
                    type: 'area',
                },
                dataLabels: {
                    enabled: false
                },
                markers: {
                    size: 0,
                    style: 'hollow',
                },
                stroke: {
                    width: 2,
                    curve: 'smooth'
                },
                colors: [this.props.color],
                xaxis: {
                    type: 'datetime',
                    tickAmount: 6,
                    labels: {
                        show: false
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
                        show: false
                    },

                    axisBorder: {
                        show: false,
                    },
                },
                plotOptions: {},
                tooltip: {
                    theme: this.props.darkMode ? 'dark' : 'light',
                    x: {
                        format: 'yyyy MMM dd, HH:mm:ss'
                    },
                    y: {
                        formatter: (value) => {
                            this.setState({
                                currentData: value
                            })
                            return value < 0.1 ? value.toFixed(6) : value.toFixed(4);
                        }
                    }
                },
                grid: {
                    borderColor: this.props.theme.bg2,
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
                },
            },
        };
    }

    updateData(days) {
        this.setState({
            days
        })
        this.props.changeRangeHandler(days);
    }

    render() {
        return (
            <div id="chart">
                <div className="d-flex align-items-center justify-content-between card-spacer flex-grow-1">
                    <div className="d-flex flex-column text-left">
                        <span className={`text-${this.props.variant} font-weight-bolder font-size-h1 mb-0`}>
                            <CurrencyText>{this.state.currentData || this.props.currentData}</CurrencyText>
                        </span>
                        <span className="text-muted font-weight-bold mt-1">{this.props.description}</span>
                    </div>
                    <div className="toolbar">
                        <button
                                className={`btn ${this.props.days === 1 ? `btn-${this.props.variant}` : `btn-outline-${this.props.variant}`} ml-1`}
                                onClick={this.updateData.bind(this, 1)}>
                            1D
                        </button>
                        <button
                                className={`btn ${this.props.days === 30 ? `btn-${this.props.variant}` : `btn-outline-${this.props.variant}`} ml-1`}
                                onClick={this.updateData.bind(this, 30)}>
                            1M
                        </button>
                        <button
                                className={`btn ${this.props.days === 90 ? `btn-${this.props.variant}` : `btn-outline-${this.props.variant}`} ml-1`}
                                onClick={this.updateData.bind(this, 90)}>
                            3M
                        </button>
                        <button id="ytd"
                                className={`btn ${this.props.days === 180 ? `btn-${this.props.variant}` : `btn-outline-${this.props.variant}`} ml-1`}
                                onClick={this.updateData.bind(this, 180)}>
                            6M
                        </button>
                        <button id="all"
                                className={`btn ${this.props.days === 365 ? `btn-${this.props.variant}` : `btn-outline-${this.props.variant}`} ml-1`}
                                onClick={this.updateData.bind(this, 365)}>
                            1Y
                        </button>
                        <button id="all"
                                className={`btn ${this.props.days === 'max' ? `btn-${this.props.variant}` : `btn-outline-${this.props.variant}`} ml-1`}
                                onClick={this.updateData.bind(this, 'max')}>
                            All
                        </button>
                    </div>
                </div>
                <div id="chart-timeline">
                    {this.props.loading ? (
                        <div className="d-flex align-items-center justify-content-center py-6 w-100" style={{ minHeight: this.props.minHeight || 350 }}>
                            <CircularProgress color={'primary'} style={{ width: 40, height: 40 }}/>
                        </div>
                    ) : (
                        <ReactApexChart options={this.state.options} series={this.props.series} type="area" height={this.props.minHeight || 350} />
                    )}
                </div>
            </div>


        );
    }
}

export default HistoricalChart;