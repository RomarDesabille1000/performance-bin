import { useRouter } from "next/router";
import useSWR from "swr";
import AdminLayout from "../../../../components/AdminLayout";
import SearchBar from "../../../../components/SearchBar";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import {Pagination} from '@mui/material';
import {paginationRecordCount, PAGINATION_COUNT} from '../../../../helper/paginationRecordCount'
import AlertMessages from "../../../../components/AlertMessages";
import axiosInstance from "../../../../utils/axiosInstance";


export default function Absences(){
    const router = useRouter();
    const { id } = router.query
    const [pageIndex, setPageIndex] = useState(1);
    const [filterText, setFilterText] = useState('')
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const { data: emp } = useSWR(id ? `users/details/${id}/` : '', {
        revalidateOnFocus: false,       
    });
    const { data: absences, mutate } = useSWR(id ? `employee/absences/${id}/?filter=${filterText}&page=${pageIndex}&from=${fromDate}&to=${toDate}` : '', {
          revalidateOnFocus: false,       
      });

    const [status, setStatus] = useState({
      error: false,
      loading: false,
      success: false,
      infoMessage: '',
    })
    function handleDelete(a_id){
        if (confirm(`Are you sure you want to delete id this Record?`)) {
            setStatus({ 
                error: false, 
                success: false, 
                loading:true, 
                infoMessage: 'Deleting Recorded Absence.' 
            })
            axiosInstance.delete(`employee/absences/${id}/${a_id}`)
            .then((_e) => {
                mutate()
                setStatus({ 
                    error: false, 
                    success: true, 
                    loading: false, 
                    infoMessage: 'Record deleted' 
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


    //search
    const onKeyUpSearch = (e) => {
      if(e.code === 'Enter')
        setFilterText(e.target.value)
    }

    const onChangeSearch = (e) => {
        if(e.target.value === ''){
          setFilterText('')
        }
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
    }

    const setToDateValue = (e) => {
        setToDate(e.target.value)
    }


    return(
        <AdminLayout
            title="Absences"
            hasBack={true}
        >
            <div className="flex gap-[50px]">
                <div> 
                    <span className="text-gray-500">Name: </span>
                    <span>{emp?.user_employee?.firstname} {emp?.user_employee?.mi}. {emp?.user_employee?.lastname}</span>
                </div>
                <div> 
                    <span className="text-gray-500">Position: </span>
                    <span>  {emp?.user_employee?.type == 'TECHNICIAN' ? 'Technician' : 'Sales Executive' }</span>
                </div>
            </div>
            <div className="mt-1">
                <span className="text-gray-500">Date Hired: </span>
                <span> {dayjs(emp?.user_employee?.date_hired).format('MMMM DD, YYYY')} </span>
            </div>
            <div className="flex justify-end py-2">
                <Link 
                    className="ml-3 text-blue-500"
                    href={`/hr/employees/absences/create/${id}`}
                >
                    Add Absences
                </Link>
            </div>
            <div className="flex flex-col">
                <div className="overflow-x-auto">
                  <div className="flex justify-between items-center">
                  <SearchBar
                      onChange={onChangeSearch}
                      onKeyUp={onKeyUpSearch}
                      text={filterText}
                      setText={setFilterText}
                      placeholder="Search and Enter | Reason"
                  />
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
                                            Date
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase "
                                        >
                                            Reason
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-xs font-bold text-left text-gray-500 uppercase "
                                        >
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {Array.isArray(absences?.results) ? absences?.results.map((d) => (
                                        <tr key={d.id}>
                                            <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                                {dayjs(d.date).format('MMMM DD, YYYY')}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                                                {d.reason}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                                                <div className="flex gap-5">
                                                    <Link
                                                        href={`/hr/employees/absences/edit/${d.id}`}
                                                        className="text-indigo-500 hover:text-indigo-700"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(d.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : <></>}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-end mt-3">
                            <Pagination 
                                    count={absences?.count ? Math.ceil(absences?.count/PAGINATION_COUNT) : 0}
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