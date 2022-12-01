import { useState } from "react";
import { useAuth } from "../context/AuthContext"

export default function Home() {
	const { login } = useAuth();
	const [state, setState] = useState({
		email: 'r@gmail.com',
		password: '1',
	});

	const handleChange = (e) => {
		setState({
			...state, 
			[e.target.name]: e.target.value
		})
	}

  return (
	<div className="max-w-[300px]">
		<div>
			<input
				placeholder="email"
				type="email"
				name="email"
				className="border border-indigo-600"
				value={state.email}
				onChange={handleChange}
			/>
		</div>
		<div>
			<input
				placeholder="password"
				name="password"
				type="password"
				className="border border-indigo-600"
				value={state.password}
				onChange={handleChange}
			/>
		</div>
		<button
			onClick={() => login(state.email, state.password)}
		>Login</button>
	</div>
  )
}
