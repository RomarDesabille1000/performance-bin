import AdminLayout from "../../../../../components/AdminLayout";
import { useRouter } from "next/router";
import useSWR from "swr";
import dayjs from "dayjs";
import { EVALUATIONTYPE } from "../../../../../helper/constants";
import { useEffect } from "react";
import { useState } from "react";
import { DoubleType } from "../../../../../helper/numbers";

export default function Evaluation(){
    const router = useRouter();
    const { id, eId } = router.query
	const { data: e } = useSWR(id ? `hr/evaluation/${id}/${eId}/` : '', {
        revalidateOnFocus: false,    
    });
    const [core, setCore] = useState({
        data: [],
        total: 0,
    })
    const [kpi, setKPI] = useState({
        data: [],
        total: 0,
    })
    const [overall, setOverall] = useState(0);

    useEffect(() => {
        let coreData = [];
        let kpiData = [];
        let coreTotal = 0;
        let kpiTotal = 0;
        e?.evaluation_detail?.map((d) => {
            if(d.type === EVALUATIONTYPE.CORE){
                coreData.push(d);
                coreTotal += DoubleType(+d.score)
            }else{
                kpiData.push(d);
                kpiTotal += DoubleType(+d.score)
            }
        })
        setCore({data: coreData, total: coreTotal})
        setKPI({data: kpiData, total: kpiTotal})
        setOverall(DoubleType((coreTotal*0.40) + (kpiTotal*0.60)))
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
                                Position: {e?.user?.user_employee?.type == 'TECHNICIAN' ? 'Technician' : 'Sales Executive' }
                            </div>
                            <div className="text-md">
                                Review Period: {e?.evaluation?.review_period}
                            </div>
                            <div className="text-md">
                                Date Hired:&nbsp;
                                {dayjs(e?.user?.user_employee?.date_hired).format('MMMM DD, YYYY')}
                            </div>

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
                                                    className="px-6 py-3 text-xs font-bold text-center text-gray-500 uppercase "
                                                >
                                                    Percentage %
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-center"
                                                    style={{width: '150px'}}
                                                >
                                                    Actual Attainment
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {display(core.data)}
                                            <tr>
                                                <td></td>
                                                <td></td>
                                                <td className="text-center py-4">Total</td>
                                                <td className="text-center">{core.total}%</td>
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
                                                    className="px-6 py-3 text-xs font-bold text-center text-gray-500 uppercase"
                                                >
                                                    Percentage %
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-center"
                                                    style={{width: '150px'}}
                                                >
                                                    Actual Attainment
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {display(kpi.data)}
                                            <tr>
                                                <td></td>
                                                <td></td>
                                                <td className="text-center py-4">Total</td>
                                                <td className="text-center">{kpi.total}%</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="text-right pr-10 py-3">Overall Total: {overall}%</div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}