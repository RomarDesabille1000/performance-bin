import { useRouter } from "next/router";
import useSWR from "swr";
import AdminLayout from "../../../../components/AdminLayout";
import SearchBar from "../../../../components/SearchBar";
import dayjs from "dayjs";
import { useState } from "react";


export default function Attendance(){
    const router = useRouter();
    const { id } = router.query
	const { data: user } = useSWR(id ? `employee/customer-rating/${id}/` : '', {
        revalidateOnFocus: false,       
    });

    console.log(user?.customer_rating);
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
            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <div className="my-4">
                        Question Answers
                    </div>
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
                                        <th className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase">
                                            Q4 &nbsp; | &nbsp; Rate 1 to 5
                                        </th>
                                        <th className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase">
                                            Question 5
                                        </th>
                                        <th className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase">
                                            Question 6
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {user?.customer_rating?.map((d) => (
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
                                            <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                                {d.q4}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                                {d.q5 ? d.q5 : 'No answer'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                                {d.q6 ? d.q6 : 'No answer'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}