import { useRouter } from "next/router";
import useSWR from "swr";
import AdminLayout from "../../../../components/AdminLayout";
import SearchBar from "../../../../components/SearchBar";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import AlertMessages from "../../../../components/AlertMessages";
import axiosInstance from "../../../../utils/axiosInstance";
import {paginationRecordCount, PAGINATION_COUNT} from '../../../../helper/paginationRecordCount'
import { MenuItem, Pagination, Select } from "@mui/material";


export default function Attendance(){
    const router = useRouter();
    const { id } = router.query
    const [pageIndex, setPageIndex] = useState(1);
    const [filterText, setFilterText] = useState('')
    const [type, setType] = useState('')
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const { data: emp } = useSWR(id ? `users/details/${id}/` : '', {
        revalidateOnFocus: false,       
    });
	const { data: attendance,mutate } = useSWR(id ? `employee/attendance/${id}/?type=${type}&filter=${filterText}&page=${pageIndex}&from=${fromDate}&to=${toDate}` : '', {
        revalidateOnFocus: false,       
    });
    console.log(attendance)
    const [viewImage, setViewImage] = useState('');

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
                  infoMessage: 'Deleting Recorded Attendance.' 
              })
              axiosInstance.delete(`employee/attendance/${id}/${a_id}`)
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


    function viewSignatureClick(image){
        setViewImage(image);
    }

    function viewImageClose(){
        setViewImage('');
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
            title="Attendance"
            hasBack={true}
        >
            <div className="flex gap-[50px]">
                <div> 
                    <span className="text-gray-500">Name: </span>
                    <span>{emp?.user_employee?.firstname} {emp?.user_employee?.mi}. {emp?.user_employee?.lastname}</span>
                </div>
                <div> 
                    <span className="text-gray-500">Position: </span>
                    <span> {emp?.user_employee?.position}</span>
                </div>
            </div>
            <div className="mt-1">
                <span className="text-gray-500">Date Hired: </span>
                <span> {dayjs(emp?.user_employee?.date_hired).format('MMMM DD, YYYY')} </span>
            </div>
            <div className="flex justify-end py-2">
                <Link 
                    className="ml-3 text-blue-500"
                    href={`/hr/employees/attendance/create/${id}`}
                >
                    Add Attendance
                </Link>
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
                    <div className="overflow-x-auto">
                        <div className="flex justify-between items-center">
                            <div className="flex ">
                                <SearchBar
                                    onChange={onChangeSearch}
                                    onKeyUp={onKeyUpSearch}
                                    text={filterText}
                                    setText={setFilterText}
                                    placeholder="Search and Enter | Customer Name"
                                />
                                <select
                                    defaultValue=''
                                    className="block w-[150px] mt-3 ml-2 p-2 pl-3 text-sm border border-indigo-500 rounded-md focus:border-indigo-800 outline-none bg-transparent h-12"
                                    onChange={(e) => setType(e.target.value)}
                                    >
                                    <option value =''>All</option>
                                    <option value ='ONSITE'>Onsite</option>
                                    <option value ='OFFSITE'>Offsite</option>
                                </select>               
                            </div>
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
                                            Type
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
                                    {Array.isArray(attendance?.results) ? attendance?.results.map((d) => (
                                        <tr key={d.id}>
                                            <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                                {dayjs(d.date).format('MMMM DD, YYYY')}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                                                {d.type}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                                                {d.type == 'OFFSITE' ? d.customer_name : ''}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                                {d.location}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                                {d.type == 'OFFSITE' ? <button
                                                    onClick={() => viewSignatureClick(d.signature)}
                                                    className="text-indigo-500 hover:text-indigo-700">
                                                        View Signature
                                                </button> : <></>}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                                                <div className="flex gap-5">
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
                                    count={attendance?.count ? Math.ceil(attendance?.count/PAGINATION_COUNT) : 0}
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