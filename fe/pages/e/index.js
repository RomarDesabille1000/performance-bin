import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useAuth } from '../../context/AuthContext';
import logoWhite from '../../images/logo-white.jpg'
import { useSignatureStore } from "../../store/signature";

export default function Employee() {
    const { user, logout } = useAuth();
	const signatureStore = useSignatureStore();

    useEffect(() => {
        signatureStore.emtpyImage();
    }, [])

    return(
        <div className="px-5 py-16 mt-10 max-w-[400px] m-auto  ">
            <div className="flex flex-col justify-center items-center">
                <Image
					src={logoWhite}
						alt="logo"
						width="auto"
						height="auto"
						loading="eager" 
						priority={true}
						className="rounded-sm w-[180px] h-[80px]"
					/>
                <div className="mt-4">  
                    <span>Hello, </span>
                    <span>{user?.user_employee?.firstname.toUpperCase()} </span>
                    {user?.user_employee?.mi.toUpperCase()}.
                    <span> {user?.user_employee?.lastname.toUpperCase()}</span>
                </div>
                {/* <div>
                    <button
                        onClick={logout}
                        className="btn hover:bg-red-600 btn-primary text-white focus:ring-0 border-0 w-[180px]"
                    >Change Password</button>
                    <button
                        onClick={logout}
                        className="btn hover:bg-red-600 bg-red-500 text-white focus:ring-0 border-0 w-[180px]"
                    >Logout</button>
                </div> */}
            </div>
            <div className="flex flex-col items-center">
                <div className="mt-10">Select Action:</div>
                <div  className="flex flex-col gap-3 py-3 max-w-[300px]">
                    <Link className="btn btn-primary" href="/e/attendance">Attendance</Link>
                    <Link className="btn btn-primary" href="/e/survey">Customer Survey</Link>
                    <Link className="btn btn-primary" href="/e/change-password">Change Password</Link>
                    <button
                        onClick={logout}
                        className="btn hover:bg-red-600 bg-red-500 text-white focus:ring-0 border-0 w-[200px]"
                        >Logout
                    </button>
                </div>
            </div>
            
        </div>
    )
}