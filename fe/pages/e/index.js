import Link from "next/link";


export default function Employee() {
    return(
        <div  className="flex flex-col gap-3 p-5 max-w-[200px] m-auto">
            <Link className="btn btn-primary" href="/e/attendance">Attendance</Link>
            <Link className="btn btn-primary" href="/e/survey">Customer Survey</Link>
        </div>
    )
}