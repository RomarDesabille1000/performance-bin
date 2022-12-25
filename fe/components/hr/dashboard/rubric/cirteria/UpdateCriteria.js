import { useState } from "react";
import axiosInstance from "../../../../../utils/axiosInstance";

export default function UpdateCriteria(props) {
    const [isEditable, setIsEditable] = useState(true);
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
		} else if (props.maxPercent == 0) {
			props.setError('Percentage is already at 100%');
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


	return (
		<tr className={props?.show ? 'bg-slate-300' : 'hidden'}>
			<td scope='row' className='py-4 px-6 font-medium  w-[100px]'>
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
					readOnly={!isEditable}
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
				<button
					className='btn w-full bg-emerald-500 border border-emerald-500'
					onClick={() => onSubmit(rubricValues)}
				>
					Save
				</button>
			</td>
		</tr>
	);
}
