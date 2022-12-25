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

export default function Positions() {
    const [pageIndex, setPageIndex] = useState(1);
    const [searchText, setSearchText] = useState('')
    const { data: positions ,mutate } = useSWR(`hr/positions/?position=${searchText}&page=${pageIndex}`, {
        revalidateOnFocus: false,
    });
    const [status, setStatus] = useState({
		error: false,
		loading: false,
		success: false,
		infoMessage: '',
	})

    function handleDelete(id){
        if (confirm(`Are you sure you want to delete this Position?`)) {
            setStatus({ 
                error: false, 
                success: false, 
                loading:true, 
                infoMessage: 'Deleting Position' 
            })
            axiosInstance.delete(`hr/positions/${id}/`)
            .then((_e) => {
                mutate()
                setStatus({ 
                    error: false, 
                    success: true, 
                    loading: false, 
                    infoMessage: 'Position Removed.' 
                })
            }).catch((_e) => {
                if(500 == _e?.response?.status){
                    setStatus({ 
                        error: true, 
                        success: false, 
                        loading: false, 
                        infoMessage: 'Unable to Delete, There are employees who have this Position.'
                    })
                }else{
                    setStatus({ 
                        error: true, 
                        success: false, 
                        loading: false, 
                        infoMessage: 'Something went wrong.' 
                    })
                }
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
            title="Positions"
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
                            href={`/hr/positions/create/`}
                        >
                            Add Position
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
                                            ID
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase "
                                        >
                                            Title
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase "
                                        >
                                            Rating
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase "
                                        >
                                            Back job
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase "
                                        >
                                            Sales
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
                                    {!positions ? (
                                        <tr>
                                            <td 
                                                colSpan="6"
                                                className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap text-center">
                                                    <Loader/>
                                            </td>
                                        </tr>
                                    ):(
                                        !positions?.results?.length && (
                                            <tr>
                                                <td 
                                                    colSpan="7"
                                                    className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap text-center">
                                                        No record Found
                                                </td>
                                            </tr>
                                        )
                                    )}
                                    {positions?.results?.map((d) => (
                                        <Fragment key={d.id}>
                                            <tr>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                                                    {d.id}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                                    {d.title}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                                    {d.has_rating ? <span className="text-green-500">True</span> : <span className="text-red-500">False</span>}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                                    {d.has_backjob ? <span className="text-green-500">True</span> : <span className="text-red-500">False</span>}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                                    {d.has_sales ? <span className="text-green-500">True</span> : <span className="text-red-500">False</span>}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                                    <div className="flex gap-5">
                                                        <a
                                                            className="text-indigo-500 hover:text-indigo-700"
                                                            href={`/hr/positions/edit/${d.id}`}
                                                        >
                                                            Update
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
                                        </Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-between mt-3">
                            <div>
                                {paginationRecordCount(pageIndex, positions?.count)}
                            </div>
                            <Pagination 
                                    count={positions?.count ? Math.ceil(positions?.count/PAGINATION_COUNT) : 0}
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