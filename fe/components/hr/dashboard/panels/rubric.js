import { useEffect, useState } from 'react';
import Update from '../../../../public/admin/dashboard/update.png';
import Delete from '../../../../public/admin/dashboard/delete.png';
import Add from '../../../../public/admin/dashboard/add.png';
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import axiosInstance from "../../../../utils/axiosInstance";


export default function Rubric() {
	const [addCoreRubric, setAddCoreRubric] = useState(true);
  const [addKPIRubric, setAddKPIRubric] = useState(false);
	const [core, setCore] = useState(['1', '2']);
	const [kpi, setKpi] = useState(['1', '2', '3']);
  const [rubricValues, setRubricsValues] = useState({
    type: '', employee_type: '', name:'', description: '', percentage: ''
  })
  const [error, setError] = useState('')
  const [status, setStatus] = useState({
		error: false,
		loading: false,
		success: false,
		infoMessage: '',
	})

  const changeType = (type) => {
    setRubricsValues({...rubricValues, type: type})
    if(type == 'CORE' && !addCoreRubric){
      setAddKPIRubric(false)
      setAddCoreRubric(true)
    }else if(type == 'KPI' && !addKPIRubric){
      setAddCoreRubric(false)
      setAddKPIRubric(true)
    }else{
      setAddCoreRubric(false)
      setAddKPIRubric(false)
    }
  }

  useEffect(()=>{
    console.log(rubricValues)
    
  },[rubricValues])

  const onSubmit = ({ type, employee_type, name, description, percentage }) => {
		setStatus({ 
			error: false, 
			success: false, 
			loading:true, 
			infoMessage: 'Saving attendance.' 
		})
			axiosInstance.post('hr/rubric/', {
				type: type,
				employee_type: employee_type,
				name: name,
        description: description,
				percentage: percentage,
			}).then((_e) => {
				setStatus({ 
					error: false, 
					success: true, 
					loading: false, 
					infoMessage: 'Rubric Saved.' 
				})
			}).catch((_e) => {
				setStatus({ 
					error: true, 
					success: false, 
					loading: false, 
					infoMessage: 'Something went wrong.' 
				})
			})
	}

  async function handleAddCore(){

  }

	function renderCoreComp() {
		if (core.length == 0) return <></>;
		else {
			return core.map((item) => (
				<tr key={item} className='bg-white border-b text-gray-800'>
					<th scope='row' className='py-4 px-6 font-medium max-w-[200px]' >
						<p className='text-left  whitespace-normal'>TITLETITLETITLET ITLETITLETITLETI TLETITLETITLETITLE TITLETITLETITL ETITLETITLETITLETITLE</p>
					</th>
					<td className='py-4'>
						<p className='text-left whitespace-normal'>Description Description Description Description Description Description Description Description Description Description Description Description Description 
            Description Description Description </p>
					</td>
          <td className='py-4'>
						<p className='text-center'>Type</p>
					</td>
					<td className='py-4'>
						<p className='text-left'>Percentage</p>
					</td>
					<td className='py-4'>
						<img className='h-6 w-6 rounded-full ml-4' src={Update.src} />
					</td>
					<td className='py-4'>
						<img className='h-6 w-6 rounded-full ml-4' src={Delete.src} />
					</td>
				</tr>
			));
		}
	}
	function renderKPI() {
		if (kpi.length == 0) return <></>;
		else {
			return kpi.map((item) => (
				<tr key={item} className='bg-white border-b text-gray-800'>
					<th scope='row' className='py-4 px-6 font-medium max-w-[200px]' >
						<p className='text-left  whitespace-normal'>TITLETITLETITLET ITLETITLETITLETI TLETITLETITLETITLE TITLETITLETITL ETITLETITLETITLETITLE</p>
					</th>
					<td className='py-4'>
						<p className='text-left whitespace-normal'>Description Description Description Description Description Description Description Description Description Description Description Description Description 
            Description Description Description </p>
					</td>
          <td className='py-4'>
						<p className='text-center'>Type</p>
					</td>
					<td className='py-4'>
						<p className='text-left'>Percentage</p>
					</td>
					<td className='py-4'>
						<img className='h-6 w-6 rounded-full ml-4' src={Update.src} />
					</td>
					<td className='py-4'>
						<img className='h-6 w-6 rounded-full ml-4' src={Delete.src} />
					</td>
				</tr>
			));
		}
	}

	return (
		<div className='flex flex-col items-center w-full  px-4'>
			{/** CORE COMPATENCY ____________________ */}
			<div className='flex flex-col justify-center h-full w-full mb-5'>
				<div className='w-full min-w-full max-w-2xl mx-auto bg-white shadow-lg rounded-sm border border-gray-200'>
					<header className='px-5 py-4 border-b border-gray-100'>
						<h2 className='font-semibold text-gray-800'>Core Competency</h2>
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
											<div className='font-semibold text-left'>Description</div>
										</th>
                    <th className='p-2 whitespace-nowrap w-[120px]'>
											<div className='font-semibold text-center'>Employee Type</div>
										</th>
										<th className='p-2 whitespace-nowrap w-[120px]'>
											<div className='font-semibold text-left'>Percentage</div>
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
                        <td scope='row' className='py-4 px-6 font-medium  w-[100px]'>
												  <input className="w-[150px] rounded-[12px] pl-2" type="text" placeholder='Title' value={rubricValues.name} onChange={(event)=>setRubricsValues({...rubricValues, name: event.target.value})}/>
                        </td>
                        <td className='py-4 w-max pr-4'>
                          <input className="min-w-full rounded-[12px] pl-2 " type="text" placeholder='Description' value={rubricValues.description} onChange={(event)=>setRubricsValues({...rubricValues, description: event.target.value})}/>
                        </td>
                        <td className='py-4'>
                        <select id="countries" className="w-[150px] rounded-[12px] pl-2" value={rubricValues.employee_type} onChange={(event)=>setRubricsValues({...rubricValues, employee_type: event.target.value})}>
                          <option value="SALESEXECUTIVE" selected>Sales Executive</option>
                          <option value="TECHNICIAN">Technician</option>
                        </select>
                        </td>
                        <td className='py-4 w-[120px]  pl-2'>
                          <input className="w-[100px] rounded-[12px] pl-2" type="text" placeholder='%' value={rubricValues.percentage} onChange={(event)=>setRubricsValues({...rubricValues, percentage: event.target.value})}/>
                        </td>
                        <td className='py-4'>
                              
                            </td>
                        <td className='py-4 pr-5'>
                          <div className="text-red-500">{error}</div>
                          <button className='btn w-full bg-emerald-500 border border-emerald-500' onClick={()=>onSubmit(rubricValues)}>
                            Save
                          </button>
                        </td>
                      </tr>
									) : (<></>)}
								</tbody>
							</table>
							<button className='btn w-full my-5 bg-emerald-500 border border-emerald-500' onClick={()=>changeType('CORE')}>ADD</button>
						</div>
					</div>
				</div>
			</div>
			{/** KEY PERFORMACE INNDICATOR ____________________ */}
			<div className='flex flex-col justify-center h-full w-full'>
				<div className='w-full min-w-full max-w-2xl mx-auto bg-white shadow-lg rounded-sm border border-gray-200'>
					<header className='px-5 py-4 border-b border-gray-100'>
						<h2 className='font-semibold text-gray-800'>
							KEY PERFORMACE INNDICATOR
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
											<div className='font-semibold text-left'>Description</div>
										</th>
                    <th className='p-2 whitespace-nowrap w-[120px]'>
											<div className='font-semibold text-left'>Employee Type</div>
										</th>
										<th className='p-2 whitespace-nowrap w-[120px]'>
											<div className='font-semibold text-left'>Percentage</div>
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
											<td scope='row' className='py-4 px-6 font-medium  w-[100px]'>
												  <input className="w-[150px] rounded-[12px] pl-2" type="text" placeholder='Title' value={rubricValues.name} onChange={(event)=>setRubricsValues({...rubricValues, name: event.target.value})}/>
                        </td>
                        <td className='py-4 w-max pr-4'>
                          <input className="min-w-full rounded-[12px] pl-2 " type="text" placeholder='Description' value={rubricValues.description} onChange={(event)=>setRubricsValues({...rubricValues, description: event.target.value})}/>
                        </td>
                        <td className='py-4'>
                        <select id="countries" className="w-[150px] rounded-[12px] pl-2" value={rubricValues.employee_type} onChange={(event)=>setRubricsValues({...rubricValues, employee_type: event.target.value})}>
                          <option value="SALESEXECUTIVE" selected>Sales Executive</option>
                          <option value="TECHNICIAN">Technician</option>
                        </select>
                        </td>
                        <td className='py-4 w-[120px]  pl-2'>
                          <input className="w-[100px] rounded-[12px] pl-2" type="text" placeholder='%' value={rubricValues.percentage} onChange={(event)=>setRubricsValues({...rubricValues, percentage: event.target.value})}/>
                        </td>
                        <td className='py-4'>
                              
                            </td>
                        <td className='py-4 pr-5'>
                          <div className="text-red-500">{error}</div>
                          <button className='btn w-full bg-emerald-500 border border-emerald-500' onClick={()=>onSubmit(rubricValues)}>
                            Save
                          </button>
                        </td>
										</tr>
									) : (<></>)}
                </tbody>
							</table>
							<button className='btn w-full my-5 bg-emerald-500 border border-emerald-500' onClick={()=>changeType('KPI')}>ADD</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
