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
import IconEye from "../../../../components/icons/IconEye";


const EmployeeSchema = yup.object().shape({
    id: yup.string().required("This field is required."),
	email: yup.string().required("This field is required.").email("must be a valid email"),
    firstname: yup.string().required("This field is required.").max(255, "Only 255 characters is allowed."),
    lastname: yup.string().required("This field is required.").max(255, "Only 255 characters is allowed."),
    mi: yup.string().required("This field is required.").max(2, "Only 1 or 2 characters is allowed."),
    position: yup.string().required("This field is required."),
    designation: yup.string().required("This field is required."),
    password: yup.string().required("This field is required.").matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
        "Must be eight characters with at least 1 uppercase letter, at least 1 lowercase letter, at least 1 digit, and at least 1 special character."
      ),
    confirm_password: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match'),
	//firstname: yup.number().typeError('This field is required and must be a number').min(0, "Must be greater than 0"),
	date_hired: yup.date().typeError('Must be a date').required("This field is required.")
	.test(
		"date_test",
		"Cannot select future date.",
		function(value) {
            if(dayjs(value).format('YYYY-MM-DD') > dayjs().format('YYYY-MM-DD'))
                return false
			return value
		}
	)
    ,
});

export default function AddEmployee(){
    const router = useRouter()
	const { register, handleSubmit, formState: { errors }, reset } = useForm({
		mode: 'onSubmit',
		resolver: yupResolver(EmployeeSchema),
	})
    const [addNew, setAddNew] = useState(true)
    const { data: positions,} = useSWR(
		`hr/positions/all/`,
		{
			revalidateOnFocus: false,
		}
	);

	const [status, setStatus] = useState({
		error: false,
		loading: false,
		success: false,
		infoMessage: '',
	})

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(()=>{
        if(!addNew) return
        setStatus({
            error: false,
            loading: false,
            success: false,
            infoMessage: '',
        })
    },[addNew])

    function onClickSubmit(data){
        var currentdate = new Date();
        var dhired = data.date_hired;
        var timeString = currentdate.getHours() + ':' + currentdate.getMinutes() + ':00';

        var year = dhired.getFullYear();
        var month = dhired.getMonth() + 1;
        var day = dhired.getDate();
        var dateString = '' + year + '-' + month + '-' + day + ' ' + timeString;
        //console.log(dateString)
        let newData = {
            user_employee :{
                emp_id: data.id,
                firstname: data.firstname,
                lastname: data.lastname,
                position_id: data.position,
                mi: data.mi,
                designation: data.designation,
                date_hired: dateString,
            },
            type: 'EMPLOYEE',
            email: data.email,
            is_active: true,
            password: data.password,
            name: data.firstname + " " + data.mi + " " + data.lastname,

        }
		setStatus({ 
			error: false, 
			success: false, 
			loading:true, 
			infoMessage: 'Saving data.' 
		})
        axiosInstance.post(`users/employees/`, newData)
        .then((_e) => {
            setStatus({ 
                error: false, 
                success: true, 
                loading: false, 
                infoMessage: 'Employee successfully Added.' 
            })
            reset()
            setAddNew(false)
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
            title="Add Employee"
            hasBack={true}
        >
            <div className="mt-10 sm:mt-0">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="mt-5 md:col-span-2 md:mt-0">
                    <form onSubmit={handleSubmit(onClickSubmit)} noValidate>
                        <div className="overflow-hidden shadow sm:rounded-md">
                            <div className="bg-white px-4 py-5 sm:p-6">
                                <div className="grid grid-cols-6 gap-6">
                                    <div className="col-span-6 sm:col-span-6">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Employee ID
                                        </label>
                                        <input
                                            {...register('id')} 
                                            type="text"
                                            autoComplete="off"
                                            className="input"
                                        />
                                        <div className="text-red-500 text-sm pt-1">{errors?.id && errors?.id?.message}</div>
                                    </div>
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
                                            Department
                                        </label>
                                        <select
                                            id='position'
                                            className='border rounded-[5px] px-2 py-1 bg-white !w-[200px]'
                                            {...register('position')} 
                                        >
                                            {/** RENDER ALL POSITIONS */}
                                            <option key = {0} value={null}></option>
                                            {
                                                positions ? positions.map((pos) => (
                                                        <option key = {pos?.id} value={pos?.id}>{pos?.title}</option>
                                                    )
                                                ) : <></>
                                            }
                                        </select>
                                        <div className="text-red-500 text-sm pt-1">{errors?.position && errors?.position?.message}</div>
                                    </div>
                                    <div className="col-span-6 sm:col-span-4">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Designation
                                        </label>
                                        <select
                                            id='designation'
                                            className='border rounded-[5px] px-2 py-1 bg-white !w-[200px]'
                                            defaultValue={'STAFF'}
                                            {...register('designation')} 
                                        >
                                            <option key = {0} value={'STAFF'}>Staff</option>
                                            <option key = {1} value={'SUPERVISOR'}>Supervisor</option>
                                        </select>
                                        <div className="text-red-500 text-sm pt-1">{errors?.designation && errors?.designation?.message}</div>
                                    </div>
                                    <div className="col-span-6 sm:col-span-6">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Email
                                        </label>
                                        <input
                                            {...register('email')} 
                                            type="text"
                                            autoComplete="off"
                                            className="input"
                                        />
                                        <div className="text-red-500 text-sm pt-1">{errors?.email && errors?.email?.message}</div>
                                    </div>
                                    <div className="col-span-6 sm:col-span-3">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Password
                                        </label>
                                        <div className="password-container">
                                            <input
                                                type={!showPassword ? 'password': 'text'}
                                                {...register('password')} 
                                                autoComplete="off"
                                                className="input"
                                            />
                                            <div className="text-red-500 text-sm pt-1">{errors?.password && errors?.password?.message}</div>
                                            <IconEye 
                                                className="!top-[13px]"
                                                show={showPassword} 
                                                setShow={setShowPassword}/>
                                        </div>
                                    </div>
                                    <div className="col-span-6 sm:col-span-3">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Confirm Password
                                        </label>
                                        <div className="password-container">
                                            <input
                                                {...register('confirm_password')} 
                                                type={!showConfirmPassword ? 'password': 'text'}
                                                autoComplete="off"
                                                className="input"
                                            />
                                            <div className="text-red-500 text-sm pt-1">{errors?.confirm_password && errors?.confirm_password?.message}</div>
                                            <IconEye 
                                                className="!top-[13px]"
                                                show={showConfirmPassword} 
                                                setShow={setShowConfirmPassword}/>
                                        </div>
                                    </div>

                                   
                                </div>
                                <div className="mt-5">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Date Hired
                                    </label>
                                    <input 
                                        min="2015-01-01" 
                                        max={dayjs(new Date()).format('YYYY-MM-DD')}
                                        {...register('date_hired')} 
                                        defaultValue={dayjs(new Date()).format('YYYY-MM-DD')}
                                        type="date" 
                                        className="input !w-[200px]" />
                                    <div className="text-red-500 text-sm pt-1">{errors?.date_hired && errors?.date_hired?.message}</div>
                                </div>
                            </div>
                            <div className={addNew ? "bg-gray-50 px-4 py-3 text-right sm:px-6" : 'hidden'}>
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
                    <div className={addNew ? 
                        'hidden'
                        :
                        "bg-gray-50 px-4 py-3 text-right sm:px-6"
                        }
                    >
                        <div className={addNew ? "hidden" : ""}>
                            <button
                            onClick={()=>router.back()}
                                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 mr-2"
                            >
                                Back
                            </button>
                            <button
                                onClick={()=> setAddNew(true)}
                                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Add New Employee
                            </button>
                        </div>
                    </div>
                    <AlertMessages
                        className="mb-3"
                        error={status.error}
                        success={status.success}
                        loading={status.loading}
                        message={status.infoMessage}
                    />
                </div>
                </div>
            </div>
        </AdminLayout>
    )
}