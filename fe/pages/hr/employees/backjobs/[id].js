import { useRouter } from "next/router";
import useSWR from "swr";
import AdminLayout from "../../../../components/AdminLayout";

export default function BackJobs(){
    const router = useRouter();
    //user id
    const { id } = router.query

    return (
        <AdminLayout
            title="Back Jobs"
            hasBack={true}
        >
            Test
        </AdminLayout>
    )
}