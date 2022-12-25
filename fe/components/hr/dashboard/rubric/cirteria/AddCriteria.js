import { useState } from "react";
import axiosInstance from "../../../../../utils/axiosInstance";

export default function AddCriteria(props) {
    const [isEditable, setIsEditable] = useState(true);
		const [showMenu, setShowMenu] = useState(false)
    const [rubricValues, setRubricsValues] = useState({
		name: '',
		description: '',
		percentage: '',
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
		} else if (props.maxPercent == 0) {
			props.setError('Percentage is already at 100%');
			return false;
        } else {
			return true;
		}
	};
    const clearAllValues = () => {
		setRubricsValues({
			name: '',
			description: '',
			percentage: '',
		});
		setIsEditable(true)
		setShowMenu(false)
	};

    const onSubmit = async (rubric) => {
		if (!valuesIsValid(rubric)) return;
		props.setStatus({
			error: false,
			success: false,
			loading: true,
			infoMessage: 'Saving Rubric.',
		});
		axiosInstance
			.post(`hr/criteria/${props.id}/`, rubric)
			.then((_e) => {
				props.mutate();
				props.setStatus({
					error: false,
					success: true,
					loading: false,
					infoMessage: 'Rubric Saved.',
				});
				clearAllValues();
                props.setShow(false)
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

	function addTemplate(name){
		if(name == 'Attendance'){
			setIsEditable(false)
			setRubricsValues({
				name: 'Attendance',
				description: 'Attendance Details here',
				percentage: '',
				template_name: 'Attendance'
			});
		}
		if(name == 'Customer Satisfaction'){
			setIsEditable(false)
			setRubricsValues({
				name: 'Customer Satisfaction',
				description: 'Customer Satisfaction Details here',
				percentage: '',
				template_name: 'Customer Satisfaction'
			});
		}
		if(name == 'No Template'){
			setIsEditable(true)
			setRubricsValues({
				name: '',
				description: '',
				percentage: '',
			});
		}
		

	}

	return (
		<tr className={props?.show ? 'bg-slate-300' : 'hidden'}>
			<td scope='row' className='py-8 px-6 font-medium  w-[100px]'>
				<input
					className='w-[150px] rounded-[12px] pl-2'
					type='text'
					readOnly={!isEditable}
					placeholder='Name'
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
			<td className='py-4 w-max pr-4'>
				<p className='text-left whitespace-normal pl-2'>{ rubricValues?.template_name ?? ''}</p>
			</td>
			<td className='py-4 w-[120px]  pl-2'>
				<input
					className='w-[100px] rounded-[12px] pl-2'
					type='number'
					placeholder='%'
					value={rubricValues.percentage}
					onChange={(event) =>
                        (event.target.value <= props.maxPercent) ?
						setRubricsValues({
							...rubricValues,
							percentage: event.target.value,
						}) :
                        setRubricsValues({
							...rubricValues,
							percentage: props.maxPercent,
						})
					}
				/>
			</td>
			<td className='py-4 pr-5'>
				<div className="flex flex-row items-center">
					<div className="ml-auto relative mr-3">
						<button onClick={() => setShowMenu(!showMenu)}>&#9776;</button>
						<div className={showMenu ? '' : 'hidden'}>
								<div className="absolute flex flex-col items-start top-5 right-0 bg-white border-[1px] border-black px-10 py-2 w-[400px]">
										Add Criteria Template
										<button className="text-indigo-500 hover:text-indigo-700" onClick={() => addTemplate('No Template')}>No Template</button>
										<button className="text-indigo-500 hover:text-indigo-700" onClick={() => addTemplate('Attendance')}>Attendance</button>
										<button className="text-indigo-500 hover:text-indigo-700" onClick={() => addTemplate('Customer Satisfaction')}>Customer Satisfaction</button>
								</div>
						</div>
					</div>
					<button
							className='btn w-full bg-emerald-500 border border-emerald-500'
							onClick={() => onSubmit(rubricValues)}
						>
							Save
					</button>
				</div>
				
			</td>
		</tr>
	);
}
