import { Fragment } from "react"
import SearchBar from "../SearchBar"
import dayjs from "dayjs"

export default function SelectUserModal(
    {setIsModalOpen, employees, searchText, setSearchText, setEmployeeTarget, 
        employeeTarget, setConfirmSelection, confirmSelection, setEmployeeSelected, employeeSelected
    }){
    const onKeyUpSearch = (e) => {
        if(e.code === 'Enter')
            setSearchText(e.target.value)
    }

    const onChangeSearch = (e) => {
        if(e.target.value === ''){
            setSearchText('')
        }
    }
    function close(){
        setIsModalOpen(false)
        // setEmployeeTarget({
        //     id: -1,
        //     name: '',
        // })
    }
    function setEmployeeSelection(d){
        setEmployeeSelected({
            id: d?.id,
            name: `${d?.user_employee?.firstname} ${d?.user_employee?.mi} ${d?.user_employee?.lastname}`,
            position: d?.user_employee?.position,
            dateHired: dayjs(d?.user_employee?.date_hired).format('MMMM DD, YYYY'),
        })
    }

    function confirm(){
        setIsModalOpen(false)
        setConfirmSelection(!confirmSelection)
    }
    return (
        <div className="bg-gray-900 bg-opacity-30 fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-modal md:h-full">
            <div className="relative w-full h-full max-w-2xl md:h-auto m-auto mt-[5%]">
                <div className="relative bg-white rounded-lg shadow">
                    <div className="flex items-center justify-between p-4 border-b rounded-t">
                        <h3 className="text-lg text-gray-900">
                            Select user to load
                        </h3>
                        <button 
                        onClick={close}
                        type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>  
                        </button>
                    </div>
                    <div className="p-6 space-y-2">
                        <SearchBar
                            onChange={onChangeSearch}
                            onKeyUp={onKeyUpSearch}
                            text={searchText}
                            setText={setSearchText}
                            hasQuery={false}
                            placeholder="Search employee lastname"
                            className="pb-0"
                        />
                        {employeeSelected.id > 0 && (
                            <div className="px-2 text-sm space-x-4">
                                <span>Selected</span>
                                <span>id: {employeeSelected.id} </span>
                                <span>name: {employeeSelected.name}</span>
                            </div>
                        )}
                        
                        <div className="w-full inline-block align-middle">
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
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {employees?.map((d) => (
                                            <Fragment key={d.id}>
                                                <tr 
                                                    onClick={() => setEmployeeSelection(d)}
                                                    className="cursor-pointer hover:bg-gray-100">
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
                                                </tr>
                                            </Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-end p-6 space-x-2 border-t border-gray-200 rounded-b">
                        <button 
                        onClick={close}
                        className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10">
                            Cancel
                            </button>
                        <button 
                        onClick={confirm}
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ">
                                Confirm
                            </button>
                    </div>
                </div>
            </div>
        </div>
    )
}