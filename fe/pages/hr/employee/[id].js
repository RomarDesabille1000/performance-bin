import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";
import axiosInstance from "../../../utils/axiosInstance";

export default function Evaluate() {
    const router = useRouter();
    const { id } = router.query
	const { data } = useSWR(id ? `users/employees/${id}/` : '', {
        revalidateOnFocus: false,       
    });

    const [e, setE] = useState([]);

    const TYPE = {
        CORE: 'CORE',
        KPI: 'KPI'
    }
    const attendanceTitle = 'Punctuality and Attendance'
    const customerService = 'Customer Service'

    useEffect(() => {
        setE({
            ...data, 
            rubric: data?.rubric.map((d) => ({...d, score: ''}))
        });
    }, [data])

    function handleRubricScoreChange(event, i){
        const rubric = {...e}
        rubric.rubric[i].score = event.target.value
        setE(rubric);
    }

    function handleSave(){
        axiosInstance.post(`users/employees/${id}/`, {
            rubric: e.rubric,
        })
        .then((_e) => {
            console.log('success')
        }).catch((_e) => {
            console.log('error')
        })
    }

	function renderCore () {
		if(e?.rubric?.length == 0)
			return (<>No data</>)
		else{
		return e?.rubric?.map((d, i) => {
            if(d.type === TYPE.CORE){
                return (
                    <tr key={d.id} className='bg-white border-b text-gray-800'>
						<td scope='row' className='py-4 px-6 font-medium'>
                            {d.name}
						</td>
						<td>
                            {d.description}
                        </td>
                        <td>
                            {d.percentage}
                        </td>
                        <td>
                            {attendanceTitle !== d.name && (
                                <input 
                                    onChange={(event) => handleRubricScoreChange(event, i)}
                                    type="number" 
                                    className="input" />
                            )}
                        </td>
					</tr>
                )
            }
        })
		}
	}


	function renderKPI () {
		if(e?.rubric?.length == 0)
			return (<>No data</>)
		else{
		return e?.rubric?.map((d) => {
            if(d.type === TYPE.KPI){
                return (
                    <tr key={d.id} className='bg-white border-b text-gray-800'>
						<td scope='row' className='py-4 px-6 font-medium'>
                            {d.name}
						</td>
						<td>
                            {d.description}
                        </td>
                        <td>
                            {d.percentage}
                        </td>
                        <td>
                            {customerService !== d.name ? (
                                <input type="number" className="input" />
                            ): (
                                <div>
                                    {e?.customer_service_rating?.customer_rating.result} / 
                                    {e?.customer_service_rating?.total} * 0.{d.percentage}
                                    &nbsp;=&nbsp;
                                    {(e?.customer_service_rating?.customer_rating.result /
                                    e?.customer_service_rating?.total) * d.percentage}
                                </div>
                            )}
                        </td>
					</tr>
                )
            }
        })
		}
	}

    return (
        <div className='flex flex-col items-center w-full px-4'>
			<div className='flex flex-col justify-center h-full w-full mb-5'>
				<div className='w-full min-w-full max-w-2xl mx-auto bg-white shadow-lg rounded-sm border border-gray-200'>
                    <div className="text-blue-500"
                        onClick={() => router.back()}
                    >Back</div>
					<header className='px-5 py-4 border-b border-gray-100'>
						<h2 className='font-semibold text-gray-800'>
                            Employee Performance Evaluation
                        </h2>
                        <div>
                            Name: 
                            <span> {e?.user?.user_employee?.lastname.toUpperCase()}, </span>
                            <span> {e?.user?.user_employee?.firstname.toUpperCase()} </span>
                            <span> {e?.user?.user_employee?.mi.toUpperCase()}. </span>
                        </div>
                        <div>
                            Position: {e?.user?.user_employee?.position}
                        </div>
                        <div>
                            Review Period: 
                        </div>
                        <div>
                            Date Hired: {e?.user?.user_employee?.date_hired}
                        </div>
					</header>
					<div className='overflow-x-auto relative'>
						<table className='w-full min-w-full text-sm text-left text-gray-500 dark:text-gray-400'>
							<thead className='text-md text-gray-700 uppercase bg-gray-50'>
								<tr>
									<th scope='col' className='py-3 px-6'>
                                        Core Competencies (40%)
									</th>
									<th scope='col' className='py-3 px-6'>
                                        MEASURABLE INDICATOR
									</th>
									<th scope='col' className='py-3 px-6'>
                                        Percentage %
									</th>
									<th scope='col' className='py-3 px-6'>
                                        Actual Attainment
									</th>
								</tr>
							</thead>
							<tbody>
                                {renderCore()}
							</tbody>
						</table>
                        Total: {}
					</div>

                    <div className='overflow-x-auto relative mt-10'>
                        <table className='w-full min-w-full text-sm text-left text-gray-500 dark:text-gray-400'>
                            <thead className='text-md text-gray-700 uppercase bg-gray-50'>
                                <tr>
                                    <th scope='col' className='py-3 px-6'>
                                        Key Performance Indicators (60%)
                                    </th>
                                    <th scope='col' className='py-3 px-6'>
                                        Measurable Indicator
                                    </th>
                                    <th scope='col' className='py-3 px-6'>
                                        Percentage %
                                    </th>
									<th scope='col' className='py-3 px-6'>
                                        Actual Attainment
									</th>
                                </tr>
                            </thead>
                            <tbody>
                                {renderKPI()}
                            </tbody>
                        </table>
                        Total: {}
                    </div>
                    <div className="mt-3">Overall Total: {}</div>
				</div>
                <button 
                    onClick={handleSave}
                    className="btn btn-primary mt-5 w-[100px]">Save</button>

			</div>
		</div>
    )
}