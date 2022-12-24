import { useRouter } from "next/router";
import useSWR from "swr";
import AdminLayout from "../../../../../components/AdminLayout";
import { useState } from "react";
import dayjs from "dayjs";
import axiosInstance from "../../../../../utils/axiosInstance";
import AlertMessages from "../../../../../components/AlertMessages";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { extractTimeLate24hrFormat } from "../../../../../helper/datetime";


const AttendanceSchema = yup.object().shape({
	date: yup.date().typeError('Must be a date').required("This field is required."),
    reason: yup.string().required("This field is required."),
    time_in: yup.string().required("This field is required."),
    time_out: yup.string().required("This field is required."),
});

export default function CreateOnsiteAttendance(){
    const router = useRouter();
    //user id
    const { id } = router.query
	const { data: e } = useSWR(id ? `users/details/${id}/` : '', {
        revalidateOnFocus: false,       
    });

	const { register, handleSubmit, formState: { errors }, reset } = useForm({
		mode: 'onSubmit',
		resolver: yupResolver(AttendanceSchema),
        defaultValues: {
            time_in: '08:00',
            time_out: '17:00'
        }
	})

	const [status, setStatus] = useState({
		error: false,
		loading: false,
		success: false,
		infoMessage: '',
	})

    function onClickSubmit(data){
        let newData = {
            ...data,
            minutes_late: extractTimeLate24hrFormat(data?.time_in),
            completed: true,
        }
		setStatus({ 
			error: false, 
			success: false, 
			loading:true, 
			infoMessage: 'Saving data.' 
		})
        axiosInstance.post(`employee/attendance/${id}/`, newData)
        .then((_e) => {
            setStatus({ 
                error: false, 
                success: true, 
                loading: false, 
                infoMessage: 'Attendance successfully recorded.' 
            })
            reset()
        }).catch((_e) => {
            if(400 == _e?.response?.status){
                setStatus({ 
                    error: true, 
                    success: false, 
                    loading: false, 
                    infoMessage: _e?.response?.data ?? '' 
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

    return (
        <AdminLayout
            title="Add Attendance"
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
                            {e?.user_employee?.type == 'TECHNICIAN' ? 'Technician' : 'Sales Executive' }&nbsp;
                        </div>
                        <div>
                            Date Hired:&nbsp;
                            {dayjs(e?.user_employee?.date_hired).format('MMMM DD, YYYY')}&nbsp;
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
                                <div className="grid grid-cols-6 gap-6">
                                    <div className="col-span-6 sm:col-span-6">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Add Attendance
                                        </label>
                                    </div>
                                </div>
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
                                <div className="mt-3 flex gap-5 items-center">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Time In
                                        </label>
                                        <input 
                                            {...register('time_in')} 
                                            type="time" 
                                            className="input !w-[200px]"/>
                                        <div className="text-red-500 text-sm pt-1">{errors?.time_in && errors?.time_out?.message}</div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Time Out
                                        </label>
                                        <input 
                                            {...register('time_out')} 
                                            type="time" 
                                            className="input !w-[200px]"/>
                                        <div className="text-red-500 text-sm pt-1">{errors?.time_out && errors?.time_out?.message}</div>
                                    </div>
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