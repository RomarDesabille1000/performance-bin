import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);


export default function LineGraph({ currentYear, previousYear, yearSelected, title, className='' }) {
    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: yearSelected - 1,
                borderColor: '#155E75',
                backgroundColor: '#155E75',
                data: previousYear,
            },
            {
                label: yearSelected,
                borderColor: '#9D174D',
                backgroundColor: '#9D174D',
                data: currentYear,
            },
        ],
    };
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 30
                }
            },
            // title: {
            //     display: true,
            //     text: 'Customer satisfaction',
            //     font: {
            //         size: 16,
            //         fontWeight: "normal",
            //     }
            // },
        },
        cornerRadius: 20,
        layout: { padding: 0 },
        legend: { display: false },
        maintainAspectRatio: false,
        responsive: true,
        scale: {
            ticks: {
                precision: 0
            }
        },
        xAxes: [
            {
                ticks: {
                    fontColor: 'red'
                },
                gridLines: {
                    display: false,
                    drawBorder: false
                }
            }
        ],
        yAxes: [
            {
                ticks: {
                    fontColor: 'blue',
                    beginAtZero: true,
                    min: 0
                },
                gridLines: {
                    borderDash: [2],
                    borderDashOffset: [2],
                    color: 'blue',
                    drawBorder: false,
                    zeroLineBorderDash: [2],
                    zeroLineBorderDashOffset: [2],
                    zeroLineColor: 'blue'
                }
            }
        ],
        tooltips: {
            backgroundColor: '#fff',
            bodyFontColor: 'blue',
            borderColor: 'red',
            borderWidth: 1,
            enabled: true,
            footerFontColor: 'green',
            intersect: false,
            mode: 'index',
            titleFontColor: 'black'
        }
    };

    return (
        <div className={className}>
            <div className="h-[300px]">
				<div className="mb-3">{title}</div>
                <Line
                    options={options}
                    data={data} />
            </div>
        </div>
    )
}