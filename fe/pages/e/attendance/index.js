import { useEffect, useState } from "react";
import Signature from "../../../components/Signature";
import { useSignatureStore } from "../../../store/signature";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import axiosInstance from "../../../utils/axiosInstance";
import { useRouter } from "next/router";
import AlertMessages from "../../../components/AlertMessages";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'
import { useAuth } from '../../../context/AuthContext'
import useSWR from "swr";
import { timeFormat } from "../../../helper/datetime";

dayjs.extend(utc)
dayjs.extend(tz)


const AttendanceSchema = yup.object().shape({
	customer_name: yup.string().required('This field is required')
		.max(100, "Only 100 characters is allowed."),
	contact_no: yup.string().required('This field is required')
		.max(100, "Only 100 characters is allowed."),
    time_in: yup.string().required("This field is required."),
    time_out: yup.string().required("This field is required.")
	.test(
		"start_time_test",
		"Time out must be greater than time in",
		function(value) {
			const { time_in } = this.parent;
			if(time_in && value){
				const ft = dayjs(`2000-01-01 ${time_in}`);
				const tt = dayjs(`2000-01-01 ${value}`);
				const mins = tt.diff(ft, "minutes", true);
				const totalHours = parseInt(mins / 60);
				const totalMins = dayjs().minute(mins).$m

				if(totalHours < 0 || mins <= 0){
					return false;
				}
			}
			return value
		}
	),
	location: yup.string().required('This field is required')
		.max(255, "Only 255 characters is allowed."),
    reason: yup.string().required("This field is required."),
});

