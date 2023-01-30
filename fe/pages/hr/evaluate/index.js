import Link from 'next/link';
import { useState } from 'react';
import useSWR from "swr";
import AdminLayout from '../../../components/AdminLayout';
import SearchBar from '../../../components/SearchBar';
import {Pagination} from '@mui/material';
import { paginationRecordCount, PAGINATION_COUNT } from "../../../helper/paginationRecordCount";
import Loader from '../../../components/Loader';
import dayjs from 'dayjs';
import axiosInstance from '../../../utils/axiosInstance';


export default function Evaluate() {
    const [pageIndex, setPageIndex] = useState(1);
    const [searchText, setSearchText] = useState('')
	const [year, setYear] = useState(dayjs().year())
    const { data: employees } = useSWR(`users/employees/selection/${year}/?lastname=${searchText}&page=${pageIndex}`, {
        revalidateOnFocus: false,
    });

    const { data: status, mutate } = useSWR(`schedule/settings/evaluation/`, {
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

	function years(){
		let year = []
		for(let i = 2015; i <= dayjs().year(); i++){
			year.push(i)
		}
		return year;
	}

    function enableDisable(){
        axiosInstance.post(`schedule/settings/evaluation/`)
        .then((_e) => {
            mutate();
        }).catch((_e) => {
        })
    }

	return (
		<AdminLayout
			title="Evaluate Employee"
		>
            <div className="flex flex-col max-w-[600px] m-auto">
                <div className="flex justify-end">
                    <button 
                        type="button"
                        className="btn btn-error"
                        onClick={enableDisable}
                    >
                        {status ? 'Disable Evaluation': 'Enable Evaluation'}
                    </button>
                </div>
                {!status && (
                    <div className="bg-teal-100 border-t-4 border-teal-500 rounded-b text-teal-900 px-4 py-3 shadow-md mt-3">
                        <div className="flex">
                            <div>
                                <p className="font-bold">Evaluation is currenly disabled</p>
                                <p className="text-sm">Other evaluators will be notified once you enable the evaluation.</p>
                            </div>
                        </div>
                    </div>
                )}
				{status && 
                    <>
                        <div className="mb-2">Select Employee to Evaluate</div>
                            <div className="overflow-x-auto">
                                <div className="flex justify-between items-center">
                                    <SearchBar
                                        onChange={onChangeSearch}
                                        onKeyUp={onKeyUpSearch}
                                        text={searchText}
                                        setText={setSearchText}
                                        hasQuery={false}
                                        placeholder="Search employee lastname"
                                        className="min-w-[270px]"
                                    />
                                    <select
                                        className="border rounded-[5px] px-2 py-1 bg-white !w-[200px] mt-2"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                    >
                                        {years()?.map((d) => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
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
                                                        Department
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase "
                                                        style={{width: '150px'}}
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
                                                    <tr key={d.id}>
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                                                            {d.user_employee.emp_id}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                                            {d.user_employee?.firstname}&nbsp;
                                                            {d.user_employee?.mi}.&nbsp;
                                                            {d.user_employee?.lastname}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                                            {d?.user_employee?.position?.title}
                                                        </td>
                                                        <td>
                                                            <Link className='text-blue-600 text-sm' 
                                                                href={`/hr/evaluate/${year}/${d.id}/`}>
                                                                Select Employee
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="flex justify-between mt-3 pl-2">
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
                    </>
                }
            </div>
		</AdminLayout>
	)
}