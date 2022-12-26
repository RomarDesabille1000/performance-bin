import AdminLayout from "../../../../../components/AdminLayout";
import { useRouter } from "next/router";
import useSWR from "swr";
import dayjs from "dayjs";
import { EVALUATIONTYPE } from "../../../../../helper/constants";
import { useEffect } from "react";
import { useState } from "react";
import { DoubleType } from "../../../../../helper/numbers";
import Loader from '../../../../../components/Loader'
import { setRequestMeta } from "next/dist/server/request-meta";

export default function Evaluation(){
    const router = useRouter();
    const { id, eId } = router.query
	const { data: e } = useSWR(id ? `hr/evaluation/${id}/${eId}/` : '', {
        revalidateOnFocus: false,    
    });
    const [overall, setOverall] = useState(0);

    useEffect(() => {
        let score = 0;
        e?.evaluation_detail?.map((d) => {
            score += DoubleType(score + (+d.score * DoubleType(+d.percentage/100)));
        })
        setOverall(score);
    }, [e])

    function display(data) {
        return data?.map((d, i) => {
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
                        {d.score}
                    </td>
                </tr>
            )
        });
    }

    return(
        <div>
            <div className="bg-gray-200 min-h-screen pb-20">
                <div className="max-w-[1300px] m-auto pt-10 px-5">
                    <div className="overflow-hidden shadow sm:rounded-md">
                        <div className="bg-white px-4 py-5 sm:p-6">
                            <div>
                                <button className="text-blue-500"
                                    onClick={() => router.back()}
                                >Back</button>
                            {!e && <Loader/>}
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
                                Department: {e?.user?.user_employee?.position?.title}
                            </div>
                            <div className="text-md">
                                Review Period: {e?.evaluation?.review_period}
                            </div>
                            <div className="text-md">
                                Date Hired:&nbsp;
                                {dayjs(e?.user?.user_employee?.date_hired).format('MMMM DD, YYYY')}
                            </div>
                            <div className="text-md">
                                Evaluated by:&nbsp;
                                {e?.evaluation?.evaluated_by}
                            </div>
                            <div className="text-md mt-4">
                                Comment:
                                <div className="max-w-[900px]">
                                    {e?.evaluation?.comment}
                                </div>
                            </div>
                            {e?.evaluation_detail.map((r, i) => (
                                <div key={r.id} className={`w-full inline-block align-middle mt-5 ${i > 0 ? '!mt-10': ''}`}>
                                    <div className="overflow-hidden border rounded-lg">
                                        <table className="divide-y block divide-gray-200 overflow-auto">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase w-[300px] min-w-[300px]"
                                                    >
                                                        {r.name} ({r.percentage}%)
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase w-[100%] min-w-[300px]"
                                                    >
                                                        MEASURABLE INDICATOR
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-xs font-bold text-center text-gray-500 uppercase w-[100px]"
                                                    >
                                                        Percentage %
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-center w-[100px]"
                                                    >
                                                        Actual Attainment
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {display(r.evaluation_criteria)}
                                                <tr>
                                                    <td></td>
                                                    <td></td>
                                                    <td className="text-center py-4">Total</td>
                                                    <td className="text-center">{r.score}%</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}

                            <div className="text-right pr-10 py-3">Overall Total: {overall}%</div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}