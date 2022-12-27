import { useEffect, useState } from "react";
import useSWR from "swr";
import AdminLayout from "../../components/AdminLayout";
import SelectUserModal from "../../components/dashboard/SelectUserModal";
import TotalCard from "../../components/dashboard/TotalCard";
import CustomerSatisfactionGraph from "../../components/dashboard/CustomerSatisfactionGraph";
import dayjs from "dayjs";
import { useRef } from "react";
import { currencyDisplay, DoubleType } from "../../helper/numbers";
import Loader from "../../components/Loader";
import LineGraph from "../../components/dashboard/LineGraph";
import BarGraphN from "../../components/dashboard/BarGraph";

export default function HRDashboard() {
	const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchText, setSearchText] = useState('')

	const [employeeTarget, setEmployeeTarget] = useState({
		id: -1,
		name: '',
		position: '',
		dateHired: '',
	})
	const [employeeSelected, setEmployeeSelected] = useState({
		id: -1,
		name: '',
		position: '',
		dateHired: '',
	})

    const [pageIndex, setPageIndex] = useState(1);
	const [year, setYear] = useState(dayjs().year())
    const { data: employees } = useSWR(`users/employees/?lastname=${searchText}&page=${pageIndex}`, {
        revalidateOnFocus: false,
    });
		

	const [confirmSelection, setConfirmSelection] = useState(false);
    const { data } = useSWR(employeeTarget.id > 0 ? 
		`hr/dashboard/${employeeTarget.id}/?year=${year}` : '', {
        revalidateOnFocus: false,
    });
	const [ratings, setRatings] = useState({
		current_year: new Array(12).fill(0),
		previous_year: new Array(12).fill(0),
		current_year_total: 0,
	})

	function years(){
		let year = []
		for(let i = 2015; i <= 2040; i++){
			year.push(i)
		}
		return year;
	}

	useEffect(() => {
		if(data){
			let rating_current_year = new Array(12).fill(0)
			let rating_previous_year = new Array(12).fill(0)
			data?.ratings?.current_year.map((d) => {
				rating_current_year[d.month-1] = DoubleType((d.total/(d.count*3*5))*100)
			})
			data?.ratings?.previous_year.map((d) => {
				rating_previous_year[d.month-1] = DoubleType((d.total/(d.count*3*5))*100)
			})
			setRatings({
				current_year: rating_current_year,
				previous_year: rating_previous_year,
			})
		}
	}, [data])


	useEffect(() => {
		setEmployeeTarget(employeeSelected)
	}, [confirmSelection])


	return(
		<AdminLayout 
			title="Dashboard"
		>
			{isModalOpen &&(
				<SelectUserModal
					employees={employees}
					setIsModalOpen={setIsModalOpen}
					searchText={searchText}
					setSearchText={setSearchText}
					setEmployeeTarget={setEmployeeTarget}
					employeeTarget={employeeTarget}
					setConfirmSelection={setConfirmSelection}
					confirmSelection={confirmSelection}
					employeeSelected={employeeSelected}
					setEmployeeSelected={setEmployeeSelected}
					pageIndex={pageIndex} 
					setPageIndex={setPageIndex}
				/>
			)}
			<div className="flex justify-between mb-5">
				<div>
					<div> 
						<span className="text-gray-500">Name: {employeeTarget.name}</span>
					</div>
					<div> 
						<span className="text-gray-500">Department: {employeeTarget.position?.title}</span>
					</div>
					<div> 
						<span className="text-gray-500">Date Hired: {employeeTarget.dateHired}</span>
					</div>
				</div>
				{employeeTarget.id > 0 && !data && (
					<Loader/>
				)}
				<div className="flex items-end flex-col justify-end">
					<button 
						onClick={() => setIsModalOpen(true)}
						className="btn btn-primary">Load User</button>
					<select
						className="border rounded-[5px] px-2 py-1 bg-white !w-[200px] mt-2"
						value={year}
						onChange={(e) => setYear(e.target.value)}
					>
						{years()?.map((d) => (
							<option key={d} value={d}>{d}</option>
						))}
					</select>
				</div>
			</div>
			{/* <div className="grid grid-cols-3 gap-3">
				<TotalCard
					title="Customer Satisfaction"
					total={data?.ratings?.result ? `${data?.ratings?.result} / ${data?.total_ratings}`: '0/0'}
					className="!bg-pink-800"
				/>
				<TotalCard
					title="Total Backjobs"
					total={data?.backjobs ? data?.backjobs: '0'}
					className="!bg-teal-800"
				/>
				<TotalCard
					title="Total Sales"
					total={data?.sales?.total_sales ? 
						`₱ ${currencyDisplay(data?.sales?.total_sales)}` :'₱ 0'}
					className="!bg-cyan-800"
				/>
			</div> */}
			{/* <div className="mt-10">
				<CustomerSatisfactionGraph
					attendance={data?.attendance}
					workdays={data?.workdays}
					lates={data?.lates}
				/>
			</div> */}

			{employeeTarget.id > 0 && (
				<div>
					<LineGraph
						title="Attendance (Percentage)"
						yearSelected={year}
						previousYear={data?.attendance?.previous_year}
						currentYear={data?.attendance?.current_year}
						className="mt-[40px]"
					/>
					{employeeTarget?.position?.has_rating && (
						<LineGraph
							title="Customer Service (Percentage)"
							yearSelected={year}
							previousYear={ratings.previous_year}
							currentYear={ratings.current_year}
						/>
					)}
					{employeeTarget?.position?.has_sales && (
						<LineGraph
							title="Sales"
							yearSelected={year}
							previousYear={data?.sales?.previous_year}
							currentYear={data?.sales?.current_year}
							className="mt-[40px]"
						/>
					)}
					{employeeTarget?.position?.has_backjob && (
						<LineGraph
							title="Quality of Work"
							yearSelected={year}
							previousYear={data?.backjobs?.previous_year}
							currentYear={data?.backjobs?.current_year}
							className="mt-[40px] pb-[50px]"
						/>
					)}
				</div>
			)}
		</AdminLayout>
	)
}