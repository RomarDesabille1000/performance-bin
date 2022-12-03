import { useRouter } from "next/router";
import Profile from "../../components/Profile";

export default function HR() {
	const router = useRouter()
	

	async function handleSubmit(){
		router.push("/hr/dashboard")
	}

	return (
		<div className="flex flex-col justify-center items-center bg-gradient-to-r from-cyan-500 to-blue-500 h-screen ">
			<label className="font-sans font-bold text-2xl mb-10 text-white">Human Resource Administration Panel </label>
			<div className="flex flex-col border border-indigo-600 rounded-[12px] max-w-[600px] max-h-[600px] bg-white py-5 px-10 ">
				<label className="font-sans font-bold text-2xl text-center">Login</label>
				<label className="font-sans text-lg pl-3">Email</label>
				<input className="font-sans text-lg border rounded-[12px] pl-3 w-[250px]" type="text" placeholder="Email"></input>
				<label className="font-sans text-lg pl-3">password</label>
				<input className="font-sans text-lg border rounded-[12px] pl-3" type="password" placeholder="Password"></input>
				<button className="font-sans text-lg btn btn-primary mt-7" onClick = {()=>handleSubmit()}>Login</button>
			</div>
		</div>
	)
}
