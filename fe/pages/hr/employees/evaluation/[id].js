import { useRouter } from "next/router";
import useSWR from "swr";
import AdminLayout from "../../../../components/AdminLayout";
import dayjs from "dayjs";
import Link from 'next/link';
import { paginationRecordCount, PAGINATION_COUNT } from "../../../../helper/paginationRecordCount";
import {Pagination} from '@mui/material';
import { useState } from "react";
import Loader from "../../../../components/Loader";

export default function Evaluation(){
    const [pageIndex, setPageIndex] = useState(1);
    const router = useRouter();
    const { id } = router.query
	const { data: user } = useSWR(id ? `hr/evaluation/${id}/?&page=${pageIndex}` : '', {
        revalidateOnFocus: false,    
    });
    

    return(
        <AdminLayout
            title="Employee Evaluation"
            hasBack={true}
        >
            <div className="flex gap-[50px]">
                <div> 
                    <span className="text-gray-500">Name: </span>
                    <span>{user?.user?.user_employee?.firstname} {user?.user?.user_employee?.mi}. {user?.user?.user_employee?.lastname}</span>
                </div>
                <div> 
                    <span className="text-gray-500">Position: </span>
                    <span> {user?.user?.user_employee?.position?.title}</span>
                </div>
            </div>
            <div className="mt-1">
                <span className="text-gray-500">Date Hired: </span>
                <span> {dayjs(user?.user?.user_employee?.date_hired).format('MMMM DD, YYYY')} </span>
            </div>
            <div className="flex flex-col mt-10">
                <div className="overflow-x-auto">
                    <div className="w-full inline-block align-middle">
                        <div className="overflow-hidden border rounded-lg">
                            <table className="divide-y divide-gray-200 overflow-x-auto">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase">
                                            Date Created
                                        </th>
                                        <th className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase">
                                            Review Period
                                        </th>
                                        <th className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase w-[100%]">
                                            Comment
                                        </th>
                                        <th className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {!user ? (
                                        <tr>
                                            <td 
                                                colSpan="6"
                                                className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap text-center">
                                                    <Loader/>
                                            </td>
                                        </tr>
                                    ):(
                                        !user?.evaluation?.results?.length && (
                                            <tr>
                                                <td colSpan="3" className="text-center py-4">
                                                    No data
                                                </td>
                                            </tr>
                                        )
                                    )}
                                    {user?.evaluation?.results?.map((d) => (
                                        <tr key={d.id}>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                                                {dayjs(d.date_created).format('MMMM DD, YYYY')}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                                {d.review_period}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-800">
                                                {d.comment}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                                <Link href={`/hr/employees/evaluation/${user?.user?.id}/${d.id}`}
                                                    className="text-indigo-500 hover:text-indigo-700"
                                                >
                                                    View Evaluation
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-between mt-3 pl-2">
                            <div>
                                {paginationRecordCount(pageIndex, user?.evaluation?.count)}
                            </div>
                            <Pagination 
                                    count={user?.evaluation?.count ? Math.ceil(user?.evaluation?.count/PAGINATION_COUNT) : 0}
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