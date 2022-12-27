import Link from 'next/link';
import { useState } from 'react';
import useSWR from "swr";
import AdminLayout from '../../../components/AdminLayout';
import SearchBar from '../../../components/SearchBar';
import {Pagination} from '@mui/material';
import { paginationRecordCount, PAGINATION_COUNT } from "../../../helper/paginationRecordCount";
import Loader from '../../../components/Loader';


export default function Evaluate() {
    const [pageIndex, setPageIndex] = useState(1);
    const [searchText, setSearchText] = useState('')
    const { data: employees } = useSWR(`users/employees/selection/?lastname=${searchText}&page=${pageIndex}`, {
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
			title="Evaluate Employee"
		>
            <div className="flex flex-col max-w-[600px] m-auto">
				<div className="mb-2">Select Employee to Evaluate</div>
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
                                                {d.id}
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
													href={`/hr/evaluate/${d.id}`}>
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
            </div>
		</AdminLayout>
	)
}