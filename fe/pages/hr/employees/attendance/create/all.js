import { useRouter } from "next/router";
import useSWR from "swr";
import AdminLayout from "../../../../../components/AdminLayout";
import { useState } from "react";
import dayjs from "dayjs";
import axiosInstance from "../../../../../utils/axiosInstance";
import AlertMessages from "../../../../../components/AlertMessages";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";

const AttendanceSchema = yup.object().shape({
	date: yup.date().typeError('Must be a date').required("This field is required."),
    reason: yup.string().required("This field is required."),
});

export default function CreateOnsiteAttendance(){
	const { register, handleSubmit, formState: { errors }, reset } = useForm({
		mode: 'onSubmit',
		resolver: yupResolver(AttendanceSchema),
	})
    const router = useRouter();
    //user id
	const [status, setStatus] = useState({
		error: false,
		loading: false,
		success: false,
		infoMessage: '',
	})

    function onClickSubmit(data){
        data = {
            ...data,
            time_in: '08:00',
            time_out: '17:00',
            completed: true,
        }
		setStatus({ 
			error: false, 
			success: false, 
			loading:true, 
			infoMessage: 'Saving.. This might take a while' 
		})
        axiosInstance.patch(`employee/attendance/`, data)
        .then((_e) => {
            setStatus({ 
                error: false, 
                success: true, 
                loading: false, 
                infoMessage: 'Attendance successfully added for all employess.' 
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

    return (
        <AdminLayout
            title="Attendance"
            hasBack={true}
        >
            <div className="mt-10 sm:mt-0">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                    <div className="px-4 sm:px-0">
                        <div className="mt-4">
                            This will add attendance for all employees
                        </div>
                    </div>
                </div>
                <div className="mt-5 md:col-span-2 md:mt-0">
                    <form onSubmit={handleSubmit(onClickSubmit)} noValidate>
                        <div className="overflow-hidden shadow sm:rounded-md">
                            <div className="bg-white px-4 py-5 sm:p-6">
                                <AlertMessages
                                    className="mb-3"
                                    error={status.error}
                                    success={status.success}
                                    loading={status.loading}
                                    message={status.infoMessage}
                                />
                                <div className="mt-5">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Date
                                    </label>
                                    <input 
                                        {...register('date')} 
                                        defaultValue={dayjs(new Date()).format('YYYY-MM-DD')}
                                        type="date" 
                                        className="input !w-[200px]" />
                                    <div className="text-red-500 text-sm pt-1">{errors?.date && errors?.date?.message}</div>
                                </div>
                                <div className="mt-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Reason
                                    </label>
                                    <textarea
                                        {...register('reason')} 
                                        id="" 
                                        cols="30" 
                                        rows="5" 
                                        className="input !p-2 !h-auto !min-w-min">
                                    </textarea>
                                    <div className="text-red-500 text-sm pt-1">{errors?.reason && errors?.reason?.message}</div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                            <button
                                disabled={status.loading}
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