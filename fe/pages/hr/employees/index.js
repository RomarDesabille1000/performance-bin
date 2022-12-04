import Link from 'next/link';
import { Fragment, useState } from 'react';
import useSWR from 'swr';
import AdminLayout from '../../../components/AdminLayout';
import SearchBar from '../../../components/SearchBar';
import dayjs from "dayjs";

export default function Employee() {
    const [searchText, setSearchText] = useState('')
    const { data: employees } = useSWR(`users/employees/?lastname=${searchText}`, {
        revalidateOnFocus: false,
    });

    const onKeyUpSearch = (e) => {
        if(e.code === 'Enter')
            setSearchText(e.target.value)
    }

    const onChangeSearch = (e) => {
        if(e.target.value === ''){
            setSearchText('')
        }
    }

	return (
        <AdminLayout
            title="Employees"
        >
            <div className="flex flex-col">
                <div className="overflow-x-auto">
                    <SearchBar
                        onChange={onChangeSearch}
                        onKeyUp={onKeyUpSearch}
                        text={searchText}
                        setText={setSearchText}
                        hasQuery={false}
                        placeholder="Search employee lastname"
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
                                            ID
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase "
                                        >
                                            Name
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase "
                                        >
                                            Position
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase "
                                        >
                                            Date Hired
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase "
                                            style={{width: '50px'}}
                                        >
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {employees?.map((d) => (
                                        <Fragment key={d.id}>
                                            <tr>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                                                    {d.id}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                                    {d.user_employee?.firstname}&nbsp;
                                                    {d.user_employee?.mi}.&nbsp;
                                                    {d.user_employee?.lastname}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                                    {d.user_employee?.position}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                                    {dayjs(d.user_employee?.date_hired).format('MMMM DD, YYYY')}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                                    <div className="flex gap-5">
                                                        <a
                                                            className="text-indigo-500 hover:text-indigo-700"
                                                            href="#"
                                                        >
                                                            Edit
                                                        </a>
                                                        <a
                                                            className="text-red-500 hover:text-red-700"
                                                            href="#"
                                                        >
                                                            Delete
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td 
                                                colSpan="5"
                                                className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                                                    <div className="flex gap-5 text-sm font-medium justify-end">
                                                        <Link href={`/hr/employees/attendance/${d.id}`}
                                                            className="text-indigo-500 hover:text-indigo-700"
                                                        >
                                                            Attendance
                                                        </Link>
                                                        <Link href={`/hr/employees/ratings/${d.id}`}
                                                            className="text-indigo-500 hover:text-indigo-700"
                                                        >
                                                            Ratings
                                                        </Link>
                                                        <Link href={`/hr/employees/backjobs/${d.id}`}
                                                            className="text-indigo-500 hover:text-indigo-700"
                                                        >
                                                            Back Jobs
                                                        </Link>
                                                        <Link href={`/hr/employees/sales/${d.id}`}
                                                            className="text-indigo-500 hover:text-indigo-700"
                                                        >
                                                            Sales
                                                        </Link>
                                                        <Link href={`/hr/employees/evaluation/${d.id}`}
                                                            className="text-indigo-500 hover:text-indigo-700"
                                                        >
                                                            Evaluations
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        </Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
	);
}