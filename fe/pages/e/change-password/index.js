import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from '../../../context/AuthContext';
import axiosInstance from "../../../utils/axiosInstance";
import AlertMessages from "../../../components/AlertMessages";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { useState } from "react";
import axios from "axios";

const EmployeeSchema = yup.object().shape({
    new_password: yup.string().required("This field is required.").min(8,"Password must be 8 characters long"),
    confirm_password: yup.string().oneOf([yup.ref('new_password'), null], 'Passwords must match'),
    old_password: yup.string().required("This field is required."),
});

export default function ChangePassword() {
    const router = useRouter();
    const { user, logout } = useAuth();

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
		mode: 'onSubmit',
		resolver: yupResolver(EmployeeSchema),
	})

	const [status, setStatus] = useState({
		error: false,
		loading: false,
		success: false,
		infoMessage: '',
	})

    async function onClickSubmit(data){
        console.log(data)
        const email = user.email;
        const password = data.old_password;
        let newData = {
            new_password: data.new_password
        }
        console.log(newData)
		setStatus({ 
			error: false, 
			success: false, 
			loading:true, 
			infoMessage: 'Saving data.' 
		})
        try{
            await axios.post(`${process.env.api}/users/login/`, {
                email, 
                password
            }).then(({ data }) => {
                axiosInstance.post(`users/profile/${user.id}/`, newData)
                .then((_e) => {
                    setStatus({ 
                        error: false, 
                        success: true, 
                        loading: false, 
                        infoMessage: 'Password Successfully Changed.' 
                    })
                    reset()
                }).catch((_e) => {
                    setStatus({ 
                        error: true, 
                        success: false, 
                        loading: false, 
                        infoMessage:  'Something went wrong.'
                    })
                    //console.log(_e.response.data.email[0])
                })
            }).catch((error) => {
                setStatus({ 
                    error: true, 
                    success: false, 
                    loading: false, 
                    infoMessage:  'Incorrect Password.'
                })
            })
        }finally {}
        
    }

    return(
        <div className="px-5 py-10 mt-10 max-w-[300px] m-auto ">
            <div className="flex flex-col justify-center items-center">
            </div>
            <form onSubmit={handleSubmit(onClickSubmit)} noValidate>
            <div className="flex flex-col items-center">
                <div className="text-2xl font-bold mb-4">Change Password</div>
                <div  className="flex flex-col items-center gap-3 py-5 max-w-[300px]">
                    <div className="w-[300px]">
                        <label className="text-left">Current Password</label>
                        <input className="input w-[300px]" 
                            type='password'
                            {...register('old_password')} 
                            placeholder="Current Password"/>
                        <div className="text-red-500 text-sm pt-1">{errors?.old_password && errors?.old_password?.message}</div>
                    </div>
                    <div className="w-[300px]">
                        <label className="text-left">New Password</label>
                        <input className="input" 
                            type='password'
                            {...register('new_password')} 
                            placeholder="New Password"/>
                        <div className="text-red-500 text-sm pt-1">{errors?.new_password && errors?.new_password?.message}</div>
                    </div>
                    <div className="w-[300px]">
                        <label className="text-left">Confirm Password</label>
                        <input className="input" 
                            type='password'
                            {...register('confirm_password')} 
                            placeholder="Confirm Password"/>
                        <div className="text-red-500 text-sm pt-1">{errors?.confirm_password && errors?.confirm_password?.message}</div>
                    </div>
                    <AlertMessages
                        className="mb-3"
                        error={status.error}
                        success={status.success}
                        loading={status.loading}
                        message={status.infoMessage}
                    />
                    <button
                        type="submit"
                        className="btn btn-primary hover:bg-red-600 text-white focus:ring-0 border-0 w-[300px]"
                        >Confirm
                    </button>
                    <button
                        onClick={() => router.back()}
                        className="btn hover:bg-red-600 bg-red-500 text-white focus:ring-0 border-0 w-[300px]"
                        >Cancel
                    </button>
                </div>
            </div>
            </form>
            
        </div>
    )
}