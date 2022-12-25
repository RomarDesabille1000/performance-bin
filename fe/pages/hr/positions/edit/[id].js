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
import { Checkbox } from "@mui/material";


const PositionSchema = yup.object().shape({
    title: yup.string().required("This field is required."),
    has_rating: yup.boolean(),
    has_backjob: yup.boolean(),
    has_sales: yup.boolean(),
});

export default function UpdatePosition(){
  const router = useRouter();
  const { id } = router.query
  const { data: position } = useSWR(id ? `hr/positions/${id}/` : '', {
    revalidateOnFocus: false,       
  });
  const [ticks, setTicks] = useState({
    has_rating: false, 
    has_backjob: false, 
    has_sales: false
  })


  useEffect(() => {
    setValue('title', position?.title)
    setValue('has_rating', position?.has_rating)
    setValue('has_backjob', position?.has_backjob)
    setValue('has_sales', position?.has_sales)
    setTicks({
      has_rating: position?.has_rating, 
      has_backjob: position?.has_backjob, 
      has_sales: position?.has_sales
    })
}, [position])

const setChecked = (name, checked) => {
  if(name == 'has_rating')
    setTicks({...ticks, has_rating: checked})
  else if(name == 'has_backjob')
    setTicks({...ticks, has_backjob: checked})
  else if(name == 'has_sales')
    setTicks({...ticks, has_sales: checked})
  setValue(name, checked)
}

	const { register, handleSubmit, formState: { errors }, reset , setValue, getValues} = useForm({
		mode: 'onSubmit',
		resolver: yupResolver(PositionSchema),
	})


	const [status, setStatus] = useState({
		error: false,
		loading: false,
		success: false,
		infoMessage: '',
	})

    function onClickSubmit(data){
      console.log(data)
		setStatus({ 
			error: false, 
			success: false, 
			loading:true, 
			infoMessage: 'Updating data.' 
		})
        axiosInstance.put(`hr/positions/${id}/`, data)
        .then((_e) => {
            setStatus({ 
                error: false, 
                success: true, 
                loading: false, 
                infoMessage: 'Position successfully Updated.' 
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
            title="Update Position"
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
                                    <div className="col-span-6 sm:col-span-6">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Position
                                        </label>
                                        <input
                                            {...register('title')} 
                                            type="text"
                                            autoComplete="off"
                                            className="input"
                                        />
                                        <div className="text-red-500 text-sm pt-1">{errors?.title && errors?.title?.message}</div>
                                    </div>
                                    <div className="col-span-6 sm:col-span-6">
                                        <div className="flex flex-row items-center">
                                            <input
                                                type="checkbox"
                                                className="mr-2"
                                                label="has Rating"
                                                checked={ticks.has_rating  ?? false}
                                                onChange={(event) => setChecked('has_rating', event.target.checked)}
                                            />
                                            <label>has Customer Satisfaction Rating</label>
                                        </div>
                                        <div className="text-red-500 text-sm pt-1">{errors?.has_rating && errors?.has_rating?.message}</div>
                                    </div>
                                    <div className="col-span-6 sm:col-span-6">
                                        <div className="flex flex-row items-center">
                                            <input
                                                type="checkbox"
                                                className="mr-2"
                                                label="has Backjobs"
                                                checked={ticks.has_backjob ?? false}
                                                onChange={(event) => setChecked('has_backjob', event.target.checked)}
                                            />
                                            <label>has Back Jobs</label>
                                        </div>
                                        <div className="text-red-500 text-sm pt-1">{errors?.has_backjob && errors?.has_backjob?.message}</div>
                                    </div>
                                    <div className="col-span-6 sm:col-span-6">
                                        <div className="flex flex-row items-center">
                                            <input
                                                type="checkbox"
                                                className="mr-2"
                                                label="has Sales"
                                                checked={ticks.has_sales  ?? false}
                                                onChange={(event) => setChecked('has_sales', event.target.checked)}
                                            />
                                            <label>has Sales</label>
                                        </div>
                                        <div className="text-red-500 text-sm pt-1">{errors?.has_sales && errors?.has_sales?.message}</div>
                                    </div>
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