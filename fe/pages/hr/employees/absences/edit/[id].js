import { useRouter } from "next/router";
import useSWR from "swr";
import AdminLayout from "../../../../../components/AdminLayout";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import axiosInstance from "../../../../../utils/axiosInstance";
import AlertMessages from "../../../../../components/AlertMessages";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { useForm } from "react-hook-form";

const AbsencesSchema = yup.object().shape({
	reason: yup.string().required("This field is required.").max(255, "Only 255 characters is allowed."),
	date: yup.date().typeError('Must be a date').required("This field is required."),
});

export default function EditAbsence(){
    const router = useRouter();
    //user id
    const { id } = router.query
	const { data: e } = useSWR(id ? `employee/absences/retrieve/${id}` : '', {
        revalidateOnFocus: false,       
    });
    

	const { register, handleSubmit, formState: { errors }, setValue } = useForm({
		mode: 'onSubmit',
		resolver: yupResolver(AbsencesSchema),
	})

    useEffect(() => {
        setValue('reason', e?.absence?.reason)
        setValue('date', dayjs(e?.absence?.date).format('YYYY-MM-DD'))
    }, [e])

	const [status, setStatus] = useState({
		error: false,
		loading: false,
		success: false,
		infoMessage: '',
	})

    function onClickSubmit(data){
		setStatus({ 
			error: false, 
			success: false, 
			loading:true, 
			infoMessage: 'Updating data.' 
		})
        axiosInstance.put(`employee/absences/${id}/`, data)
        .then((_e) => {
            setStatus({ 
                error: false, 
                success: true, 
                loading: false, 
                infoMessage: 'Record Successfully Updated.' 
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
            title="Update Absence"
            hasBack={true}
        >
            <div className="mt-10 sm:mt-0">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                    <div className="px-4 sm:px-0">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Employee Information</h3>
                        <div className="mt-4">
                            Name:&nbsp;
                            {e?.user?.user_employee?.firstname}&nbsp;
                            {e?.user?.user_employee?.mi}.&nbsp;
                            {e?.user?.user_employee?.lastname}
                        </div>
                        <div>
                            Position:&nbsp;
                            {e?.user?.user_employee?.position?.title}&nbsp;
                        </div>
                        <div>
                            Date Hired:&nbsp;
                            {dayjs(e?.user?.user_employee?.date_hired).format('MMMM DD, YYYY')}&nbsp;
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
                                <div className="col-span-6 sm:col-span-6">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Reason
                                        </label>
                                        <input
                                            {...register('reason')} 
                                            type="text"
                                            autoComplete="off"
                                            className="input"
                                        />
                                        <div className="text-red-500 text-sm pt-1">{errors?.reason && errors?.reason?.message}</div>
                                    </div>
                                <div className="mt-5">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Date
                                    </label>
                                    <input 
                                        {...register('date')} 
                                        disabled = {true}
                                        type="text" 
                                        className="input !w-[200px]" />
                                    <div className="text-red-500 text-sm pt-1">{errors?.date && errors?.date?.message}</div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                            <button
                                disabled={status.loading}
                                type="submit"
                                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Update
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