export default function Employee() {
	const router = useRouter()

	const { user } = useAuth();
	const { data: e } = useSWR(user?.id ? `users/details/${user?.id}/` : '', {
        revalidateOnFocus: false,       
    });

	const signatureStore = useSignatureStore();
	const [isAddingSignature, setIsAddingSignature] = useState(false);
	const [isImageEmpty, setIsImageEmpty] = useState(false);
	const [status, setStatus] = useState({
		error: false,
		loading: false,
		success: false,
		infoMessage: 'Attendance Saved.',
	})

	const { register, handleSubmit, formState: { errors }, reset } = useForm({
		mode: 'onBlur',
		resolver: yupResolver(AttendanceSchema)
	})

	useEffect(() => {
		if(signatureStore.image){
			setIsImageEmpty(false);
		}
	}, [signatureStore.image])

	const onSubmit = (data) => {
		if(!signatureStore.image){
			setIsImageEmpty(true);
		}else{
			setStatus({ 
				error: false, 
				success: false, 
				loading:true, 
				infoMessage: 'Saving attendance.' 
			})
			axiosInstance.post('employee/attendance/', {
				...data,
				signature: signatureStore.image,
			}).then((_e) => {
				setStatus({ 
					error: false, 
					success: true, 
					loading: false, 
					infoMessage: 'Attendance Saved.' 
				})
				reset();
				signatureStore.emtpyImage();
			}).catch((_e) => {
				if(400 == _e?.response?.status){
					setStatus({ 
							error: true, 
							success: false, 
							loading: false, 
							infoMessage: 'Attendance for this day already Recorded.' 
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
	}


	function isSunday(){
		const schedule = e?.user_employee?.next_sunday;
		const is_sunday = 'Sunday' === dayjs(new Date()).tz("Asia/Shanghai").format('dddd')
		if(schedule && is_sunday){
			return dayjs(new Date()).tz("Asia/Shanghai").format('MM-D-YYYY') === dayjs(schedule).format('MM-D-YYYY') ? false : true;
		}
		return is_sunday;
	}

	return (
		<div>
			{!e ? (
				<div className="max-w-lg w-[90%] py-5 mt-5 m-auto">
					<div className="mb-3 text-lg">Checking your schedule..</div>
				</div>
			):(
				<>
					{isSunday() && (
						<div className="max-w-lg w-[90%] py-5 mt-5 m-auto">
							<div className="mb-3 text-lg font-bold">No attendance for this sunday</div>
							<button 
								type="button"
								onClick={() => router.back()}
								className="btn btn-secondary mt-3 mr-3">Back</button>
						</div>
					)}
					{!isSunday() && (
						<div>
							{isAddingSignature ? (
								<Signature setIsAddingSignature={setIsAddingSignature}/>
							): (
								<form 
									onSubmit={handleSubmit(onSubmit)}
									className="max-w-lg w-[90%] py-5 mt-5 m-auto">
									<button 
										type="button"
										className="text-blue-500 mb-2"
										onClick={() => router.push('/e')}
									>
										Back
									</button>
									<div className="mb-3 text-lg font-bold">Attendance</div>

									<label className="block text-md text-gray-700">Customer Name</label>
									<input type="text" 
											autoComplete="off"
											{...register('customer_name')}
											className="input"
									/>
									<small className="text-red-500">{errors?.customer_name && errors?.customer_name?.message}</small>

									<div className="mt-3">
										<label className="block text-md text-gray-700">Contact No.</label>
										<input type="text" 
												autoComplete="off"
												{...register('contact_no')}
												className="input"
										/>
										<small className="text-red-500">{errors?.contact_no && errors?.contact_no?.message}</small>
									</div>

									<div className={`border border-indigo-600 rounded-lg max-w-[600px] mt-5 ${!signatureStore.image? 'p-4': ''}`}>
										{signatureStore.image ? (
											<img src={signatureStore.image} 
												height={signatureStore.h} 
												width={signatureStore.w} />
										): 'No signature yet'}
									</div>
									<small className="text-red-500">{isImageEmpty && 'Signature is required.'}</small>
									<div className="mt-5">
										<button 
												type="button"
												className="btn btn-primary" 
												onClick={() => setIsAddingSignature(true)}> 
											{signatureStore.image ? 'Update Signature' : 'Add Signature'}
										</button>
									</div>

									<div className="mt-5 flex gap-5 items-start">
										<div className="w-[50%]">
											<label className="text-gray-700">
												Time In (Arrival)
											</label>
											<input 
												{...register('time_in')} 
												type="time" 
												className="input"/>
											<small className="text-red-500 pt-1">{errors?.time_in && errors?.time_out?.message}</small>
										</div>

										<div className="w-[50%]">
											<label className="text-gray-700">
												Time Out (Departure)
											</label>
											<input 
												{...register('time_out')} 
												type="time" 
												className="input"/>
											<small className="text-red-500 pt-1">{errors?.time_out && errors?.time_out?.message}</small>
										</div>
									</div>


									<label className="block text-gray-700 mt-5">Location</label>
									<input type="text" 
											autoComplete="off"
											{...register('location')}
											className="input"
									/>
									<small className="text-red-500">{errors?.location && errors?.location?.message}</small>

									<div className="mt-3">
										<label className="block text-gray-700">
											Reason
										</label>
										<textarea
											{...register('reason')} 
											id="" 
											cols="30" 
											rows="3" 
											className="input !p-2 !h-auto !min-w-min">
										</textarea>
										<small className="text-red-500 pt-1">{errors?.reason && errors?.reason?.message}</small>
									</div>

									<div className="flex items-center gap-3 mt-3">
										<input
											style={{width: '15px', height: '15px'}}
											{...register('completed')}
											type="checkbox"
										/>
										<label className="block text-gray-700 text-sm">
											Check if completed
										</label>
									</div>

									<AlertMessages
										error={status.error}
										success={status.success}
										loading={status.loading}
										message={status.infoMessage}
										className="mt-4"
									/>

									<button 
										type="submit"
										disabled={status.loading}
										className="btn btn-primary mt-5 mb-10 float-right">Submit</button>
								</form>
							)}
						</div>
					)}
				</>
			)}
		</div>
	)
}
