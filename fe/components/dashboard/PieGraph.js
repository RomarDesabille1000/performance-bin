import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
ChartJS.register(ArcElement, Tooltip, Legend);

export default function Pie({ previousTotal, currentTotal, selectedYear, displayCurrTotal ='', displayPrevTotal='', className="", percentage=false }){
    let bgColors = [
        '#285973', '#9D174D'
    ]

    const data = {
        labels: [selectedYear-1, selectedYear],
        datasets: [
            {
                data: previousTotal == 0 && currentTotal == 0 ? [0, 1] : 
                    [percentage ? previousTotal * 0.50: previousTotal, percentage ? currentTotal * 0.50: currentTotal],
                backgroundColor: bgColors,
                borderColor: bgColors,
                borderWidth: 1,
            },
        ],
    };

    const options = {
        cutoutPercentage: 80,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 30
                }
            },
        },
        layout: { padding: 0 },
        legend: {
        display: false
        },
            maintainAspectRatio: false,
            responsive: true,
            tooltips: {
            backgroundColor: '#000000',
            bodyFontColor: '#000000',
            borderColor: '#000000',
            borderWidth: 1,
            enabled: true,
            footerFontColor: '#000000',
            intersect: false,
            mode: 'index',
            titleFontColor: '#000000',
        }
    };

    return(
        <div className={`pt-[70px] pb-[80px] ${className}`}>
			<div className="h-[300px]">
				<Doughnut
					data={data}
					options={options}
				/>
                <div className="flex justify-center flex-col items-center mt-5">
                    <div>
                        {selectedYear-1}: {displayPrevTotal ? displayPrevTotal() : previousTotal} {percentage? '%': ''}
                    </div>
                    <div>
                        {selectedYear}: {displayCurrTotal ? displayCurrTotal() : currentTotal} {percentage? '%': ''}
                    </div>
                </div>
			</div>
        </div>
    )
}