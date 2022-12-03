import Link from "next/link";
import { useAuth } from '../../context/AuthContext';

export default function Employee() {
    const { user, logout } = useAuth();
    console.log();

    return(
        <div className="p-5 max-w-[500px] m-auto">
            <div className="flex justify-between items-center">
                <div>
                    <span>Hello, </span>
                    <span>{user?.user_employee?.firstname.toUpperCase()} </span>
                    {user?.user_employee?.mi.toUpperCase()}.
                    <span> {user?.user_employee?.lastname.toUpperCase()}</span>
                </div>
                <div>
                    <button
                        onClick={logout}
                        className="btn hover:bg-red-600 bg-red-500 text-white focus:ring-0 border-0"
                    >Logout</button>
                </div>
            </div>
            <div className="mt-10">Select Action:</div>
            <div  className="flex flex-col gap-3 py-3 max-w-[200px]">
                <Link className="btn btn-primary" href="/e/attendance">Attendance</Link>
                <Link className="btn btn-primary" href="/e/survey">Customer Survey</Link>
            </div>
        </div>
    )
}