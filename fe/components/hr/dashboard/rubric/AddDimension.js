import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { mutate } from "swr";
import axiosInstance from "../../../../utils/axiosInstance";
import AlertMessages from "../../../AlertMessages";


export default function AddDimension(props) {
    const [data, setData] = useState({
        dimension_name: '',
        percentage: 0 
    })
    const [error, setError] = useState('')
    const [status, setStatus] = useState({
		error: false,
		loading: false,
		success: false,
		infoMessage: '',
	});

    const validateData = (data) => {
        if(data.dimension_name == ''){
            setError('Name is Required')
            return false
        }
        if(isNaN(data.percentage) || data.percentage == 0 ){
            setError('Percentage value must be greater than 0.')
            return false
        }
        if(data.percentage > props.maxPercent ){
            setError(`Percentage value cannot be greater than ${props.maxPercent}.`)
            return false
        }
        setError('')
        return true
    }
    const clearAllValues = () => {
		setData({
			dimension_name: '',
			percentage: '',
		});
	};

    async function onClickSubmit(data){
        if(!validateData(data))
            return 
		props.setStatus({ 
			error: false, 
			success: false, 
			loading:true, 
			infoMessage: 'Saving data.' 
		})
        axiosInstance.post(`hr/templates/${props.id}/`, data)
        .then((_e) => {
            props.setStatus({ 
                error: false, 
                success: true, 
                loading: false, 
                infoMessage: 'Dimension successfully Added.' 
            })
            props.mutate()
            props.setShow(false)
            clearAllValues()
        }).catch((_e) => {
            if(400 == _e?.response?.status){
                props.setStatus({ 
                    error: true, 
                    success: false, 
                    loading: false, 
                    infoMessage: _e?.response?.data ?? ''
                })
            }else{
                props.setStatus({ 
                    error: true, 
                    success: false, 
                    loading: false, 
                    infoMessage: 'Something went wrong.' 
                })
            }
        })
    }

	return (
		<div className='flex flex-col justify-center h-full w-full mb-5'>
			<div className='w-full min-w-full max-w-2xl mx-auto bg-white shadow-lg rounded-sm border border-gray-200'>
                <div className="flex flex-row p-4">
                    <label>Rubric Dimension Name:</label>
                    <input
                        className='w-[400px] rounded-[12px] mx-2 px-2 border-2 border-black'
                        type='text'
                        placeholder='Rubric Name' 
                        value={data?.dimension_name}
                        onChange = {(event)=> setData({...data, dimension_name: event.target.value})}
                    />
                    <label>Percentage:</label>
                    <input
                        className='w-[250px] rounded-[12px] ml-2 px-2 border-2 border-black'
                        type='number'
                        placeholder='Percentage'  
                        value={data?.percentage}
                        onChange = {(event)=> (event.target.value <= props.maxPercent) ? 
                            setData({...data, percentage: event.target.value}) : 
                            setData({...data, percentage: props.maxPercent})}
                    />
                </div>
                <div className='p-3 pt-0'>
                    <div className='overflow-x-auto'>
                        <button
                            className={
                            'bg-emerald-500 btn w-full my-5 border border-emerald-500'
                            }
                            onClick = {()=> onClickSubmit(data)}
                        >
                        SAVE
                        </button>
                        <div className="text-red-500 text-sm pt-1 ">{error ?? 'aaa'}</div>
                        <AlertMessages
                            className="mb-3"
                            error={status.error}
                            success={status.success}
                            loading={status.loading}
                            message={status.infoMessage}
                        />
                    </div>
                </div>
			</div>
		</div>
	);
}
