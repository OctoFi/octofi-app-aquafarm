import React, {useMemo} from 'react';
import Chart from 'react-apexcharts';
import {useHtmlClassService} from "../_metronic/layout";
// @ts-ignore
import objectPath from "object-path";


const CustomChart = ({chartColor, height, series, categories}: {
    chartColor: string | null,
    height: number,
    series: any,
    categories: any,
}) => {
    const uiService = useHtmlClassService();
    const layoutProps = useMemo(() => {
        return {
            colorsGrayGray500: objectPath.get(
                uiService.config,
                "js.colors.gray.gray500"
            ),
            colorsGrayGray300: objectPath.get(
                uiService.config,
                "js.colors.gray.gray300"
            ),
            colorsThemeBaseColor: objectPath.get(
                uiService.config,
                `js.colors.theme.base.${chartColor}`
            ),
            colorsThemeLightColor: objectPath.get(
                uiService.config,
                `js.colors.theme.light.${chartColor}`
            ),
            fontFamily: objectPath.get(uiService.config, "js.fontFamily"),
        };
    }, [uiService, chartColor]);

    return (
        <Chart
            height={height}
            series={series}
            options={getChartOption(layoutProps, categories, height)}
            />
    )
}

function getChartOption(layoutProps: { colorsGrayGray500: any; colorsGrayGray300: any; colorsThemeBaseColor: any; colorsThemeLightColor: any; fontFamily: any; }, categories: any, height: any) {
    return {
        chart: {
            id: 'area-datetime',
            type: "area",
            height: height,
            toolbar: {
                show: false,
            },
            zoom: {
                enabled: false,
            },
            sparkline: {
                enabled: true,
            },
        },
        plotOptions: {},
        legend: {
            show: false,
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            curve: "smooth",
            show: true,
            width: 3,
            colors: [layoutProps.colorsThemeBaseColor],
        },
        xaxis: {
            categories,
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
            labels: {
                show: false,
                style: {
                    colors: layoutProps.colorsGrayGray500,
                    fontSize: "12px",
                    fontFamily: layoutProps.fontFamily,
                },
            },
            crosshairs: {
                show: false,
                position: "front",
                stroke: {
                    color: layoutProps.colorsGrayGray300,
                    width: 1,
                    dashArray: 3,
                },
            },
            tooltip: {
                enabled: false,
                formatter: undefined,
                offsetY: 0,
                style: {
                    fontSize: "12px",
                    fontFamily: layoutProps.fontFamily,
                },
            },
        },
        yaxis: {
            labels: {
                show: false,
                style: {
                    colors: layoutProps.colorsGrayGray500,
                    fontSize: "12px",
                    fontFamily: layoutProps.fontFamily,
                },
            },
        },
        states: {
            normal: {
                filter: {
                    type: "none",
                    value: 0,
                },
            },
            hover: {
                filter: {
                    type: "none",
                    value: 0,
                },
            },
            active: {
                allowMultipleDataPointsSelection: false,
                filter: {
                    type: "none",
                    value: 0,
                },
            },
        },
        tooltip: {
            style: {
                fontSize: "12px",
                fontFamily: layoutProps.fontFamily,
            },
            y: {
                formatter: function(val: number) {
                    return "$" + val;
                },
            },
        },
        colors: [layoutProps.colorsThemeLightColor],
        markers: {
            colors: [layoutProps.colorsThemeLightColor],
            strokeColor: [layoutProps.colorsThemeBaseColor],
            strokeWidth: 3,
        },
        padding: {
            top: 0,
            bottom: 0,
        },
    };
}


export default CustomChart;