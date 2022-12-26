import { useEffect, useState } from "react";
import useSWR from "swr";
import AdminLayout from "../../components/AdminLayout";
import SelectUserModal from "../../components/dashboard/SelectUserModal";
import TotalCard from "../../components/dashboard/TotalCard";
import CustomerSatisfactionGraph from "../../components/dashboard/CustomerSatisfactionGraph";
import dayjs from "dayjs";
import { useRef } from "react";
import { currencyDisplay } from "../../helper/numbers";
import Loader from "../../components/Loader";
import LineGraph from "../../components/dashboard/LineGraph";

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

	function years(){
		let year = []
		for(let i = 2015; i <= 2040; i++){
			year.push(i)
		}
		return year;
	}


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
						<span className="text-gray-500">Department: {employeeTarget.position}</span>
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
			<LineGraph/>
		</AdminLayout>
	)
}