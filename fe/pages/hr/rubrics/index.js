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

export default function Rubric() {
	const [addCoreRubric, setAddCoreRubric] = useState(false);
	const [addKPIRubric, setAddKPIRubric] = useState(false);
	const [rubricValues, setRubricsValues] = useState({
		type: '',
		employee_type: 'SALESEXECUTIVE',
		name: '',
		description: '',
		percentage: '',
		editable: true,
	});
	console.log(rubricValues)
	const [totalCC, setTotalCC] = useState(0);
	const [totalKPI, setTotalKPI] = useState(0);
	const [selectedID, setSelectedID] = useState();
	const { mutate } = useSWRConfig()
	const { data: core } = useSWR(
		`hr/rubric/core/?emptype=${rubricValues.employee_type}`,
		{
			revalidateOnFocus: false,
		}
	);
	const { data: kpi } = useSWR(
		`hr/rubric/kpi/?emptype=${rubricValues.employee_type}`,
		{
			revalidateOnFocus: false,
		}
	);
	
	useEffect(()=>{
		if(core != undefined && core.length != 0){
			let total = 0;
			core.map((item)=>{
				total+=parseInt(item.percentage);
			})
			setTotalCC(total)
		}else{
			setTotalCC(0)
		}
	},[core])
	useEffect(()=>{
		if(kpi != undefined && kpi.length != 0){
			let total = 0;
			kpi.map((item)=>{
				total+=parseInt(item.percentage);
			})
			setTotalKPI(total)
		}else{
			setTotalKPI(0)
		}
	},[kpi])

	const [error, setError] = useState('');
	const [status, setStatus] = useState({
		error: false,
		loading: false,
		success: false,
		infoMessage: '',
	});

	const changeType = (type) => {
		setStatus({ ...status, infoMessage: '' });
		setRubricsValues({ ...rubricValues, type: type });
		if (type == 'CORE' && !addCoreRubric) {
			setAddKPIRubric(false);
			setAddCoreRubric(true);
		} else if (type == 'KPI' && !addKPIRubric) {
			setAddCoreRubric(false);
			setAddKPIRubric(true);
		} else {
			setAddCoreRubric(false);
			setAddKPIRubric(false);
			setSelectedID(undefined)
			setRubricsValues({
				...rubricValues,
				type: '',
				name: '',
				description: '',
				percentage: '',
			});
		}
	};
	const valuesIsValid = (rubric) => {
		if(rubric.name == ''){
			setError('Name cannot be empty!')
			return false
		}
		else if(rubric.description == ''){
			setError('Description cannot be empty!')
			return false
		}
		else if(rubric.percentage == ''){
			setError('Percentage must be a number!')
			return false
		}
		else if(rubric.percentage == 0){
			setError('Percentage cannot be 0!')
			return false
		}
		else if(rubric.percentage % 1 != 0){
			setError('Percentage must be a whole Number!')
			return false
		}
		else{
			return true
		}
		
	}

	useEffect(() => {
		//console.log(rubricValues)
		if (rubricValues.name != '' && rubricValues.name.length > 255)
			setError('Name cannot exceed 255 characters!');
		else if (
			rubricValues.description != '' &&
			rubricValues.description.length > 255
		)
			setError('description cannot exceed 255 characters!');

		else setError('');
	}, [rubricValues]);

	const onSubmit = async (rubric) => {
		if(!valuesIsValid(rubric))
			return
		setStatus({
			error: false,
			success: false,
			loading: true,
			infoMessage: 'Saving Rubric.',
		});
		axiosInstance
			.post('hr/rubric/', {
				type: rubric.type,
				employee_type: rubric.employee_type,
				name: rubric.name,
				description: rubric.description,
				percentage: rubric.percentage,
			})
			.then((_e) => {
				mutate(`hr/rubric/core/?emptype=${rubricValues.employee_type}`)
				mutate(`hr/rubric/kpi/?emptype=${rubricValues.employee_type}`)
				setStatus({
					error: false,
					success: true,
					loading: false,
					infoMessage: 'Rubric Saved.',
				});
				clearAllValues();
			})
			.catch((_e) => {
				setStatus({
					error: true,
					success: false,
					loading: false,
					infoMessage: 'Something went wrong.',
				});
			});
	};
	const updateOnSubmit = async (id,rubric) => {
		if(!valuesIsValid(rubric))
			return
		setStatus({
			error: false,
			success: false,
			loading: true,
			infoMessage: 'Saving Rubric.',
		});
		axiosInstance
			.patch(`hr/rubric/${id}/update/`, {
				type: rubric.type,
				employee_type: rubric.employee_type,
				name: rubric.name,
				description: rubric.description,
				percentage: rubric.percentage,
			})
			.then((_e) => {
				setSelectedID(undefined)
				mutate(`hr/rubric/core/?emptype=${rubricValues.employee_type}`)
				mutate(`hr/rubric/kpi/?emptype=${rubricValues.employee_type}`)
				setStatus({
					error: false,
					success: true,
					loading: false,
					infoMessage: 'Rubric Updated.',
				});
				clearAllValues();
			})
			.catch((_e) => {
				setStatus({
					error: true,
					success: false,
					loading: false,
					infoMessage: 'Something went wrong.',
				});
			});
	};
	const deleteOnSubmit = async (id) => {
		setStatus({
			error: false,
			success: false,
			loading: true,
			infoMessage: 'Saving Rubric.',
		});
		axiosInstance
			.delete(`hr/rubric/${id}/delete/`, {})
			.then((_e) => {
				mutate(`hr/rubric/core/?emptype=${rubricValues.employee_type}`)
				mutate(`hr/rubric/kpi/?emptype=${rubricValues.employee_type}`)
				setStatus({
					error: false,
					success: true,
					loading: false,
					infoMessage: 'Rubric Removed.',
				});
				clearAllValues();
			})
			.catch((_e) => {
				setStatus({
					error: true,
					success: false,
					loading: false,
					infoMessage: 'Something went wrong.',
				});
			});
	};

	const clearAllValues = () => {
		setRubricsValues({
			...rubricValues,
			type: '',
			name: '',
			description: '',
			percentage: '',
		});
		setAddCoreRubric(false);
		setAddKPIRubric(false);
	};

	const selectForUpdate = (item) => {
		console.log(item)
		setSelectedID(item.id)
		setRubricsValues({
			type: item.type,
			employee_type: item.employee_type,
			name: item.name,
			description: item.description,
			percentage: item.percentage,
			editable: true,
		})
		if(item.type =='CORE'){
			setAddKPIRubric(false);
			setAddCoreRubric(true);
		}else if(item.type == 'KPI'){
			setAddKPIRubric(true);
			setAddCoreRubric(false);
		}

	}

	const checkPercentage = (value) => {
		if(rubricValues.type =='CORE'){
			let ccTotal = 0
			core.map((item)=> {
				if(selectedID == undefined || selectedID != item.id)
					ccTotal+=parseInt(item.percentage)
			})
			const maxValue = 100 - ccTotal;
			if(value>=maxValue)
				return maxValue;
			else
				return value;
		}else if(rubricValues.type =='KPI'){
			let kpiTotal = 0
			kpi.map((item)=> {
				if(selectedID == undefined || selectedID != item.id)
					kpiTotal+=parseInt(item.percentage)
			})
			const maxValue = 100 - kpiTotal;
			if(value>=maxValue)
				return maxValue;
			else
				return value;
		}
		return 0;
	}


	function renderCoreComp() {
		if (core == undefined || core.length == 0) return <></>;
		else {
			return core.map((item) => (
				<tr key={item.id} className='bg-white border-b text-gray-800'>
					<th scope='row' className='py-4 px-6 font-medium max-w-[200px]'>
						<p className='text-left  whitespace-normal'>{item?.name ?? ''}</p>
					</th>
					<td className='py-4'>
						<p className='text-left whitespace-normal'>
							{item?.description ?? ''}
						</p>
					</td>
					<td className='py-4'>
						<p className='w-[100px] text-center'>{item?.percentage ?? ''}%</p>
					</td>
					<td className='py-4'>
					{item?.editable ?  
						<img className='h-6 w-6 rounded-full ml-4 cursor-pointer' src={Update.src} onClick={()=>selectForUpdate(item)}/> : <></>}
					</td>
					<td className='py-4'>
					{item?.editable ?  
						<img className='h-6 w-6 rounded-full ml-4 cursor-pointer' src={Delete.src} onClick={()=>
								{if (confirm('Are you sure you want to Delete this Rubric?')) {
									// Save it!
									deleteOnSubmit(item.id)
								} else {
									// Do nothing!
								}}
						}/>: <></>}
					</td>
				</tr>
			));
		}
	}
	function renderKPI() {
		if (kpi == undefined || kpi.length == 0) return <></>;
		else {
			return kpi.map((item) => (
				<tr key={item.id} className='bg-white border-b text-gray-800'>
					<th scope='row' className='py-4 px-6 font-medium max-w-[200px]'>
						<p className='text-left  whitespace-normal'>{item?.name ?? ''}</p>
					</th>
					<td className='py-4'>
						<p className='text-left whitespace-normal'>
							{item?.description ?? ''}
						</p>
					</td>
					<td className='py-4'>
						<p className='w-[100px] text-center'>{item?.percentage ?? ''}%</p>
					</td>
					<td className='py-4'> 
					{item?.editable ?  
						<img className='h-6 w-6 rounded-full ml-4 cursor-pointer' src={Update.src} onClick={()=>selectForUpdate(item)}/> : <></>}
					</td>
					<td className='py-4'>
					{item?.editable ?  
						<img className='h-6 w-6 rounded-full ml-4 cursor-pointer' src={Delete.src} onClick={()=>
							{if (confirm('Are you sure you want to Delete this Rubric?')) {
								// Save it!
								deleteOnSubmit(item.id)
							} else {
								// Do nothing!
							}}
						}/>: <></>}
					</td>
				</tr>
			));
		}
	}

	return (
		<AdminLayout title='Manage Rubrics'>
			<div className='flex flex-col items-center w-full  px-4'>
				<div className='w-full p-4'>
					<select
						id='employee type'
						className='w-[200px] border rounded-[12px] pl-2 bg-gray-100'
						onChange={(event) =>
							setRubricsValues({
								...rubricValues,
								employee_type: event.target.value,
							})
						}
					>
						<option value='SALESEXECUTIVE'>
							Sales Executive
						</option>
						<option value='TECHNICIAN'>Technician</option>
					</select>
				</div>
				{/** CORE COMPATENCY ____________________ */}
				<div className='flex flex-col justify-center h-full w-full mb-5'>
					<div className='w-full min-w-full max-w-2xl mx-auto bg-white shadow-lg rounded-sm border border-gray-200'>
						<header className='px-5 py-4 border-b border-gray-100'>
							<h2 className='font-semibold text-gray-800'>
							Core Competency&nbsp; 
									<span className={totalCC == 100 ? 'text-green-500' : 'text-red-500' }>&#40;{totalCC}%&#41;</span>
							</h2>
						</header>
						<div className='p-3'>
							<div className='overflow-x-auto'>
								<table className='table-auto w-full '>
									<thead className='text-xs font-semibold uppercase text-gray-400 bg-gray-50'>
										<tr>
											<th className='p-2 whitespace-nowrap w-[200px]'>
												<div className='font-semibold text-left'>Name</div>
											</th>
											<th className='p-2 whitespace-nowrap'>
												<div className='font-semibold text-left'>
													Description
												</div>
											</th>
											<th className='p-2 whitespace-nowrap w-[120px]'>
												<div className='font-semibold text-left'>
													Percentage
												</div>
											</th>
											<th className='p-2 whitespace-nowrap w-[80px]'>
												<div className='font-semibold text-left'>Update</div>
											</th>
											<th className='p-2 whitespace-nowrap w-[80px]'>
												<div className='font-semibold text-left'>Delete</div>
											</th>
										</tr>
									</thead>
									<tbody>
										{renderCoreComp()}
										{addCoreRubric ? (
											<tr className='bg-slate-300'>
												<td
													scope='row'
													className='py-4 px-6 font-medium  w-[100px]'
												>
													<input
														className='w-[150px] rounded-[12px] pl-2'
														type='text'
														placeholder='Title'
														value={rubricValues.name}
														onChange={(event) =>
															setRubricsValues({
																...rubricValues,
																name: event.target.value,
															})
														}
													/>
												</td>
												<td className='py-4 w-max pr-4'>
													<input
														className='min-w-full rounded-[12px] pl-2 '
														type='text'
														placeholder='Description'
														value={rubricValues.description}
														onChange={(event) =>
															setRubricsValues({
																...rubricValues,
																description: event.target.value,
															})
														}
													/>
												</td>
												<td className='py-4 w-[120px]  pl-2'>
													<input
														className='w-[100px] rounded-[12px] pl-2'
														type='number'
														placeholder='%'
														value={rubricValues.percentage}
														onChange={(event) =>
															setRubricsValues({
																...rubricValues,
																percentage: checkPercentage(event.target.value),
															})
														}
													/>
												</td>
												<td className='py-4'></td>
												<td className='py-4 pr-5'>
													{selectedID == undefined ? <button
														className='btn w-full bg-emerald-500 border border-emerald-500'
														onClick={() => onSubmit(rubricValues)}
													>
														Save
													</button> : 
													<button
														className='btn w-full bg-emerald-500 border border-emerald-500'
														onClick={() => updateOnSubmit(selectedID, rubricValues)}
													>
														Update
													</button>}
												</td>
											</tr>
										) : (
											<></>
										)}
									</tbody>
								</table>
								<div className={
										addCoreRubric
											? 'block'
											: 'hidden'
									}>
									<div
										className={status.error ? 'text-red-500' : 'text-green-500'}
									>
										{status.infoMessage}
									</div>
									<div className='text-red-500'>{error}</div>
								</div>
								<button
									className={
										addCoreRubric
											? 'bg-red-500 btn w-full my-5 border border-red-500'
											: 'bg-emerald-500 btn w-full my-5 border border-emerald-500'
									}
									onClick={() => changeType('CORE')}
								>
									{addCoreRubric ? 'CANCEL' : 'ADD'}
								</button>
							</div>
						</div>
					</div>
				</div>
				{/** KEY PERFORMACE INNDICATOR ____________________ */}
				<div className='flex flex-col justify-center h-full w-full'>
					<div className='w-full min-w-full max-w-2xl mx-auto bg-white shadow-lg rounded-sm border border-gray-200'>
						<header className='px-5 py-4 border-b border-gray-100'>
							<h2 className='font-semibold text-gray-800'>
								Key Performance Indicator&nbsp; 
									<span className={totalKPI == 100 ? 'text-green-500' : 'text-red-500' }>&#40;{totalKPI}%&#41;</span>
							</h2>
						</header>
						<div className='p-3'>
							<div className='overflow-x-auto'>
								<table className='table-auto w-full'>
									<thead className='text-xs font-semibold uppercase text-gray-400 bg-gray-50'>
										<tr>
											<th className='p-2 whitespace-nowrap w-[200px]'>
												<div className='font-semibold text-left'>Name</div>
											</th>
											<th className='p-2 whitespace-nowrap'>
												<div className='font-semibold text-left'>
													Description
												</div>
											</th>
											<th className='p-2 whitespace-nowrap w-[120px]'>
												<div className='font-semibold text-left'>
													Percentage
												</div>
											</th>
											<th className='p-2 whitespace-nowrap w-[80px]'>
												<div className='font-semibold text-left'>Update</div>
											</th>
											<th className='p-2 whitespace-nowrap w-[80px]'>
												<div className='font-semibold text-left'>Delete</div>
											</th>
										</tr>
									</thead>
									<tbody>
										{renderKPI()}
										{addKPIRubric ? (
											<tr className='bg-slate-300'>
												<td
													scope='row'
													className='py-4 px-6 font-medium  w-[100px]'
												>
													<input
														className='w-[150px] rounded-[12px] pl-2'
														type='text'
														placeholder='Title'
														value={rubricValues.name}
														onChange={(event) =>
															setRubricsValues({
																...rubricValues,
																name: event.target.value,
															})
														}
													/>
												</td>
												<td className='py-4 w-max pr-4'>
													<input
														className='min-w-full rounded-[12px] pl-2 '
														type='text'
														placeholder='Description'
														value={rubricValues.description}
														onChange={(event) =>
															setRubricsValues({
																...rubricValues,
																description: event.target.value,
															})
														}
													/>
												</td>
												<td className='py-4 w-[120px]  pl-2'>
													<input
														className='w-[100px] rounded-[12px] pl-2'
														type='number'
														placeholder='%'
														value={rubricValues.percentage}
														onChange={(event) =>
															setRubricsValues({
																...rubricValues,
																percentage: checkPercentage(event.target.value),
															})
														}
													/>
												</td>
												<td className='py-4'></td>
												<td className='py-4 pr-5'>
													{selectedID == undefined ? <button
														className='btn w-full bg-emerald-500 border border-emerald-500'
														onClick={() => onSubmit(rubricValues)}
													>
														Save
													</button> : 
													<button
														className='btn w-full bg-emerald-500 border border-emerald-500'
														onClick={() => updateOnSubmit(selectedID, rubricValues)}
													>
														Update
													</button>}
												</td>
											</tr>
										) : (
											<></>
										)}
									</tbody>
								</table>
								<div className={
										addKPIRubric
											? 'block'
											: 'hidden'
									}>
									<div
										className={status.error ? 'text-red-500' : 'text-green-500'}
									>
										{status.infoMessage}
									</div>
									<div className='text-red-500'>{error}</div>
								</div>
								
								<button
									className={
										addKPIRubric
											? 'bg-red-500 btn w-full my-5 border border-red-500'
											: 'bg-emerald-500 btn w-full my-5 border border-emerald-500'
									}
									onClick={() => changeType('KPI')}
								>
									{addKPIRubric ? 'CANCEL' : 'ADD'}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</AdminLayout>
	);
}
