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
import { useEffect } from 'react';
import { useState } from 'react';
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);
import dayjs from 'dayjs';


export default function LineGraph({ currentYear, previousYear, yearSelected, title, className='', monthHired, yearHired, }) {
    const [currYear, setCurrYear] = useState(currentYear);
    const [prevYear, setPrevYear] = useState(previousYear);
    const curr = dayjs().year()
    const currMonth = dayjs().month()

    useEffect(() => {
        if(curr === yearSelected){
            const d = currentYear?.map((d, i) => {
                if(i <= currMonth){
                    return d;
                }
                return null;
            })
            setCurrYear(d)
        }else if(yearSelected > yearHired){
            setCurrYear(currentYear)
        }else if(yearSelected == yearHired){
            curerntDateHired(setCurrYear, currentYear)
        }else{
            setCurrYear([null, null, null, null, null, null, null, null, null, null, null, null]);
        }
        if(yearSelected-1 > yearHired){
            setPrevYear(previousYear)
        }else if(yearSelected-1 == yearHired){
            curerntDateHired(setPrevYear, previousYear)
        }else{
            setPrevYear([null, null, null, null, null, null, null, null, null, null, null, null]);
        }
    }, [currentYear, previousYear, monthHired, yearHired, yearSelected])

    function curerntDateHired(set, data){
        if(data){
            const d = data?.map((d, i) => {
                if(i+1 >= monthHired){
                    return d;
                }
                return null;
            })
            set(d);
        }
    }

    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: yearSelected - 1,
                borderColor: '#155E75',
                backgroundColor: '#155E75',
                data: prevYear,
            },
            {
                label: yearSelected,
                borderColor: '#9D174D',
                backgroundColor: '#9D174D',
                data: currYear,
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