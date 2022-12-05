import Link from 'next/link';
import { useState } from 'react';
import useSWR from "swr";
import AdminLayout from '../../../components/AdminLayout';
import SearchBar from '../../../components/SearchBar';

export default function Evaluate() {
    const [searchText, setSearchText] = useState('')
    const { data: employees } = useSWR(`users/employees/selection/?lastname=${searchText}`, {
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
                                            Position
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
                                    {employees?.map((d) => (
                                        <tr key={d.id}>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap">
                                                {d.id}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                                {d.user_employee?.firstname}&nbsp;
                                                {d.user_employee?.mi}&nbsp;
                                                {d.user_employee?.lastname}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                                                {d.user_employee?.position}
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
                    </div>
                </div>
            </div>
		</AdminLayout>
	)
}