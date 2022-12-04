import { useRouter } from "next/router";
import useSWR from "swr";
import AdminLayout from "../../../../components/AdminLayout";
import Link from "next/link";

export default function Sales(){
    const router = useRouter();
    //user id
    const { id } = router.query

    return (
        <AdminLayout
            title="Sales"
            hasBack={true}
        >
            <Link 
                className="btn btn-primary"
                href="/hr/employees/sales/create/1">
                Create Sales
            </Link>
        </AdminLayout>
    )
}