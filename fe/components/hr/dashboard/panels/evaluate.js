import Link from 'next/link';
import { useState } from 'react';
import useSWR from "swr";

export default function Evaluate() {
	const { data: employees } = useSWR('users/employees/');

	function renderEmployees () {
		if(employees?.length == 0)
			return (<>No data</>)
		else{
		return employees?.map((d)=>(
			<tr key={d.id} className='bg-white border-b text-gray-800'>
						<td scope='row' className='py-4 px-6 font-medium'>
							<span>{d?.user_employee?.firstname.toUpperCase()}, </span>
							<span>{d?.user_employee?.lastname.toUpperCase()}</span>
						</td>
						<td>{d?.user_employee?.position}</td>
						<td className='py-4 px-6'>
							<Link className='text-blue-600' 
									href={`/hr/employee/${d.id}`}>
								View
							</Link>
						</td>
					</tr>
		))
		}
	}

	return (
		<div className='flex flex-col items-center w-full px-4'>
			<div className='flex flex-col justify-center h-full w-full mb-5'>
				<div className='w-full min-w-full max-w-2xl mx-auto bg-white shadow-lg rounded-sm border border-gray-200'>
					<header className='px-5 py-4 border-b border-gray-100'>
						<h2 className='font-semibold text-gray-800'>Evaluate Employee</h2>
					</header>
					<div className='overflow-x-auto relative'>
						<table className='w-full min-w-full text-sm text-left text-gray-500 dark:text-gray-400'>
							<thead className='text-md text-gray-700 uppercase bg-gray-50'>
								<tr>
									<th scope='col' className='py-3 px-6'>
										Employee Name
									</th>
									<th scope='col' className='py-3 px-6'>
										Position
									</th>
									<th scope='col' className='py-3 px-6'>
										Action
									</th>
								</tr>
							</thead>
							<tbody>
								{renderEmployees()}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	)
}
