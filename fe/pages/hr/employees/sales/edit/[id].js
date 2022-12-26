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
import { DoubleType } from "../../../../../helper/numbers";

const SalesSchema = yup.object().shape({
	item_deal: yup.string().required("This field is required."),
	amount: yup.number().typeError('This field is required and must be a number').min(0, "Must be greater than 0"),
	date: yup.date().typeError('Must be a date').required("This field is required."),
});

export default function EditSales(){
    const router = useRouter();
    //user id
    const { id } = router.query
	const { data: e } = useSWR(id ? `hr/sales/retrieve/${id}/` : '', {
        revalidateOnFocus: false,       
    });
   

	const { register, handleSubmit, formState: { errors }, setValue } = useForm({
		mode: 'onSubmit',
		resolver: yupResolver(SalesSchema),
	})

    useEffect(() => {
        setValue('item_deal', e?.sales?.item_deal)
        setValue('amount', e?.sales?.amount)
        setValue('date', dayjs(e?.sales?.date).format('YYYY-MM-DD'))
    }, [e])

	const [status, setStatus] = useState({
		error: false,
		loading: false,
		success: false,
		infoMessage: '',
	})

    function onClickSubmit(data){
        data['amount'] = DoubleType(data['amount'])
		setStatus({ 
			error: false, 
			success: false, 
			loading:true, 
			infoMessage: 'Updating data.' 
		})
        axiosInstance.put(`hr/sales/${id}/`, data)
        .then((_e) => {
            setStatus({ 
                error: false, 
                success: true, 
                loading: false, 
                infoMessage: 'Sale successfully updated.' 
            })
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
            title="Update sale"
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
                            Department:&nbsp;
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
                                <div className="grid grid-cols-6 gap-6">
                                    <div className="col-span-6 sm:col-span-6">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Item Deal
                                        </label>
                                        <input
                                            {...register('item_deal')} 
                                            type="text"
                                            autoComplete="off"
                                            className="input"
                                        />
                                        <div className="text-red-500 text-sm pt-1">{errors?.item_deal && errors?.item_deal?.message}</div>
                                    </div>

                                    <div className="col-span-6 sm:col-span-6">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Amount
                                        </label>
                                        <input
                                            {...register('amount')} 
                                            type="number"
                                            autoComplete="off"
                                            className="input !w-[200px]"
                                        />
                                        <div className="text-red-500 text-sm pt-1">{errors?.amount && errors?.amount?.message}</div>
                                    </div>
                                </div>
                                <div className="mt-5">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Date
                                    </label>
                                    <input 
                                        {...register('date')} 
                                        type="date" 
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