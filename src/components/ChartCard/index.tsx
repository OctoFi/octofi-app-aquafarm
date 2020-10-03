import React, { Component } from 'react';
import Chart from '../Chart';

class ChartCard extends Component {
    state = {
        series: [{
            name: 'Performance',
            data: [20, 5, 32, 28, 25, 12, 30, 28, 13, 24, 25, 35],
        }],
        selected: 'year',
        options: [
            {
                title: '1 Day',
                id: 'day',
            },
            {
                title: '1 Week',
                id: 'week',
            },
            {
                title: '1 Month',
                id: 'month',
            },
            {
                title: '6 Month',
                id: 'six_month',
            },
            {
                title: '1 Year',
                id: 'year',
            },
        ]
    }


    changeOption = (id: string) => {
        this.setState({
            selected: id
        })
    }

    render() {
        // @ts-ignore
        let {chartColor, className} = this.props;
        return (
            <div className={`card card-custom ${className}`}>

                {/* begin::Header */}
                <div className="card-header border-0 pt-5">
                    <div className="card-title">
                        <div className="card-label">
                            <div className="font-weight-bolder">Portfolio Performance</div>
                        </div>
                    </div>
                    <div className="card-toolbar">
                        {this.state.options.map(option => {
                            return (
                                <button
                                    onClick={this.changeOption.bind(this, option.id)}
                                    className={`btn btn-sm ${this.state.selected === option.id ? 'btn-success' : 'btn-light-success'} px-4 mr-2 btn-inline`}
                                >
                                    {option.title}
                                </button>
                            )
                        })}
                    </div>
                </div>
                {/* end::Header */}

                {/* begin::Content */}
                <div className="card-body d-flex flex-column px-0">
                    {/* begin::Chart */}
                    <Chart
                        series={this.state.series}
                        categories={[
                            "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                        ]}
                        chartColor={chartColor}
                        height={300}
                    />
                    {/* end::Chart */}
                </div>
                {/* end::Content */}
            </div>
        )
    }
};

export default ChartCard;