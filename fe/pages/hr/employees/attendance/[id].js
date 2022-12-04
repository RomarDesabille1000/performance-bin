import { useRouter } from "next/router";
import useSWR from "swr";
import AdminLayout from "../../../../components/AdminLayout";
import SearchBar from "../../../../components/SearchBar";
import dayjs from "dayjs";
import { useState } from "react";


export default function Attendance(){
    const router = useRouter();
    const { id } = router.query
	const { data: user } = useSWR(id ? `employee/attendance/${id}/` : '', {
        revalidateOnFocus: false,       
    });
    const [viewImage, setViewImage] = useState('');


    function viewSignatureClick(image){
        setViewImage(image);
    }

    function viewImageClose(){
        setViewImage('');
    }

    return(
        <AdminLayout
            title="Attendance"
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
                    {viewImage && (
                        <div className="mt-3">
                            <img className="rounded-lg border-2 border-indigo-500" src={viewImage} width="300" height="100" 
                                alt="no image"
                            />
                            <button 
                                onClick={viewImageClose}
                                className="btn btn-secondary ml-2 mt-2">Close</button>
                        </div>
                    )}
                    <SearchBar
                        text=""
                        placeholder="Search and enter"
                    />
                    <div className="p-1.5 w-full inline-block align-middle">
                        <div className="overflow-hidden border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200 overflow-x-auto">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase "
                                        >
                                            Date
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase "
                                        >
                                            Customer Name
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase "
                                        >
                                            Location
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase "
                                            style={{width: '50px'}}
                                        >
                                            Signature
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {user?.attendance_list.map((d) => (
                                        <tr key={d.id}>
                                            <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                                {dayjs(d.date).format('MMMM DD, YYYY')}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                                                {d.customer_name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                                {d.location}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                                <button
                                                    onClick={() => viewSignatureClick(d.signature)}
                                                    className="text-indigo-500 hover:text-indigo-700">
                                                        View Signature
                                                </button>
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