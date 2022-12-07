import { useRouter } from "next/router";
import useSWR from "swr";
import AdminLayout from "../../../../components/AdminLayout";
import dayjs from "dayjs";
import { useState } from "react";
import {Pagination} from '@mui/material';
import { paginationRecordCount, PAGINATION_COUNT } from "../../../../helper/paginationRecordCount";
import { useEffect } from "react";
import { handleNoValue } from "../../../../helper/numbers";


export default function Attendance(){
    const [pageIndex, setPageIndex] = useState(1);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const router = useRouter();
    const { id } = router.query
	const { data: user } = useSWR(id ? 
        `employee/customer-rating/${id}/?&page=${pageIndex}&from=${fromDate}&to=${toDate}` : '', {
        revalidateOnFocus: false,       
    });

    const q1 = {
        'VERYPOSITIVE': 'Very Positive',
        'SOMEWHATPOSITIVE': 'Somewhat Positive',
        'NEUTRAL': 'Negative',
        'SOMEWHATNEGATIVE': 'Somewhat Negative',
        'VERYNEGATIVE': 'Very Negative',
    }
    const q2 = {
        'EXTREMELYWELL': 'Extremely Well',
        'VERYWELL': 'Very well',
        'SOMEWHATWELL': 'Somewhat Well',
        'NOTSOWELL': 'Not So Well',
        'NOTATALLWELL': 'Not at all well'
    }
    const q3 = {
        'MUCHSHORTERTHANEXPECTED': 'Much shorter than expected',
        'ABOUTWHATIEXPECT': 'About what I expected',
        'SHORTERTHANEXPECTED': 'Shorter than expected',
        'LONGERTHANIEXPECTED': 'Longer than I expected',
        'MUCHLONGERTHANIEXPECTED': 'Much longer than I expected'
    }

    //filter
    useEffect(() => {
        //jan 1
        setFromDate(`${dayjs().year()}-01-01`)
        //current year
        const d = new Date()
        d.setDate(d.getDate() + 1);
        setToDate(d.toISOString().slice(0, 10))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const setFromDateValue = (e) => {
        setFromDate(e.target.value)
        setPageIndex(1)
    }

    const setToDateValue = (e) => {
        setToDate(e.target.value)
        setPageIndex(1)
    }

    return(
        <AdminLayout
            title="Ratings"
            hasBack={true}
        >
            <div className="flex gap-[50px]">
                <div> 
                    <span className="text-gray-500">Name: </span>
                    <span>{user?.user?.user_employee?.firstname} {user?.user?.user_employee?.mi}. {user?.user?.user_employee?.lastname}</span>
                </div>
                <div> 
                    <span className="text-gray-500">Position: </span>
                    <span> {user?.user?.user_employee?.position}</span>
                </div>
            </div>
            <div className="mt-1">
                <span className="text-gray-500">Date Hired: </span>
                <span> {dayjs(user?.user?.user_employee?.date_hired).format('MMMM DD, YYYY')} </span>
            </div>
            <div className="mt-1">
                <span className="text-gray-500">Total Filtered Rating: </span>
                {handleNoValue(user?.rating?.total_rating?.result, 0)} / {handleNoValue(user?.rating?.over, 0)}
            </div>
            <div className="flex justify-end items-center mb-2">
                <div>
                    <div className="flex items-center gap-3">
                        <div>From: &nbsp;</div>
                        <input 
                            value={fromDate}
                            onChange={setFromDateValue}
                            type="date" 
                            className="input !mt-0 !w-[200px]" />
                        To: &nbsp;
                        <input 
                            value={toDate}
                            onChange={setToDateValue}
                            type="date" 
                            className="input !mt-0 !w-[200px]" />
                    </div>
                    <div className="text-xs mt-1 text-right">Month\Date\Year</div>
                </div>
            </div>
            <div className="flex flex-col">
                Question Answers
                <div className="overflow-x-auto">
                    <div className="w-full inline-block align-middle">
                        <div className="overflow-hidden border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200 overflow-x-auto">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase">
                                            Question 1
                                        </th>
                                        <th className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase">
                                            Question 2
                                        </th>
                                        <th className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase">
                                            Question 3
                                        </th>
                                        <th className="px-6 py-3 text-xs font-bold text-center text-gray-500 uppercase">
                                            Question 4 &nbsp; | &nbsp; Rate 1 to 5
                                        </th>
                                        <th className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase">
                                            Question 5
                                        </th>
                                        <th className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase">
                                            Question 6
                                        </th>
                                        <th className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {!user?.customer_rating?.count && (
                                        <tr>
                                            <td 
                                                colSpan="7"
                                                className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap text-center">
                                                    No record Found
                                            </td>
                                        </tr>
                                    )}
                                    {user?.customer_rating?.results.map((d) => (
                                        <tr key={d.id}>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                                                {q1[d.q1]}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                                {q2[d.q2]}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                                {q3[d.q3]}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap text-center">
                                                {d.q4}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                                {d.q5 ? d.q5 : 'No answer'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                                {d.q6 ? d.q6 : 'No answer'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                                {dayjs(d.data).format('MMMM DD, YYYY')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-between mt-3 pl-2">
                            <div>
                                {paginationRecordCount(pageIndex, user?.customer_rating?.count)}
                            </div>
                            <Pagination 
                                    count={user?.customer_rating?.count ? Math.ceil(user?.customer_rating?.count/PAGINATION_COUNT) : 0}
                                    page={pageIndex}
                                    color="primary"
                                    onChange={(_e, n) => setPageIndex(n)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}