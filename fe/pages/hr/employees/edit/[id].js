import { useRouter } from "next/router";
import useSWR from "swr";
import AdminLayout from "../../../../components/AdminLayout";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import axiosInstance from "../../../../utils/axiosInstance";
import AlertMessages from "../../../../components/AlertMessages";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { useForm } from "react-hook-form";


const EmployeeSchema = yup.object().shape({
    email: yup.string().required("This field is required.").email("must be a valid email"),
    firstname: yup.string().required("This field is required.").max(255, "Only 255 characters is allowed."),
    lastname: yup.string().required("This field is required.").max(255, "Only 255 characters is allowed."),
    mi: yup.string().required("This field is required.").max(2, "Only 1 or 2 characters is allowed."),
    position: yup.string().required("This field is required."),
    emptype: yup.string().required("This field is required."),
	date_hired: yup.date().typeError('Must be a date').required("This field is required."),
});

export default function EditEmployee(){
    const router = useRouter();
    //user id
    const { id } = router.query
    const { data: emp } = useSWR(id ? `users/details/${id}/` : '', {
        revalidateOnFocus: false,       
    });
    useEffect(() => {
        setValue('firstname', emp?.user_employee?.firstname)
        setValue('lastname', emp?.user_employee?.lastname)
        setValue('mi', emp?.user_employee?.mi)
        setValue('emptype', emp?.user_employee?.type)
        setValue('position', emp?.user_employee?.position)
        setValue('date_hired', dayjs(emp?.user_employee?.date_hired).format('YYYY-MM-DD'))
        setValue('email', emp?.email)
    }, [emp])

	const { register, handleSubmit, formState: { errors }, setValue } = useForm({
		mode: 'onSubmit',
		resolver: yupResolver(EmployeeSchema),
	})

	const [status, setStatus] = useState({
		error: false,
		loading: false,
		success: false,
		infoMessage: '',
	})

    function onClickSubmit(data){
        try{
            let newData = {
                firstname: data.firstname,
                lastname: data.lastname,
                mi: data.mi,
                position: data.position,
                type: data.emptype,
                date_hired: data.date_hired,
                
            }
            setStatus({ 
                error: false, 
                success: false, 
                loading:true, 
                infoMessage: 'Saving data.' 
            })
            axiosInstance.put(`users/details/${emp?.user_employee?.id ?? ''}/`, newData)
            .then((_e) => {
                setStatus({ 
                    error: false, 
                    success: true, 
                    loading: false, 
                    infoMessage: 'Employee successfully Updated.' 
                })
            }).catch((_e) => {
                setStatus({ 
                    error: true, 
                    success: false, 
                    loading: false, 
                    infoMessage:  'Something went wrong.'
                })
            })
        }catch(err){}
    }

    return (
        <AdminLayout
            title="Edit Employee"
            hasBack={true}
        >
            <div className="mt-10 sm:mt-0">
                <div className="md:grid md:grid-cols-3 md:gap-6">
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
                                    <div className="col-span-6 sm:col-span-3">
                                        <label className="block text-sm font-medium text-gray-700">
                                            First Name
                                        </label>
                                        <input
                                            {...register('firstname')} 
                                            type="text"
                                            autoComplete="off"
                                            className="input"
                                        />
                                        <div className="text-red-500 text-sm pt-1">{errors?.firstname && errors?.firstname?.message}</div>
                                    </div>
                                    <div className="col-span-6 sm:col-span-3">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Last Name
                                        </label>
                                        <input
                                            {...register('lastname')} 
                                            type="text"
                                            autoComplete="off"
                                            className="input"
                                        />
                                        <div className="text-red-500 text-sm pt-1">{errors?.lastname && errors?.lastname?.message}</div>
                                    </div>
                                    <div className="col-span-6 sm:col-span-4">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Middle Initial
                                        </label>
                                        <input
                                            {...register('mi')} 
                                            type="text"
                                            autoComplete="off"
                                            className="input !w-[100px]"
                                        />
                                        <div className="text-red-500 text-sm pt-1">{errors?.mi && errors?.mi?.message}</div>
                                    </div>
                                    <div className="col-span-6 sm:col-span-4">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Position
                                        </label>
                                        <select
                                            id='employee_type'
                                            className='border rounded-[5px] px-2 py-1 bg-white !w-[200px]'
                                            defaultValue='SALESEXECUTIVE'
                                            {...register('emptype')} 
                                        >
                                            <option value='SALESEXECUTIVE'>Sales Executive</option>
                                            <option value='TECHNICIAN'>Technician</option>
                                        </select>
                                        <div className="text-red-500 text-sm pt-1">{errors?.emptype && errors?.emptype?.message}</div>
                                    </div>
                                    <div className="col-span-6 sm:col-span-4">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Rank
                                        </label>
                                        <input
                                            {...register('position')} 
                                            type="text"
                                            autoComplete="off"
                                            className="input"
                                        />
                                        <div className="text-red-500 text-sm pt-1">{errors?.position && errors?.position?.message}</div>
                                    </div>
 

                                   
                                </div>
                                <div className="mt-5">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Date Hired
                                    </label>
                                    <input 
                                        {...register('date_hired')} 
                                        defaultValue={dayjs(new Date()).format('YYYY-MM-DD')}
                                        type="date" 
                                        className="input !w-[200px]" />
                                    <div className="text-red-500 text-sm pt-1">{errors?.date_hired && errors?.date_hired?.message}</div>
                                </div>
                                <div className="col-span-6 sm:col-span-6">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Email
                                        </label>
                                        <input
                                            {...register('email')} 
                                            disabled
                                            type="text"
                                            autoComplete="off"
                                            className="input"
                                        />
                                        <div className="text-red-500 text-sm pt-1">{errors?.email && errors?.email?.message}</div>
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