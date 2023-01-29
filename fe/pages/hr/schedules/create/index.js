import AdminLayout from "../../../../components/AdminLayout";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import dayjs from "dayjs";
import { useState } from "react";
import AlertMessages from "../../../../components/AlertMessages";
import useSWR from "swr";
import SelectUserModal from "../../../../components/dashboard/SelectUserModal";
import { useEffect } from "react";
import axiosInstance from "../../../../utils/axiosInstance";

const SchedulesSchema = yup.object().shape({
	customer_name: yup.string().required('This field is required')
		.max(100, "Only 100 characters is allowed."),
	contact_no: yup.string().required('This field is required')
		.max(100, "Only 100 characters is allowed."),
	date: yup.date().typeError('Must be a date').required("This field is required.")
	.test(
		"date_test",
		"Cannot select previous date.",
		function(value) {
            if(dayjs(value).format('YYYY-MM-DD') < dayjs().format('YYYY-MM-DD'))
                return false
			return value
		}
	)
});

export default function CreateSchedule(){
	const { register, handleSubmit, formState: { errors }, reset } = useForm({
		mode: 'onSubmit',
		resolver: yupResolver(SchedulesSchema),
	})
	const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchText, setSearchText] = useState('')
    const [pageIndex, setPageIndex] = useState(1);
    const { data: employees } = useSWR(`users/employees/?lastname=${searchText}&page=${pageIndex}`, {
        revalidateOnFocus: false,
    });

	const [employeeTarget, setEmployeeTarget] = useState({
		id: -1,
		name: '',
		position: '',
		dateHired: '',
        error: '',
	})
	const [employeeSelected, setEmployeeSelected] = useState({
		id: -1,
		name: '',
		position: '',
		dateHired: '',
	})
	const [confirmSelection, setConfirmSelection] = useState(false);
    
	useEffect(() => {
		setEmployeeTarget(employeeSelected)
	}, [confirmSelection])

	const [status, setStatus] = useState({
		error: false,
		loading: false,
		success: false,
		infoMessage: '',
	})

    function onClickSubmit(data){
        data = {
            ...data,
            date:  dayjs(data.date).format('YYYY-MM-DD')
        }
        if(!employeeTarget.name){
            setEmployeeTarget({...employeeTarget, error: 'Please select employee.'})
            return
        }

		setStatus({ 
			error: false, 
			success: false, 
			loading:true, 
			infoMessage: 'Saving data.' 
		})
        axiosInstance.post(`schedule/schedules/${employeeTarget.id}/`, data)
        .then((_e) => {
            setStatus({ 
                error: false, 
                success: true, 
                loading: false, 
                infoMessage: 'Schedule successfully created.' 
            })
            setEmployeeTarget({
                id: -1,
                name: '',
                position: '',
                dateHired: '',
                error: '',
            })
            reset()
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
            title="Create Schedule"
            hasBack={true}
        >
			{isModalOpen &&(
				<SelectUserModal
					employees={employees}
					setIsModalOpen={setIsModalOpen}
					searchText={searchText}
					setSearchText={setSearchText}
					setEmployeeTarget={setEmployeeTarget}
					employeeTarget={employeeTarget}
					setConfirmSelection={setConfirmSelection}
					confirmSelection={confirmSelection}
					employeeSelected={employeeSelected}
					setEmployeeSelected={setEmployeeSelected}
					pageIndex={pageIndex} 
					setPageIndex={setPageIndex}
				/>
			)}
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
                                        <div className="">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Employee Selected: {employeeTarget.name}
                                            </label>
                                            <div className="text-red-500 text-sm pt-1">{employeeTarget.error ? employeeTarget.error : ''}</div>
                                            <div className="flex justify-end mt-2">
                                                <button 
                                                    type="button"
                                                    onClick={() => setIsModalOpen(true)}
                                                    className="btn btn-primary mb-5">Select Employee</button>
                                            </div>
                                        </div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Customer Name
                                        </label>
                                        <input
                                            {...register('customer_name')} 
                                            type="text"
                                            autoComplete="off"
                                            className="input"
                                        />
                                        <div className="text-red-500 text-sm pt-1">{errors?.customer_name && errors?.customer_name?.message}</div>
                                    </div>

                                    <div className="col-span-6 sm:col-span-6">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Contact No
                                        </label>
                                        <input
                                            {...register('contact_no')} 
                                            autoComplete="off"
                                            className="input !w-[300px]"
                                        />
                                        <div className="text-red-500 text-sm pt-1">{errors?.contact_no && errors?.contact_no?.message}</div>
                                    </div>
                                </div>
                                <div className="mt-5">
                                    <label 
                                        className="block text-sm font-medium text-gray-700">
                                        Date
                                    </label>
                                    <input 
                                        min={dayjs(new Date()).format('YYYY-MM-DD')}
                                        {...register('date')} 
                                        defaultValue={dayjs(new Date()).format('YYYY-MM-DD')}
                                        type="date" 
                                        className="input !w-[200px]" />
                                    <div className="text-red-500 text-sm pt-1">{errors?.date_visit && errors?.date_visit?.message}</div>
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