import { useState } from "react";
import LoadingButton from "../components/LoadingButton";
import { useAuth } from "../context/AuthContext"
import { useForm } from 'react-hook-form';

export default function Home() {
	const { login, statusCode, isLoading, setStatusCode } = useAuth()
	const { register, handleSubmit, formState: { errors }, } = useForm({
		defaultValues: {
			username: 'r@gmail.com',
			password: '1'
		}
	});

	const onSubmit = ({ username, password }) => {
        setStatusCode(0)
        login(username, password)
    }

	return (
		<div className="max-w-[500px] m-auto">
			<div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
					<div className="w-full max-w-md space-y-8">
						<div>
							<img
								className="mx-auto h-12 w-auto"
								src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
								alt="Your Company"
							/>
							<h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
								Sign in to your account
							</h2>
						</div>
						<form className="mt-8 space-y-6" 
								onSubmit={handleSubmit(onSubmit)}>
							{statusCode === 401 && (
								<div className="text-sm text-red-500 my-1 text-center">
									Password/Username Incorrect
								</div>
                            )}
							{(statusCode !== 401 && statusCode !== 0 && statusCode !== 200) && (
								<div className="text-sm text-red-500 my-1 text-center">
									Something went wrong
								</div>
                            )}
							<input type="hidden" name="remember" defaultValue="true" />
							<div className="-space-y-px rounded-md shadow-sm">
							<div>
								<label>
									Username
								</label>
								<input
									{...register("username")}
									autoComplete="off"
									className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
								/>
								<div className="text-red-500">{errors?.username && errors?.username?.message}</div>
							</div>
							<div className="pt-3">
								<label>
									Password
								</label>
								<div className="text-red-500">{errors?.password && errors?.password?.message}</div>
								<input
									{...register("password")}
									autoComplete="off"
									className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
								/>
							</div>
							</div>


							<div>
								<LoadingButton
									text={`${isLoading ? 'Logging in': 'Sign In'}`}
									loading={false}
									disable={isLoading}
									type="submit"
								/>
								<div className="text-sm mt-3 text-center">
									<span>Dont have an account? </span>
									<a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
										Sign up here.
									</a>
								</div>
							</div>
						</form>
						</div>
					</div>
				<div>
			</div>
		</div>
	)
}
