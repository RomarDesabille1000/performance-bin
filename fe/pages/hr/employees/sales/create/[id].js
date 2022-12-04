import { useRouter } from "next/router";
import useSWR from "swr";
import AdminLayout from "../../../../../components/AdminLayout";
import { useState } from "react";
import dayjs from "dayjs";

export default function CreateSales(){
    const router = useRouter();
    //user id
    const { id } = router.query
	const { data: e } = useSWR(id ? `users/details/${id}/` : '', {
        revalidateOnFocus: false,       
    });

    console.log();

    return (
        <AdminLayout
            title="Create sales"
            hasBack={true}
        >
            <div className="mt-10 sm:mt-0">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                    <div className="px-4 sm:px-0">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Employee Information</h3>
                        <div className="mt-4">
                            Name:&nbsp;
                            {e?.user_employee?.firstname}&nbsp;
                            {e?.user_employee?.mi}.&nbsp;
                            {e?.user_employee?.lastname}
                        </div>
                        <div>
                            Position:&nbsp;
                            {e?.user_employee?.position}&nbsp;
                        </div>
                        <div>
                            Date Hired:&nbsp;
                            {dayjs(e?.user_employee?.date_hired).format('MMMM DD, YYYY')}&nbsp;
                        </div>
                    </div>
                </div>
                <div className="mt-5 md:col-span-2 md:mt-0">
                    <form action="#" method="POST">
                    <div className="overflow-hidden shadow sm:rounded-md">
                        <div className="bg-white px-4 py-5 sm:p-6">
                            <div className="grid grid-cols-6 gap-6">
                                <div className="col-span-6 sm:col-span-6">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Item Deal
                                    </label>
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        className="input"
                                    />
                                </div>

                                <div className="col-span-3 sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Amount
                                    </label>
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        className="input !w-[200px]"
                                    />
                                </div>
                            </div>
                            <div className="mt-5">
                                <label className="block text-sm font-medium text-gray-700">
                                    Date
                                </label>
                                <input 
                                    type="date" 
                                    className="input !w-[200px]" />
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                        <button
                            type="submit"
                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Save
                        </button>
                        </div>
                    </div>
                    </form>
                </div>
                </div>
            </div>
        </AdminLayout>
    )
}