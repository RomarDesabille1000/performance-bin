import { useAuth } from "../context/AuthContext";

export default function Profile(){
	const { user, logout } = useAuth();

    return(
        <div>
            <div>Your username: {user?.name}</div>
            <button onClick={logout}>Logout</button>
        </div>
    )
}