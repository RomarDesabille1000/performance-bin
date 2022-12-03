import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";
import axiosInstance from "../../../utils/axiosInstance";
import dayjs from "dayjs";
import { DoubleType } from "../../../helper/numbers";
import AlertMessages from "../../../components/AlertMessages";

export default function Evaluate() {
    const router = useRouter();
    const { id } = router.query
	const { data } = useSWR(id ? `users/employees/${id}/` : '', {
        revalidateOnFocus: false,       
    });

	const [status, setStatus] = useState({
		error: false,
		loading: false,
		success: false,
		infoMessage: '',
	})

    const [e, setE] = useState([]);
    const [coreTotal, setCoreTotal] = useState(0);
    const [kpiTotal, setKpiTotal] = useState(0);

    const TYPE = {
        CORE: 'CORE',
        KPI: 'KPI'
    }
    const attendanceTitle = 'Punctuality and Attendance'
    const customerService = 'Customer Service'

    useEffect(() => {
        if(data){
            const newRubric =  [...data?.rubric]
                .map((d) => {
                    if(attendanceTitle == d.name){
                        const score = DoubleType((data?.attendance?.total_attendance / data?.attendance?.days_count) * d?.percentage);
                        setCoreTotal(score)
                        return {...d, score: score}
                    }else if(customerService == d.name){
                        const score = DoubleType((data?.customer_service_rating?.customer_rating?.result /
                                        data?.customer_service_rating?.total) * d.percentage)
                        setKpiTotal(score)
                        return {...d, score: score}
                    }
                    return {...d, score: 0}
                })
            setE({
                ...data, 
                rubric: newRubric
            });
        }
    }, [data])

    function handleRubricScoreChange(event, i){
        const rubric = {...e}
        
        rubric.rubric[i].score = event.target.value
        if(+event.target.value > +rubric.rubric[i].percentage)
            rubric.rubric[i].score = rubric.rubric[i].percentage

        setE(rubric);

        let sum = 0
        if(rubric.rubric[i].type === TYPE.CORE){
            for(let j = 0; j < rubric?.rubric?.length; j++){
                if(rubric.rubric[j].type === TYPE.CORE)
                    sum += DoubleType(+rubric.rubric[j].score);
            }
            setCoreTotal(sum)
        }else{
            for(let j = 0; j < rubric?.rubric?.length; j++){
                if(rubric.rubric[j].type === TYPE.KPI)
                    sum += DoubleType(+rubric.rubric[j].score);
            }
            setKpiTotal(sum)
        }
    }

    function handleSave(){
        setStatus({ 
            error: false, 
            success: false, 
            loading:true, 
            infoMessage: 'Saving Evaluation.' 
        })
        window.location.href = "#"
        axiosInstance.post(`users/employees/${id}/`, {
            review_period: e?.review_period,
            rubric: e?.rubric,
        })
        .then((_e) => {
            setStatus({ 
                error: false, 
                success: true, 
                loading:false, 
                infoMessage: 'Evaluation Saved.' 
            })
        }).catch((_e) => {
            setStatus({ 
                error: false, 
                success: true, 
                loading:false, 
                infoMessage: 'Error: Something went wrong.' 
            })
        })
    }

	function renderCore () {
		if(e?.rubric?.length == 0)
			return (<>No data</>)
		else{
		return e?.rubric?.map((d, i) => {
            if(d.type === TYPE.CORE){
                return (
                    <tr key={d.id}>
						<td className="pl-3 py-4">
                            {d.name}
						</td>
						<td>
                            {d.description}
                        </td>
                        <td className="text-center">
                            {d.percentage}
                        </td>
                        <td className="pr-3">
                            {attendanceTitle !== d.name ? (
                                <input 
                                    value={d.score}
                                    onChange={(event) => handleRubricScoreChange(event, i)}
                                    type="number" 
                                    className="input" />
                            ): (
                                <div className="text-center">
                                     {e?.attendance.total_attendance} / {e?.attendance?.days_count} * {d?.percentage}
                                     <span> = </span>
                                    {DoubleType((e?.attendance.total_attendance / e?.attendance.days_count) * d?.percentage)}%
                                </div>
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
		return e?.rubric?.map((d, i) => {
            if(d.type === TYPE.KPI){
                return (
                    <tr key={d.id} className='bg-white border-b text-gray-800'>
						<td className="pl-3 py-4">
                            {d.name}
						</td>
                        <td>
                            {d.description}
                        </td>
                        <td className="text-center">
                            {d.percentage}
                        </td>
                        <td className="pr-3">
                            {customerService !== d.name ? (
                                <input 
                                    value={d.score}
                                    type="number" 
                                    onChange={(event) => handleRubricScoreChange(event, i)}
                                    className="input" />
                            ): (
                                <div className="text-center">
                                    {e?.customer_service_rating?.customer_rating.result} / 
                                    {e?.customer_service_rating?.total} * 0.{d.percentage}
                                    &nbsp;=&nbsp;
                                    {DoubleType((e?.customer_service_rating?.customer_rating.result /
                                    e?.customer_service_rating?.total) * d.percentage)}%
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
        <div>
            <div className="bg-gray-200 min-h-screen pb-20">
                <div className="max-w-[1300px] m-auto pt-10 px-5">
                    <div className="overflow-hidden shadow sm:rounded-md">
                        <div className="bg-white px-4 py-5 sm:p-6">
                            <div>
                                <button className="text-blue-500"
                                    onClick={() => router.back()}
                                >Back</button>
                            </div>
                            <div className="text-md text-center font-medium text-red-500" aria-hidden="true">
                                {e?.is_evaluated > 0 && (
                                    'This user is already evaluated for this year.'
                                )}
                            </div>
                            <div className="text-md mt-3 font-medium text-gray-900" aria-hidden="true">
                                Employee Performance Evaluation
                            </div>
                            <div className="text-md mt-4">
                                Name: 
                                <span> {e?.user?.user_employee?.lastname.toUpperCase()}, </span>
                                <span> {e?.user?.user_employee?.firstname.toUpperCase()} </span>
                                <span> {e?.user?.user_employee?.mi.toUpperCase()}. </span>
                            </div>
                            <div className="text-md">
                                Position: {e?.user?.user_employee?.position}
                            </div>
                            <div className="text-md">
                                Review Period: {e?.review_period}
                            </div>
                            <div className="text-md">
                                Date Hired:&nbsp;
                                {dayjs(e?.user?.user_employee?.date_hired).format('MMMM DD, YYYY')}
                            </div>

                            <AlertMessages
                                error={status.error}
                                success={status.success}
                                loading={status.loading}
                                message={status.infoMessage}
                                className="py-3"
                            />

                            <div className="w-full inline-block align-middle mt-5">
                                <div className="overflow-hidden border rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200 overflow-x-auto">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase "
                                                >
                                                    Core Competencies (40%)
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase "
                                                >
                                                    MEASURABLE INDICATOR
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase "
                                                >
                                                    Percentage %
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase "
                                                    style={{width: '150px'}}
                                                >
                                                    Actual Attainment
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {renderCore()}
                                            <tr>
                                                <td></td>
                                                <td></td>
                                                <td className="text-center py-4">Total</td>
                                                <td className="text-center">{coreTotal}%</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="w-full inline-block align-middle mt-10">
                                <div className="overflow-hidden border rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200 overflow-x-auto">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase "
                                                >
                                                    Key Performance Indicators (60%)
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase "
                                                >
                                                    Measurable Indicator
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase "
                                                >
                                                    Percentage %
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase "
                                                    style={{width: '150px'}}
                                                >
                                                    Actual Attainment
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {renderKPI()}
                                            <tr>
                                                <td></td>
                                                <td></td>
                                                <td className="text-center py-4">Total</td>
                                                <td className="text-center">{kpiTotal}%</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex justify-end mt-10">
                                <button 
                                    disabled={status.loading}
                                    onClick={handleSave}
                                    className="btn btn-primary px-[20px]">Save Evaluation</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}