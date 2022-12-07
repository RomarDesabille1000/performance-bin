import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";
import axiosInstance from "../../../utils/axiosInstance";
import dayjs from "dayjs";
import { DoubleType, handleNoValue } from "../../../helper/numbers";
import AlertMessages from "../../../components/AlertMessages";
import { Fragment } from "react";

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
    const [overall, setOverall] = useState(0);

    const TYPE = {
        CORE: 'CORE',
        KPI: 'KPI'
    }
    const attendanceTitle = 'Punctuality and Attendance'
    const customerService = 'Customer Service'
    const [percentage, setPercentage] = useState({
        core: 0,
        kpi: 0,
    })

    useEffect(() => {
        if(data){
            let coreTotal = 0;
            let kpiTotal = 0;
            let kpiPercentTotal = 0;
            let corePercentTotal = 0;
            const newRubric =  [...data?.rubric]
                .map((d) => {
                    if(d.type === TYPE.CORE){
                        corePercentTotal += d.percentage
                    }else{
                        kpiPercentTotal += d.percentage
                    }
                    if(attendanceTitle == d.name){
                        let score = DoubleType((data?.attendance?.total_attendance / data?.attendance?.days_count) * d?.percentage);
                        score = isNaN(score)?d.percentage:score
                        setCoreTotal(score)
                        coreTotal += score;
                        return {...d, score: score}
                    }else if(customerService == d.name){
                        let score = DoubleType((data?.customer_service_rating?.customer_rating?.result /
                                        data?.customer_service_rating?.total) * d.percentage)
                        score = isNaN(score)?d.percentage:score
                        setKpiTotal(score)
                        kpiTotal += score;
                        return {...d, score: score}
                    }

                    return {...d, score: 0}
                })
            setE({
                ...data, 
                rubric: newRubric
            });
            setPercentage({ kpi: kpiPercentTotal, core: corePercentTotal})
            setOverall(DoubleType((coreTotal*0.40)+(kpiTotal*0.60)));
        }
    }, [data])


    function handleRubricScoreChange(event, i){
        const rubric = {...e}
        
        rubric.rubric[i].score = event.target.value
        if(+event.target.value > +rubric.rubric[i].percentage)
            rubric.rubric[i].score = rubric.rubric[i].percentage

        setE(rubric);

        let core = 0;
        let kpi = 0;
        for(let j = 0; j < rubric?.rubric?.length; j++){
            if(rubric.rubric[j].type === TYPE.CORE)
                core += DoubleType(+rubric.rubric[j].score);
            else
                kpi += DoubleType(+rubric.rubric[j].score);
        }
        setCoreTotal(core)
        setKpiTotal(kpi)
        setOverall(DoubleType((core*0.40) + (kpi*0.60)));
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
                        <td className="px-6 py-2">
                            {d.name}
						</td>
                        <td className="px-6 py-2">
                            {d.description}
                        </td>
                        <td className="px-6 py-2 text-center">
                            {d.percentage}
                        </td>
                        <td className="px-6 py-2 text-center">
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
                                    {DoubleType((e?.attendance.total_attendance / e?.attendance.days_count) * d?.percentage, d.percentage)}%
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
                        <td className="px-6 py-2">
                            {d.name}
						</td>
                        <td className="px-6 py-2">
                            {d.description}
                        </td>
                        <td className="px-6 py-2 text-center">
                            {d.percentage}
                        </td>
                        <td className="px-6 py-2 text-center">
                            {customerService !== d.name ? (
                                <input 
                                    value={d.score}
                                    type="number" 
                                    onChange={(event) => handleRubricScoreChange(event, i)}
                                    className="input" />
                            ): (
                                <div className="text-center">
                                    {handleNoValue(e?.customer_service_rating?.customer_rating.result, 0)} / 
                                    {e?.customer_service_rating?.total} * 0.{d.percentage}
                                    &nbsp;=&nbsp;
                                    {DoubleType((e?.customer_service_rating?.customer_rating.result /
                                    e?.customer_service_rating?.total) * d.percentage, d.percentage)}%
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
            {!data ? (
                <AlertMessages
                    loading={true}
                    message="Preparing Form."
                    className="text-2xl flex justify-center mt-20"
                />
            ):(
                <div className="bg-gray-200 min-h-screen pb-20">
                    <div className="max-w-[1300px] m-auto pt-10 px-5">
                        <div className="overflow-hidden shadow sm:rounded-md">
                            <div className="bg-white px-4 py-5 sm:p-6">
                                <div>
                                    <button className="text-blue-500"
                                        onClick={() => router.push('/hr/evaluate')}
                                    >Back</button>
                                </div>
                                {percentage.kpi !== 100 || percentage.core !== 100 ? (
                                    <div className="mt-5">
                                        The rubric did not reach 100%. Please set in the rubric menu
                                    </div>
                                ):(
                                    <Fragment>
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

                                        <div className="text-right pr-10 py-3">Overall Total: {overall}%</div>

                                        <div className="flex justify-end mt-10">
                                            <button 
                                                disabled={status.loading}
                                                onClick={handleSave}
                                                className="btn btn-primary px-[20px]">Save Evaluation</button>
                                        </div>
                                    </Fragment>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}