import Link from 'next/link';
import { useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

export default function Employee() {
	const [openAddModal, setOpenAddModal] = useState(false);
	return (
        <AdminLayout
            title="Employees"
        >
            <div className='flex flex-col items-center w-full px-4'>
                <div className='flex flex-col justify-center h-full w-full mb-5'>
                    <div className='w-full min-w-full max-w-2xl mx-auto bg-white shadow-lg rounded-sm border border-gray-200'>
                        <header className='px-5 py-4 border-b border-gray-100'>
                            <h2 className='font-semibold text-gray-800'>Employee List</h2>
                        </header>
                        <div className='overflow-x-auto relative'>
                            <table className='w-full min-w-full text-sm text-left text-gray-500 dark:text-gray-400'>
                                <thead className='text-md text-gray-700 uppercase bg-gray-50'>
                                    <tr>
                                        <th scope='col' className='py-3 px-6'>
                                            Customer Name
                                        </th>
                                        <th scope='col' className='py-3 px-6'>
                                            Date
                                        </th>
                                        <th scope='col' className='py-3 px-6'>
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className='bg-white border-b text-gray-800'>
                                        <th scope='row' className='py-4 px-6 font-medium'>
                                            John Doe
                                        </th>
                                        <td className='py-4 px-6'>Nov 11, 2022</td>
                                        <td className='py-4 px-6'>
                                            <Link className='text-blue-600' href='/admin/customer/1'>
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <button className="btn w-full my-5" onClick = {()=>setOpenAddModal(!openAddModal)}>ADD</button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
	);
}