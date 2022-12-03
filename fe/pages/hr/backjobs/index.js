import AdminLayout from "../../../components/AdminLayout"

export default function Backjobs() {

	return (
		<AdminLayout 
			title="Back Jobs"
		>
			<div className="flex flex-col items-center bg-slate-500 w-full px-4">
				<label className="font-sans font-bold text-lg my-5 text-white">Encode Reported backjobs</label>
			</div>
		</AdminLayout>
	)
}