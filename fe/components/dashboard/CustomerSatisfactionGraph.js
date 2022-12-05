import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function CustomerSatisfactionGraph(){
	const data = {
		datasets: [
		{
			backgroundColor: '#3F51B5',
			barPercentage: 0.5,
			barThickness: 12,
			borderRadius: 4,
			categoryPercentage: 0.5,
			data: [10, 10],
			label: 'This year',
			maxBarThickness: 10
		},
		{
			backgroundColor: '#EEEEEE',
			barPercentage: 0.5,
			barThickness: 12,
			borderRadius: 4,
			categoryPercentage: 0.5,
			data: [4321432143, 321412],
			label: 'Last year',
			maxBarThickness: 10
		}
		],
		labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
	};

	const options = {
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

    return(
        <div>
			<div className="h-[200px]">
				<Bar
					data={data}
					options={options}
				/>
			</div>
        </div>
    )
}