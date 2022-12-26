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

    const [rubric, setRubric] = useState([]);
    const [overall, setOverall] = useState(0);
    const [comment, setComment] = useState('')

    const TYPE = {
        ATTENDANCE: 'Attendance',
        CUSTOMER_SATISFACTION: 'Customer Satisfaction'
    }


    useEffect(() => {
        if(data && !data?.err){
            const total = Array(data?.rubric?.length).fill(0)
            const newRubric =  [...data?.rubric].map((r, rI) => ({
                ...r, 
                total: 0,
                rubric_criteria: r.rubric_criteria.map((rc) => {
                    if(rc.template_name === TYPE.ATTENDANCE){
                        let score = DoubleType((data?.attendance?.total_attendance / data?.attendance?.days_count) * rc?.percentage);
                        score = isNaN(score)? rc.percentage : score
                        total[rI] = DoubleType(total[rI] + score)
                        return {...rc, score: score}
                    }
                    else if(rc.template_name === TYPE.CUSTOMER_SATISFACTION){
                        let score = DoubleType((data?.customer_service_rating?.customer_rating?.result /
                                        data?.customer_service_rating?.total) * rc.percentage)
                        score = isNaN(score)? rc?.percentage : score
                        total[rI] = DoubleType(total[rI] + score)
                        return {...rc, score: score}
                    }

                    return {...rc, score: 0}
                })
            }))
            for(let i = 0; i < total.length; i++){
                newRubric[i].total = total[i];
            }
            setRubric(newRubric);
        }
    }, [data])



    function handleSave(){
        setStatus({ 
            error: false, 
            success: false, 
            loading:true, 
            infoMessage: 'Saving Evaluation.' 
        })
        axiosInstance.post(`users/employees/${id}/`, {
            review_period: data?.review_period,
            rubric: rubric,
            comment: comment,
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
                error: true, 
                success: false, 
                loading:false, 
                infoMessage: 'Error: Something went wrong.' 
            })
        })
    }

    function handleRubricScoreChange(event, rubricIndex, i){
        const newRubric = [...rubric]
        newRubric[rubricIndex].rubric_criteria[i].score = event.target.value
        if(+event.target.value > +newRubric[rubricIndex].rubric_criteria[i].percentage)
            newRubric[rubricIndex].rubric_criteria[i].score = newRubric[rubricIndex].rubric_criteria[i].percentage
        
        let dScore = newRubric[rubricIndex].rubric_criteria.reduce(function (sum, r) {
            return DoubleType(sum + (+r.score));
        }, 0);
        newRubric[rubricIndex].total = dScore;

        let overallScore = 0;
        for(let i = 0; i < newRubric.length; i++){
            let dScore = newRubric[i].rubric_criteria.reduce(function (sum, r) {
                return DoubleType(sum + (+r.score));
            }, 0);
            overallScore = DoubleType(overallScore + (dScore * DoubleType(+newRubric[i].percentage/100)));
        }
        setOverall(overallScore);

        setRubric(newRubric);
    }

    function tableData(td, rubricIndex, total){
        return(
            <tbody className="divide-y divide-gray-200">
                {td.map((d, i) => {
                    return (
                        <tr key={d.id} className='bg-white border-b text-gray-800'>
                            <td className="px-6 py-2">
                                {d.name}
                            </td>
                            <td className="px-6 py-2">
                                {d.description}
                            </td>
                            <td className="px-6 py-2">
                                {d.percentage}
                            </td>
                            <td className="px-6 py-2">
                                {d.template_name == 'none' && ( 
                                    <input 
                                        value={d.score}
                                        onChange={(event) => handleRubricScoreChange(event, rubricIndex, i)}
                                        type="number" 
                                        className="input text-center !min-w-[90px] !mt-0"/>
                                )}
                                {d.template_name == TYPE.ATTENDANCE && ( 
                                    <div className="text-center">
                                        {data?.attendance?.total_attendance} / {data?.attendance?.days_count} * {d?.percentage}
                                        <span> = </span>
                                        {DoubleType(d.score)}%
                                    </div>
                                )}
                                {d.template_name == TYPE.CUSTOMER_SATISFACTION && ( 
                                    <div className="text-center">
                                        {handleNoValue(data?.customer_service_rating?.customer_rating.result, 0)} / 
                                        {data?.customer_service_rating?.total} * 0.{d.percentage}
                                        &nbsp;=&nbsp;
                                        {DoubleType(d.score)}%
                                    </div>
                                )}
                            </td>
                        </tr>
                    )
                })}
                <tr>
                    <td></td>
                    <td></td>
                    <td className="px-6 py-2">Total</td>
                    <td className="px-6 py-2 text-center">{total}%</td>
                </tr>
            </tbody>
        )
    }

    function table(){
        return rubric?.map((r, i) => {
            return (
                <div key={r.id} className={`w-full inline-block align-middle mt-5 ${i > 0 ? '!mt-10': ''}`}>
                    <div className="overflow-hidden border rounded-lg">
                        <table className="divide-y block divide-gray-200 overflow-auto">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase w-[300px] min-w-[300px]"
                                    >
                                        {r.dimension_name} ({r.percentage}%)
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase w-[100%] min-w-[300px]"
                                    >
                                        MEASURABLE INDICATOR
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase w-[100px]"
                                    >
                                        Percentage %
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase w-[100px]"
                                    >
                                        Actual Attainment
                                    </th>
                                </tr>
                            </thead>
                            {tableData(r.rubric_criteria, i, r.total)}
                        </table>
                    </div>
                </div>
            )
        })
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
                                        onClick={() => router.back()}
                                    >Back</button>
                                </div>
                                {data?.err ? (
                                    <div className="mt-5">
                                        {data?.err}
                                    </div>
                                ):(
                                    <Fragment>
                                        <div className="text-md text-center font-medium text-red-500" aria-hidden="true">
                                            {data?.is_evaluated > 0 && (
                                                'This user is already evaluated for this year.'
                                            )}
                                        </div>
                                        <div className="text-md mt-3 font-medium text-gray-900" aria-hidden="true">
                                            Employee Performance Evaluation
                                        </div>
                                        <div className="text-md mt-4">
                                            Name: 
                                            <span> {data?.user?.user_employee?.lastname.toUpperCase()}, </span>
                                            <span> {data?.user?.user_employee?.firstname.toUpperCase()} </span>
                                            <span> {data?.user?.user_employee?.mi.toUpperCase()}. </span>
                                        </div>
                                        <div className="text-md">
                                            Position: {data?.position}
                                        </div>
                                        <div className="text-md">
                                            Review Period: {data?.review_period}
                                        </div>
                                        <div className="text-md">
                                            Date Hired:&nbsp;
                                            {dayjs(data?.user?.user_employee?.date_hired).format('MMMM DD, YYYY')}
                                        </div>

                                        {table()}
                                        <div className="text-right pr-10 py-3">Overall Total: {overall}%</div>

                                        <div className="mt-3">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Comment
                                            </label>
                                            <textarea
                                                cols="30" 
                                                rows="3" 
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                className="input !p-2 !h-auto !min-w-min">
                                            </textarea>
                                        </div>

                                        <AlertMessages
                                            error={status.error}
                                            success={status.success}
                                            loading={status.loading}
                                            message={status.infoMessage}
                                            className="py-3"
                                        />

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