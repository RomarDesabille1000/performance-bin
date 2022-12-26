import { use, useState } from 'react';
import axiosInstance from '../../../../../utils/axiosInstance';

export default function Criteria(props) {
    const [update, setUpdate] = useState(false);
    const [isEditable, setIsEditable] = useState(props?.isTemplate == 'none' ? false : true);
    const [rubricValues, setRubricsValues] = useState({
        name: props?.name,
        description: props?.description,
        percentage: props?.percentage,
    })
    
    const valuesIsValid = (rubric) => {
		if (rubric.name == '') {
			props.setError('Name cannot be empty!');
			return false;
		} else if (rubric.description == '') {
			props.setError('Description cannot be empty!');
			return false;
		} else if (rubric.percentage == '') {
			props.setError('Percentage must be a number!');
			return false;
		} else if (rubric.percentage == 0) {
			props.setError('Percentage cannot be 0!');
			return false;
		} else if (rubric.percentage % 1 != 0) {
			props.setError('Percentage must be a whole Number!');
			return false;
		} else {
			return true;
		}
	};

    const onSubmit = async (rubric) => {
		if (!valuesIsValid(rubric)) return;
		props.setStatus({
			error: false,
			success: false,
			loading: true,
			infoMessage: 'Updating Rubric.',
		});
		axiosInstance
			.put(`hr/criteria/${props.id}/`, {
				name: rubric.name,
				description: rubric.description,
				percentage: rubric.percentage,
			})
			.then((_e) => {
				props.mutate();
                setUpdate(!update)
				props.setStatus({
					error: false,
					success: true,
					loading: false,
					infoMessage: 'Rubric Updated.',
				});
			})
			.catch((_e) => {
				props.setStatus({
					error: true,
					success: false,
					loading: false,
					infoMessage: 'Something went wrong.',
				});
			});
	};

    const deleteOnSubmit = async (id) => {
		props.setStatus({
			error: false,
			success: false,
			loading: true,
			infoMessage: 'Deleting Rubric.',
		});
		axiosInstance
			.delete(`hr/criteria/delete/${id}/`, {})
			.then((_e) => {
				props.mutate();
				props.setStatus({
					error: false,
					success: true,
					loading: false,
					infoMessage: 'Criteria Removed.',
				});
			})
			.catch((_e) => {
				props.setStatus({
					error: true,
					success: false,
					loading: false,
					infoMessage: 'Something went wrong.',
				});
			});
	};

	return (
		<tr key={props.id} className={update ? 'bg-slate-300' : 'bg-white border-b text-gray-800'}>
			<th scope='row' className='py-4 px-6 font-medium max-w-[200px]'>
				{
                update ? 
                    <input
                        className='w-[150px] rounded-[12px] pl-2'
                        type='text'
                        //readOnly={isEditable}
                        placeholder='Name'
                        value={rubricValues.name}
                        onChange={(event) =>
                            setRubricsValues({
                                ...rubricValues,
                                name: event.target.value,
                            })
                        }
                    /> 
                    :
                    <p className='text-left  whitespace-normal'>{props?.name ?? ''}</p>
                }
			</th>
			<td className='py-4'>
				{update ? 
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
                :
                <p className='text-left whitespace-normal'>{props?.description ?? ''}</p>
            }
			</td>
            <td className='py-4'>
                <p className='text-left whitespace-normal pl-2'>{props?.isTemplate == 'none' ? '' : props?.isTemplate}</p>
			</td>
			<td className='py-4'>
				{update ? 
                    <input
                        className='w-[100px] rounded-[12px] pl-2'
                        type='number'
                        placeholder='%'
                        value={rubricValues.percentage}
                        onChange={(event) =>
                            (event.target.value <= (props.maxPercent + props.percentage)) ?
                            setRubricsValues({
                                ...rubricValues,
                                percentage: event.target.value,
                            }) :
                            setRubricsValues({
                                ...rubricValues,
                                percentage: (props.maxPercent + props.percentage),
                            })
                        }
                    />
                    :
                    <p className='w-[100px] text-center'>{props?.percentage ?? ''}%</p>
                }
			</td>
			<td className='py-4 flex justify-center items-center'>
				{update ? 
                    <div className='flex gap-5'>
                        <button
                            onClick={() => onSubmit(rubricValues)}
                            className='text-indigo-500 hover:text-indigo-700'
                        >
                            Save
                        </button>
                        {props?.template_name != 'none' ? (
                            <button
                                onClick={() => setUpdate(!update)}
                                className='text-red-500 hover:text-red-700'
                            >
                                Cancel
                            </button>
                        ) : (
                            <></>
                        )}
                    </div>
                    :
                    <div className='flex gap-5'>
                        <button
                            onClick={() => setUpdate(!update)}
                            className='text-indigo-500 hover:text-indigo-700'
                        >
                            Edit
                        </button>
                        {props?.template_name != 'none' ? (
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to Delete this Rubric?')) {
                                        // Save it!
                                        deleteOnSubmit(props?.id);
                                    } else {
                                        // Do nothing!
                                    }
                                }}
                                className='text-red-500 hover:text-red-700'
                            >
                                Delete
                            </button>
                        ) : (
                            <></>
                        )}
                    </div>
                }
			</td>
		</tr>
	);
}
