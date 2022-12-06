import { useState } from "react";
import useSWR from "swr";
import AdminLayout from "../../components/AdminLayout";
import SelectUserModal from "../../components/dashboard/SelectUserModal";

export default function HRDashboard() {
	const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchText, setSearchText] = useState('')
    const { data: employees } = useSWR(`users/employees/?lastname=${searchText}`, {
        revalidateOnFocus: false,
    });
	const [employeeTarget, setEmployeeTarget] = useState({
		id: -1,
		name: '',
	})



	return(
		<AdminLayout 
			title="Dashboard"
		>
			<button 
			onClick={() => setIsModalOpen(true)}
			className="btn btn-primary">Load User</button>
			{isModalOpen &&(
				<SelectUserModal
					employees={employees}
					setIsModalOpen={setIsModalOpen}
					searchText={searchText}
					setSearchText={setSearchText}
					setEmployeeTarget={setEmployeeTarget}
					employeeTarget={employeeTarget}
				/>
			)}
		</AdminLayout>
	)
}