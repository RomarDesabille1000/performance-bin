import Link from 'next/link';
import { Fragment, useState } from 'react';
import useSWR from 'swr';
import AdminLayout from '../../../components/AdminLayout';
import SearchBar from '../../../components/SearchBar';
import dayjs from "dayjs";
import AlertMessages from '../../../components/AlertMessages';
import axiosInstance from '../../../utils/axiosInstance';
import {Pagination} from '@mui/material';
import { paginationRecordCount, PAGINATION_COUNT } from '../../../helper/paginationRecordCount';
import Loader from '../../../components/Loader';

export default function Employee() {
    const [pageIndex, setPageIndex] = useState(1);
    const [searchText, setSearchText] = useState('')
    const { data: employees,mutate } = useSWR(`users/employees/?lastname=${searchText}&page=${pageIndex}`, {
        revalidateOnFocus: false,
    });
    const { data: positions,} = useSWR(
		`hr/positions/all/`,
		{
			revalidateOnFocus: false,
		}
	);
    function getPosition (id) {
        if(positions == undefined)
            return ''
        for(let pos of positions){
            if(pos.id == id) return pos.title
        }
        return 'No Title'
    }
    function showType (id, type) {
        if(positions == undefined)
            return false
        for(let pos of positions){
            if(pos.id != id) 
                continue
            if(type == 'rating')
                return pos.has_rating
            if(type == 'backjob')
                return pos.has_backjob
            if(type == 'sales')
                return pos.has_sales
        }
        return false
    }
    const [status, setStatus] = useState({
		error: false,
		loading: false,
		success: false,
		infoMessage: '',
	})

    function handleDelete(id){
        if (confirm(`Are you sure you want to delete this User?`)) {
            setStatus({ 
                error: false, 
                success: false, 
                loading:true, 
                infoMessage: 'Deleting Employee' 
            })
            axiosInstance.delete(`users/details/${id}/`)
            .then((_e) => {
                mutate()
                setStatus({ 
                    error: false, 
                    success: true, 
                    loading: false, 
                    infoMessage: 'Employee Removed.' 
                })
            }).catch((_e) => {
                setStatus({ 
                    error: true, 
                    success: false, 
                    loading: false, 
                    infoMessage: 'Something went wrong.' 
                })
            })
        }    
    }

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
                    <div className="flex justify-end py-2">
                        <Link 
                            className="mr-3 text-blue-500"
                            href={`/hr/employees/create/`}
                        >
                            Add Employee
                        </Link>
                    </div>
                    <AlertMessages
                        className="mb-3"
                        error={status.error}
                        success={status.success}
                        loading={status.loading}
                        message={status.infoMessage}
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
                                            EMP ID
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
                                            Designation
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
                                    {!employees ? (
                                        <tr>
                                            <td 
                                                colSpan="6"
                                                className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap text-center">
                                                    <Loader/>
                                            </td>
                                        </tr>
                                    ):(
                                        !employees?.results?.length && (
                                            <tr>
                                                <td 
                                                    colSpan="7"
                                                    className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap text-center">
                                                        No record Found
                                                </td>
                                            </tr>
                                        )
                                    )}
                                    {employees?.results?.map((d) => (
                                        <Fragment key={d.id}>
                                            <tr>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                                                    {d.user_employee.emp_id}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                                    {d.user_employee?.firstname}&nbsp;
                                                    {d.user_employee?.mi}.&nbsp;
                                                    {d.user_employee?.lastname}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                                    {getPosition(d.user_employee?.position)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                                    {d.user_employee?.designation == 'SUPERVISOR' ? 'Supervisor' : 'Staff' }
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                                    {dayjs(d.user_employee?.date_hired).format('MMMM DD, YYYY')}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                                    <div className="flex gap-5">
                                                        <a
                                                            className="text-indigo-500 hover:text-indigo-700"
                                                            href={`/hr/employees/edit/${d.id}`}
                                                        >
                                                            Edit
                                                        </a>
                                                        <button
                                                            className="text-red-500 hover:text-red-700"
                                                            onClick = {()=>handleDelete(d.id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td 
                                                colSpan="6"
                                                className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                                                    <div className="flex gap-5 text-sm font-medium justify-end">
                                                        <Link href={`/hr/employees/absences/${d.id}`}
                                                            className="text-indigo-500 hover:text-indigo-700"
                                                        >
                                                            Absences
                                                        </Link>
                                                        <Link href={`/hr/employees/attendance/${d.id}`}
                                                            className="text-indigo-500 hover:text-indigo-700"
                                                        >
                                                            Attendance
                                                        </Link>
                                                        <Link href={`/hr/employees/ratings/${d.id}`}
                                                            className={showType(d.user_employee?.position, 'rating') ? 
                                                            "text-indigo-500 hover:text-indigo-700" : 
                                                            "hidden"}
                                                        >
                                                            Ratings
                                                        </Link>
                                                        <Link href={`/hr/employees/backjobs/${d.id}`}
                                                            className={showType(d.user_employee?.position, 'backjob') ? 
                                                                "text-indigo-500 hover:text-indigo-700" : 
                                                                "hidden"}
                                                        >
                                                            Back Jobs
                                                        </Link>
                                                        <Link href={`/hr/employees/sales/${d.id}`}
                                                            className={showType(d.user_employee?.position, 'sales') ? 
                                                            "text-indigo-500 hover:text-indigo-700" : 
                                                            "hidden"}
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
                        <div className="flex justify-between mt-3">
                            <div>
                                {paginationRecordCount(pageIndex, employees?.count)}
                            </div>
                            <Pagination 
                                    count={employees?.count ? Math.ceil(employees?.count/PAGINATION_COUNT) : 0}
                                    page={pageIndex}
                                    color="primary"
                                    onChange={(_e, n) => setPageIndex(n)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
	);
}