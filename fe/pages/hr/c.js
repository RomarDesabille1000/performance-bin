import Link from "next/link";
import { useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import axiosInstance from "../../utils/axiosInstance";
import AlertMessages from "../../components/AlertMessages";


export default function C(){
    const [file, setFile] = useState({
        file: '',
        name: '',
    })
    const [ids, setIds] = useState([]);

	const [status, setStatus] = useState({
		error: false,
		loading: false,
		success: false,
		infoMessage: '',
	})

    const onChangeFile = (e) => {
		setStatus({ 
			error: false, 
			success: false, 
			loading:false, 
			infoMessage: '' 
		})
        setIds([])
        let localFile = ''
        try {
            localFile = e.target.files[0]

            setFile({ 
                name: localFile.name,
                file: localFile,
            })
        } finally {}
    }

    const cancel = (e) => {
        setIds([])
		setStatus({ 
			error: false, 
			success: false, 
			loading:false, 
			infoMessage: '' 
		})
        setFile({ name: '', file: '' })
    }

    const go = () => {
		setStatus({ 
			error: false, 
			success: false, 
			loading:true, 
			infoMessage: 'Importing CSV.' 
		})
        let data = new FormData();
        data.append('csv', file.file)

        setIds([])
        setFile({
            file: '',
            name: '',
        })
        axiosInstance.post('hr/import-csv/', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(({ data }) => {
            if(data?.not_exist_ids){
                setIds(data?.not_exist_ids)
            }
            setStatus({ 
                error: false, 
                success: true, 
                loading:false, 
                infoMessage: 'CSV successfully imported.' 
            })
        }).catch((_e) => {
            setStatus({ 
                error: true, 
                success:false, 
                loading:false, 
                infoMessage: 'Something went wrong please check your csv file.' 
            })
        })
    }


    return(
		<AdminLayout 
			title="Attendance CSV"
		>
            <div>
                <small>This may take a while depending how large csv is.</small>
                <div className="mt-2">
                    Please see sample 
                    <Link
                        className="text-blue-500"
                        href="/sampleattendance.csv"
                    > CSV</Link>
                </div>
            </div>
            <div className="mt-4">
                <label 
                    htmlFor="file-upload" 
                    className={`btn btn-secondary cursor-pointer 
                    ${status.loading ? '!bg-gray-200 pointer-events-none': ''}`}
                >
                    Import CSV
                </label>
                <input 
                    accept=".csv, text/csv" 
                    id="file-upload" 
                    type="file" 
                    className="hidden"
                    onChange={onChangeFile}
                    onClick={(e) => {e.target.value = ""}}
                />
                <AlertMessages
                    className="mt-5"
                    error={status.error}
                    success={status.success}
                    loading={status.loading}
                    message={status.infoMessage}
                />
                {ids.length !== 0 && (
                    <div className="mt-5">
                        Following Employee Ids could not be found:
                        <div className="flex gap-3 mt-2">
                            {ids.map((d) => (( <div key={d}>[{d}]</div>)))}
                        </div>
                    </div>
                )}
                {file.name && file.file && (
                    <div className="mt-10">
                        <div className="mb-3">{file.name}</div>
                        <div className="flex gap-3">
                            <button 
                                className="btn btn-secondary"
                                onClick={cancel}
                            >Cancel</button>
                            <button 
                                onClick={go}
                                className="btn btn-primary"
                            >Go</button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}