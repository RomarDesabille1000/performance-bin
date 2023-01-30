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
	completionReport: yup.string().required("Please Select One of the following Check Boxes"),
  reason: yup.string().when('completionReport',{
			is: (completionReport) => completionReport != null && completionReport != 'completed',
			then: yup.string().required('This field is required'),
		}
	),
});

export default function Employee() {
	const router = useRouter()

	const { user } = useAuth();
	const { data: e } = useSWR(user?.id ? `users/details/${user?.id}/` : '', {
        revalidateOnFocus: false,       
    });
	const { data: schedules, mutate } = useSWR(user?.id ? `schedule/schedules/${user?.id}/today/` : '', {
        revalidateOnFocus: false,       
    });
	const [selectedSchedule, setSelectedSchedule] = useState(0);

	const signatureStore = useSignatureStore();
	const [isAddingSignature, setIsAddingSignature] = useState(false);
	const [isImageEmpty, setIsImageEmpty] = useState(false);
	const [hasTimeIn, setHasTimeIn] = useState(false);
	const [completionReport, setCompletionReport] = useState('');
	const [status, setStatus] = useState({
		error: false,
		loading: false,
		success: false,
		infoMessage: 'Attendance Saved.',
	})

	const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
		mode: 'onBlur',
		resolver: yupResolver(AttendanceSchema)
	})

	useEffect(() => {
		if(signatureStore.image){
			setIsImageEmpty(false);
		}
	}, [signatureStore.image])

	const onSubmit = async (data) => {
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
				schedule_id: selectedSchedule,
			}).then((_e) => {
				setStatus({ 
					error: false, 
					success: true, 
					loading: false, 
					infoMessage: 'Attendance Saved.' 
				})
				localStorage.setItem(`${user?.id}-rating`,  JSON.stringify({
					customer_name: data.customer_name,
					contact_no: data.contact_no,
					location: data.location}));
				reset();
				mutate();
				signatureStore.emtpyImage();
				setHasTimeIn(false)
				if(typeof window !== 'undefined' && localStorage.getItem(user?.name) != null){
					localStorage.removeItem(user?.name);
				}
				// window.setTimeout(function() {
				// 	window.location.replace('/e/survey');
				// }, 3000);
				
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


	useState(()=>{
		function checkLocalStorage(){
			if(typeof window !== 'undefined' && localStorage.getItem(user?.name) != null){
				var data = localStorage.getItem(user?.name)
				setHasTimeIn(true)
				setValue('time_in', data)
			}else{
				console.log('no data')
			}
		}
		checkLocalStorage()
	},[user])


	function Time_In(){
		var time = new Date();
		//setValue('time_in', time.toLocaleTimeString());
		var FormattedTime = 
			(time.getHours() < 10 ? `0${time.getHours()}` : time.getHours())
				+ ":" + 
			(time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes()) 
				+ ":" + 
			(time.getSeconds() < 10 ? `0${time.getSeconds()}` : time.getSeconds());
		setValue('time_in', FormattedTime);
		setHasTimeIn(true)
		localStorage.setItem(user?.name,  FormattedTime);
	}

	function Time_Out(){
		var time = new Date();
		var FormattedTime = 
			(time.getHours() < 10 ? `0${time.getHours()}` : time.getHours())
				+ ":" + 
			(time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes()) 
				+ ":" + 
			(time.getSeconds() < 10 ? `0${time.getSeconds()}` : time.getSeconds());
		setValue('time_out', FormattedTime);
	}

	function setCompletion(c){
		setCompletionReport(c)
		setValue('completionReport', c)
		if(c === 'completed'){
			setValue('completed', true)
			setValue('reason', '--')
		}else{
			setValue('completed', false)
			setValue('reason', '')
		}
	}


	function scheduleChange(e){
		setSelectedSchedule(e.target.value);
		if(e.target.value >= 0){
			const sch = schedules.filter((d) => d.id == e.target.value)[0]
			setValue('customer_name', sch.customer_name)
			setValue('contact_no', sch.contact_no)
		}else{
			setValue('customer_name', '')
			setValue('contact_no', '')
		}
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
									{schedules?.length > 0 && (
										<>
											<label className="block text-md text-gray-700">Select Schedule</label>
											<select onChange={scheduleChange} value={selectedSchedule} 
											className="border border-gray-300 text-gray-900 rounded-md focus:ring-indigo-500 block w-full px-3 py-1 mb-3">
												<option value={-1}>Select Schedule</option>
												{schedules.map((schedule) => (
													<option 
														key={schedule.id}
														value={schedule.id}
														>{schedule.customer_name}</option>
												))}
											</select>
										</>
									)}

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
									<label className="block text-gray-700 mt-5">Location</label>
									<input type="text" 
											autoComplete="off"
											{...register('location')}
											className="input"
									/>
									<small className="text-red-500">{errors?.location && errors?.location?.message}</small>

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
												disabled = {true}
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
												disabled = {true}
												className="input"/>
											<small className="text-red-500 pt-1">{errors?.time_out && errors?.time_out?.message}</small>
										</div>
									</div>
									<div className="mt-5 flex gap-5 items-start">
										<div className="w-[50%]">
											<button 
													type="button"
													disabled = {hasTimeIn}
													className={hasTimeIn ? "btn btn w-[100%]" : "btn btn-primary w-[100%]" }
													onClick={() => Time_In()}> 
												Login
											</button>
										</div>

										<div className="w-[50%]">
											<button 
													type="button"
													disabled = {!hasTimeIn}
													className={!hasTimeIn ? "btn btn w-[100%]" : "btn btn-primary w-[100%]" }
													onClick={() => Time_Out()}> 
												Logout
											</button>
										</div>
									</div>
									<div className={hasTimeIn ? "mt-3" : "hidden"}>
										<div className="block mb-3 text-lg">Completion Report</div>
										<div className="flex items-center gap-3 ">
											<input
												style={{width: '15px', height: '15px'}}
												checked = {completionReport === 'completed'}
												onChange = {()=>setCompletion('completed')}
												type="checkbox"
											/>
											<label className="block text-gray-700 text-sm">
												Job completed
											</label>
										</div>
										<div className="flex items-center gap-3 mt-3">
											<input
												style={{width: '15px', height: '15px'}}
												checked = {completionReport === 'backjob'}
												onChange = {()=>setCompletion('backjob')}
												type="checkbox"
											/>
											<label className="block text-gray-700 text-sm">
												Backjob
											</label>
										</div>
										<div className="flex items-center gap-3 mt-3">
											<input
												style={{width: '15px', height: '15px'}}
												checked = {completionReport === 'followup'}
												onChange = {()=>setCompletion('followup')}
												type="checkbox"
											/>
											<label className="block text-gray-700 text-sm">
												For follow up visit
											</label>
										</div>
										<small className="text-red-500 pt-1">{errors?.completionReport && errors?.completionReport?.message}</small>

										<div className={completionReport === 'completed' ? "hidden" : "mt-3"}>
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
