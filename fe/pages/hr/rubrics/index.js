import { useEffect, useState } from 'react';
import Update from '../../../public/admin/dashboard/update.png';
import Delete from '../../../public/admin/dashboard/delete.png';
import Add from '../../../public/admin/dashboard/add.png';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axiosInstance from '../../../utils/axiosInstance';
import AdminLayout from '../../../components/AdminLayout';
import useSWR, { useSWRConfig } from 'swr';
import { interpolateAs } from 'next/dist/shared/lib/router/router';
import RubricDimension from '../../../components/hr/dashboard/rubric/RubricDimension';
import AddDimension from '../../../components/hr/dashboard/rubric/AddDimension';
import AlertMessages from '../../../components/AlertMessages';

export default function Rubric() {
	const [template, setTemplate] = useState()
	const [showAdd, setShowAdd] = useState(false)
	const [status, setStatus] = useState({
		error: false,
		loading: false,
		success: false,
		infoMessage: '',
	})
	const { data: positions,} = useSWR(
		`hr/positions/all/`,
		{
			revalidateOnFocus: false,
		}
	);
	const { data: dimension, mutate} = useSWR(
		template ? `hr/templates/${template}/` : '',
		{
			revalidateOnFocus: false,
		}
	);

  const changeEmployeeType = (type) => {
			setTemplate(type)
	};
	const checkTotalPercentage = () => {
		if(template == undefined) return false
		let total = 0;
		if(undefined != dimension)
			for(let dim of dimension) total+=dim?.percentage;

		if(total >= 100) return false

		return true
	}
	const getTotalPercentage = () => {
		if(template == undefined) return 0
		let total = 0;
		if(undefined != dimension)
			for(let dim of dimension) total+=dim?.percentage;

		return (100 - total)
	}

	return (
		<AdminLayout title='Manage Rubrics'>
			<div className='flex flex-col items-center w-full  px-4'>
				<div className='w-full p-4'>
					<select
						id='employee type'
						className='w-[200px] border rounded-[12px] pl-2 bg-gray-100'
						onChange={(event) =>changeEmployeeType(event.target.value)}
					>
						{/** RENDER ALL POSITIONS */}
						<option key = {0} value={0}>--</option>
						{
							positions ? positions.map((pos) => (
									<option key = {pos?.id} value={pos?.id}>{pos?.title}</option>
								)
							) : <></>
						}
					</select>
				</div>
				<AlertMessages
            className="mb-3"
            error={status.error}
            success={status.success}
            loading={status.loading}
            message={status.infoMessage}
        />
				{/** RENDER ALL RUBRIC DIMENSION */}
				{
					dimension ? dimension.map((dim) => (
							<RubricDimension 
								key={dim?.id} 
								id={dim?.id} 
								name = {dim?.dimension_name} 
								percentage = {dim?.percentage} 
								mutate = {mutate}
								setStatus = {setStatus}
								maxPercent = {getTotalPercentage() ?? 0}
							/>
						)
					) : <></>
				}
				<div className={checkTotalPercentage() ? 'block w-full' : 'hidden'}>
					<button
								className={ 
									showAdd ? 
									'bg-red-500 btn w-full my-5 border border-red-500' : 
									'bg-emerald-500 btn w-full my-5 border border-emerald-500'
								}
								onClick={()=> setShowAdd(!showAdd)}
							>
							{showAdd ? 'CANCEL' : 'ADD DIMENSION'}
					</button>
					<div className={showAdd ? 'block' : 'hidden'}>
						<AddDimension id={template} maxPercent = {getTotalPercentage() ?? 0} mutate = {mutate} setShow = {setShowAdd}/>
					</div>
				</div>
			</div>
		</AdminLayout>
	);
}
