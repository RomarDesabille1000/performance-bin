import { useState } from "react";
import useSWR from "swr";
import axiosInstance from "../../../../utils/axiosInstance";
import AddCriteria from "./cirteria/AddCriteria";
import Criteria from "./cirteria/Criteria";


export default function RubricDimension(props) {

    const { data: criteria, mutate} = useSWR(
		`hr/criteria/${props.id}/`,
		{
			revalidateOnFocus: false,
		}
	);
    console.log(criteria)

    const [showMenu, setShowMenu] = useState(false)
    const [update, setUpdate] = useState(false)
    const [addCriteria, setAddCriteria] = useState(false)
    const [updateData, setUpdateData] = useState({
        dimension_name: props.name,
        percentage: props.percentage
    })
    const [error, setError] = useState('')
    const [status, setStatus] = useState({
		error: false,
		loading: false,
		success: false,
		infoMessage: '',
	});

    const validateData = (data) => {
        if(updateData.dimension_name == ''){
            setError('Name is Required')
            return false
        }
        if(isNaN(updateData.percentage) || updateData.percentage == 0 ){
            setError('Percentage value must be greater than 0.')
            return false
        }
        if(updateData.percentage > (props.maxPercent+props.percentage) ){
            setError(`Percentage value cannot be greater than ${(props.maxPercent+props.percentage)}.`)
            return false
        }
        setError('')
        return true
    }

    const getTotalPercentage = () => {
		let total = 0;
		if(undefined != criteria)
			for(let c of criteria) total+=c?.percentage;

		return (100 - total)
	}

    async function onClickUpdate(data){
        if(!validateData(data))
            return 
		setStatus({ 
			error: false, 
			success: false, 
			loading:true, 
			infoMessage: 'Updating data.' 
		})
        axiosInstance.put(`hr/templates/${props.id}/`, data)
        .then((_e) => {
            setStatus({ 
                error: false, 
                success: true, 
                loading: false, 
                infoMessage: 'Template successfully Updated.' 
            })
            props.mutate()
            setUpdate(false)
        }).catch((_e) => {
            if(400 == _e?.response?.status){
                setStatus({ 
                    error: true, 
                    success: false, 
                    loading: false, 
                    infoMessage: _e?.response?.data ?? ''
                })
            }else{
                setStatus({ 
                    error: true, 
                    success: false, 
                    loading: false, 
                    infoMessage: 'Something went wrong.' 
                })
            }
        })
    }


    function handleDelete(id){
        if (confirm(`Are you sure you want to delete this Rubric Dimension?`)) {
            props.setStatus({ 
                error: false, 
                success: false, 
                loading:true, 
                infoMessage: 'Deleting Rubric Dimension' 
            })
            axiosInstance.delete(`hr/templates/delete/${id}/`)
            .then((_e) => {
                props.mutate()
                props.setStatus({ 
                    error: false, 
                    success: true, 
                    loading: false, 
                    infoMessage: 'Rubric Dimension Removed.' 
                })
            }).catch((_e) => {
                props.setStatus({ 
                    error: true, 
                    success: false, 
                    loading: false, 
                    infoMessage: 'Something went wrong.' 
                })
            })
        }    
    }

	return (
		<div className='flex flex-col justify-center h-full w-full mb-5'>
			<div className='w-full min-w-full max-w-2xl mx-auto bg-white shadow-lg rounded-sm border border-gray-200'>
				<header className='flex flex-row px-5 py-4 border-b border-gray-100'>
                    <div  className={update ? 'hidden' : ''}>
                        <h2 className='font-semibold text-gray-800'>{props.name}&nbsp;
                            <span
                                className={
                                    'text-indigo-500'
                                }
                            >
                                &#40;{props.percentage ?? '0'}%&#41;
                            </span>
                        </h2>
                    </div>
                    <div className={update ? '' : 'hidden'}>
                        <label>Rubric Dimension Name:</label>
                        <input 
                            className='w-[250px] rounded-[12px] mx-2 px-2 border-2 border-black'
                            type='text'
                            value={updateData.dimension_name}
                            onChange = {(event) => setUpdateData({...updateData, dimension_name: event.target.value})}
                            placeholder='Rubric Name' >
                        </input>
                        <label>Percentage:</label>
                        <input
                            className='w-[150px] rounded-[12px] mx-2 px-2 border-2 border-black'
                            type='number'
                            value={updateData.percentage}
                            onChange = {(event) => (event.target.value <= (props.maxPercent + props.percentage)) ? 
                                setUpdateData({...updateData, percentage: event.target.value}) : 
                                setUpdateData({...updateData, percentage: (props.maxPercent + props.percentage)})}
                            placeholder='Percentage'
                        />
                        <button onClick={()=>onClickUpdate(updateData)} className="btn bg-green-500 text-white">Save</button>
                    </div>

                    <div className="ml-auto relative ">
                        <button onClick={() => setShowMenu(!showMenu)}>&#9776;</button>
                        <div className={showMenu ? '' : 'hidden'}>
                            <div className="absolute flex flex-col top-6 right-0 bg-white border-[1px] border-black px-10 py-2">
                                <button className="text-indigo-500 hover:text-indigo-700 mb-2" onClick={() => setUpdate(!update)}>Update</button>
                                <button className="text-red-500 hover:text-red-700" onClick={() => handleDelete(props?.id)}>Delete</button>
                            </div>
                        </div>
                    </div>
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
                                    <th className='p-2 whitespace-nowrap'>
										<div className='font-semibold text-left'>Template</div>
									</th>
									<th className='p-2 whitespace-nowrap w-[120px]'>
										<div className='font-semibold text-left'>Percentage</div>
									</th>
									<th className='p-2 whitespace-nowrap w-[200px]'>
										<div className='font-semibold text-center'>Action</div>
									</th>
								</tr>
							</thead>
							<tbody>
                                {/** RENDER ALL RUBRIC DIMENSION */}
                                {
                                    criteria ? criteria.map((c) => (
                                            <Criteria 
                                                key={c?.id} 
                                                id={c?.id} 
                                                name = {c?.name} 
                                                description = {c?.description} 
                                                percentage = {c?.percentage} 
                                                isTemplate = {c?.template_name} 
                                                mutate = {mutate}
                                                setError = {setError} 
                                                setStatus = {setStatus}
                                                maxPercent = {getTotalPercentage() ?? 0}
                                                
                                            />
                                        )
                                    ) : <></>
                                }
                                <AddCriteria 
                                    id = {props.id} 
                                    show = {addCriteria} 
                                    setShow = {setAddCriteria} 
                                    mutate = {mutate} 
                                    maxPercent = {getTotalPercentage() ?? 0} 
                                    setError = {setError} 
                                    setStatus = {setStatus}
                                />
                            </tbody>
						</table>
                        <div
							className={status.error ? 'text-red-500' : 'text-green-500'}
							>
								{status.infoMessage}
							</div>
							<div className='text-red-500'>{error}</div>
						<div className={'block'}>
							<div className={'text-green-500'}></div>
							<div className='text-red-500'>{}</div>
						</div>
                        <div className={getTotalPercentage() > 0 ? "" : "hidden"}>
                            <button
                                className={
                                    addCriteria ? 
                                    'bg-red-500 btn w-full my-5 border border-red-500' : 
                                    'bg-emerald-500 btn w-full my-5 border border-emerald-500'
                                }
                                onClick = {()=> setAddCriteria(!addCriteria)}
                            >
                            {addCriteria ? 'CANCEL' : 'ADD'}
                            </button>
                        </div>
					</div>
				</div>
			</div>
		</div>
	);
}
